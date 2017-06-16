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
     * 扩展 cocos 显示对象相关
     */
    export function extend_cc(): void {

        expend_node();
        expend_ctor(UIManager);
        expend_ctor(DisplayObjectContainer);
        expend_ctor(Bitmap);
        expend_ctor(SimpleBitmap);
        expend_ctor(Animation);
        expend_ctor(TextField);
        expend_ctor(InputText);
        expend_ctor(ModalBackground);


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
}


namespace lolo {

    /**
     * 扩展 cc.Node
     */
    export function expend_node(): void {
        let p: any = cc.Node.prototype;

        p.destroyed = p._touchEnabled = false;
        p.propagateTouchEvents = true;
        p._x = p._y = p._width = p._height = 0;
        p._scaleX = p._scaleY = 1;

        Object.defineProperty(p, "alpha", expend_alpha);
        Object.defineProperty(p, "name", expend_name);
        Object.defineProperty(p, "touchEnabled", expend_touenabled);

        p.destroy = expend_destroy;
        p.hitTest = expend_hitTest;
        p.inStageVisibled = expend_inStageVisibled;

        // addChild
        p._original_addChild = p.addChild;
        p.addChild = expend_addChild;

        // html5中，onEnter 的时候，需要重新注册 touchListener
        if (!isNative) {
            p._original_onEnter = p.onEnter;
            p.onEnter = expend_onEnter;
        }

        // EventDispatcher
        p.event_addListener = expend_event_addListener;
        p.event_removeListener = expend_event_removeListener;
        p.event_dispatch = expend_event_dispatch;
        p.event_hasListener = expend_event_hasListener;

        // width
        p.setWidth = expend_setWidth;
        p.getWidth = expend_getWidth;
        Object.defineProperty(p, "width", expend_width);
        // height
        p.setHeight = expend_setHeight;
        p.getHeight = expend_getHeight;
        Object.defineProperty(p, "height", expend_height);

        // position
        p._original_setPosition = p.setPosition;
        p.setPosition = expend_setPosition;
        // x
        p._original_setPositionX = p.setPositionX;
        p._original_getPositionX = p.getPositionX;
        p.setPositionX = expend_setPositionX;
        p.getPositionX = expend_getPositionX;
        Object.defineProperty(p, "x", expend_x);
        // y
        p._original_setPositionY = p.setPositionY;
        p._original_getPositionY = p.getPositionY;
        p.setPositionY = expend_setPositionY;
        p.getPositionY = expend_getPositionY;
        Object.defineProperty(p, "y", expend_y);

        // scale
        p._original_setScale = p.setScale;
        p.setScale = expend_setScale;
        // scaleX
        p._original_setScaleX = p.setScaleX;
        p._original_getScaleX = p.getScaleX;
        p.setScaleX = expend_setScaleX;
        p.getScaleX = expend_getScaleX;
        Object.defineProperty(p, "scaleX", expend_scaleX);
        // scaleY
        p._original_setScaleY = p.setScaleY;
        p._original_getScaleY = p.getScaleY;
        p.setScaleY = expend_setScaleY;
        p.getScaleY = expend_getScaleY;
        Object.defineProperty(p, "scaleY", expend_scaleY);

    }


    /**
     * 扩展显示对象的 ctor() 方法
     */
    export function expend_ctor(targetClass: any): void {
        let p: any = targetClass.prototype;

        p._original_ctor = p.ctor;
        p.ctor = function () {
            this._original_ctor.apply(this, arguments);
            this.retain();
            this.notRelease = true;
            this.setAnchorPoint(0, 1);// 设置锚点位置，转到屏幕坐标系（继承至 ccSprite 的类，记得调用完 super() 后，再设置一次）
            this.cascadeOpacity = true;

            this._ed = new lolo.EventDispatcher(this);

            this.touchListener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                bubbles: false,
                onTouchBegan: expend_touchBegan,
                onTouchMoved: expend_touchMoved,
                onTouchEnded: expend_touchEnded
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

    }
}


namespace lolo {

    // onEnter
    export function expend_onEnter(): void {
        this._original_onEnter();
        if (this._touchEnabled && !this.touchListener._registered)
            this.touchEnabled = true;
    }


    // destroy
    export function expend_destroy(): void {
        if (this.touchListener != null) {
            this.touchEnabled = false;
            this.touchListener.release();
            this.touchListener = null;
        }

        // 调用子节点的 destroy()
        let children: cc.Node[] = this.children;
        if (!isNative) children = children.concat();
        let len: number = children.length;
        for (let i = 0; i < len; i++) {
            children[i].destroy();
        }

        this.removeFromParent();
        if (this.notRelease) {
            this.release();
            this.notRelease = false;
        }
        this.destroyed = true;
    }


    // inStageVisibled
    export function expend_inStageVisibled(): boolean {
        let node: cc.Node = this;
        while (node != null) {
            if (node == lolo.stage) return true;// 已经找到舞台了
            if (!node.isVisible()) return false;
            if (node.getOpacity() <= 0) return false;
            node = node.parent;
        }
        return false;
    }


    // hitTest
    export function expend_hitTest(worldPoint: cc.Point): boolean {
        let children: cc.Node[] = this.children;
        for (let i = 0; i < children.length; i++) {
            let child: cc.Node = children[i];
            if (child instanceof ModalBackground) continue;// 忽略模态背景
            if (child.hitTest(worldPoint))  return true;
        }
        return false;
    }

