namespace lolo {


    /**
     * 位图显示对象的描述信息
     * @author LOLO
     */
    export interface BitmapInfo {
        /**图像对应的sourceName*/
        sn: string;
        /**图像所属文件的URL*/
        url: string;
        /**在大图中的位置和宽高*/
        rect: Rectangle;
        /**锚点位置*/
        anchor: Point;
        /**九切片区域。不是九切片图像时，该值为null*/
        scale9Grid: Rectangle;
    }


    /**
     * 位图显示对象，支持九切片。
     * 在位图数据还未加载前，将什么都不显示
     * @author LOLO
     */
    export class Bitmap extends cc.Sprite {

        /**配置信息列表（通过sn获取BitmapInfo）*/
        private static _config: Dictionary;
        /**LRU缓存（通过url获取Texture）*/
        private static _cache: LRUCache;
        /**纹理加载完毕时的渲染回调列表（url 为 key）*/
        private static _handlers: Dictionary;

        /**图像的源名称*/
        private _sourceName: string = "";
        /**当前图像描述信息*/
        private _info: BitmapInfo;

        /**html5下的九切片对象*/
        private _scale9Bitmap: Scale9Bitmap;

        /**在sourceName改变时，是否需要自动重置宽高*/
        public autoResetSize: boolean = true;


        /**
         * 初始化
         */
        public static initialize(): void {

            // 解析配置文件
            this._config = new Dictionary();
            let configList: any[] = loader.getResByConfigName("bitmapConfig", true);
            for (let i = 0; i < configList.length; i++) {
                let fileInfo: any = configList[i];
                for (let n = 0; n < fileInfo.list.length; n++) {
                    let itemInfo: any = fileInfo.list[n];
                    let bitmapInfo: BitmapInfo = {
                        sn: itemInfo.sn,
                        url: "ui/" + fileInfo.url,
                        rect: new Rectangle(itemInfo.x, itemInfo.y, itemInfo.w, itemInfo.h),
                        anchor: new Point(itemInfo.ox, itemInfo.oy),
                        scale9Grid: null
                    };

                    // 得出 anchorX / anchorY 对应的值
                    bitmapInfo.anchor.setTo(
                        bitmapInfo.anchor.x / bitmapInfo.rect.width,
                        1 - bitmapInfo.anchor.y / bitmapInfo.rect.height
                    );

                    // 九切片信息
                    if (itemInfo.g != null) {
                        let arr: any[] = itemInfo.g.split(",");
                        let grid: Rectangle = new Rectangle(+arr[0], +arr[1], +arr[2], +arr[3]);
                        // 得出比例，可直接用于 CCSprite.setCenterRectNormalized()
                        if (isNative) {
                            grid.setTo(
                                grid.x / bitmapInfo.rect.width,
                                grid.y / bitmapInfo.rect.height,
                                grid.width / bitmapInfo.rect.width,
                                grid.height / bitmapInfo.rect.height,
                            );
                        }
                        bitmapInfo.scale9Grid = grid;
                    }
                    // 存入 _config
                    this._config.setItem(bitmapInfo.sn, bitmapInfo);
                }
            }

            this._handlers = new Dictionary();

            // 创建缓存池
            this._cache = new LRUCache();
            this._cache.maxMemorySize = 200 * 1024 * 1024;
            this._cache.disposeHandler = new Handler(this.disposeCallback, this);
            loader.event_addListener(LoadEvent.ITEM_COMPLETE, this.loadItemCompleteHandler, this);
        }


        /**
         * 加载单个文件完成，解析图像包数据
         * @param event
         */
        private static loadItemCompleteHandler(event: LoadEvent): void {
            if (event.lii.extension != Constants.EXTENSION_UI) return;// 不是UI数据

            // 存入缓存，url 为 key
            let texture: cc.Texture2D = event.lii.data;
            this._cache.add(event.lii.url, texture, texture.width * texture.height * 4);

            // 执行回调 render()
            let handlers: Handler[] = this._handlers.getItem(event.lii.url);
            if (handlers != null) {
                for (let i = 0; i < handlers.length; i++) {
                    handlers[i].execute();
                }
                this._handlers.removeItem(event.lii.url);
            }
        }


        /**
         * 缓存对象被清理时，调用的回调函数。
         * @param url 对应的url
         * @param data 要被清理的数据
         */
        private static disposeCallback(url: string, data: cc.Texture2D): void {
            lolo.loader.cleanRes(url);
        }


        /**
         * 获取指定源名称的图像在配置中的信息
         * @param sourceName
         * @return
         */
        public static getConfigInfo(sourceName: string): BitmapInfo {
            return this._config.getItem(sourceName);
        }


        /**
         * 日志和状态信息
         */
        public static get log(): LRUCacheLog {
            if (this._cache != null) return this._cache.log;
            return null;
        }


