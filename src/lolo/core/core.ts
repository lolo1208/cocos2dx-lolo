namespace lolo {

    /**舞台*/
    export let stage: UIManager;
    /**配置信息*/
    export let config: ConfigManager;
    /**语言包*/
    export let language: LanguageManager;
    /**资源加载器*/
    export let loader: LoadManager;
    /**用户界面管理*/
    export let ui: UIManager;
    /**布局管理*/
    export let layout: LayoutManager;
    /**控制台界面*/
    // export var consoleView:Console;
    /**手势管理*/
    export let gesture: Gesture;

    /**核心框架版本号，修改该值，在动更时会强制重新下载APP。定义在 project.json 中*/
    export let coreVersion: string;
    /**项目版本号，打包时会自动生成在 Updater.js 中*/
    export let version: string;
    /**初始化版本号（APP安装包的版本号），APP第一次启动时，记录在 writablePath/assets/version/init.js 文件内*/
    export let initVersion: string;

    /**资源库的 语言和区域*/
    export let locale: string;
    /**当前是否在 debug 环境中*/
    export let isDebug: boolean;
    /**当前是否在 native 环境中*/
    export let isNative: boolean;
    /**当前是否在 mobile 环境中*/
    export let isMobile: boolean;

    /**资源映射列表（在打包时会自动生成）*/
    export let resList: any;


    /**
     * 初始化框架
     * @param stage
     * @param locale
     */
    export function initialize(stage: UIManager, locale: string): void {

        LocalData.initialize("ShibaInu");
        TimeUtil.initialize();

        lolo.isDebug = cc.game.config.debugMode != 0;
        lolo.stage = lolo.ui = stage;
        lolo.locale = locale;
        lolo.config = new ConfigManager();
        lolo.language = new LanguageManager();
        lolo.loader = new LoadManager();
        lolo.layout = new LayoutManager();
        lolo.gesture = new Gesture();
        // consoleView = new Console();

        if (!isNative && !isDebug) window["onerror"] = Logger.uncaughtErrorHandler;// native 无效

        Constants.ALIGN_LOLO_TO_COCOS = {left: 0, center: 1, right: 2};
        Constants.ALIGN_COCOS_TO_LOLO = [Constants.ALIGN_LEFT, Constants.ALIGN_CENTER, Constants.ALIGN_RIGHT];
        Constants.VALIGN_LOLO_TO_COCOS = {top: 0, middle: 1, bottom: 2};
        Constants.VALIGN_COCOS_TO_LOLO = [Constants.VALIGN_TOP, Constants.VALIGN_MIDDLE, Constants.VALIGN_BOTTOM];


        // 创建1像素的空白纹理
        let rt: cc.RenderTexture = new cc.RenderTexture(1, 1);
        rt.clear(0, 0, 0, 0);
        Constants.EMPTY_TEXTURE = rt.sprite.texture;
        if (isNative) Constants.EMPTY_TEXTURE.retain();

        // 创建1像素的黑色纹理
        rt = new cc.RenderTexture(1, 1);
        rt.clear(0, 0, 0, 255);
        Constants.BLACK_TEXTURE = rt.sprite.texture;
        if (isNative) Constants.BLACK_TEXTURE.retain();
    }


    /**
     * 延迟指定毫秒后，执行一次回调
     * @param delay 延迟时间（毫秒）
     * @param callback 回调函数
     * @param caller 执行域（this）
     * @param args 附带的参数
     */
    export function delayedCall(delay: number, callback: Function, caller: any = null, ...args: any[]): Handler {
        let handler: Handler = Handler.once(callback, caller);
        handler.args = args;
        setTimeout(function () {
            handler.execute.call(handler);
        }, delay);
        return handler;
    }

    /**
     * 快速创建一个 指定执行域（this），携带参数的 Handler 对象
     * @param callback 回调函数
     * @param caller 执行域（this）
     * @param once 是否只用执行一次
     * @param args 附带的参数
     */
    export function handler(callback: Function, caller: any = null, once: boolean = true, ...args: any[]): Handler {
        let handler: Handler = Handler.once(callback, caller);
        handler.once = once;
        handler.args = args;
        return handler;
    }


    /**
     * 通过ID在语言包中获取对应的字符串
     * @param id 在语言包中的ID
     * @param args 用该参数替换字符串内的"{n}"标记
     * @return
     */
    export function getLanguage(id: string, ...args: any[]): string {
        args.unshift(id);
        return language.getLanguage.apply(lolo.language, args);
    }


    /**
     * 抛出一个错误
     * @param args 参数列表，最终会拼接成一段字符串
     */
    export function throwError(...args: any[]): void {
        let str: string = "";
        for (let i = 0; i < args.length; i++) {
            if (i != 0) str += " ";
            str += args[i];
        }
        Logger.addErrorLog(str);
    }


    /**
     * 数组数字降序（从小到大）排序方法
     */
    export function arrayNumericAscending(a: number, b: number): number {
        return a - b;
    }


    /**
     * 数组数字降序（从大到小）排序方法
     */
    export function arrayNumericDescending(a: number, b: number): number {
        return b - a;
    }


    //
}


