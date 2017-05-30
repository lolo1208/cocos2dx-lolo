namespace lolo {

    const enum index {TL, TC, TR, ML, MC, MR, BL, BC, BR}


    /**
     * HTML5中的九切片位图
     * @author LOLO
     */
    export class Scale9Bitmap {


        private static _pool: Scale9Bitmap[] = [];


        /**空纹理区域*/
        public rect: lolo.Rectangle;
        /**对应的 Bitmap 对象*/
        public target: Bitmap;

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

            for (let i = 0; i < 9; i++)
                target.addChild(s9b.bitmaps[i]);

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
         * 请使用 Scale9Bitmap.create() 创建 Scale9Bitmap 实例
         */
        public constructor() {
            this.rect = new Rectangle();
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

            this.rect.width = width;
            this.rect.height = height;
            this.render();
        }


        /**
         * 渲染
         */
        private render(): void {
            let bitmaps: Scale9Sprite[] = this._bitmaps;
            let w: number = this.rect.width, h: number = this.rect.height;

            bitmaps[index.TL].y = bitmaps[index.TC].y = bitmaps[index.TR].y = -h;
            bitmaps[index.ML].y = bitmaps[index.MC].y = bitmaps[index.MR].y = bitmaps[index.TL].height - h;
            bitmaps[index.BL].y = bitmaps[index.BC].y = bitmaps[index.BR].y = h - bitmaps[index.BR].height - h;
            bitmaps[index.TR].x = bitmaps[index.MR].x = bitmaps[index.BR].x = w - bitmaps[index.BR].width;
            bitmaps[index.TC].width = bitmaps[index.MC].width = bitmaps[index.BC].width = w - bitmaps[index.TL].width - bitmaps[index.BR].width;
            bitmaps[index.ML].height = bitmaps[index.MC].height = bitmaps[index.MR].height = h - bitmaps[index.TL].height - bitmaps[index.BR].height;

            this.target.setTextureRect(this.rect);
        }


        /**
         * 宽度
         * @param value
         */
        public set width(value: number) {
            if (value == this.rect.width) return;
            this.rect.width = value;
            this.render();
        }

        public get width(): number {
            return this.rect.width;
        }


        /**
         * 高度
         * @param value
         */
        public set height(value: number) {
            if (value == this.rect.height) return;
            this.rect.height = value;
            this.render();
        }

        public get height(): number {
            return this.rect.height;
        }


        /**
         * 对应的九块图像
         * @return {Scale9Sprite[]}
         */
        public get bitmaps(): Scale9Sprite[] {
            return this._bitmaps;
        }


        //
    }


    /**
     * HTML5中的九切片位图对应的图像块。
     * 每个 Scale9Bitmap 都拥有9个实例
     * @author LOLO
     */
    export class Scale9Sprite extends cc.Sprite {

        public rect: Rectangle;
        private _width: number;
        private _height: number;
        private _y: number;


        public constructor() {
            super();

            this.setAnchorPoint(0, 1);
            this.rect = new Rectangle();
        }

        public setTo(texture: cc.Texture2D, x: number, y: number, w: number, h: number): void {
            this._width = w;
            this._height = h;
            this.rect.setTo(x, y, w, h);
            this.setTexture(texture);
            this.setTextureRect(this.rect);
        }


        public set width(value: number) {
            this._width = value;
            this.scaleX = value / this.rect.width;
        }

        public get width(): number {
            return this._width;
        }


        public set height(value: number) {
            this._height = value;
            this.scaleY = value / this.rect.height;
        }

        public get height(): number {
            return this._height;
        }


        public set y(value: number) {
            this._y = value;
            this.setPositionY(-value);
        }

        public get y(): number {
            return this._y;
        }

        //
    }
}