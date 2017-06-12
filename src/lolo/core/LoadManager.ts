/// <reference path="../events/EventDispatcher.ts"/>


namespace lolo {


    /**
     * 加载管理器
     * @author LOLO
     */
    export class LoadManager extends EventDispatcher {
        /**允许并发加载的最大数量*/
        private static MAX_LOAD_COUNT: number = 3;
        /**暗中加载时，允许并发加载的最大数量*/
        private static SECRETLY_LOAD_COUNT: number = 2;
        /**判定加载超时的时间（毫秒）*/
        private static TIMEOUT: number = 1000 * 60;

        /**需要加载的加载项队列*/
        private _loadList: HashMap;
        /**正在加载的加载项列表*/
        private _loadingList: HashMap;
        /**已经加载好的加载项队列*/
        private _resList: HashMap;
        /**显示加载项全部加载完成时的回调列表*/
        private _handlers: Handler[];
        /**所有加载项全部加载完毕时的回调列表*/
        private _allHandlers: Handler[];

        /**加载超时计时器*/
        private _timeoutTimer: Timer;

        /**是否被主动停止了*/
        private _stopped: boolean = true;
        /**当前显示加载文件的编号*/
        private _numCurrent: number = 0;
        /**当前正在监听加载的item*/
        private _currentLii: LoadItemInfo;


        public constructor() {
            super();

            this._loadList = new HashMap();
            this._loadingList = new HashMap();
            this._resList = new HashMap();
            this._handlers = [];
            this._allHandlers = [];

            this._timeoutTimer = new Timer(1000, new Handler(this.timeoutTimerHandler, this));
        }


        /**
         * 添加一个加载项模型到加载队列中
         * @param lii 加载项模型
         * @return 如果文件已在加载列表，或者已经加载完毕，将返回原先的加载项模型，并同步isSecretly和priority。否则返回参数lii传入的加载项模型
         */
        public add(lii: LoadItemInfo): LoadItemInfo {
            let oldLii: LoadItemInfo = this._loadList.getValueByKey(lii.url);//已经在加载队列中了
            if (oldLii == null) oldLii = this._loadingList.getValueByKey(lii.url);//正在加载中
            if (oldLii == null) oldLii = this._resList.getValueByKey(lii.url);//已经加载完毕了

            if (oldLii != null) {
                oldLii.isSecretly = lii.isSecretly;
                oldLii.priority = lii.priority;
                if (oldLii.name == "" || oldLii.name == null) oldLii.name = lii.name;
                lii = oldLii;
            }
            else {
                this._loadList.add(lii, lii.url);
            }

            this.sortLoadList();
            return lii;
        }


        /**
         * 对需要加载的文件列表进行排序
         */
        public sortLoadList(): void {
            let list: LoadItemInfo[] = this._loadList.values.sort(LoadManager.liiPrioritySort);
            this._loadList.clean();
            for (let i = 0; i < list.length; i++) {
                this._loadList.add(list[i], list[i].url);
            }
        }

        /**
         * 加载项数据模型的加载优先级排序方法
         * @param lii1
         * @param lii2
         * @return
         */
        private static liiPrioritySort(lii1: LoadItemInfo, lii2: LoadItemInfo): number {
            if (lii1.isSecretly && !lii2.isSecretly) return 1;
            if (lii2.isSecretly && !lii1.isSecretly) return -1;
            if (lii1.priority > lii2.priority) return -1;
            if (lii2.priority > lii1.priority) return 1;
            return 0;
        }


        /**
         * 开始加载所有项目（包括暗中加载和正常加载）
         * @param handler 显示加载项全部加载完成时的回调
         * @param allHandler 所有加载项全部加载完毕时的回调
         */
        public start(handler: Handler = null, allHandler: Handler = null): void {
            if (this.isSecretly) {
                if (handler != null) handler.execute();
                this.dispatchLoadEvent(LoadEvent.LOAD_COMPLETE);
            }
            else {
                if (handler != null && this._handlers.indexOf(handler) == -1) {
                    this._handlers.push(handler);
                }
            }

            if (this._loadList.length > 0 || this._loadingList.length > 0) {
                this._stopped = false;
                if (allHandler != null && this._allHandlers.indexOf(allHandler) == -1) {
                    this._allHandlers.push(allHandler);
                }
                this.loadNext();
            }
            else {
                if (allHandler != null) allHandler.execute();
                this.dispatchLoadEvent(LoadEvent.ALL_COMPLETE);
            }
        }


