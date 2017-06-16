namespace lolo {


    /**
     * 文本按钮（图形皮肤 + 链接文本）
     * @author LOLO
     */
    export class Button extends BaseButton {

        /**链接文本*/
        protected _labelText: LinkText;

        /**是否自动调整大小*/
        protected _autoSize: boolean = false;
        /**按钮的最小宽度*/
        protected _minWidth: number = 0;
        /**按钮的最大宽度*/
        protected _maxWidth: number = 0;
        /**按钮的最小高度*/
        protected _minHeight: number = 0;
        /**按钮的最大高度*/
        protected _maxHeight: number = 0;

        /**标签文本内容在语言包的ID*/
        protected _labelID: string = "";
        /**文本距顶像素*/
        protected _labelPaddingTop: number = 0;
        /**文本距底像素*/
        protected _labelPaddingBottom: number = 0;
        /**文本距左像素*/
        protected _labelPaddingLeft: number = 0;
        /**文本距右像素*/
        protected _labelPaddingRight: number = 0;

        /**文本的水平对齐方式，可选值["left", "center", "right"]*/
        protected _labelHorizontalAlign: string = "center";
        /**文本的垂直对齐方式，可选值["top", "middle", "bottom"]*/
        protected _labelVerticalAlign: string = "middle";


        public constructor() {
            super();
            this._labelText = new LinkText(false);
            this._bc.addChild(this._labelText);
        }


        protected setStyle(value: any): void {
            super.setStyle(value);

            if (value.autoSize != null) this._autoSize = value.autoSize;

            if (value.minWidth != null) this._minWidth = value.minWidth;
            if (value.maxWidth != null) this._maxWidth = value.maxWidth;
            if (value.minHeight != null) this._minHeight = value.minHeight;
            if (value.maxHeight != null) this._maxHeight = value.maxHeight;

            if (value.labelPaddingTop != null) this._labelPaddingTop = value.labelPaddingTop;
            if (value.labelPaddingBottom != null) this._labelPaddingBottom = value.labelPaddingBottom;
            if (value.labelPaddingLeft != null) this._labelPaddingLeft = value.labelPaddingLeft;
            if (value.labelPaddingRight != null) this._labelPaddingRight = value.labelPaddingRight;

            if (value.labelHorizontalAlign != null) this._labelHorizontalAlign = value.labelHorizontalAlign;
            if (value.labelVerticalAlign != null) this._labelVerticalAlign = value.labelVerticalAlign;

            if (value.labelStyle != null) this._labelText.style = value.labelStyle;

            this.render();
        }


        /**
         * 设置链接文本的属性
         */
        public set labelProps(value: Object) {
            AutoUtil.initObject(this._labelText, value);
            this.render();
        }


        /**
         * 进行渲染
         * @param event Event.ENTER_FRAME 事件
         */
        protected doRender(event?: Event): void {
            let label: LinkText = this._labelText;

            if (label.currentText.length == 0) {
                super.doRender();
                return;
            }

            let w: number;
            if (this._autoSize) {
                label.width = 0;// 重置宽度

                this._width = label.width + this._labelPaddingLeft + this._labelPaddingRight;
                if (this._maxWidth > 0 && this._width > this._maxWidth) this._width = this._maxWidth;
                else if (this._minWidth > 0 && this._width < this._minWidth) this._width = this._minWidth;
                w = this._width - this._labelPaddingLeft - this._labelPaddingRight;
                label.width = w;

                this._height = label.height + this._labelPaddingTop + this._labelPaddingBottom;
                if (this._maxHeight > 0 && this._height > this._maxHeight) this._height = this._maxHeight;
                else if (this._minHeight > 0 && this._height < this._minHeight) this._height = this._minHeight;

                this._skin.width = this._width;
                this._skin.height = this._height;
            }
            else {
                w = this._width - this._labelPaddingLeft - this._labelPaddingRight;
                label.width = w;
            }
            label.height = this._height - this._labelPaddingTop - this._labelPaddingBottom;

            label.align = this._labelHorizontalAlign;
            label.valign = this._labelVerticalAlign;
            label.x = this._labelPaddingLeft - this._width / 2;
            label.y = this._labelPaddingTop - this._height / 2;

            super.doRender();
        }


        protected setState(state: string): void {
            super.setState(state);

            switch (state) {
                case Skin.UP:
                    this._labelText.switchStyle(LinkText.STYlE_UP);
                    break;
                case Skin.OVER:
                    this._labelText.switchStyle(LinkText.STYLE_OVER);
                    break;
                case Skin.DOWN:
                    this._labelText.switchStyle(LinkText.STYLE_DOWN);
                    break;
                case Skin.DISABLED:
                    this._labelText.switchStyle(LinkText.STYLE_DISABLED);
                    break;
                case Skin.SELECTED_UP:
                    this._labelText.switchStyle(LinkText.STYLE_SELECTED);
                    break;
                case Skin.SELECTED_OVER:
                    this._labelText.switchStyle(LinkText.STYLE_SELECTED);
                    break;
                case Skin.SELECTED_DOWN:
                    this._labelText.switchStyle(LinkText.STYLE_SELECTED);
                    break;
                case Skin.SELECTED_DISABLED:
                    this._labelText.switchStyle(LinkText.STYLE_DISABLED);
                    break;
            }

            this.render();
        }


        /**
         * 按钮上的文本框对象
         */
        public get textField(): LinkText {
            return this._labelText;
        }


        /**
         * 文本框的内容
         */
        public set label(value: string) {
            if (value == null) value = "";
            this._labelText.text = value;
            this._labelID = "";
            this.render();
        }

        public get label(): string {
            return this._labelText.currentText;
        }


        /**
         * 标签文本内容在语言包的ID（将会通过ID自动到语言包中拿取对应的内容）
         */
        public set labelID(value: string) {
            this.label = getLanguage(value);
            this._labelID = value;
        }

        public get labelID(): string {
            return this._labelID;
        }


        /**
         * 是否自动调整大小
         */
        public set autoSize(value: boolean) {
            this._autoSize = value;
            this.render();
        }

        public get autoSize(): boolean {
            return this._autoSize;
        }


        /**
         * 最小宽度
         */
        public set minWidth(value: number) {
            this._minWidth = value;
            this.render();
        }

        public get minWidth(): number {
            return this._minWidth;
        }


        /**
         * 最大宽度
         */
        public set maxWidth(value: number) {
            this._maxWidth = value;
            this.render();
        }

        public get maxWidth(): number {
            return this._maxWidth;
        }


        /**
         * 最小高度
         */
        public set minHeight(value: number) {
            this._minHeight = value;
            this.render();
        }

        public get minHeight(): number {
            return this._minHeight;
        }


        /**
         * 最大高度
         */
        public set maxHeight(value: number) {
            this._maxHeight = value;
            this.render();
        }

        public get maxHeight(): number {
            return this._maxHeight;
        }


        /**
         * 文本的水平对齐方式，可选值["left", "center", "right"]
         */
        public set labelHorizontalAlign(value: string) {
            this._labelHorizontalAlign = value;
            this.render();
        }

        public get labelHorizontalAlign(): string {
            return this._labelHorizontalAlign;
        }


        /**
         * 文本的垂直对齐方式，可选值["top", "middle", "bottom"]
         */
        public set labelVerticalAlign(value: string) {
            this._labelVerticalAlign = value;
            this.render();
        }

        public get labelVerticalAlign(): string {
            return this._labelVerticalAlign;
        }


        //
    }
}