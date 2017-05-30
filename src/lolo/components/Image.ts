namespace lolo {


    /**
     * 图像
     * 文件可以是：*.png, *.jpg
     * @author LOLO
     */
    export class Image extends cc.Sprite {

        /**用于图像的LRU缓存（通过 url 获取 cc.Texture2D）*/
        private static _cache: LRUCache;
        /**等待被加载的图像回调列表（url 为 key）*/
        private static _handlers: LinkedList;
        /**当前正在加载的图像文件的url*/
        private static _currentURL: string;

        /**文件所在目录*/
        private _directory: string;
        /**文件的名称*/
        private _fileName: string;
        /**文件的扩展名*/
        private _extension: string;
        /**当前文件的完整路径（未格式化）*/
        private _url: string;

        /**设置的宽度*/
        private _width: number;
        /**设置的高度*/
        private _height: number;

        /**是否已经加载完成（无论成功还是失败）*/
        private _loaded: boolean = false;

        /**
         * 加载完成（成功或者失败）的回调：hander(success:boolean):void
         */
        public hander: Handler;

        /**用于在 native 下调用 setTextureRect()*/
        private _textureRect: Rectangle;


        /**
         * 初始化
         */
        public static initialize(): void {
            if (this._cache == null) {
                this._cache = new LRUCache();
                this._cache.disposeHandler = new Handler(this.disposeCallback, this);
                lolo.loader.event_addListener(LoadEvent.ITEM_COMPLETE, this.loadItemCompleteHandler, this);

                this._handlers = new LinkedList();
            }
        }


        /**
         * 加载图像文件完成
         * @param event
         */
        private static loadItemCompleteHandler(event: LoadEvent): void {
            // 图像资源会放入LRUCache中（并且会被LRUCache清理）
            let lii: LoadItemInfo = event.lii;
            if (lii.extension == Constants.EXTENSION_PNG || lii.extension == Constants.EXTENSION_JPG) {
                if (!this._cache.contains(lii.url)) {
                    // 存入缓存，url 为 key
                    let texture: cc.Texture2D = lii.data;
                    this._cache.add(lii.url, texture, texture.width * texture.height * 4);
                    this.loadHandler(lii.url, true);
                }
            }
        }

        /**
         * 加载图像文件失败
         * @param event
         */
        private static loadItemErrorHandler(event: LoadEvent): void {
            let lii: LoadItemInfo = event.lii;
            if (lii.extension == Constants.EXTENSION_PNG || lii.extension == Constants.EXTENSION_JPG) {
                Logger.addLog("[LFW] Image Error:" + event.type, Logger.LOG_TYPE_INFO);
                this.loadHandler(lii.url, false);
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
         * 日志和状态信息
         * @see LRUCache.log
         */
        public static get log(): LRUCacheLog {
            return this._cache.log;
        }


        /**
         * 加载成功或失败的回调
         * @param curUrl
         * @param success
         */
        private static loadHandler(curUrl: string = null, success?: boolean): void {
            if (curUrl != this._currentURL) return;

            // render() 回调
            if (curUrl != null) {
                let handlers: Handler[] = this._handlers.remove(curUrl).value;
                for (let i = 0; i < handlers.length; i++)
                    handlers[i].execute(curUrl, success);
            }

            // 没有文件需要被加载
            if (this._handlers.isEmpty()) {
                this._currentURL = null;
                return;
            }

            // 加载下一个文件
            this._currentURL = this._handlers.head.key;
            let lii: LoadItemInfo = new LoadItemInfo();
            lii.isSecretly = true;
            lii.type = Constants.RES_TYPE_IMG;
            lii.parseUrl(this._currentURL);
            lolo.loader.cleanRes(lii.url);// 可能已经加载过了
            lolo.loader.add(lii);
            lolo.loader.start();
        }


        public constructor() {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this._extension = Constants.EXTENSION_PNG;
            this._textureRect = new Rectangle();
        }


        /**
         * 文件所在目录
         */
        public set directory(value: string) {
            this._directory = value;
        }

        public get directory(): string {
            return this._directory;
        }


        /**
         * 文件的名称
         */
        public set fileName(value: string) {
            this.loadFile(value);
        }

        public get fileName(): string {
            return this._fileName;
        }


        /**
         * 文件的扩展名
         */
        public set extension(value: string) {
            this._extension = value;
        }

        public get extension(): string {
            return this._extension;
        }


        /**
         * 加载文件
         */
        public loadFile(fileName: string = null): void {
            if (fileName != null) this._fileName = fileName;
            if (this._directory == null || this._directory == "" || this._fileName == null || this._fileName == "") return;

            let url: string = "img/" + this._directory + "/" + this._fileName + "." + this._extension;
            if (url != this._url) {
                this._url = url;
                this._loaded = false;

                // 图像已被缓存了
                if (Image._cache.contains(url)) {
                    this.render(this._url, true);
                }
                else {
                    // 显示空纹理
                    this.setTexture(Constants.EMPTY_TEXTURE);

                    // 添加到队列中，等待加载
                    let handlers: Handler[] = Image._handlers.getValue(url);
                    if (handlers == null) {
                        handlers = [];
                        Image._handlers.push(handlers, url);
                    }
                    handlers.push(Handler.once(this.render, this));

                    Image.loadHandler();
                }
            }
        }


        /**
         * 加载完成后的回调
         * @param url
         * @param success
         */
        private render(url: string, success: boolean): void {
            // 加载的这段时间内，URL已经改变了
            if (url != this._url) return;

            if (success) {
                let texture: cc.Texture2D = Image._cache.getValue(url);
                this._textureRect.width = texture.width;
                this._textureRect.height = texture.height;
                this.setTexture(texture);
                this.setTextureRect(this._textureRect);
                this.sizeChanged();
            }
            this._loaded = true;

            let hander: Handler = this.hander;
            this.hander = null;
            if (hander != null) hander.execute(success);
        }


        /**
         * 是否已经加载完成（无论成功还是失败）
         */
        public get loaded(): boolean {
            return this._loaded;
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
        private sizeChanged(): void {
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
            this._url = null;
            if (this.hander != null) {
                this.hander.recycle();
                this.hander = null;
            }
        }

        //
    }
}