        /**
         * 加载下一个文件
         */
        private loadNext(): void {
            if (this._stopped) return;//已经被停止了
            if (this._loadList.length == 0) return;//没有需要加载的资源
            if (this._loadingList.length >= LoadManager.MAX_LOAD_COUNT) return;//达到了允许的最大并发加载数

            let lii: LoadItemInfo, tempLii: LoadItemInfo, i: number;

            //按顺序拿一个可加载的文件
            for (i = 0; i < this._loadList.length; i++) {
                tempLii = this._loadList.getValueByIndex(i);
                if (this.getCanLoad(tempLii)) {
                    lii = tempLii;
                    break;
                }
            }

            //接下来要加载的文件是暗中加载项
            if (lii != null && lii.isSecretly) {
                tempLii = this.canLoadNormalLii;
                if (tempLii != null) {
                    lii = tempLii;
                }
                else {
                    if (this._loadingList.length >= LoadManager.SECRETLY_LOAD_COUNT) return;
                }
            }

            //完全没文件可加载
            if (lii == null) return;

            this._loadList.removeByKey(lii.url);
            this._loadingList.add(lii, lii.url);
            this.dispatchLoadEvent(LoadEvent.START, lii);

            //解析出文件的url
            let resUrl: string = lii.needToFormatUrl ? lolo.getResUrl(lii.url) : lii.url;
            let loadFun: Function;
            let loadFunArgs: any[] = [resUrl];

            switch (lii.type) {
                case Constants.RES_TYPE_JS:
                    loadFun = cc.loader.loadJs;
                    break;

                case Constants.RES_TYPE_JSON:
                    loadFun = cc.loader.loadJson;
                    break;

                case Constants.RES_TYPE_TEXT:
                    loadFun = cc.loader.loadTxt;
                    break;

                case Constants.RES_TYPE_PARTICLE:
                    loadFun = cc.loader.load;
                    break;

                default:// 图片
                    loadFun = cc.loader.loadImg;
                    loadFunArgs.push({isCrossOrigin: false});
            }

            loadFunArgs.push(function (err, data) {
                if (err != null) {
                    lolo.loader.loadError.call(lolo.loader, lii, err);
                }
                else {
                    lolo.loader.loadComplete.call(lolo.loader, lii, data);
                }
            });

            //执行加载
            loadFun.apply(cc.loader, loadFunArgs);

            lii.lastUpdateTime = lii.loadTime = TimeUtil.nowTime;
            this._timeoutTimer.start();

            //没达到并发加载的上限，继续加载下个文件
            if (this._loadingList.length < LoadManager.MAX_LOAD_COUNT) this.loadNext();
        }


        /**
         * 加载单个文件完成
         * @param lii
         * @param data
         */
        private loadComplete(lii: LoadItemInfo, data: any): void {

            switch (lii.type) {
                case Constants.RES_TYPE_JS:
                    lii.data = true;
                    break;

                case Constants.RES_TYPE_JSON:
                case Constants.RES_TYPE_TEXT:
                    lii.data = data;
                    break;

                case Constants.RES_TYPE_PARTICLE:
                    lii.data = data[0];
                    break;

                default:// 图片
                    let texture2d;
                    if (isNative) {
                        texture2d = data;
                    }
                    else {
                        texture2d = new cc.Texture2D();
                        texture2d.initWithElement(data);
                        texture2d.handleLoadedTexture();
                    }
                    // texture2d.setAliasTexParameters();
                    lii.data = texture2d;
            }

            lii.loadTime = TimeUtil.nowTime - lii.loadTime;
            // LogSampler.addLoadFileSampleLog(lii);

            if (!lii.isSecretly) this._numCurrent++;

            this._resList.add(lii, lii.url);
            this.removeLoader(lii);
            lii.hasLoaded = true;
            lii.bytesLoaded = lii.bytesTotal;
            this.dispatchLoadEvent(LoadEvent.ITEM_COMPLETE, lii);

            //显示加载项都已经加载完成了
            let list: LoadItemInfo[] = this._loadList.values.concat(this._loadingList.values.concat());
            let cbList: Handler[] = this._handlers.concat();
            let acbList: Handler[] = this._allHandlers.concat();
            if (list.length == 0) this._allHandlers.length = 0;

            let i: number;
            let notDisplay: boolean = true;
            for (i = 0; i < list.length; i++) {
                if (!list[i].isSecretly) {
                    notDisplay = false;
                    break;
                }
            }
            if (notDisplay) {
                this._numCurrent = 0;
                this._handlers.length = 0;
                for (i = 0; i < cbList.length; i++) cbList[i].execute();
                this.dispatchLoadEvent(LoadEvent.LOAD_COMPLETE, lii);
            }

            //已经没有文件需要加载了
            if (list.length == 0) {
                for (i = 0; i < acbList.length; i++) acbList[i].execute();
                this.dispatchLoadEvent(LoadEvent.ALL_COMPLETE, lii);
            }

            this.loadNext();
        }


