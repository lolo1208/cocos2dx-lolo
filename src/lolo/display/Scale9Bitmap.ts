namespace lolo {

    const enum index {TL, TC, TR, ML, MC, MR, BL, BC, BR}


    /**
     * HTML5中的九切片位图
     * @author LOLO
     */
    export class Scale9Bitmap {

        /**缓存池*/
        private static _pool: Scale9Bitmap[] = [];

        /**对应的 Bitmap 对象*/
        public target: Bitmap;

        /**空纹理区域*/
        private _rect: Rectangle;
        /**九切片图片实例列表*/
        private _bitmaps: Scale9Sprite[];


        /**
         * 创建（从池中获取）一个 Scale9Bitmap 实例
         * @param target
         * @return {Scale9Bitmap}
         */
        public static create(target: Bitmap): Scale9Bitmap {
            let s9b: Scale9Bitmap = (this._pool.length > 0)
                ? this._pool.pop() : new Scale9Bitmap();

            let bitmaps = s9b.bitmaps;
            let filter: string = target._filter;
            for (let i = 0; i < 9; i++) {
                target.addChild(bitmaps[i]);
                bitmaps[i].setFilter(filter);
            }

            s9b.target = target;
            return s9b;
        }


        /**
         * 回收到池
         * @param s9b
         */
        public static recycle(s9b: Scale9Bitmap): void {
            for (let i = 0; i < 9; i++) {
                s9b.bitmaps[i].removeFromParent();
            }
            s9b.target = null;
            this._pool.push(s9b);
        }


        /**
         * 清理缓存池
         */
        public static clean(): void {
            let len: number = this._pool.length;
            for (let i = 0; i < len; i++) {
                this._pool[i].destroy();
            }
            this._pool.length = 0;
        }


        /**
         * 请使用 Scale9Bitmap.create() 创建 Scale9Bitmap 实例
         */
        public constructor() {
            this._rect = CachePool.getRectangle();
            this._bitmaps = [];
            for (let i = 0; i < 9; i++) this._bitmaps[i] = new Scale9Sprite();
        }


        /**
         * 设置属性
         * @param texture
         * @param info
         * @param width
         * @param height
         */
        public setTo(texture: cc.Texture2D, info: BitmapInfo, width: number, height: number): void {
            let grid: Rectangle = info.scale9Grid;
            let zx: number = info.rect.x;
            let zy: number = info.rect.y;
            let gx: number = zx + grid.x;
            let gy: number = zy + grid.y;
            let mx: number = gx + grid.width;
            let my: number = gy + grid.height;
            let w: number = info.rect.width - grid.x - grid.width;
            let h: number = info.rect.height - grid.y - grid.height;
            let bitmaps: Scale9Sprite[] = this._bitmaps;

            bitmaps[index.TL].setTo(texture, zx, zy, grid.x, grid.y);
            bitmaps[index.TC].setTo(texture, gx, zy, grid.width, grid.y);
            bitmaps[index.TR].setTo(texture, mx, zy, w, grid.y);
            bitmaps[index.ML].setTo(texture, zx, gy, grid.x, grid.height);
            bitmaps[index.MC].setTo(texture, gx, gy, grid.width, grid.height);
            bitmaps[index.MR].setTo(texture, mx, gy, w, grid.height);
            bitmaps[index.BL].setTo(texture, zx, my, grid.x, h);
            bitmaps[index.BC].setTo(texture, gx, my, grid.width, h);
            bitmaps[index.BR].setTo(texture, mx, my, w, h);

            bitmaps[index.TC].x = bitmaps[index.MC].x = bitmaps[index.BC].x = bitmaps[index.TL].width;

            this._rect.width = width;
            this._rect.height = height;
            this.render();
        }


        /**
         * 渲染
         */
        private render(): void {
            let bitmaps: Scale9Sprite[] = this._bitmaps;
            let w: number = this._rect.width, h: number = this._rect.height;

            bitmaps[index.TL].y = bitmaps[index.TC].y = bitmaps[index.TR].y = -h;
            bitmaps[index.ML].y = bitmaps[index.MC].y = bitmaps[index.MR].y = bitmaps[index.TL].height - h;
            bitmaps[index.BL].y = bitmaps[index.BC].y = bitmaps[index.BR].y = h - bitmaps[index.BR].height - h;
            bitmaps[index.TR].x = bitmaps[index.MR].x = bitmaps[index.BR].x = w - bitmaps[index.BR].width;
            bitmaps[index.TC].width = bitmaps[index.MC].width = bitmaps[index.BC].width = w - bitmaps[index.TL].width - bitmaps[index.BR].width;
            bitmaps[index.ML].height = bitmaps[index.MC].height = bitmaps[index.MR].height = h - bitmaps[index.TL].height - bitmaps[index.BR].height;

            this.target.setTextureRect(this._rect);
        }


        /**
         * 宽度
         * @param value
         */
        public set width(value: number) {
            if (value == this._rect.width) return;
            this._rect.width = value;
            this.render();
        }

        public get width(): number {
            return this._rect.width;
        }


        /**
         * 高度
         * @param value
         */
        public set height(value: number) {
            if (value == this._rect.height) return;
            this._rect.height = value;
            this.render();
        }

        public get height(): number {
            return this._rect.height;
        }


        /**
         * 对应的九块图像
         * @return {Scale9Sprite[]}
         */
        public get bitmaps(): Scale9Sprite[] {
            return this._bitmaps;
        }


        /**
         * 销毁
         */
        public destroy(): void {
            if (this._bitmaps != null) {
                for (let i = 0; i < 9; i++) {
                    this._bitmaps[i].destroy();
                }
                this._bitmaps = null;
            }
            if (this._rect != null) {
                CachePool.recycle(this._rect);
                this._rect = null;
            }
        }


        //
    }


    /**
     * HTML5中的九切片位图对应的图像块。
     * 每个 Scale9Bitmap 都拥有9个实例
     * @author LOLO
     */
    export class Scale9Sprite extends cc.Sprite {

        private _rect: Rectangle;


        public constructor() {
            super();

            this.setAnchorPoint(0, 1);
            this._rect = CachePool.getRectangle();
        }


        public setTo(texture: cc.Texture2D, x: number, y: number, w: number, h: number): void {
            this._width = w;
            this._height = h;
            this.setTexture(texture);
            this._rect.setTo(x, y, w, h);
            this.setTextureRect(this._rect);
        }


        public setWidth(value: number): void {
            this._width = value;
            this.setScaleX(value / this._rect.width);
        }


        public setHeight(value: number): void {
            this._height = value;
            this.setScaleY(value / this._rect.height);
        }


        public destroy(): void {
            if (this._rect != null) {
                CachePool.recycle(this._rect);
                this._rect = null;
            }

            super.destroy();
        }

        //
    }
}