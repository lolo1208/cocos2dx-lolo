namespace lolo {


    /**
     * 输入文本
     * @author LOLO
     */
    export class InputText extends cc.EditBox {

        /**是否可编辑（可输入）*/
        public editable: boolean;

        private _font: string;
        private _size: number;
        private _color: cc.Color;
        private _placeholderFont: string;
        private _placeholderSize: number;
        private _placeholderColor: cc.Color;

        /**输入模式*/
        private _inputMode: number;
        /**输入标记*/
        private _inputFlag: number;
        /**返回键类型*/
        private _returnType: number;

        /**当前尺寸*/
        private _cSize: cc.Size;

        // html5下使用
        private _editBoxInputMode: number;
        private _renderCmd: {_edTxt: any, show: Function, hidden: Function};


        /**
         * 构造函数
         */
        public constructor() {
            let s9s: cc.Scale9Sprite = new cc.Scale9Sprite(lolo.getResUrl(Constants.EMPTY_S9S_URL));
            this._cSize = cc.size(100, 100);
            if (isNative) {
                super();// 不调用 super() 语法检查会报错（EditBox::EditBox() 调用两次并不会有问题）
                this.ctor(this._cSize, s9s);
            }
            else {
                super(this._cSize, s9s);
            }

            this._inputMode = cc.EDITBOX_INPUT_MODE_ANY;
            this._inputFlag = cc.EDITBOX_INPUT_FLAG_SENSITIVE;
            this._returnType = cc.KEYBOARD_RETURNTYPE_DEFAULT;

            this.touchListener.onTouchBegan = InputText.onTouchBegan;
            this.touchListener.onTouchEnded = InputText.onTouchEnded;
            this.touchEnabled = this.editable = true;

            this.styleName = "textField";
        }


        /**
         * html onEnter() 时需要重新创建输入控件
         */
        public onEnter(): void {
            super.onEnter();
            if (isNative) return;

            this._editBoxInputMode = -1;
            this.setInputMode(this._inputMode);// 重新创建输入框
            this.setInputFlag(this._inputFlag);// 更新 _edTxt.style.textTransform 自动大写的问题
            this._renderCmd._edTxt.style.fontFamily = this._font;// 更新输入框的字体和字号
            this._renderCmd._edTxt.style.fontSize = this._size + 'px';

            if (isMobile) {
                let text: string = this.getString();
                this.setString(Math.random().toString());// 内容有改变才能正确渲染，不然 y 会显示不正确
                this.setString(text);
            }
        }


        /**
         * 设置样式
         */
        public set style(value: any) {
            this.setStyle(value);
        }

        protected setStyle(value: any): void {
            if (value.font != null) this.font = value.font;
            if (value.size != null) this.size = value.size;
            if (value.color != null) this.color = value.color;
            if (value.placeholderFont != null) this.placeholderFont = value.placeholderFont;
            if (value.placeholderSize != null) this.placeholderSize = value.placeholderSize;
            if (value.placeholderColor != null) this.placeholderColor = value.placeholderColor;
        }


        /**
         * 根据样式名称，在样式列表中获取并设置样式
         */
        public set styleName(value: string) {
            this.style = lolo.config.getStyle(value);
        }


        //


        /**
         * 字体名称
         */
        public set font(value: string) {
            this._font = value;
            this.setFontName(value);
            this.setPlaceholderFontName(value);
        }

        public get font(): string {
            return this._font;
        }

        /**
         * 文本尺寸
         */
        public set size(value: number) {
            this._size = value;
            this.setFontSize(value);
            this.setPlaceholderFontSize(value);
        }

        public get size(): number {
            return this._size;
        }

        /**
         * 文本颜色
         */
        public set color(value: string|cc.Color) {
            if (typeof value === "string") value = hexToColor(<string>value);
            this._color = <cc.Color>value;
            this.setFontColor(this._color);
        }

        public get color(): string|cc.Color {
            return this._color;
        }


        //


        /**
         * （占位符）字体名称
         */
        public set placeholderFont(value: string) {
            this._placeholderFont = value;
            this.setPlaceholderFontName(value);
        }

        public get placeholderFont(): string {
            return this._placeholderFont;
        }

        /**
         * （占位符）文本尺寸
         */
        public set placeholderSize(value: number) {
            this._placeholderSize = value;
            this.setPlaceholderFontSize(value);
        }

        public get placeholderSize(): number {
            return this._placeholderSize;
        }

        /**
         * （占位符）文本颜色
         */
        public set placeholderColor(value: string|cc.Color) {
            if (typeof value === "string") value = hexToColor(<string>value);
            this._color = <cc.Color>value;
            this.setPlaceholderFontColor(this._color);
        }

        public get placeholderColor(): string|cc.Color {
            return this._placeholderColor;
        }


        //


        /**
         * 文本内容
         */
        public set text(value: string) {
            this.setString(value);
        }

        public get text(): string {
            return this.getString();
        }


        /**
         * 输入模式
         */
        public set inputMode(value: number) {
            this._inputMode = value;
            this.setInputMode(value)
        }

        public get inputMode(): number {
            return this._inputMode;
        }


        /**
         * 输入标记
         */
        public set inputFlag(value: number) {
            this._inputFlag = value;
            this.setInputFlag(value)
        }

        public get inputFlag(): number {
            return this._inputFlag;
        }


        /**
         * 返回键类型
         */
        public set returnType(value: number) {
            this._returnType = value;
            this.setReturnType(value)
        }

        public get returnType(): number {
            return this._returnType;
        }


        /**
         * 宽度
         */
        public set width(value: number) {
            this._cSize.width = value;
            this.setContentSize(this._cSize);
        }

        public get width(): number {
            return this._cSize.width;
        }


        /**
         * 高度
         */
        public set height(value: number) {
            this._cSize.height = value;
            this.setContentSize(this._cSize);
        }

        public get height(): number {
            return this._cSize.height;
        }


        /**
         * 重写该方法，让 cc.EditBox(html5) 的默认点击判断失效
         */
        private _onTouchBegan(touch: cc.Touch, event: cc.EventTouch): boolean {
            return false;
        }


        /**
         * Touch在别处时隐藏键盘
         * @param touch
         * @param event
         * @return {boolean}
         */
        private static onTouchBegan(touch: cc.Touch, event: cc.EventTouch): boolean {
            let target: InputText = <InputText>event.getCurrentTarget();
            let hited: boolean = lolo.touchHitTest.call(target, touch.getLocation());
            if (hited && target.propagateTouchEvents) {
                cc_touchDispatchEvent(TouchEvent.TOUCH_BEGIN, target, touch, event);
            }
            if (!hited && !isNative) target._renderCmd.hidden();
            return hited;
        }

        /**
         * 在Touch结束时打开键盘
         * @param touch
         * @param event
         */
        private static onTouchEnded(touch: cc.Touch, event: cc.EventTouch): void {
            let target: InputText = <InputText>event.getCurrentTarget();
            if (target.propagateTouchEvents) {
                cc_touchDispatchEvent(TouchEvent.TOUCH_MOVE, target, touch, event);
            }

            if (target.editable) {
                isNative ? target.openKeyboard() : target._renderCmd.show();
            }
        }


        //
    }
}