        /**
         * 加载失败
         * @param lii
         * @param err
         */
        private loadError(lii: LoadItemInfo, err: any): void {
            Logger.addLog("[LFW] 加载错误: " + lii.url + "  " + event.type, Logger.LOG_TYPE_INFO);
            // LogSampler.addLoadErrorLog(lii, "notFound");
            this.dispatchLoadEvent(LoadEvent.ERROR, lii);
            this.addToReload(lii);
        }


        /**
         * 加载超时计时器
         */
        private timeoutTimerHandler(): void {
            if (this._loadingList.length == 0) {
                this._timeoutTimer.reset();
            }
            else {
                for (let i = 0; i < this._loadingList.length; i++) {
                    let lii: LoadItemInfo = this._loadingList.getValueByIndex(i);
                    if (TimeUtil.nowTime - lii.lastUpdateTime >= LoadManager.TIMEOUT) {
                        Logger.addLog("[LFW] 加载超时: " + lii.url, Logger.LOG_TYPE_INFO);
                        // LogSampler.addLoadErrorLog(lii, "timeout");
                        this.dispatchLoadEvent(LoadEvent.TIMEOUT, lii);
                        this.addToReload(lii);
                    }
                }
            }
        }


        /**
         * 添加到加载列表，重新进行加载
         * @param lii
         */
        private addToReload(lii: LoadItemInfo): void {
            this.removeLoader(lii);

            lii.reloadCount--;
            if (lii.reloadCount > 0) {
                lii.priority = LoadItemInfo.nextPriority;//优先级延后
                this.add(lii);
                if (!this.running) lolo.delayedCall(lolo.isDebug ? 100 : 4000, this.loadNext, this)
            }
            else {
                lolo.ui.loadBar.hide();
            }
        }


        /**
         * 获取该文件是否可以加载了（所依赖的文件是否全部加载完毕了）
         * @param lii
         * @return
         */
        private getCanLoad(lii: LoadItemInfo): boolean {
            for (let i = 0; i < lii.urlList.length; i++) {
                if (this._resList.getValueByKey(lii.urlList[i]) == null) return false;
            }
            return true;
        }

        /**
         * 获取一个可以加载的正常项（不是暗中加载项）
         * @return
         */
        private get canLoadNormalLii(): LoadItemInfo {
            for (let i = 0; i < this._loadList.length; i++) {
                let lii: LoadItemInfo = this._loadList.getValueByIndex(i);
                if (!lii.isSecretly && this.getCanLoad(lii)) return lii;
            }
            return null;
        }


        /**
         * 从正在加载队列中移除加载项，并移除加载项的所有加载事件、清除loader
         * @param lii
         */
        private removeLoader(lii: LoadItemInfo): void {
            if (lii == this._currentLii) this._currentLii = null;
            this._loadingList.removeByKey(lii.url);
        }


        /**
         * 停止所有项目的加载（包括暗中加载和正常加载），以及正在加载的项目
         */
        public stop(): void {
            this._stopped = true;
            while (this._loadingList.values.length) {
                let lii: LoadItemInfo = this._loadingList.getValueByIndex(0);
                this._loadList.add(lii, lii.url);
                this.removeLoader(lii);
            }
            this._loadingList.clean();
        }


        /**
         * 清除加载列表
         * @param type 类型[ 0:所有加载项, 1:所有显示加载项, 2:所有隐藏加载项 ]
         */
        public cleanLoadList(type: number = 0): void {
            let list: LoadItemInfo[] = this._loadList.values.concat(this._loadingList.values.concat());
            for (let i = 0; i < list.length; i++) {
                let lii: LoadItemInfo = list[i];
                let cleanMark: boolean = (type == 0);
                if (!cleanMark) {
                    cleanMark = lii.isSecretly ? (type == 2) : (type == 1);
                }
                if (cleanMark) {
                    this.removeLoader(lii);
                    this._loadList.removeByKey(lii.url);
                }
            }
            this._handlers.length = 0;
            this._allHandlers.length = 0;
            this.loadNext();
        }