/////////////////////////////////
//
//      cocos 相关支持
//
/////////////////////////////////
namespace lolo {

    export let _original_cc_moveBy_update: Function;
    export let _original_cc_moveBy: Function;
    export let _original_cc_moveTo: Function;


    /**
     * 扩展 cocos 相关功能
     */
    export function cc_support(): void {

        cc_extendDisplayObject(UIManager);
        cc_extendDisplayObject(DisplayObjectContainer);
        cc_extendDisplayObject(Bitmap);
        cc_extendDisplayObject(Image);
        cc_extendDisplayObject(Animation);
        cc_extendDisplayObject(TextField);
        cc_extendDisplayObject(InputText);
        cc_extendDisplayObject(ModalBackground);


        // 让 cc.ClippingNode 支持事件冒泡
        cc.ClippingNode.prototype.event_dispatch = function (...args: any[]): void {
            let parent: cc.Node = this.getParent();
            if (parent != null) parent.event_dispatch.apply(parent, args);
        };


        // 重写 Action 相关方法，将传入的y值取反（native），并在运行时同步位置
        if (isNative) {

            _original_cc_moveBy_update = cc.MoveBy.prototype.update;
            cc.MoveBy.prototype.update = function (dt: number): void {
                lolo._original_cc_moveBy_update.call(this, dt);
                let target: cc.Node = this.getTarget();
                target._x = target._original_getPositionX();
                target._y = -target._original_getPositionY();
            };

            _original_cc_moveBy = cc.moveBy;
            cc.moveBy = function (...args: any[]): cc.MoveBy {
                if (args.length == 3) args[2] = -args[2];
                else if (args.length == 2) args[1].y = -args[1].y;
                return lolo._original_cc_moveBy.apply(this, args);
            };

            _original_cc_moveTo = cc.moveTo;
            cc.moveTo = function (...args: any[]): cc.MoveTo {
                if (args.length == 3) args[2] = -args[2];
                else if (args.length == 2) args[1].y = -args[1].y;
                return lolo._original_cc_moveTo.apply(this, args);
            };
        }
    }


    /**
     * 扩展cc显示对象，实现：屏幕坐标转换、IEventDispatcher、touchEnabled
     * @param targetClass
     */
    export function cc_extendDisplayObject(targetClass: any): void {

        let p: any = targetClass.prototype;


        // 扩展 ctor 方法
        p._original_ctor = p.ctor;
        p.ctor = function (...args: any[]) {
            this._original_ctor.apply(this, args);
            this._ed = new lolo.EventDispatcher(this);
            this._x = this._y = 0;
            this.setAnchorPoint(0, 1);// 设置锚点位置，转到屏幕坐标系
            this.retain();

            this._touchEnabled = false;
            this.propagateTouchEvents = true;
            this.touchListener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                bubbles: false,
                onTouchBegan: cc_touchBegan,
                onTouchMoved: cc_touchMoved,
                onTouchEnded: cc_touchEnded
            });
            this.touchListener.retain();

