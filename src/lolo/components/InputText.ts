namespace lolo {


    /**
     * 输入文本
     * @author LOLO
     */
    export class InputText extends cc.EditBox {

        /**默认宽高*/
        public static DEFAULT_SIZE: cc.Size = cc.size(100, 100);

        /**是否可编辑（可输入）*/
        public editable: boolean;

        private _font: string;
        private _size: number;
        private _color: cc.Color = new cc.Color();
        private _placeholderFont: string;
        private _placeholderSize: number;
        private _placeholderColor: cc.Color = new cc.Color();

        /**输入模式*/
        private _inputMode: number;
        /**输入标记*/
        private _inputFlag: number;
        /**返回键类型*/
        private _returnType: number;


        /**
         * 构造函数
         */
        public constructor() {
            super(InputText.DEFAULT_SIZE, new cc.Scale9Sprite(lolo.getResUrl(Constants.EMPTY_S9S_URL)));
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this._inputMode = cc.EDITBOX_INPUT_MODE_ANY;
            this._inputFlag = cc.EDITBOX_INPUT_FLAG_SENSITIVE;
            this._returnType = cc.KEYBOARD_RETURNTYPE_DEFAULT;

            this.touchListener.onTouchBegan = InputText.onTouchBegan;
            this.touchListener.onTouchEnded = InputText.onTouchEnded;
            this.touchEnabled = this.editable = true;

            this.setAnchorPoint(0, 1);
            this.styleName = "textField";

            if (!isNative) {
                // html5环境，_textLabel 和 _placeholderLabel 的 y 不能取反
                this._renderCmd._textLabel.setPosition = this._renderCmd._textLabel._original_setPosition;
                this._renderCmd._placeholderLabel.setPosition = this._renderCmd._placeholderLabel._original_setPosition;
            }
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
        public set color(value: string | cc.Color) {
            if (typeof value === "string") this._color.parseHex(value);
            else this._color._val = value._val;
            this.setFontColor(this._color);
        }

        public get color(): string | cc.Color {
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
        public set placeholderColor(value: string | cc.Color) {
            if (typeof value === "string") this._placeholderColor.parseHex(value);
            else this._placeholderColor._val = value._val;
            this.setPlaceholderFontColor(this._color);
        }

        public get placeholderColor(): string | cc.Color {
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
         * 设置 宽/高
         */
        public setWidth(value: number): void {
            super.setWidth(value);
            if (!isNative) this._updateEditBoxSize(this._width, this.height);
        }

        public setHeight(value: number): void {
            super.setHeight(value);
            if (!isNative) this._updateEditBoxSize(this._width, this.height);
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
            if (!target.inStageVisibled()) return false;// 当前节点不可见

            let p: cc.Point = target.convertToNodeSpace(touch.getLocation());
            lolo.temp_rect.setTo(0, 0, target.getWidth(), target.getHeight());
            let hited: boolean = lolo.temp_rect.contains(p.x, p.y);

            if (hited && target.propagateTouchEvents) {
                lolo.expend_touchDispatchEvent(TouchEvent.TOUCH_BEGIN, target, touch, event);
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
                lolo.expend_touchDispatchEvent(TouchEvent.TOUCH_END, target, touch, event);
            }

            if (target.editable) {
                isNative ? target.openKeyboard() : target._renderCmd.show();
            }
        }


        //
    }
}