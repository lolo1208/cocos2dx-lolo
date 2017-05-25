namespace lolo {


    /**
     * 粒子信息
     * @author LOLO
     */
    export interface ParticleInfo {
        /**粒子纹理*/
        texture: cc.Texture2D;
        /**粒子数据*/
        dictionary: any;
    }


    /**
     * 粒子对象
     * cc.ParticleSystem 在 native 下不能继承，只能绕着写
     * @author LOLO
     */
    export class Particle extends cc.ParticleSystem {

        /**LRU缓存（url 为 key）*/
        private static _cache: LRUCache;
        /**粒子数据加载完毕时的渲染回调列表（url 为 key）*/
        private static _handlers: Dictionary;


        /**
         * 初始化
         */
        public static initialize(): void {
            this._cache = new LRUCache();
            this._cache.maxMemorySize = 20 * 1024 * 1024;
            this._cache.disposeHandler = new Handler(this.disposeCallback, this);
            this._handlers = new Dictionary();
            loader.event_addListener(LoadEvent.ITEM_COMPLETE, this.loadItemCompleteHandler, this);


            //


            let p: any = cc.ParticleSystem.prototype;

            // 重写 cc.ParticleSystem 设置和获取坐标的方法，转到屏幕坐标系
            p._x = p._y = 0;

            p._original_setPositionX = p.setPositionX;
            p.setPositionX = function (x: number): void {
                this._x = x;
                this._original_setPositionX(x);
            };

            p._original_getPositionX = p.getPositionX;
            p.getPositionX = function (): number {
                return this._x;
            };

            Object.defineProperty(p, "x", {
                enumerable: true, configurable: true,
                set: p.setPositionX,
                get: p.getPositionX
            });


            p._original_setPositionY = p.setPositionY;
            p.setPositionY = function (y: number): void {
                this._y = y;
                this._original_setPositionY(-y);
            };

            p._original_getPositionY = p.getPositionY;
            p.getPositionY = function (): number {
                return this._y;
            };

            Object.defineProperty(p, "y", {
                enumerable: true, configurable: true,
                set: p.setPositionY,
                get: p.getPositionY
            });

            p._original_setPosition = p.setPosition;
            p.setPosition = function (newPosOrxValue: number|cc.Point, yValue?: number): void {
                if (yValue == null) {
                    this.setPositionX((<cc.Point>newPosOrxValue).x);
                    this.setPositionY((<cc.Point>newPosOrxValue).y);
                }
                else {
                    this.setPositionX(<number>newPosOrxValue);
                    this.setPositionY(yValue);
                }
            };


            // 实现 cc.ParticleSystem 的 sourceName 属性
            p._sourceName = "";
            p._url = "";

            Object.defineProperty(p, "sourceName", {
                enumerable: true, configurable: true,
                set: function (value: string): void {

                    this._sourceName = value;
                    this._url = "particle/" + value.replace(/\./g, "/") + ".plist";

                    // 粒子数据已经存在
                    if (Particle._cache.contains(this._url)) {
                        this.render(this._url);
                    }
                    else {
                        // 等待加载完成的回调
                        let handlers: Handler[] = Particle._handlers.getItem(this._url);
                        if (handlers == null) {
                            handlers = [];
                            Particle._handlers.setItem(this._url, handlers);
                        }
                        handlers.push(Handler.once(this.render, this));

                        // 加载粒子数据
                        let lii: LoadItemInfo = new LoadItemInfo();
                        lii.isSecretly = true;
                        lii.type = Constants.RES_TYPE_PARTICLE;
                        lii.parseUrl(this._url);
                        lolo.loader.cleanRes(lii.url);// 可能已经加载过了
                        lolo.loader.add(lii);
                        lolo.loader.start();
                    }
                },
                get: function (): string {
                    return this._sourceName;
                }
            });

            /**
             * 加载完成后的回调
             * @param url
             */
            p.render = function (url: string): void {
                if (url != this._url) return;

                // 移除当前已创建的粒子
                this.resetSystem();
                this.emissionRate = 0;
                this.update(0);

                let x: number = this._x, y: number = this._y;
                let duration: number = this.duration;

                let info: ParticleInfo = Particle._cache.getValue(url);
                // initWithDictionary() 之前得先有 texture 值，不然 native 会报 warn
                if (isNative && this.texture == null) this.texture = Constants.EMPTY_TEXTURE;
                this.initWithDictionary(info.dictionary);
                if (info.texture != null) this.texture = info.texture;

                this.setPosition(x, y);
                if (duration > 0) this.duration = duration;// 有设置过持续时间
            };
        }


        /**
         * 加载文件完成时，解析粒子数据
         * @param event
         */
        private static loadItemCompleteHandler(event: LoadEvent): void {
            if (event.lii.type != Constants.RES_TYPE_PARTICLE) return;// 不是粒子数据
            let url: string = event.lii.url;

            // 解析出纹理数据，存入缓存
            let dic: any = event.lii.data;
            let p: cc.ParticleSystem = new cc.ParticleSystem();
            dic["textureFileName"] = url;// 防止纹理名称重复
            p.initWithDictionary(dic);
            delete dic["textureImageData"]; // 移除base64图像数据
            let info: ParticleInfo = {texture: p.texture, dictionary: dic};
            this._cache.add(url, info, info.texture.width * info.texture.height * 4);

            // 执行回调 render()
            let handlers: Handler[] = this._handlers.getItem(url);
            if (handlers != null) {
                for (let i = 0; i < handlers.length; i++) {
                    handlers[i].execute(url);
                }
                this._handlers.removeItem(url);
            }
        }


        /**
         * 缓存对象被清理时，调用的回调函数。
         * @param url 对应的url
         * @param data 要被清理的数据
         */
        private static disposeCallback(url: string, data: ParticleInfo): void {
            lolo.loader.cleanRes(url);
        }


        /**
         * 创建并返回一个粒子对象
         * @param sourceName 源名称
         * @param duration 持续时间
         * @return {cc.ParticleSystem}
         */
        public static create(sourceName: string, duration: number = -1): cc.ParticleSystem {
            let p: cc.ParticleSystem = new cc.ParticleSystem();
            p.sourceName = sourceName;
            p.duration = duration;
            return p;
        }

        //
    }


    //
}