            // native 需要绑定 swallowTouches 属性
            if (isNative) {
                Object.defineProperty(this.touchListener, "swallowTouches", {
                    enumerable: true, configurable: true,
                    set: this.touchListener.setSwallowTouches,
                    get: this.touchListener.isSwallowTouches
                });
            }
        };


        // 覆盖 destroy 方法
        p._original_destroy = p.destroy;
        p.destroy = function () {
            if (p._original_destroy != null) p._original_destroy.call(this);

            this.touchEnabled = false;
            this.touchListener.release();
            this.release();
        };


        // 重写设置和获取坐标的方法，转到屏幕坐标系
        // setPositionX
        p._original_setPositionX = p.setPositionX;
        p.setPositionX = function (x: number): void {
            this._x = x;
            this._original_setPositionX(x);
            if (this._xChanged) this._xChanged();
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


        // setPositionY
        p._original_setPositionY = p.setPositionY;
        p.setPositionY = function (y: number): void {
            this._y = y;
            this._original_setPositionY(-y);
            if (this._yChanged) this._yChanged();
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


        // setPosition
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


        // 实现 alpha 属性
        Object.defineProperty(p, "alpha", {
            enumerable: true, configurable: true,
            set: function (value: number): void {
                this.setOpacity(value * 255);
            },
            get: function (): number {
                return this.getOpacity() / 255;
            }
        });


        // 实现 name 属性
        Object.defineProperty(p, "name", {
            enumerable: true, configurable: true,
            set: p.setName,
            get: p.getName
        });


        // 实现 inStageVisibled()
        p.inStageVisibled = lolo.inStageVisibled;


        // 实现 IEventDispatcher 相关
        p.event_addListener = function (type: string, listener: Function, caller: any, priority: number = 0, ...args: any[]): void {
            if (args.length == 0) {
                this._ed.event_addListener(type, listener, caller, priority);
            }
            else {
                args = [type, listener, caller, priority].concat(args);
                this._ed.event_addListener.apply(this._ed, args);
            }
        };

        p.event_removeListener = function (type: string, listener: Function, caller: any): void {
            this._ed.event_removeListener(type, listener, caller);
        };

        p.event_dispatch = function (event: Event, bubbles: boolean = false, recycle: boolean = true): void {
            this._ed.event_dispatch(event, bubbles, recycle);
        };

        p.event_hasListener = function (type: string): boolean {
            return this._ed.event_hasListener(type);
        };


        // 实现 Touch 相关
        Object.defineProperty(p, "touchEnabled", {
            enumerable: true, configurable: true,
            set: function (value: boolean): void {
                this._touchEnabled = value;
                if (value)
                    cc.eventManager.addListener(this.touchListener, this);
                else
                    cc.eventManager.removeListener(this.touchListener);
            },
            get: function (): boolean {
                return this._touchEnabled;
            }
        });

        // html5中，onEnter 的时候，需要重新注册 touchListener
        if (!isNative) {
            p._original_onEnter = p.onEnter;
            p.onEnter = function (): void {
                this._original_onEnter();
                if (this._touchEnabled && !this.touchListener._registered)
                    this.touchEnabled = true;
            };
        }

        // 点击测试函数（当前类可能已经实现该方法了）
        if (p.hitTest == null) p.hitTest = lolo.touchHitTest;
    }


    export function cc_touchBegan(touch: cc.Touch, event: cc.EventTouch): boolean {
        let target: cc.Node = event.getCurrentTarget();
        let hited: boolean = target.hitTest(touch.getLocation());
        if (hited && target.propagateTouchEvents)
            cc_touchDispatchEvent(TouchEvent.TOUCH_BEGIN, target, touch, event);
        return hited;
    }

    export function cc_touchMoved(touch: cc.Touch, event: cc.EventTouch): void {
        let target: cc.Node = event.getCurrentTarget();
        if (target.propagateTouchEvents) {
            cc_touchDispatchEvent(TouchEvent.TOUCH_MOVE, target, touch, event);
        }
    }

    export function cc_touchEnded(touch: cc.Touch, event: cc.EventTouch): void {
        let target: cc.Node = event.getCurrentTarget();
        if (target.propagateTouchEvents) {
            cc_touchDispatchEvent(TouchEvent.TOUCH_END, target, touch, event);

            if (target.hitTest(touch.getLocation()))
                cc_touchDispatchEvent(TouchEvent.TOUCH_TAP, target, touch, event);
        }
    }

    export function cc_touchDispatchEvent(type: string, target: cc.Node, touch: cc.Touch, event: cc.Event): void {
        let e: TouchEvent = Event.create(TouchEvent, type);
        e.touch = touch;
        e.event = event;
        target.event_dispatch(e, target.touchListener.bubbles);
    }


    //


    /**
     * 对象是否在舞台，并且可见
     * 以下情况将会返回 false：
     *  - 不在显示列表中
     *  - 自己或父级的 visible = false
     *  - 自己或父级的 opacity = 0
     * @return {boolean}
     */
    export function inStageVisibled(): boolean {
        let node: cc.Node = this;
        while (node != null) {
            if (node == lolo.stage) return true;// 已经找到舞台了
            if (!node.isVisible()) return false;
            if (node.getOpacity() <= 0) return false;
            node = node.parent;
        }
        return false;
    }


    /**
     * 是否点中测试函数（默认）
     * @param worldPoint
     * @return {boolean}
     */
    export function touchHitTest(worldPoint: cc.Point): boolean {
        if (!this.inStageVisibled()) return false;// 当前节点不可见
        let p: cc.Point = this.convertToNodeSpace(worldPoint);
        lolo.temp_rect.setTo(0, 0, this.width, this.height);
        return lolo.temp_rect.contains(p.x, p.y);// p.y 是反过来的，但是对矩形检测没影响
    }

}


