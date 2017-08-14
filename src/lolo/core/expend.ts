/////////////////////////////////
//
//      cocos 相关支持
//
/////////////////////////////////
namespace lolo {

    export let _original_cc_ClippingNode_onEnter: Function;


    /**
     * 扩展 cocos 显示对象相关
     */
    export function extend_cc(): void {

        expend_other();

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
        let p = cc.ClippingNode.prototype;
        p.event_dispatch = function (): void {
            let parent: cc.Node = this.getParent();
            if (parent != null) parent.event_dispatch.apply(parent, arguments);
        };

        _original_cc_ClippingNode_onEnter = p.onEnter;
        p.onEnter = expend_clippingNode_onEnter;
        p.contains = expend_clippingNode_contains;


        // cc.LabelTTF
        p = cc.LabelTTF.prototype;
        Object.defineProperty(p, "width", expend_width);
        Object.defineProperty(p, "height", expend_height);


        // cc.Sprite
        p = cc.Sprite.prototype;
        p._original_setTexture = p.setTexture;
        p.setTexture = function (texture) {
            this._original_setTexture(texture);
            if (this._filter != null)
                this.setShaderProgram(Filter.getShaderProgram(this._filter));
        };


        if (isNative) {
            // cc.EditBox 属性重新定义
            let p = cc.EditBox.prototype;
            Object.defineProperty(p, "x", expend_x);
            Object.defineProperty(p, "y", expend_y);
            Object.defineProperty(p, "width", expend_width);
            Object.defineProperty(p, "height", expend_height);
            Object.defineProperty(p, "touchEnabled", expend_touchEnabled);

            expend_action();
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
        p._filter = null;

        Object.defineProperty(p, "alpha", expend_alpha);
        Object.defineProperty(p, "name", expend_name);
        Object.defineProperty(p, "touchEnabled", expend_touchEnabled);

        p.destroy = expend_destroy;
        p.destroyAllChildren = expend_destroyAllChildren;
        p.hitTest = expend_hitTest;
        p.inStageVisibled = expend_inStageVisibled;

        // addChild
        p._original_addChild = p.addChild;
        p.addChild = expend_addChild;

        // html5
        if (!isNative) {

            // onEnter() 的时候，需要重新注册 touchListener
            p._original_onEnter = p.onEnter;
            p.onEnter = expend_onEnter;

            // getChildren() 返回 _children 的副本
            p.getChildren = function (): cc.Node[] {
                return this._children.concat();
            };
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

        // filter
        p.setFilter = expend_setFilter;
        p.getFilter = expend_getFilter;
        Object.defineProperty(p, "filter", expend_filter);
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

        this.destroyAllChildren();

        this.removeFromParent();
        if (this.notRelease) {
            this.release();
            this.notRelease = false;
        }
        this.destroyed = true;
    }


    // destroyAllChildren
    export function expend_destroyAllChildren(): void {
        let children: cc.Node[] = this.getChildren();
        let len: number = children.length;
        for (let i = 0; i < len; i++) children[i].destroy();
    }


    // inStageVisibled
    export function expend_inStageVisibled(worldPoint?: cc.Point): boolean {
        let node: cc.Node = this;
        while (node != null) {
            if (node == lolo.stage) return true;// 已经找到舞台了
            if (!node.isVisible()) return false;
            if (node.getOpacity() <= 0) return false;
            if (node instanceof cc.ClippingNode && worldPoint != null && !node.contains(worldPoint)) return false;
            node = node.parent;
        }
        return false;
    }


    // hitTest
    export function expend_hitTest(worldPoint: cc.Point): boolean {
        if (!this.inStageVisibled(worldPoint)) return false;// 当前节点不可见
        let children: cc.Node[] = this.getChildren();
        let len: number = children.length;
        for (let i = 0; i < len; i++) {
            let child: cc.Node = children[i];
            if (child instanceof ModalBackground) continue;// 忽略模态背景
            if (child.hitTest(worldPoint)) return true;
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

        if (child.getParent() != null) child.removeFromParent();
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
    export let expend_touchEnabled: PropertyDescriptor = {
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
        this._setWidth(value);
    }

    export function expend_getWidth(): number {
        let w: number = (this._width > 0) ? this._width : this._getWidth();
        return w * this._scaleX;
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
        this._setHeight(value);
    }

    export function expend_getHeight(): number {
        let h: number = (this._height > 0) ? this._height : this._getHeight();
        return h * this._scaleY;
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
    export function expend_setPosition(newPosOrxValue: number | cc.Point, yValue?: number): void {
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


    // filter
    export function expend_setFilter(value: string): void {
        if (value == null) return;
        this._filter = value;

        if (this instanceof cc.Sprite) {
            this.setShaderProgram(Filter.getShaderProgram(value));
        }

        let children: cc.Node[] = this.getChildren();
        let len: number = children.length;
        for (let i = 0; i < len; i++) {
            children[i].setFilter(value);
        }
    }

    export function expend_getFilter(): string {
        return this._filter;
    }

    export let expend_filter: PropertyDescriptor = {
        enumerable: true, configurable: true,
        set: function (value) {
            this.setFilter(value);
        },
        get: function () {
            return this.getFilter();
        }
    };


    // clippingNode.onEnter
    export function expend_clippingNode_onEnter(): void {
        let clipper: cc.ClippingNode = <cc.ClippingNode>this;
        _original_cc_ClippingNode_onEnter.call(clipper);
        if (!isNative && clipper.mask.touchEnabled && !clipper.mask.touchListener._registered)
            clipper.mask.touchEnabled = true;
    }

    // clippingNode.contains
    export function expend_clippingNode_contains(worldPoint: Point): boolean {
        let clipper: cc.ClippingNode = <cc.ClippingNode>this;
        let p = this.convertToNodeSpace(worldPoint);
        return clipper.mask.getRect().contains(p.x, -p.y);
    }

}


namespace lolo {

    export let _original_cc_moveBy_update: Function;
    export let _original_cc_moveBy: Function;
    export let _original_cc_moveTo: Function;

    export let _original_cc_bezierBy_update: Function;
    export let _original_cc_bezierBy: Function;
    export let _original_cc_bezierTo: Function;

    export let _original_cc_jumpBy_update: Function;
    export let _original_cc_jumpBy: Function;
    export let _original_cc_jumpTo: Function;

    export let _original_cc_place: Function;


    /**
     * 重写 Action 相关方法，将传入的y值取反（native），并在运行时同步位置
     */
    export function expend_action(): void {

        // move
        _original_cc_moveBy_update = cc.MoveBy.prototype.update;
        cc.MoveBy.prototype.update = function (dt: number): void {
            lolo._original_cc_moveBy_update.call(this, dt);
            lolo.expend_updatePosition.call(this.getTarget());
        };

        _original_cc_moveBy = cc.moveBy;
        cc.moveBy = function (): cc.MoveBy {
            if (arguments.length == 3) arguments[2] = -arguments[2];
            else/* if (arguments.length == 2)*/ arguments[1] = {x: arguments[1].x, y: -arguments[1].y};
            return lolo._original_cc_moveBy.apply(this, arguments);
        };

        _original_cc_moveTo = cc.moveTo;
        cc.moveTo = function (): cc.MoveTo {
            if (arguments.length == 3) arguments[2] = -arguments[2];
            else/* if (arguments.length == 2)*/ arguments[1] = {x: arguments[1].x, y: -arguments[1].y};
            return lolo._original_cc_moveTo.apply(this, arguments);
        };


        // bezier
        // _original_cc_bezierBy_update = cc.BezierBy.prototype.update;
        // cc.BezierBy.prototype.update = function (dt: number): void {
        //     lolo._original_cc_bezierBy_update.call(this, dt);
        //     lolo.expend_updatePosition.call(this.getTarget());
        // };

        _original_cc_bezierBy = cc.bezierBy;
        cc.bezierBy = function (t: number, c: cc.Point[]): cc.BezierBy {
            let len = c.length;
            for (let i = 0; i < len; i++) c[i] = {x: c[i].x, y: -c[i].y};
            return lolo._original_cc_bezierBy.call(this, t, c);
        };

        _original_cc_bezierTo = cc.bezierTo;
        cc.bezierTo = function (t: number, c: cc.Point[]): cc.BezierTo {
            let len = c.length;
            for (let i = 0; i < len; i++) c[i] = {x: c[i].x, y: -c[i].y};
            return lolo._original_cc_bezierTo.call(this, t, c);
        };


        // jump
        // _original_cc_jumpBy_update = cc.JumpTo.prototype.update;
        // cc.JumpBy.prototype.update = function (dt: number): void {
        //     lolo._original_cc_jumpBy_update.call(this, dt);
        //     lolo.expend_updatePosition.call(this.getTarget());
        // };

        _original_cc_jumpBy = cc.jumpBy;
        cc.jumpBy = function (): cc.JumpBy {
            if (arguments.length == 5) {
                arguments[2] = -arguments[2];
                arguments[3] = -arguments[3];
            }
            else/* if (arguments.length == 4)*/{
                arguments[1] = {x: arguments[1].x, y: -arguments[1].y};
                arguments[2] = -arguments[2];
            }
            return lolo._original_cc_jumpBy.apply(this, arguments);
        };

        _original_cc_jumpTo = cc.jumpTo;
        cc.jumpTo = function (): cc.JumpTo {
            if (arguments.length == 5) {
                arguments[2] = -arguments[2];
                arguments[3] = -arguments[3];
            }
            else/* if (arguments.length == 4)*/{
                arguments[1] = {x: arguments[1].x, y: -arguments[1].y};
                arguments[2] = -arguments[2];
            }
            return lolo._original_cc_jumpTo.apply(this, arguments);
        };


        // place
        _original_cc_place = cc.place;
        cc.place = function (): cc.Place {
            if (arguments.length == 2) arguments[1] = -arguments[1];
            else/* if (arguments.length == 1)*/ arguments[0] = {x: arguments[0].x, y: -arguments[0].y};
            return lolo._original_cc_place.apply(this, arguments);
        };
    }


    /**
     * 更新 _x / _y 的值（native）
     */
    export function expend_updatePosition(): void {
        this._x = this._original_getPositionX();
        this._y = -this._original_getPositionY();
    }
}


namespace lolo {

    /**
     * 扩展其他
     */
    export function expend_other(): void {

        // 扩展 cc.Color
        let p = cc.Color.prototype;

        p.parseHex = function (hex: string): cc.Color {
            if (hex.length == 8) hex += "FF";// alpha 默认 255
            this._val = parseInt(hex);
            return this;
        };
        p.getHex = function (prefix: string = "0x", alpha?: boolean): string {
            let hex: string = this._val.toString(16);
            if (!alpha) hex = hex.substr(0, 6);
            return prefix + hex;
        };

        if (isNative) {
            Object.defineProperty(p, "_val", {
                enumerable: true, configurable: true,
                set: function (value) {
                    this.r = (value & 0xff000000) >>> 24;
                    this.g = (value & 0x00ff0000) >> 16;
                    this.b = (value & 0x0000ff00) >> 8;
                    this.a = value & 0x000000ff;
                },
                get: function () {
                    return ((this.r << 24) >>> 0) + (this.g << 16) + (this.b << 8) + this.a;
                }
            });

            cc.color = function (r, g, b, a): cc.Color {
                if (r === undefined)
                    return new cc.Color(0, 0, 0, 255);
                if (typeof r === 'object')
                    return new cc.Color(r.r, r.g, r.b, (r.a == null) ? 255 : r.a);
                if (typeof r === 'string')
                    return new cc.Color().parseHex(r);
                return new cc.Color(r, g, b, (a == null ? 255 : a));
            };
        }


        // 扩展 cc.Touch
        p = cc.Touch.prototype;
        if (isPCWeb) {
            p.getTouchID = function (): number {
                return this.__instanceId;
            };
        } else {
            p.getTouchID = p.getID;
        }
    }
}