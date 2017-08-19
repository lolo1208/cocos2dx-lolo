/// <reference path="../geom/Rectangle.ts"/>
/// <reference path="../geom/Point.ts"/>


namespace lolo {


    /**
     * 动画的描述信息
     * @author LOLO
     */
    export interface AnimationInfo {
        /**动画对应的sourceName*/
        sn: string;
        /**动画所属文件的URL*/
        url: string;
        /**默认帧频*/
        fps: number;
        /**帧图像信息*/
        frames: AnimationFrameInfo[];
    }


    /**
     * 动画帧的描述信息
     * @author LOLO
     */
    export interface AnimationFrameInfo {
        /**在大图中的位置和宽高*/
        rect: lolo.Rectangle;
        /**锚点位置*/
        anchor: lolo.Point;
    }


    /**
     * 动画
     * @author LOLO
     */
    export class Animation extends cc.Sprite {

        /**配置信息列表（通过 sn 获取 AnimationInfo）*/
        private static _config: Dictionary;
        /**LRU缓存（通过 url 获取 cc.Texture2D）*/
        private static _cache: LRUCache;
        /**纹理加载完毕时的渲染回调列表（url 为 key）*/
        private static _handlers: Dictionary;

        /**当前动画的描述信息*/
        private _info: AnimationInfo;

        /**动画的帧频*/
        private _fps: number;
        /**动画是否正在播放中*/
        private _playing: boolean = false;
        /**当前帧编号*/
        private _currentFrame: number = 0;
        /**动画的源名称*/
        private _sourceName: string = "";
        /**动画当前已重复播放的次数*/
        private _currentRepeatCount: number;

        /**是否反向播放动画*/
        public reverse: boolean = false;
        /**动画的重复播放次数（值为0时，表示无限循环）*/
        public repeatCount: number;
        /**动画达到重复播放次数时的停止帧*/
        public stopFrame: number;
        /**动画在完成了指定重复次数，并到达了停止帧时的回调（异常情况将不会触发回调，如：位图数据包还未初始化，帧数为0，以及重复次数为0）*/
        public handler: Handler;
        /**是否需要抛出AnimationEvent.ENTER_FRAME事件*/
        public propagateAnimationEvents: boolean = false;

        /**用于播放动画*/
        private _timer: Timer;


        /**
         * 初始化
         */
        public static initialize(): void {
            // 解析配置文件
            this._config = new Dictionary();
            let configList: any[] = lolo.loader.getResByConfigName("animationConfig", true);
            for (let i = 0; i < configList.length; i++) {
                let fileInfo: any = configList[i];
                for (let n = 0; n < fileInfo.list.length; n++) {
                    let itemInfo: any = fileInfo.list[n];
                    let aniInfo: AnimationInfo = {
                        sn: itemInfo.sn,
                        url: "ani/" + fileInfo.url,
                        fps: itemInfo.fps,
                        frames: [],
                        handlers: null
                    };

                    for (let j = 0; j < itemInfo.frames.length; j++) {
                        let frameInfo: any = itemInfo.frames[j];
                        let rect: Rectangle = new Rectangle(frameInfo.x, frameInfo.y, frameInfo.w, frameInfo.h);
                        let anchor: Point = new Point(frameInfo.ox, frameInfo.oy);
                        anchor.x = anchor.x / rect.width;
                        anchor.y = 1 - anchor.y / rect.height;
                        aniInfo.frames.push({anchor: anchor, rect: rect});
                    }

                    // 存入 _config
                    this._config.setItem(aniInfo.sn, aniInfo);
                }
            }

            this._handlers = new Dictionary();

            this._cache = new LRUCache();
            this._cache.maxMemorySize = 200 * 1024 * 1024;
            this._cache.disposeHandler = new Handler(this.disposeCallback, this);
            loader.event_addListener(LoadEvent.ITEM_COMPLETE, this.loadItemCompleteHandler, this);
        }


