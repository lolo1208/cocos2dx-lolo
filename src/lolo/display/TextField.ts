namespace lolo {


    /**
     * 显示文本
     * @author LOLO
     */
    export class TextField extends cc.LabelTTF {

        private _font: string;
        private _size: number;
        private _color: cc.Color;
        private _align: number;
        private _valign: number;
        private _stroke: cc.Color;
        private _strokeSize: number = 0;

        /**当前显示的文本*/
        private _currentText: string = "";
        /**文本内容在语言包的ID*/
        private _textID: string = "";

        /**设置的宽度*/
        private _width: number = 0;
        /**设置的高度*/
        private _height: number = 0;


        public constructor() {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

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
        public set color(value: string|cc.Color) {
            this.setColor(value);
        }

        protected setColor(value: string|cc.Color): void {
            if (typeof value === "string") value = hexToColor(<string>value);
            this._color = <cc.Color>value;
            this.setFontFillColor(this._color);

            if (!isNative) this._setUpdateTextureDirty();
        }

        public get color(): string|cc.Color {
            return this._color;
        }


        /**
         * 水平对齐方式，可选值[ "left"|0, "center"|1, "right"|2 ]
         */
        public set align(value: string|number) {
            this.setAlign(value);
        }

        protected setAlign(value: string|number): void {
            if (value == null) return;
            if (typeof value === "string") value = Constants.ALIGN_LOLO_TO_COCOS[value];
            this._align = <number>value;
            this.setHorizontalAlignment(this._align);
        }

        public get align(): string|number {
            return this._align;
        }


        /**
         * 垂直对齐方式，可选值[ "top"|0, "middle"|1, "bottom"|2 ]
         */
        public set valign(value: string|number) {
            this.setValign(value);
        }

        protected setValign(value: string|number): void {
            if (value == null) return;
            if (typeof value === "string") value = Constants.VALIGN_LOLO_TO_COCOS[value];
            this._valign = <number>value;
            this.setVerticalAlignment(this._valign);
        }

        public get valign(): string|number {
            return this._valign;
        }


        /**
         * 描边颜色
         */
        public set stroke(value: string|cc.Color) {
            this.setStroke(value);
        }

        protected setStroke(value: string|cc.Color): void {
            // 取消描边
            if (value == "none") {
                this.disableStroke();
            }
            else {
                if (typeof value === "string") value = hexToColor(<string>value);
                this._stroke = <cc.Color>value;
                this.enableStroke(this._stroke, this._strokeSize);
            }
        }

        public get stroke(): string|cc.Color {
            return this._stroke;
        }


        /**
         * 描边尺寸（粗细）
         */
        public set strokeSize(value: number) {
            this.setStrokeSize(value);
        }

        protected setStrokeSize(value: number): void {
            this._strokeSize = value;
            if (this._stroke != null) this.enableStroke(this._stroke, this._strokeSize);
        }

        public get strokeSize(): number {
            return this._strokeSize;
        }


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
         * 文本宽度
         * @param value
         */
        public set width(value: number) {
            this._width = value;
            this.setDimensions(this._width, this._height);
        }

        public get width(): number {
            if (this._width > 0) return this._width;
            return this.getContentSize().width;
        }


        /**
         * 文本高度
         * @param value
         */
        public set height(value: number) {
            this._height = value;
            this.setDimensions(this._width, this._height);
        }

        public get height(): number {
            if (this._height > 0) return this._height;
            return this.getContentSize().height;
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled()) return false;// 当前节点不可见

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            // 在手机端，不是 native，坐标值需要减一半
            if (!lolo.isNative && lolo.isMobile) {
                p.x *= 0.5;
                p.y *= 0.5;
            }
            lolo.temp_rect.setTo(0, 0, this.width, this.height);
            return lolo.temp_rect.contains(p.x, p.y);
        }


        //
    }
}