namespace lolo {


    /**
     * 加载条接口
     * @author LOLO
     */
    export interface ILoadBar {
        /**是否侦听Common.loader资源加载事件*/
        isListener: boolean;
        /**是否自动显示或隐藏*/
        autoShow: boolean;
        /**显示文本的内容*/
        text: string;
        /**进度，0~1*/
        progress: number;
        /**模态背景的透明度，0~1*/
        modalTransparency: number;

        /**显示*/
        show();
        /**隐藏*/
        hide();
    }


    /**
     * 将与服务端通信的请求进行模态的界面接口
     * @author LOLO
     */
    export interface IRequestModal {
        /**
         * 开始进行通信模态
         * @param req 通信接口信息
         */
        startModal(req: RequestInfo): void;

        /**
         * 结束通信模态
         * @param req 通信接口信息
         */
        endModal(req: RequestInfo): void;

        /**
         * 重置所有模态的通信
         */
        reset(): void;
    }


    /**
     * 将与服务端通信的请求进行模态的界面接口
     * @author LOLO
     */
    export interface ModuleInfo {
        /**当前模块已创建的实例*/
        instance: Module,
        /**模块的名称*/
        moduleName: string,
        /**模块对应的类*/
        moduleCls: any,
        /**创建该模块需要加载的资源列表*/
        liiList: LoadItemInfo[];
    }


    /**
     * 用户界面管理
     * @author LOLO
     */
    export class UIManager extends cc.Scene implements IEventDispatcher {

        /**背景层*/
        protected _bgLayer: DisplayObjectContainer;
        /**场景层*/
        protected _sceneLayer: DisplayObjectContainer;
        /**UI层*/
        protected _uiLayer: DisplayObjectContainer;
        /**窗口层*/
        protected _windowLayer: DisplayObjectContainer;
        /**顶级UI层*/
        protected _uiTopLayer: DisplayObjectContainer;
        /**提示消息层*/
        protected _alertLayer: DisplayObjectContainer;
        /**游戏指导层*/
        protected _guideLayer: DisplayObjectContainer;
        /**顶级层*/
        protected _topLayer: DisplayObjectContainer;
        /**装饰层*/
        protected _adornLayer: DisplayObjectContainer;

        /**全屏模态遮挡物*/
        protected _modal: ModalBackground;
        /**模块加载条*/
        protected _loadBar: ILoadBar;
        /**将与服务端通信的请求进行模态的界面*/
        protected _requestModal: IRequestModal;

        /**当前窗口*/
        protected _nowWindow: Window;

        /**所有的模块信息列表*/
        protected _moduleList: Object;
        /**当前正在加载的模块的信息*/
        protected _loadModuleInfo: ModuleInfo;
        /**当前已经打开的窗口列表*/
        protected _windowList: Window[];

        /**当前场景的信息 { moduleName:模块名称, args:启动时参数 }*/
        protected _currentSceneInfo: ModuleInfo;
        /**上一个场景的信息{ moduleName:模块名称, args:启动时参数 }*/
        protected _prevSceneInfo: ModuleInfo;


        /**当前的舞台宽度*/
        public stageWidth: number;
        /**当前的舞台高度*/
        public stageHeight: number;
        /**半个舞台宽度*/
        public halfStageWidth: number;
        /**半个舞台高度*/
        public halfStageHeight: number;


        private _enterFrameEvent: Event;
        private _prerenderEvent: Event;