        /**
         * 将指定的加载项从加载列表中移除
         * @param lii
         */
        public remove(lii: LoadItemInfo): void {
            let list: LoadItemInfo[] = this._loadList.values.concat(this._loadingList.values.concat());
            if (list.indexOf(lii) != -1) {
                this.removeLoader(lii);
                this._loadList.removeByKey(lii.url);
            }
        }


        /**
         * 通过url获取已加载好的资源。如果还加载完成，则返回null
         * @param url
         * @param clean 获取后是否清除
         * @return    RES_TYPE_JSON 返回：Object
         *            RES_TYPE_IMG 返回：cc.Texture2D
         *            RES_TYPE_TEXT 返回：string
         *            RES_TYPE_JS 返回：true
         *            RES_TYPE_PARTICLE 返回：plist 文件内容（Object）
         */
        public getResByUrl(url: string, clean: boolean = false): any {
            let lii: LoadItemInfo = this._resList.getValueByKey(url);
            if (lii == undefined) return null;
            if (clean) this.cleanRes(url);
            return lii.data;
        }

        /**
         * 移除url对应的资源
         * @param url
         */
        public cleanRes(url: string): void {
            this._resList.removeByKey(url);
        }

        /**
         * 通过配置文件(ResConfig)中的名称，获取已加载好的资源
         * @param configName
         * @param clean 获取后是否清除
         * @param urlArgs url的替换参数
         * @return @see getResByUrl() 方法
         */
        public getResByConfigName(configName: string, clean: boolean = false, urlArgs: string[] = null): any {
            let config: ResConfigItem = lolo.config.getResConfig(configName);
            let url: string = (urlArgs != null) ? StringUtil.substitute(config.url, urlArgs) : config.url;
            return this.getResByUrl(url, clean);
        }


        /**
         * 通过url获取已创建的加载项数据模型。如果还未创建，则返回null
         * @param url
         * @return
         */
        public getLoadItemInfoByUrl(url: string): LoadItemInfo {
            let lii: LoadItemInfo = this._resList.getValueByKey(url);
            if (lii != null) return lii;

            lii = this._loadList.getValueByKey(url);
            if (lii != null) return lii;

            lii = this._loadingList.getValueByKey(url);
            if (lii != null) return lii;

            return null;
        }


        /**
         * 通过资源获取已创建的加载项数据模型。如果还未创建，则返回null
         * @param res
         * @return
         */
        public getLoadItemInfoByRes(res: any): LoadItemInfo {
            for (let i: number = 0; i < this._resList.length; i++) {
                let lii: LoadItemInfo = this._resList.getValueByIndex(i);
                if (lii.data == res) return lii;
            }
            return null;
        }


        /**
         * 通过url检测资源是否已经加载完成
         * @param url
         */
        public hasLoaded(url: string): boolean {
            return this._resList.getValueByKey(url) != null;
        }

        /**
         * 加载器是否正在运行中
         * @return
         */
        public get running(): boolean {
            return this._loadingList.length > 0 && !this._stopped;
        }

        /**
         * 是否为暗中加载状态（正在加载和将要加载的文件全部都是暗中加载项）
         * @return
         */
        public get isSecretly(): boolean {
            let list: LoadItemInfo[] = this._loadList.values.concat(this._loadingList.values.concat());
            for (let i = 0; i < list.length; i++) {
                if (!list[i].isSecretly) return false;
            }
            return true;
        }

        /**
         * 当前显示加载文件的编号
         */
        public get numCurrent(): number {
            return this._numCurrent;
        }

        /**
         * 当前显示加载文件的总数
         */
        public get numTotal(): number {
            let num: number = this._numCurrent;
            for (let i = 0; i < this._loadingList.values.length; i++) {
                let lii: LoadItemInfo = <LoadItemInfo> this._loadingList.values[i];
                if (!lii.isSecretly) num++;
            }
            return num;
        }


        /**
         * 抛出加载事件
         * @param type 事件类型
         * @param lii 触发该事件的 LoadItemInfo
         */
        private dispatchLoadEvent(type: string, lii?: LoadItemInfo): void {
            let event: LoadEvent = Event.create(LoadEvent, type);
            if (lii == undefined) lii = new LoadItemInfo();
            event.lii = lii;
            this.event_dispatch(event);
        }

        //
    }
}