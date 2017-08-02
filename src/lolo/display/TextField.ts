namespace lolo {


    /**
     * 显示文本
     * @author LOLO
     */
    export class TextField extends cc.LabelTTF {

        /**该常量用于禁用 描边(stroke) 或 投影(shadow) 效果*/
        public static EFFECT_DISABLED: string = "none";

        protected _font: string;
        protected _size: number;
        protected _color: cc.Color = new cc.Color();
        protected _align: number;
        protected _valign: number;

        /**当前是否启用了描边*/
        protected _strokeEnabled: boolean = false;
        protected _strokeColor: cc.Color = new cc.Color();
        protected _strokeSize: number = 0;

        /**当前是否启用了投影*/
        protected _shadowEnabled: boolean = false;
        protected _shadowColor: cc.Color = new cc.Color();
        protected _shadowOffset: cc.Point = new cc.p(2, -2);
        protected _shadowBlur: number = 0;

        /**当前显示的文本*/
        private _currentText: string = "";
        /**文本内容在语言包的ID*/
        private _textID: string = "";


        public constructor() {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this.setAnchorPoint(0, 1);
            this.styleName = "textField";
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
            if (value.align != null) this.align = value.align;
            if (value.valign != null) this.valign = value.valign;
            if (value.stroke != null) this.stroke = value.stroke;
            if (value.strokeSize != null) this.strokeSize = value.strokeSize;
        }


        /**
         * 根据样式名称，在样式列表中获取并设置样式
         */
        public set styleName(value: string) {
            this.style = lolo.config.getStyle(value);
        }


        /**
         * 字体名称
         */
        public set font(value: string) {
            this.setFont(value);
        }

        protected setFont(value: string): void {
            if (isWindowsNative) return;// 关模拟器时，有大概率出现bug
            this._font = value;
            if (lolo.isNative) value = "res/" + lolo.locale + "/font/" + value + ".ttf";
            this.setFontName(value);
        }

        public get font(): string {
            return this._font;
        }


        /**
         * 文本尺寸
         */
        public set size(value: number) {
            this.setSize(value);
        }

        protected setSize(value: number): void {
            this._size = value;
            this.setFontSize(value);
        }

        public get size(): number {
            return this._size;
        }


        /**
         * 文本颜色
         */
        public set color(value: string | cc.Color) {
            this.setColor(value);
        }

        protected setColor(value: string | cc.Color): void {
            let color = this._color;
            if (color == null) return;
            if (typeof value === "string") color.parseHex(value);
            else color._val = value._val;
            this.setFontFillColor(this._color);

            if (!isNative) this._setUpdateTextureDirty();
        }

        public get color(): string | cc.Color {
            return this._color;
        }


        /**
         * 水平对齐方式，可选值[ "left"|0, "center"|1, "right"|2 ]
         */
        public set align(value: string | number) {
            this.setAlign(value);
        }

        protected setAlign(value: string | number): void {
            if (value == null) return;
            if (typeof value === "string") value = Constants.ALIGN_LOLO_TO_COCOS[value];
            this._align = <number>value;
            this.setHorizontalAlignment(this._align);
        }

        public get align(): string | number {
            return this._align;
        }


        /**
         * 垂直对齐方式，可选值[ "top"|0, "middle"|1, "bottom"|2 ]
         */
        public set valign(value: string | number) {
            this.setValign(value);
        }

        protected setValign(value: string | number): void {
            if (value == null) return;
            if (typeof value === "string") value = Constants.VALIGN_LOLO_TO_COCOS[value];
            this._valign = <number>value;
            this.setVerticalAlignment(this._valign);
        }

        public get valign(): string | number {
            return this._valign;
        }


        //


        /**
         * 描边颜色
         */
        public set stroke(value: string | cc.Color) {
            this.setStroke(value);
        }

        protected setStroke(value: string | cc.Color): void {
            this._strokeEnabled = value != TextField.EFFECT_DISABLED;
            if (this._strokeEnabled) {
                if (typeof value === "string") this._strokeColor.parseHex(value);
                else this._strokeColor._val = value._val;
                this.enableStroke(this._strokeColor, this._strokeSize);
            }
            else {
                this.disableStroke();
            }
        }

        public get stroke(): string | cc.Color {
            return this._strokeColor;
        }


        /**
         * 描边尺寸（粗细）
         */
        public set strokeSize(value: number) {
            this.setStrokeSize(value);
        }

        protected setStrokeSize(value: number): void {
            this._strokeSize = value;
            if (this._strokeEnabled) this.enableStroke(this._strokeColor, this._strokeSize);
        }

        public get strokeSize(): number {
            return this._strokeSize;
        }


        //


        /**
         * 启用投影
         * @param color
         * @param offset
         * @param blur
         */
        public enableShadow(color: cc.Color, offset: cc.Point | cc.Size, blur: number): void {
            if (isNative) {
                offset["width"] = offset["x"];// native 只支持 cc.Size
                offset["height"] = offset["y"];
                this.getChildren()[0]["enableShadow"](color, offset, blur);// children[0] = CCLabel
            }
            else {
                super.enableShadow(color, offset, blur);
            }
        }


        /**
         * 投影颜色
         */
        public set shadow(value: string | cc.Color) {
            this.setShadow(value);
        }

        protected setShadow(value: string | cc.Color): void {
            this._shadowEnabled = value != TextField.EFFECT_DISABLED;
            if (this._shadowEnabled) {
                if (typeof value === "string") this._shadowColor.parseHex(value);
                else this._shadowColor._val = value._val;
                this.enableShadow(this._shadowColor, this._shadowOffset, this._shadowBlur);
            }
            else {
                this.disableShadow();
            }
        }

        public get shadow(): string | cc.Color {
            return this._shadowColor;
        }


        /**
         * 投影偏移
         */
        public set shadowOffset(value: cc.Point) {
            this.setShadowOffset(value.x, value.y);
        }

        public setShadowOffset(xOrPoint: number | cc.Point, y?: number): void {
            if (y != null) {
                this._shadowOffset.x = <number>xOrPoint;
                this._shadowOffset.y = y;
            }
            else {
                this._shadowOffset.x = (<cc.Point>xOrPoint).x;
                this._shadowOffset.y = (<cc.Point>xOrPoint).y;
            }
            if (this._shadowEnabled) this.enableShadow(this._shadowColor, this._shadowOffset, this._shadowBlur);
        }

        public get shadowOffset(): cc.Point {
            return this._shadowOffset;
        }


        /**
         * 投影模糊范围（native 无效）
         */
        public set shadowBlur(value: number) {
            this._shadowBlur = value;
            if (this._shadowEnabled) this.enableShadow(this._shadowColor, this._shadowOffset, this._shadowBlur);
        }

        public get shadowBlur(): number {
            return this._shadowBlur;
        }


        //


        /**
         * 获取当前显示的文本值
         */
        public get currentText(): string {
            return this._currentText;
        }


        /**
         * 文本显示内容
         */
        public set text(value: string) {
            this.setText(value);
        }

        protected setText(value: string): void {
            if (value == null) value = "";
            if (value == this._currentText) return;

            this._currentText = value;
            this._textID = "";
            this.setString(value);

            this.event_dispatch(new Event(Event.CHILD_RESIZE), true);
        }

        public get text(): string {
            return this._currentText;
        }


        /**
         * 文本内容在语言包的ID（将会通过ID自动到语言包中拿取对应的内容）
         */
        public set textID(value: string) {
            this.text = lolo.getLanguage(value);
            this._textID = value;
        }

        public get textID(): string {
            return this._textID;
        }


        /**
         * 设置 宽/高
         */
        public setWidth(value: number): void {
            this._width = value;
            this.setDimensions(this._width, this._height);
        }

        public getWidth(): number {
            let value: number = super.getWidth();
            return lolo.isMobileWeb ? value * 2 : value;
        }

        public setHeight(value: number): void {
            this._height = value;
            this.setDimensions(this._width, this._height);
        }

        public getHeight(): number {
            let value: number = super.getHeight();
            return lolo.isMobileWeb ? value * 2 : value;
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled(worldPoint)) return false;// 当前节点不可见

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            if (lolo.isMobileWeb) {
                p.x *= 0.5;
                p.y *= 0.5;
            }
            lolo.temp_rect.setTo(0, 0, this._getWidth(), this._getHeight());
            return lolo.temp_rect.contains(p.x, p.y);
        }


        //
    }
}