        /**
         * 构造一个位图显示对象
         * @param sourceName 图像的源名称
         */
        public constructor(sourceName: string = "") {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this.sourceName = sourceName;
        }


        /**
         * 图像的源名称
         */
        public set sourceName(value: string) {
            if (value == this._sourceName) return;

            this._sourceName = value;
            let info: BitmapInfo = this._info = Bitmap._config.getItem(value);

            //配置文件中不存在该资源
            if (info == null) {
                Logger.addLog("[LFW] Bitmap.sourceName: " + value + " 是不存在的资源！", Logger.LOG_TYPE_INFO);
            }
            else {
                // 重置宽高
                if (this.autoResetSize) {
                    this._width = info.rect.width;
                    this._height = info.rect.height;
                }

                // 加载纹理
                if (!Bitmap._cache.contains(info.url)) {
                    let lii: LoadItemInfo = new LoadItemInfo();
                    lii.isSecretly = true;
                    lii.type = Constants.RES_TYPE_IMG;
                    lii.url = info.url;
                    lolo.loader.cleanRes(lii.url);// 可能已经加载过了
                    lolo.loader.add(lii);
                    lolo.loader.start();

                    //等待加载完成的回调
                    let handlers: Handler[] = Bitmap._handlers.getItem(info.url);
                    if (handlers == null) {
                        handlers = [];
                        Bitmap._handlers.setItem(info.url, handlers);
                    }
                    handlers.push(Handler.once(this.render, this));
                }
            }
            this.render();
        }

        public get sourceName(): string {
            return this._sourceName;
        }


        /**
         * 在加载完成后，显示当前图像
         */
        protected render(): void {
            if (this.destroyed) return;

            let texture: cc.Texture2D;
            let info: BitmapInfo = this._info;
            let isEmpty: boolean = info == null;

            if (!isEmpty) {
                texture = Bitmap._cache.getValue(info.url);
                isEmpty = texture == null;
            }

            if (!isEmpty && info != null) {
                this.setTexture(texture);
                this.setTextureRect(info.rect);
                this.setAnchorPoint(info.anchor);

                // 九切片纹理
                if (info.scale9Grid != null) {
                    this.setScale(1, 1);

                    if (isNative) {
                        this.setContentSize(this._width, this._height);
                        this.setCenterRectNormalized(info.scale9Grid);
                    }

                    else {
                        this.setTexture(Constants.EMPTY_TEXTURE);
                        this.setAnchorPoint(0, 1);

                        if (this._scale9Bitmap == null) this._scale9Bitmap = Scale9Bitmap.create(this);
                        this._scale9Bitmap.setTo(texture, info, this._width, this._height);
                    }
                }

                // 不是九切片
                else {
                    this.setScale(this._width / info.rect.width, this._height / info.rect.height);

                    if (this._scale9Bitmap != null) {
                        Scale9Bitmap.recycle(this._scale9Bitmap);
                        this._scale9Bitmap = null;
                    }
                }

            }
            else {
                this.setScale(1, 1);
                this.setTexture(Constants.EMPTY_TEXTURE);
                this.setTextureRect(Constants.EMPTY_TEXTURE_RECT);
            }
        }


        /**
         * 重置宽高（将会置成当前图像的默认宽高）
         */
        public resetSize(): void {
            if (this._info == null) return;
            this.width = this._info.rect.width;
            this.height = this._info.rect.height;
        }


        /**
         * 图像的宽
         */
        public setWidth(value: number): number {
            this._width = value;
            if (this._info == null) return;

            if (this._info.scale9Grid != null) {
                if (this._scale9Bitmap != null) {
                    this._scale9Bitmap.width = value;
                }
                else {
                    this.setContentSize(this._width, this._height);
                }
            }
            else {
                this.scaleX = value / this._info.rect.width;
            }
        }


        /**
         * 图像的高
         */
        public setHeight(value: number): void {
            this._height = value;
            if (this._info == null) return;

            if (this._info.scale9Grid != null) {
                if (this._scale9Bitmap != null) {
                    this._scale9Bitmap.height = value;
                }
                else {
                    this.setContentSize(this._width, this._height);
                }
            }
            else {
                this.scaleY = value / this._info.rect.height;
            }
        }


        /**
         * 是否为九切片图像
         */
        public get isScale9(): boolean {
            return this._info != null && this._info.scale9Grid != null;
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled()) return false;// 当前节点不可见

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            if (this._info == null) return false;

            if (this._info.scale9Grid != null)
                lolo.temp_rect.setTo(0, 0, this._width, this._height);
            else
                lolo.temp_rect.setTo(0, 0, this._info.rect.width, this._info.rect.height);

            return lolo.temp_rect.contains(p.x, p.y);
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            if (this._scale9Bitmap != null) {
                Scale9Bitmap.recycle(this._scale9Bitmap);
                this._scale9Bitmap = null;
            }

            super.destroy();
        }


        //
    }
}