        public constructor() {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this._enterFrameEvent = new Event(Event.ENTER_FRAME);
            this._prerenderEvent = new Event(Event.PRERENDER);

            this.stage_resizeHandler();
            this.scheduleUpdate();
            cc.eventManager.addCustomListener(cc.Director.EVENT_AFTER_UPDATE, this.afterUpdateHandler.bind(this));
            cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, this.activateHandler.bind(this));
            cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, this.deactivateHandler.bind(this));
        }


        /**
         * 初始化
         */
        public initialize(): void {
            this._moduleList = {};
            this._windowList = [];

            this._bgLayer = new DisplayObjectContainer();
            this.addChild(this._bgLayer, 0, Constants.LAYER_NAME_BG);

            this._sceneLayer = new DisplayObjectContainer();
            this.addChild(this._sceneLayer, 0, Constants.LAYER_NAME_SCENE);

            this._uiLayer = new DisplayObjectContainer();
            this.addChild(this._uiLayer, 0, Constants.LAYER_NAME_UI);

            this._windowLayer = new DisplayObjectContainer();
            this.addChild(this._windowLayer, 0, Constants.LAYER_NAME_WINDOW);

            this._uiTopLayer = new DisplayObjectContainer();
            this.addChild(this._uiTopLayer, 0, Constants.LAYER_NAME_UI_TOP);

            this._alertLayer = new DisplayObjectContainer();
            this.addChild(this._alertLayer, 0, Constants.LAYER_NAME_ALERT);

            this._guideLayer = new DisplayObjectContainer();
            this.addChild(this._guideLayer, 0, Constants.LAYER_NAME_GUIDE);

            this._topLayer = new DisplayObjectContainer();
            this.addChild(this._topLayer, 0, Constants.LAYER_NAME_TOP);

            this._adornLayer = new DisplayObjectContainer();
            this.addChild(this._adornLayer, 0, Constants.LAYER_NAME_ADORN);

            this._modal = new ModalBackground();
        }


        /**
         * 添加一个模块（Scene 或 Window）
         * @param moduleName 模块的名称（完整类定义）
         * @param moduleCls 模块对应的类
         * @param liiList 模块需要的资源列表（字符串 或 LoadItemInfo对象）
         */
        protected addModule(moduleName: string, moduleCls: any, ...liiList: any[]): void {
            if (this._moduleList[moduleName] != null) {
                throwError("不能重复添加模块，请检查 moduleName：", moduleName);
            }

            for (let i = 0; i < liiList.length; i++) {
                if (ObjectUtil.isString(liiList[i])) {
                    liiList[i] = new LoadItemInfo(liiList[i]);
                }
            }

            this._moduleList[moduleName] = {
                instance: null,
                moduleName: moduleName,
                moduleCls: moduleCls,
                liiList: liiList
            };
        }


        /**
         * 实例化一个模块
         * 调用该方法前，请确保模块所需资源都已加载完毕
         * @param moduleName
         * @param moduleCls
         * @param parent
         * @return {Module}
         */
        protected instanceModule(moduleName: string, moduleCls: any, parent?: DisplayObjectContainer): Module {
            if (this._moduleList[moduleName] != null) {
                throwError("不能重复添加模块，请检查 moduleName：", moduleName);
            }

            let instance: Module = new moduleCls();
            instance.initialize();
            if (parent != null) parent.addChild(instance);

            this._moduleList[moduleName] = {
                instance: instance,
                moduleName: moduleName,
                moduleCls: moduleCls,
                liiList: null
            };

            return instance;
        }


        /**
         * 显示指定模块
         * @param moduleName 模块的名称
         */
        public showModule(moduleName: string): void {
            // 当前有模块正在加载
            if (this._loadModuleInfo != null) {
                // 当前正在加载的模块，不是需要显示的模块。清除加载
                if (moduleName != this._loadModuleInfo.moduleName) {
                    for (let i = 0; i < this._loadModuleInfo.liiList.length; i++) {
                        lolo.loader.remove(this._loadModuleInfo.liiList[i]);
                    }
                }
            }

            this._loadModuleInfo = this._moduleList[moduleName];

            // 加载当前要显示模块的所需资源
            let liiList: LoadItemInfo[] = this._loadModuleInfo.liiList;
            for (let i = 0; i < liiList.length; i++) lolo.loader.add(liiList[i]);
            lolo.loader.start(this._loadModuleCompleteHandler);
        }


        /**
         * 加载模块所需资源完成
         */
        private loadModuleComplete(): void {
            let mod: Module = this._loadModuleInfo.instance;

            //初始化模块
            if (this._loadModuleInfo.instance == null) {
                mod = new this._loadModuleInfo.moduleCls();
                this._loadModuleInfo.instance = mod;
                mod.moduleName = this._loadModuleInfo.moduleName;
                mod.initialize();
            }

            // 显示模块
            if (mod instanceof Window) {
                this.openWindow(mod);
            }
            else {
                this.showScene(mod);
            }
        }

        private _loadModuleCompleteHandler: Handler = new Handler(this.loadModuleComplete, this);


        /**
         * 获取指定ID的模块的实例
         * @param moduleName
         * @return
         */
        public getModule(moduleName: string): Module {
            return this._moduleList[moduleName].instance;
        }


        /**
         * 打开指定窗口
         * @param window 要打开的窗口
         */
        public openWindow(window: Window): void {
            //这个窗口已经打开了
            if (window.showed) {
                if (window.autoHide) this.closeWindow(window);
                else this.showDisplayObject(window, this._windowLayer);
                return;
            }

            //将新打开的窗口放到默认的位置上
            let p: Point = lolo.layout.getStageLayout(window);
            window.x = p.x;
            window.y = p.y;
            CachePool.recycle(p);

            //关闭互斥的窗口，获取需要组合的窗口
            let i: number, w: Window, needClose: boolean;
            let comboList: Window[] = [];
            for (i = 0; i < this._windowList.length; i++) {
                needClose = true;
                w = this._windowList[i];

                //这个窗口在组合列表中
                if (window.comboList.indexOf(w.moduleName) != -1) {
                    comboList.push(w);
                    needClose = false;
                }
                else {
                    //这个窗口不在互斥列表中
                    if (window.excludeList != null) {
                        if (window.excludeList.indexOf(w.moduleName) == -1) needClose = false;
                    }
                }

                if (needClose) this.closeWindow(w);
            }

            this._windowList.push(window);

            //当前没有别的窗口被打开
            if (comboList.length == 0) {
                this.showDisplayObject(window, this._windowLayer);
                return;
            }

            //按照组合排序显示窗口
            comboList.push(window);
            comboList.sort(this.windowSort);
            let width: number, height: number;
            for (i = 0; i < comboList.length; i++) {
                w = comboList[i];
                lolo.layout.setStageLayoutEnabled(w, false);
                this.showDisplayObject(w, this._windowLayer);

                //计算出组合后的窗口所占的总宽高
                if (window.layoutDirection == Constants.HORIZONTAL) {
                    width += w.layoutWidth;
                    if (i < comboList.length - 1) width += w.layoutGap;
                    if (w.layoutHeight > height) height = w.layoutHeight;
                }
                else {
                    height += w.layoutHeight;
                    if (i < comboList.length - 1) height += w.layoutGap;
                    if (w.layoutWidth > width) width = w.layoutWidth;
                }
            }

            //缓动到正确的位置上
            let x: number = this.halfStageWidth;
            let y: number = this.halfStageHeight;
            for (i = 0; i < comboList.length; i++) {
                w = comboList[i];
                w.stopAllActions();
                w.runAction(cc.moveTo(Constants.EFFECT_DURATION_WINDOW_MOVE, x, y));

                if (i < comboList.length - 1) {
                    if (window.layoutDirection == "horizontal")
                        x += w.layoutWidth + w.layoutGap;
                    else
                        y += w.layoutHeight + w.layoutGap;
                }
            }
        }

        /**
         * window.layoutIndex 的降序（从小到大）排序方法
         */
        private windowSort(a: Window, b: Window): number {
            if (a.layoutIndex > b.layoutIndex) return 1;
            else if (a.layoutIndex < b.layoutIndex) return -1;
            else return 0;
        }


        /**
         * 关闭指定窗口
         * @param window 要关闭的窗口
         */
        public closeWindow(window: Window): void {
            window.hide();
            lolo.layout.setStageLayoutEnabled(window, true);

            let i: number = this._windowList.indexOf(window);
            if (i == -1) return;//要关闭的窗口不在已打开的窗口列表中
            this._windowList.splice(i, 1);

            if (window.comboList.length == 0) return;
            for (i = 0; i < this._windowList.length; i++) {
                let w: Window = this._windowList[i];
                //w 在 window 的组合列表中
                if (window.comboList.indexOf(w.moduleName) != -1) {
                    let p: Point = lolo.layout.getStageLayout(w);
                    w.stopAllActions();
                    w.runAction(cc.moveTo(Constants.EFFECT_DURATION_WINDOW_MOVE, p.x, p.y));
                    CachePool.recycle(p);
                }
            }
        }

        /**
         * 关闭所有窗口
         */
        public closeAllWindow(): void {
            // 拷贝是为了 window.hide() 调回 closeWindow() 时 _windowList.length = 0
            let list: Window[] = this._windowList.concat();
            this._windowList.length = 0;
            let len: number = list.length;
            for (let i = 0; i < len; i++) list[i].hide();
        }


        /**
         * 显示一个显示对象，并添加到指定容器中。
         * 如果显示对象为 IBaseSprite，将会调用 show() 方法进行显示
         * @param target 目标显示对象
         * @param parent 父级容器
         */
        private showDisplayObject(target: cc.Node, parent: DisplayObjectContainer): void {
            parent.addChild(target);

            if (target instanceof Container) {
                target.show();
            } else {
                target.visible = true;
            }
        }

        /**
         * 隐藏一个显示对象，并从父级容器中移除。
         * 如果显示对象为 IBaseSprite，将会调用 hide() 方法进行隐藏
         * @param target
         */
        private hideDisplayObject(target: cc.Node): void {
            if (target instanceof Container) {
                target.hide();
            } else {
                target.visible = false;
                target.removeFromParent();
            }
        }


        /**
         * 添加显示对象到指定的层中
         * @param child 显示对象
         * @param layerName 层的名称
         */
        public addChildToLayer(child: cc.Node, layerName: string): void {
            if (layerName == Constants.LAYER_NAME_WINDOW) {
                throwError("要将显示对象添加到 window 层，请使用 openWindow() 方法");
                return;
            }
            this.showDisplayObject(child, this.getLayer(layerName));
        }

        /**
         * 从指定层中移除指定显示对象
         * @param child 显示对象
         * @param layerName 层的名称
         */
        public removeChildFromLayer(child: cc.Node, layerName: string): void {
            let layer: DisplayObjectContainer = this.getLayer(layerName);
            if (child.parent == layer) this.hideDisplayObject(child);
        }


        /**
         * 根据名称获取图层
         * 注意：如果要在图层中添加或移除内容，请使用 addChildToLayer() 或  removeChildToLayer()
         * @param layerName
         * @return
         */
        public getLayer(layerName: string): DisplayObjectContainer {
            return <DisplayObjectContainer>this.getChildByName(layerName);
        }


        /**
         * 显示已经加载好的场景
         * @param scene
         */
        protected showScene(scene: Scene): void {
            //场景有变动，隐藏当前场景，并记录到上个场景的信息
            let changed: boolean = this._currentSceneInfo != null && this._currentSceneInfo.moduleName != this._loadModuleInfo.moduleName;
            if (changed) {
                this._prevSceneInfo = this._currentSceneInfo;
                this._moduleList[this._prevSceneInfo.moduleName].instance.hide();
                this.closeAllWindow();
            }
            if (!changed) changed = this._currentSceneInfo == null;//第一次进入场景

            //显示已经加载好的新场景，并记录到当前场景的信息
            this._currentSceneInfo = this._loadModuleInfo;
            this.showDisplayObject(this._currentSceneInfo.instance, this._sceneLayer);

            if (changed) {
                this.event_dispatch(Event.create(SceneEvent, SceneEvent.ENTER_SCENE));
            }
        }

        /**
         * 显示上一个场景
         */
        public showPrevScene(): void {
            if (this._prevSceneInfo == null) return;

            this.showModule(this._prevSceneInfo.moduleName);
        }

        /**
         * 获取上一个场景的名称，没有上一个场景时，值为null
         */
        public get prevSceneName(): string {
            if (this._prevSceneInfo == null) return null;
            return this._prevSceneInfo.moduleName;
        }

        /**
         * 获取当前场景的名称，没有进入场景时，值为null
         */
        public get currentSceneName(): string {
            if (this._currentSceneInfo == null) return null;
            return this._currentSceneInfo.moduleName;
        }


        /**
         * 显示全屏模态（模态对象为单例，就算调用该方法多次，同时也只会有一个模态实例存在）
         * @param alpha 模态透明度
         * @param layerName 将模态放置在该图层，可使用 Constants.LAYER_NAME_xxx 系列常量
         * @param zIndex 模态在图层中的深度
         */
        public showModal(alpha: number = 0.01, layerName: string = "top", zIndex: number = 0): void {
            this._modal.alpha = alpha;
            this.getLayer(layerName).addChild(this._modal, zIndex);
        }

        /**
         * 隐藏已显示的全屏模态
         */
        public hideModal(): void {
            this._modal.removeFromParent();
        }


        /**
         * 加载条
         */
        public get loadBar(): ILoadBar {
            return this._loadBar;
        }

        /**
         * 将与服务端通信的请求进行模态的界面
         */
        public get requestModal(): IRequestModal {
            return this._requestModal;
        }

        /**
         * 当前已打开的窗口列表
         */
        public get windowList(): Window[] {
            return this._windowList;
        }


        /**
         * 舞台尺寸有改变。
         */
        public stage_resizeHandler(): void {
            let winSize: cc.Size = cc.winSize;
            this.stageWidth = winSize.width;
            this.stageHeight = winSize.height;
            this.halfStageWidth = this.stageWidth >> 1;
            this.halfStageHeight = this.stageHeight >> 1;
            this.setPositionY(-winSize.height);// 设置 y 坐标，转到屏幕坐标系

            if (this._modal != null) this._modal.render();

            this.event_dispatch(Event.create(Event, Event.RESIZE));
        }


        /**
         * 帧刷新
         * @param dt
         */
        private update(dt: number): void {
            let date = TimeUtil.nowDate = new Date();
            TimeUtil.nowTime = date.getTime();

            this.event_dispatch(this._enterFrameEvent, false, false);
        }

        private afterUpdateHandler(): void {
            this.event_dispatch(this._prerenderEvent, false, false);
        }

        private activateHandler(): void {
            this.event_dispatch(Event.create(Event, Event.ACTIVATE));
        }

        private deactivateHandler(): void {
            this.event_dispatch(Event.create(Event, Event.DEACTIVATE));
        }

        //
    }
}