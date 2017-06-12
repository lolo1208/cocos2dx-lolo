namespace lolo.rpg {


    /**
     * 地图背景
     * @author LOLO
     */
    export class Background extends DisplayObjectContainer {

        /**缩略图*/
        private _thumbnail: SimpleBitmap;
        /**图块容器*/
        private _chunkC: DisplayObjectContainer;
        /**touch地图时，播放的动画*/
        private _touchAni: Animation;

        /**所在的地图*/
        private _map: Map;

        /**正在加载的Chunk列表*/
        private _loaderList: Chunk[];

        /**用于加载重试*/
        private _reloadTimer: Timer;


        public constructor(map: Map) {
            super();

            this._map = map;
            this._reloadTimer = new Timer(5000, new Handler(this.loadChunk, this));
        }


        public init(thumbnailTexture: cc.Texture2D): void {
            this.clean();

            // 显示缩略图
            this._thumbnail = new SimpleBitmap();
            this._thumbnail.texture = thumbnailTexture;
            this._thumbnail.width = this._map.info.mapWidth;
            this._thumbnail.height = this._map.info.mapHeight;
            this.addChild(this._thumbnail);

            //加载图块
            this._chunkC = new DisplayObjectContainer();
            this.addChild(this._chunkC);
            this._loaderList = [];
            this.loadChunk();
        }


        /**
         * 加载图块
         * @param isMax 值为false时，加载当前屏幕范围内的图块，值为true时，加载整个地图的图块
         */
        private loadChunk(isMax: boolean = false): void {
            this._reloadTimer.stop();
            if (this._loaderList == null) return;

            let map: Map = this._map;
            let cw: number = map.info.chunkWidth;
            let ch: number = map.info.chunkHeight;

            let screenArea: Rectangle = map.getScreenArea();
            let startX: number = isMax ? 0 : Math.floor(screenArea.x / cw);
            if (startX < 0) startX = 0;
            let maxX: number = Math.ceil((screenArea.x + screenArea.width) / cw);
            if (isMax || maxX > map.info.hChunkCount) maxX = map.info.hChunkCount;

            let y: number = isMax ? 0 : Math.floor(screenArea.y / ch);
            if (y < 0) y = 0;
            let maxY: number = Math.ceil((screenArea.y + screenArea.height) / ch);
            if (isMax || maxY > map.info.vChunkCount) maxY = map.info.vChunkCount;

            for (; y < maxY; y++) {
                for (let x = startX; x < maxX; x++) {
                    //最多2个图块同时加载
                    if (this._loaderList.length >= 2) return;
                    let chunk: Chunk = <Chunk>this._chunkC.getChildByName(x + "_" + y);
                    if (chunk == null) {
                        chunk = new Chunk(map.id, map.info, x, y);
                        chunk.name = x + "_" + y;
                        this._chunkC.addChild(chunk);
                    }
                    if (!chunk.needLoad) continue;

                    //尝试5次，仍无法加载。不再加载，显示马赛克图
                    chunk.needLoad = false;
                    chunk.count++;
                    if (chunk.count > 5) {
                        // TODO 背景图块无法加载时，显示马赛克背景还未现实
                        // let ox: number = cw * x;
                        // let oy: number = ch * y;
                        //
                        // let w: number = map.info.mapWidth - ox;
                        // if (w > cw) w = cw;
                        // let h: number = map.info.mapHeight - oy;
                        // if (h > ch) h = ch;
                        //
                        // let rect: Rectangle = CachePool.getRectangle(ox, oy, w, h);
                        // let texture: RenderTexture = new RenderTexture();
                        // texture.drawToTexture(this._thumbnail, rect);
                        // chunk.texture = texture;
                        // CachePool.recover(rect);
                        continue;
                    }

                    //加载图块
                    this._loaderList.push(chunk);
                    chunk.load(this._chunkLoadedHandler);
                }
            }

            if (!isMax) {
                this.loadChunk(true);
            }
            //全部加载完毕了
            else if (this._loaderList.length == 0) {
                this._thumbnail.destroy();
                this._thumbnail = null;
                this._loaderList = null;
                console.log("[RPG] 地图[" + map.id + "]背景图块全部加载完毕！");
            }
        }


        /**
         * 有图块加载结束
         * @param chunk
         * @param successful 加载是否成功
         */
        private chunkLoaded(chunk: Chunk, successful: boolean): void {
            this.removeChunkLoader(chunk);
            if (successful) {
                this.loadChunk();
            }
            else {
                chunk.needLoad = true;
                this._reloadTimer.start();
            }
        }

        private _chunkLoadedHandler: Handler = new Handler(this.chunkLoaded, this);


        /**
         * 清除chunk的加载状态
         * @param chunk
         */
        private removeChunkLoader(chunk: Chunk): void {
            if (this._loaderList != null) {
                for (let i = 0; i < this._loaderList.length; i++) {
                    if (this._loaderList[i] == chunk) {
                        this._loaderList.splice(i, 1);
                        return;
                    }
                }
            }
            chunk.destroy();
        }


        /**
         * 播放touch动画
         */
        public playTouchAnimation(): void {
            if (this._touchAni == null)
                this._touchAni = new Animation(lolo.config.getUIConfig(Constants.CN_ANI_TOUCH_MAP));

            let p: cc.Point = this.convertToNodeSpace(lolo.gesture.touchPoint);
            this._touchAni.x = p.x;
            this._touchAni.y = p.y;

            if (this._touchAni.parent == null) this.addChild(this._touchAni);
            this._touchAni.play(1, 1, 0, Handler.once(this._touchAni.destroy, this._touchAni));
        }


        //


        /**
         * 清理
         */
        public clean(): void {
            this._reloadTimer.stop();

            if (this._chunkC != null) {
                this._chunkC.destroy();
                this._chunkC = null;
            }

            if (this._thumbnail != null) {
                this._thumbnail.removeFromParent();
                this._thumbnail = null;
            }

            let children: cc.Node[] = this.children.concat();
            for (let i = 0; i < children.length; i++) {
                try {
                    children[i].destroy();
                }
                catch (error) {
                }
            }

            if (this._loaderList != null) {
                while (this._loaderList.length > 0)
                    this.removeChunkLoader(this._loaderList[0]);
                this._loaderList = null;
            }
        }

        //
    }
}