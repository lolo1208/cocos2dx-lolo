/// <reference path="../display/SimpleBitmap.ts"/>


namespace lolo {


    /**
     * 图像
     * 文件可以是：*.png, *.jpg
     * @author LOLO
     */
    export class Image extends SimpleBitmap {

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

        /**是否已经加载完成（无论成功还是失败）*/
        private _loaded: boolean = false;

        /**
         * 加载完成（成功或者失败）的回调：hander(successful:boolean):void
         */
        public hander: Handler;


        /**
         * 初始化
         */
        public static initialize(): void {
            if (this._cache == null) {
                this._cache = new LRUCache();
                this._cache.disposeHandler = new Handler(this.disposeCallback, this);
                lolo.loader.event_addListener(LoadEvent.ITEM_COMPLETE, this.loadItemCompleteHandler, this);
                lolo.loader.event_addListener(LoadEvent.ERROR, this.loadItemErrorHandler, this);

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
         * @param successful
         */
        private static loadHandler(curUrl: string = null, successful?: boolean): void {
            if (curUrl != this._currentURL) return;

            // render() 回调
            if (curUrl != null) {
                let handlers: Handler[] = this._handlers.remove(curUrl).value;
                for (let i = 0; i < handlers.length; i++)
                    handlers[i].execute(curUrl, successful);
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
            lii.url = this._currentURL;
            lolo.loader.cleanRes(lii.url);// 可能已经加载过了
            lolo.loader.add(lii);
            lolo.loader.start();
        }


        public constructor() {
            super();

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
                    handlers.push(lolo.handler(this.render, this));

                    Image.loadHandler();
                }
            }
        }


        /**
         * 加载完成后的回调
         * @param url
         * @param successful
         */
        private render(url: string, successful: boolean): void {
            if (url != this._url) return;

            if (successful) {
                this.setTexture(Image._cache.getValue(url));
                this.event_dispatch(new Event(Event.CHILD_RESIZE), true);
            }
            this._loaded = true;

            let hander: Handler = this.hander;
            this.hander = null;
            if (hander != null) hander.execute(successful);
        }


        /**
         * 是否已经加载完成（无论成功还是失败）
         */
        public get loaded(): boolean {
            return this._loaded;
        }


        //


        /**
         * 清空，显示空纹理
         */
        public clean(): void {
            this._url = null;
            this.setTexture(Constants.EMPTY_TEXTURE);
        }


        /**
         * 销毁
         */
        public destroy(): void {
            this._url = null;

            let hander: Handler = this.hander;
            this.hander = null;
            if (hander != null && hander.once) hander.recycle();

            super.destroy();
        }

        //
    }
}