        /**
         * 加载单个文件完成
         * @param event
         */
        private static loadItemCompleteHandler(event: LoadEvent): void {
            if (event.lii.extension != Constants.EXTENSION_ANI) return;// 不是动画数据

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
         * 日志和状态信息
         */
        public static get log(): LRUCacheLog {
            return this._cache.log;
        }


        /**
         * 缓存中是否有指定 sourceName 的动画
         * @param sourceName
         * @return
         */
        public static hasAnimation(sourceName: string): boolean {
            let info: AnimationInfo = this._config.getItem(sourceName);
            return this._cache.contains(info.url);
        }


        /**
         * 获取一个动画对应的动画包的url
         * @param sourceName
         * @return
         */
        public static getUrl(sourceName: string): string {
            let info: AnimationInfo = this._config.getItem(sourceName);
            if (info == null) return null;
            return info.url;
        }

        /**
         * 获取指定源名称的动画在配置中的信息
         * @param sourceName
         * @return
         */
        public static getConfigInfo(sourceName: string): AnimationInfo {
            return this._config.getItem(sourceName);
        }


        /**
         * 构造一个位图动画
         * @param sourceName 动画的源名称
         * @param fps 动画的帧频（默认值：0，表示使用打包时的设置的帧频）
         */
        public constructor(sourceName: string = "", fps: number = 0) {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this._timer = new Timer(1000, new Handler(this.timerHandler, this));

            this.sourceName = sourceName;
            if (fps != 0) this.fps = fps;
        }


        /**
         * 动画的源名称
         */
        public set sourceName(value: string) {
            //动画的源名称没有改变
            if (value == this._sourceName) return;

            this._sourceName = value;
            let info: AnimationInfo = this._info = Animation._config.getItem(value);

            //配置文件中不存在该资源
            if (info == null) {
                Logger.addLog("[LFW] Bitmap.sourceName: " + value + " 是不存在的资源！", Logger.LOG_TYPE_INFO);
            }
            else {
                this.fps = info.fps;

                // 加载动画纹理
                if (!Animation._cache.contains(info.url)) {
                    let lii: LoadItemInfo = new LoadItemInfo();
                    lii.isSecretly = true;
                    lii.type = Constants.RES_TYPE_IMG;
                    lii.url = info.url;
                    lolo.loader.cleanRes(lii.url);// 可能已经加载过了
                    lolo.loader.add(lii);
                    lolo.loader.start();

                    // 等待加载完成的回调
                    let handlers: Handler[] = Animation._handlers.getItem(info.url);
                    if (handlers == null) {
                        handlers = [];
                        Animation._handlers.setItem(info.url, handlers);
                    }
                    handlers.push(lolo.handler(this.render, this));
                }

            }

            this.render();
        }

        public get sourceName(): string {
            return this._sourceName;
        }


        /**
         * 在加载完成后，显示当前帧
         */
        private render(): void {
            if (this.destroyed) return;

            let info: AnimationInfo = this._info;
            if (info != null) {
                let texture: cc.Texture2D = Animation._cache.getValue(info.url);
                if (texture == null) texture = Constants.EMPTY_TEXTURE;
                this.setTexture(texture);
                this.showFrame(this._currentFrame);
            }
            else {
                this.setTexture(Constants.EMPTY_TEXTURE);
            }

            this.event_dispatch(new Event(Event.CHILD_RESIZE), true);
        }


        /**
         * 显示指定帧的图像
         * @param frame
         */
        private showFrame(frame: number): void {
            if (this._info == null) return;

            let frameList: AnimationFrameInfo[] = this._info.frames;
            if (frame > frameList.length) frame = frameList.length;
            else if (frame < 1) frame = 1;
            this._currentFrame = frame;

            frame--;
            let info: AnimationFrameInfo = frameList[frame];
            this.setTextureRect(info.rect);
            this.setAnchorPoint(info.anchor);

            if (this.propagateAnimationEvents) this.event_dispatch(Event.create(AnimationEvent, AnimationEvent.ENTER_FRAME));
        }


        /**
         * 播放动画
         * @param startFrame 动画开始帧（默认值:0 为当前帧）
         * @param repeatCount 动画的重复播放次数（默认值:0 为无限循环）
         * @param stopFrame 动画达到重复播放次数时的停留帧（默认值:0 为最后一帧）
         * @param handler 动画在完成了指定重复次数，并到达了停止帧时的回调（异常情况将不会触发回调，如：位图数据包还未初始化，帧数为0，以及重复次数为0）
         */
        public play(startFrame: number = 0, repeatCount: number = 0, stopFrame: number = 0, handler: Handler = null): void {
            if (startFrame == 0) startFrame = this._currentFrame;
            this.showFrame(startFrame);

            this._playing = true;
            this._currentRepeatCount = 0;
            this.repeatCount = repeatCount;
            this.stopFrame = stopFrame;
            this.handler = handler;

            if (this._info != null) this._timer.start();
        }


        /**
         * 停止动画的播放
         */
        public stop(): void {
            this._timer.stop();
            this._playing = false;
        }


        /**
         * 跳转到指定帧，并继续播放
         * @param startFrame 动画开始帧
         * @param repeatCount 动画的重复播放次数（默认值:0 为无限循环）
         * @param stopFrame 动画达到重复播放次数时的停留帧（默认值:0 为最后一帧）
         * @param handler 动画在完成了指定重复次数，并到达了停止帧时的回调（异常情况将不会触发回调，如：位图数据包还未初始化，帧数为0，以及重复次数为0）
         */
        public gotoAndPlay(startFrame: number, repeatCount: number = 0, stopFrame: number = 0, handler: Handler = null): void {
            this.play(startFrame, repeatCount, stopFrame, handler);
        }


        /**
         * 跳转到指定帧，并停止动画的播放
         */
        public gotoAndStop(value: number): void {
            this.stop();
            this.showFrame(value);
        }


        /**
         * 立即播放下一帧（反向播放时为上一帧），并停止动画
         */
        public nextFrame(): void {
            this.stop();
            this.showFrame(this.reverse ? this._currentFrame - 1 : this._currentFrame + 1);
        }


        /**
         * 立即播放上一帧（反向播放时为下一帧），并停止动画
         */
        public prevFrame(): void {
            this.stop();
            this.showFrame(this.reverse ? this._currentFrame + 1 : this._currentFrame - 1);
        }


        /**
         * 计时器回调（帧刷新）
         */
        private timerHandler(): void {
            let frame: number;
            let totalFrames: number = (this._info == null) ? 0 : this._info.frames.length;

            if (this.reverse) {
                frame = (this._currentFrame == 1) ? totalFrames : this._currentFrame - 1;
            }
            else {
                frame = (this._currentFrame == totalFrames) ? 1 : this._currentFrame + 1;
            }
            this.showFrame(frame);

            //只有一帧，或没有帧
            if (totalFrames <= 1) {
                this.stop();
                if (this.propagateAnimationEvents) this.event_dispatch(Event.create(AnimationEvent, AnimationEvent.ENTER_STOP_FRAME));
                this.event_dispatch(Event.create(AnimationEvent, AnimationEvent.ANIMATION_END));
                return;
            }

            //有指定重复播放次数
            if (this.repeatCount > 0) {
                let stopFrame: number = (this.stopFrame == 0)
                    ? totalFrames
                    : this.stopFrame;
                //到达停止帧
                if (this._currentFrame == stopFrame) {
                    if (this.propagateAnimationEvents) this.event_dispatch(Event.create(AnimationEvent, AnimationEvent.ENTER_STOP_FRAME));

                    //达到了重复播放次数
                    this._currentRepeatCount++;
                    if (this._currentRepeatCount >= this.repeatCount) {
                        this.stop();
                        let handler: Handler = this.handler;
                        this.handler = null;
                        if (handler != null) handler.execute();
                        this.event_dispatch(Event.create(AnimationEvent, AnimationEvent.ANIMATION_END));
                    }
                }
            }
        }


        /**
         * 动画的帧频
         */
        public set fps(value: number) {
            value = Math.floor(value);
            if (value == this._fps) return;
            this._fps = value;
            this._timer.delay = 1000 / this._fps;
        }

        public get fps(): number {
            return this._fps;
        }


        /**
         * 动画是否正在播放中
         */
        public set playing(value: boolean) {
            value ? this.play() : this.stop();
        }

        public get playing(): boolean {
            return this._playing;
        }


        /**
         * 当前帧编号
         */
        public set currentFrame(value: number) {
            this.gotoAndStop(value);
        }

        public get currentFrame(): number {
            return this._currentFrame;
        }


        /**
         * 总帧数
         */
        public get totalFrames(): number {
            if (this._info == null) return 0;
            return this._info.frames.length;
        }


        /**
         * 动画当前已重复播放的次数
         */
        public get currentRepeatCount(): number {
            return this._currentRepeatCount;
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled(worldPoint)) return false;// 当前节点不可见

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            lolo.temp_rect.setTo(0, 0, this._getWidth(), this._getHeight());
            return lolo.temp_rect.contains(p.x, p.y);
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            this.stop();
            if (this.handler != null) {
                this.handler.clean();
                this.handler = null;
            }

            super.destroy();
        }

        //
    }
}