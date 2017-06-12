namespace lolo {


    /**
     * 简单的位图显示对象，该对象与 cc.Sprite 无异
     * 注意：因native 与 html5 有很多表现不一致，所以不要直接从 cc.Sprite 继承，要从该类继承
     * @author LOLO
     */
    export class SimpleBitmap extends cc.Sprite {

        protected _width: number;
        protected _height: number;

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
         * 宽度
         */
        public set width(value: number) {
            this._width = value;
            this.sizeChanged();
        }

        public get width(): number {
            if (this._width > 0) return this._width;
            let texture: cc.Texture2D = this.getTexture();
            if (texture) return texture.width;
            return 0;
        }


        /**
         * 高度
         */
        public set height(value: number) {
            this._height = value;
            this.sizeChanged();
        }

        public get height(): number {
            if (this._height > 0) return this._height;
            let texture: cc.Texture2D = this.getTexture();
            if (texture) return texture.height;
            return 0;
        }


        /**
         * 尺寸（宽高）有变化
         */
        protected sizeChanged(): void {
            let texture: cc.Texture2D = this.getTexture();
            if (texture == null) return;

            let w: number = this._width > 0 ? this._width : texture.width;
            let h: number = this._height > 0 ? this._height : texture.height;
            if (isNative) {
                this.setContentSize(w, h);
            }
            else {
                this.setScale(w / this._textureRect.width, h / this._textureRect.height);
            }
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled()) return false;// 当前节点不可见

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            if (isNative) {
                lolo.temp_rect.setTo(0, 0, this.width, this.height);
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
        }


        //
    }
}