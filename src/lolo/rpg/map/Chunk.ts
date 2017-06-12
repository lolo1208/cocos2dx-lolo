namespace lolo.rpg {


    /**
     * 图块
     * @author LOLO
     */
    export class Chunk extends SimpleBitmap {

        /**地图ID*/
        public mapID: string;
        /**图块的 x 位置*/
        public chunkX: number;
        /**图块的 y 位置*/
        public chunkY: number;

        /**是否需要加载（加载中或加载完成，该值为false）*/
        public needLoad: boolean = true;
        /**已尝试加载次数*/
        public count: number = 0;

        /**加载结束时的回调*/
        private _handler: Handler;


        public constructor(id: string, info: MapInfo, x: number, y: number) {
            super();

            this.mapID = id;
            this.chunkX = x;
            this.chunkY = y;

            this.setPosition(x * info.chunkWidth, y * info.chunkHeight);
        }


        /**
         * 加载图像
         */
        public load(handler: Handler): void {
            this._handler = handler;
            cc.loader.loadImg(this.url, {isCrossOrigin: false}, this.loadHandler.bind(this));
        }


        /**
         * 加载结束回调
         * @param err
         * @param data
         */
        private loadHandler(err: any, data: any): void {
            let handler: Handler = this._handler;
            if (handler == null) return;
            this._handler = null;

            // 加载成功
            if (err == null) {
                let texture: cc.Texture2D;
                if (isNative) {
                    texture = data;
                }
                else {
                    texture = new cc.Texture2D();
                    texture.initWithElement(data);
                    texture.handleLoadedTexture();
                }
                this.setTexture(texture);
                handler.execute(this, true);
            }
            else {
                handler.execute(this, false);
                Logger.addLog("[RPG] 加载图块失败！" + this.url, Logger.LOG_TYPE_INFO);
            }
        }


        /**
         * 图块对应的URL
         */
        private get url(): string {
            return lolo.getResUrl(lolo.config.getUIConfig(Constants.CN_MAP_CHUNK, this.mapID, this.chunkX, this.chunkY));
        }


        public set name(value: string) {
            super.setName(value);
        }

        public get name(): string {
            return super.getName();
        }


        //


        /**
         * 清理，销毁
         */
        public destroy(): void {
            this.release();
            if (this._handler != null) {
                this._handler.clean();
                this._handler = null;
            }
        }

        //
    }
}