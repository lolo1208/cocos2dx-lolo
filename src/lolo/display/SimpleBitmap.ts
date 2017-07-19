namespace lolo {


    /**
     * 简单的位图显示对象，该对象与 cc.Sprite 无异
     * 注意：因native 与 html5 有很多表现不一致，所以不要直接从 cc.Sprite 继承，要从该类继承
     * @author LOLO
     */
    export class SimpleBitmap extends cc.Sprite {

        /**用于在 native 下调用 setTextureRect()*/
        protected _textureRect: Rectangle;


        public constructor() {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this._textureRect = CachePool.getRectangle();
        }


        public setTexture(texture: cc.Texture2D): void {
            super.setTexture(texture);
            if (texture == null) return;

            this._textureRect.width = texture.width;
            this._textureRect.height = texture.height;
            this.setTextureRect(this._textureRect);
            this.sizeChanged();
        }

        public set texture(value: cc.Texture2D) {
            this.setTexture(value);
        }

        public get texture(): cc.Texture2D {
            return this.getTexture();
        }


        /**
         * 获取纹理宽度
         */
        public get textureWidth(): number {
            return this._textureRect.width;
        }

        /**
         * 获取纹理高度
         */
        public get textureHeight(): number {
            return this._textureRect.height;
        }


        /**
         * width
         */
        public setWidth(value: number): void {
            this._width = value;
            this.sizeChanged();
        }

        public getWidth(): number {
            return (this._width > 0) ? this._width : this._textureRect.width;
        }

        /**
         * height
         */
        public setHeight(value: number): void {
            this._height = value;
            this.sizeChanged();
        }

        public getHeight(): number {
            return (this._height > 0) ? this._height : this._textureRect.height;
        }


        /**
         * scale
         */
        public setScale(scale: number, scaleY?: number): void {
            if (scaleY == null) scaleY = scale;
            this._scaleX = scale;
            this._scaleY = scaleY;
            this._width = this._textureRect.width * scale;
            this._height = this._textureRect.height * scaleY;
            this.sizeChanged();
        }

        /**
         * scaleX
         */
        public setScaleX(newScaleX: number): void {
            this._scaleX = newScaleX;
            this._width = this._textureRect.width * newScaleX;
            this.sizeChanged();
        }

        /**
         * scaleY
         */
        public setScaleY(newScaleY: number): void {
            this._scaleY = newScaleY;
            this._height = this._textureRect.height * newScaleY;
            this.sizeChanged();
        }


        /**
         * 尺寸（宽高）有变化
         */
        protected sizeChanged(): void {
            if (this.getTexture() == null) return;

            let w: number = this._width > 0 ? this._width : this._textureRect.width;
            let h: number = this._height > 0 ? this._height : this._textureRect.height;
            if (isNative) {
                this.setContentSize(w, h);
            }
            else {
                this._original_setScale(w / this._textureRect.width, h / this._textureRect.height);
            }
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled(worldPoint)) return false;// 当前节点不可见

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            if (isNative) {
                lolo.temp_rect.setTo(0, 0, this.getWidth(), this.getHeight());
                return lolo.temp_rect.contains(p.x, p.y);
            }
            else {
                return this._textureRect.contains(p.x, p.y);
            }
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            if (this._textureRect != null) {
                CachePool.recycle(this._textureRect);
                this._textureRect = null;
            }

            super.destroy();
        }


        //
    }
}