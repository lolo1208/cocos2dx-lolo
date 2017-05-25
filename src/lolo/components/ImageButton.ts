namespace lolo {


    /**
     * 图片按钮（图形皮肤 + 图形文本）
     * @author LOLO
     */
    export class ImageButton extends BaseButton {

        /**按钮上的图片*/
        protected _image: Skin;

        /**按钮的最小宽度*/
        protected _minWidth: number = 0;
        /**按钮的最大宽度*/
        protected _maxWidth: number = 0;
        /**按钮的最小高度*/
        protected _minHeight: number = 0;
        /**按钮的最大高度*/
        protected _maxHeight: number = 0;

        /**图片距顶像素*/
        protected _imagePaddingTop: number = 0;
        /**图片距底像素*/
        protected _imagePaddingBottom: number = 0;
        /**图片距左像素*/
        protected _imagePaddingLeft: number = 0;
        /**图片距右像素*/
        protected _imagePaddingRight: number = 0;

        /**图片的水平对齐方式，可选值["left", "center", "right"]*/
        protected _imageHorizontalAlign: string = "center";
        /**图片的垂直对齐方式，可选值["top", "middle", "bottom"]*/
        protected _imageVerticalAlign: string = "middle";

        /**是否自动调整大小*/
        protected _autoSize: boolean = false;


        public constructor() {
            super();

            this._image = new Skin();
            this.addChild(this._image);
        }


        protected setStyle(value: any): void {
            super.setStyle(value);

            if (value.autoSize != null) this._autoSize = value.autoSize;

            if (value.minWidth != null) this._minWidth = value.minWidth;
            if (value.maxWidth != null) this._maxWidth = value.maxWidth;
            if (value.minHeight != null) this._minHeight = value.minHeight;
            if (value.maxHeight != null) this._maxHeight = value.maxHeight;

            if (value.imagePaddingTop != null) this._imagePaddingTop = value.imagePaddingTop;
            if (value.imagePaddingBottom != null) this._imagePaddingBottom = value.imagePaddingBottom;
            if (value.imagePaddingLeft != null) this._imagePaddingLeft = value.imagePaddingLeft;
            if (value.imagePaddingRight != null) this._imagePaddingRight = value.imagePaddingRight;

            if (value.imageHorizontalAlign != null) this._imageHorizontalAlign = value.imageHorizontalAlign;
            if (value.imageVerticalAlign != null) this._imageVerticalAlign = value.imageVerticalAlign;

            if (value.imagePrefix != null) this.imagePrefix = value.imagePrefix;

            this.render();
        }


        /**
         * 设置图片的属性
         */
        public set imageProps(value: Object) {
            AutoUtil.initObject(this._image, value);
            this.render();
        }


        /**
         * 进行渲染
         * @param event Event.ENTER_FRAME 事件
         */
        protected doRender(event?: Event): void {
            //根据内容调整大小
            if (this._autoSize) {
                this._width = this._image.width + this._imagePaddingLeft + this._imagePaddingRight;
                if (this._maxWidth > 0 && this._width > this._maxWidth) this._width = this._maxWidth;
                else if (this._minWidth > 0 && this._width < this._minWidth) this._width = this._minWidth;

                this._height = this._image.height + this._imagePaddingTop + this._imagePaddingBottom;
                if (this._maxHeight > 0 && this._height > this._maxHeight) this._height = this._maxHeight;
                else if (this._minHeight > 0 && this._height < this._minHeight) this._height = this._minHeight;

                this._skin.width = this._width;
                this._skin.height = this._height;
            }

            // 根据图片的水平和垂直对齐方式来确定图片的位置
            let x: number, y: number;
            switch (this._imageHorizontalAlign) {
                case Constants.ALIGN_LEFT:
                    x = this._imagePaddingLeft;
                    break;
                case Constants.ALIGN_RIGHT:
                    x = this._width - this._imagePaddingRight - this._image.width;
                    break;
                default:
                    x = this._imagePaddingLeft + (this._width - this._imagePaddingLeft - this._imagePaddingRight - this._image.width) / 2;
            }

            switch (this._imageVerticalAlign) {
                case Constants.VALIGN_TOP:
                    y = this._imagePaddingTop;
                    break;
                case Constants.VALIGN_BOTTOM:
                    y = this._height - this._imagePaddingBottom - this._image.height;
                    break;
                default:
                    y = this._imagePaddingTop + (this._height - this._imagePaddingTop - this._imagePaddingBottom - this._image.height) / 2;
            }
            this._image.x = -this._width / 2 + x;
            this._image.y = -this._height / 2 + y;

            super.doRender();
        }


        protected setState(value: string): void {
            super.setStyle(value);
            this._image.state = value;
            this.render();
        }


        /**
         * 按钮上的图片
         */
        public get image(): Skin {
            return this._image;
        }


        /**
         * 按钮上的图片源名称的前缀（根据该前缀解析相对应的皮肤状态）
         */
        public set imagePrefix(value: string) {
            if (value == this._image.prefix) return;
            this._image.prefix = value;
            this._image.state = this._skin.state;
            this.render();
        }

        public get imagePrefix(): string {
            return this._image.prefix;
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
         * 图片的水平对齐方式，可选值["left", "center", "right"]
         */
        public set imageHorizontalAlign(value: string) {
            this._imageHorizontalAlign = value;
            this.render();
        }

        public get imageHorizontalAlign(): string {
            return this._imageHorizontalAlign;
        }


        /**
         * 图片的垂直对齐方式，可选值["top", "middle", "bottom"]
         */
        public set imageVerticalAlign(value: string) {
            this._imageVerticalAlign = value;
            this.render();
        }

        public get imageVerticalAlign(): string {
            return this._imageVerticalAlign;
        }

        //
    }
}