    // addChild
    export function expend_addChild(): void {
        let child: cc.Node = arguments[0];
        if (child == null) return;
        if (child.destroyed) {
            throwError("不能添加已被销毁的节点");
            return;
        }

        child.removeFromParent();
        this._original_addChild.apply(this, arguments);
    }


    // touch
    export function expend_touchBegan(touch: cc.Touch, event: cc.EventTouch): boolean {
        let target: cc.Node = event.getCurrentTarget();
        let hited: boolean = target.hitTest(touch.getLocation());
        if (hited && target.propagateTouchEvents)
            expend_touchDispatchEvent(TouchEvent.TOUCH_BEGIN, target, touch, event);
        return hited;
    }

    export function expend_touchMoved(touch: cc.Touch, event: cc.EventTouch): void {
        let target: cc.Node = event.getCurrentTarget();
        if (target.propagateTouchEvents) {
            expend_touchDispatchEvent(TouchEvent.TOUCH_MOVE, target, touch, event);
        }
    }

    export function expend_touchEnded(touch: cc.Touch, event: cc.EventTouch): void {
        let target: cc.Node = event.getCurrentTarget();
        if (target.propagateTouchEvents) {
            expend_touchDispatchEvent(TouchEvent.TOUCH_END, target, touch, event);

            if (target.hitTest(touch.getLocation()))
                expend_touchDispatchEvent(TouchEvent.TOUCH_TAP, target, touch, event);
        }
    }

    export function expend_touchDispatchEvent(type: string, target: cc.Node, touch: cc.Touch, event: cc.Event): void {
        let e: TouchEvent = Event.create(TouchEvent, type);
        e.touch = touch;
        e.event = event;
        target.event_dispatch(e, target.touchListener.bubbles);
    }


    // alpha
    export let expend_alpha: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value: number): void {
            this.setOpacity(value * 255);
        },
        get: function (): number {
            return this.getOpacity() / 255;
        }
    };

    // name
    export let expend_name: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value: string): void {
            this.setName(value);
        },
        get: function (): string {
            return this.getName();
        }
    };

    // touenabled
    export let expend_touenabled: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value: boolean): void {
            if (value && this._touchEnabled) {
                if (isNative) return;
                else if (this.touchListener._registered) return;
            }

            this._touchEnabled = value;
            if (value)
                cc.eventManager.addListener(this.touchListener, this);
            else
                cc.eventManager.removeListener(this.touchListener);
        },
        get: function (): boolean {
            return this._touchEnabled;
        }
    };


    // width
    export function expend_setWidth(value: number): void {
        this._width = value;
        this.setContentSize(this._width, this._height);
    }

    export function expend_getWidth(): number {
        return this._width;
    }

    export let expend_width: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value) {
            this.setWidth(value);
        },
        get: function () {
            return this.getWidth();
        }
    };


    // height
    export function expend_setHeight(value: number): void {
        this._height = value;
        this.setContentSize(this._width, this._height);
    }

    export function expend_getHeight(): number {
        return this._height;
    }

    export let expend_height: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value) {
            this.setHeight(value);
        },
        get: function () {
            return this.getHeight();
        }
    };


    // position
    export function expend_setPosition(newPosOrxValue: number|cc.Point, yValue?: number): void {
        if (yValue == null) {
            this.setPositionX((<cc.Point>newPosOrxValue).x);
            this.setPositionY((<cc.Point>newPosOrxValue).y);
        }
        else {
            this.setPositionX(<number>newPosOrxValue);
            this.setPositionY(yValue);
        }
    }


    // x
    export function expend_setPositionX(value: number): void {
        this._x = value;
        this._original_setPositionX(value);
    }

    export function expend_getPositionX(): number {
        return this._x;
    }

    export let expend_x: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value: number): void {
            this.setPositionX(value);
        },
        get: function (): number {
            return this.getPositionX();
        }
    };


    // y
    export function expend_setPositionY(value: number): void {
        this._y = value;
        this._original_setPositionY(-value);
    }

    export function expend_getPositionY(): number {
        return this._y;
    }

    export let expend_y: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value: number): void {
            this.setPositionY(value);
        },
        get: function (): number {
            return this.getPositionY();
        }
    };


    // scale
    export function expend_setScale(scale: number, scaleY?: number): void {
        if (scaleY == null) {
            this.setScaleX(scale);
            this.setScaleY(scale);
        }
        else {
            this.setScaleX(scale);
            this.setScaleY(scaleY);
        }
    }


    // scaleX
    export function expend_setScaleX(value: number): void {
        this._scaleX = value;
        this._original_setScaleX(value);
    }

    export function expend_getScaleX(): number {
        return this._scaleX;
    }

    export let expend_scaleX: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value: number): void {
            this.setScaleX(value);
        },
        get: function (): number {
            return this.getScaleX();
        }
    };


    // scaleY
    export function expend_setScaleY(value: number): void {
        this._scaleY = value;
        this._original_setScaleY(value);
    }

    export function expend_getScaleY(): number {
        return this._scaleY;
    }

    export let expend_scaleY: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value: number): void {
            this.setScaleY(value);
        },
        get: function (): number {
            return this.getScaleY();
        }
    };


    // EventDispatcher
    export function expend_event_addListener(): void {
        this._ed.event_addListener.apply(this._ed, arguments);
    }

    export function expend_event_removeListener(): void {
        this._ed.event_removeListener.apply(this._ed, arguments);
    }

    export function expend_event_dispatch(): void {
        this._ed.event_dispatch.apply(this._ed, arguments);
    }

    export function expend_event_hasListener(): boolean {
        return this._ed.event_hasListener.apply(this._ed, arguments);
    }
}