namespace lolo {

    /**
     * 将16进制字符串转换成 cc.Color
     * @param hex 如："0xFF66CC"
     * @return {Color}
     */
    export function hexToColor(hex: string): cc.Color {
        let c = parseInt(hex);
        return cc.color(
            c >> 16,
            (c >> 8) % 256,
            c % 256
        );
    }


    /**
     * 将16进制数字转换成 cc.Color
     * @param c 如：16737996（0xFF66CC）
     * @return {Color}
     */
    export function numToColor(c: number): cc.Color {
        return cc.color(
            c >> 16,
            (c >> 8) % 256,
            c % 256
        );
    }


    /**
     * 将 cc.Color 转换成16进制字符串
     * @param color
     * @param prefix 添加的字符串前缀
     * @return {string}
     */
    export function colorToHex(color: cc.Color, prefix: string = "0x") {
        let hR = color.r.toString(16), hG = color.g.toString(16), hB = color.b.toString(16);
        return prefix + (color.r < 16 ? ("0" + hR) : hR) + (color.g < 16 ? ("0" + hG) : hG) + (color.b < 16 ? ("0" + hB) : hB);
    }

}


namespace lolo {
    export let temp_rect: Rectangle = new Rectangle();
    export let temp_p: Point = new Point();
}


/////////////////////////////////
//
//      由native或其他js文件实现的类和方法
//
/////////////////////////////////
declare namespace lolo {

    /**
     * 根据传入的url，解析出真实的url地址（在 main.js 中实现）
     * @param url
     */
    function getResUrl(url: string): string;


    /**
     * 线上动更 native 实现部分
     */
    class Updater {
        static enableAssetsDir(): void;

        static start(zipUrl: string, version: string, md5: string): void;

        static getState(): number;

        static getByteLoaded(): number;

        static getByteTotal(): number;

        static getSpeed(): number;

        static clearUpdateDirectory(): void;

        static resetApp(): void;
    }
}


/////////////////////////////////
//
//      全局变量、函数
//
/////////////////////////////////


