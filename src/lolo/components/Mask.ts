/// <reference path="../events/EventDispatcher.ts"/>


namespace lolo {


    /**
     * 遮罩对象（native cc.ClippingNode 不能继承，所以继承至 EventDispatcher，只关注遮罩相关业务逻辑）
     *
     * 使用 Mask 时，会改变被遮罩对象的显示层级，被遮罩对象的 parent 将会被更改为 mask.clipper
     * 而 mask.clipper.parent 将会被设置为 被遮罩对象原本的 parent
     * @author LOLO
     */
    export class Mask extends EventDispatcher {

        public touchListener: cc.TouchListener;

        private _clipper: cc.ClippingNode;
        private _content: cc.Node;
        private _touchEnabled: boolean = false;
        private _rectStencil: cc.Sprite;
        private _rect: lolo.Rectangle;


        public constructor() {
            super();

            this._clipper = new cc.ClippingNode();
            this._clipper.retain();
            this._clipper.setAnchorPoint(0, 1);
            this._clipper.mask = this;
            this._clipper.onEnter = Mask.clipperOnEnter;

            this.touchListener = <cc.TouchListener>cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                bubbles: false,
                onTouchBegan: Mask.touchBegan,
                onTouchMoved: Mask.touchMoved,
                onTouchEnded: Mask.touchEnded
            });
            this.touchListener.retain();
            this.touchEnabled = true;
        }


        /**
         * clipper.onEnter()，this=clipper
         * html5中，onEnter 的时候，需要重新注册 touchListener
         */
        private static clipperOnEnter(): void {
            let self: cc.ClippingNode = <cc.ClippingNode>this;
            cc.ClippingNode.prototype.onEnter.call(self);

            if (!isNative && self.mask._touchEnabled && !self.mask.touchListener._registered)
                self.mask.touchEnabled = true;
        }


        /**
         * 遮罩的内容（目标）
         */
        public set content(value: cc.Node) {
            if (value.parent == this._clipper) return;

            this._clipper.removeAllChildren();
            this._content = value;

            this._clipper.removeFromParent();
            this._content.parent.addChild(this._clipper);

            this._content.removeFromParent();
            this._clipper.addChild(this._content);
        }

        public get content(): cc.Node {
            return this._content;
        }


        /**
         * 使用矩形遮罩
         * @param x
         * @param y
         * @param width
         * @param height
         */
        public setRect(x: number, y: number, width: number, height: number) {
            if (this._rectStencil == null) {
                this._rectStencil = new cc.Sprite();
                this._rectStencil.retain();
                this._rectStencil.setAnchorPoint(0, 1);
                this._rectStencil.setTexture(Constants.EMPTY_TEXTURE);

                this._rect = lolo.CachePool.getRectangle();
                this._rect.setTo(0, 0, width, height);
                this._rectStencil.setTextureRect(this._rect);
            }

            this._rect.setTo(0, 0, width, height);
            this._rectStencil.setTextureRect(this._rect);
            this._rectStencil.x = x;
            this._rectStencil.y = -y;
            this._clipper.stencil = this._rectStencil;

            this._rect.x = x;
            this._rect.y = y;
        }

        public getRect(): Rectangle {
            return this._rect;
        }


        /**
         * 是否启用 touch
         */
        public set touchEnabled(value: boolean) {
            this._touchEnabled = value;

            if (value)
                cc.eventManager.addListener(this.touchListener, this._clipper);
            else
                cc.eventManager.removeListener(this.touchListener);
        }

        public get touchEnabled(): boolean {
            return this._touchEnabled;
        }


        /**
         * touch 相关
         */
        private static touchBegan(touch: cc.Touch, event: cc.EventTouch): boolean {
            let target: cc.Node = event.getCurrentTarget();
            if (!lolo.inStageVisibled.call(target["mask"].content)) return false;// 遮罩内容不可见

            let hited: boolean = Mask.hitTest(target, touch.getLocation());
            if (hited)
                Mask.touchDispatchEvent(TouchEvent.TOUCH_BEGIN, target, touch, event);
            return hited;
        }

        private static touchMoved(touch: cc.Touch, event: cc.EventTouch): void {
            let target: cc.Node = event.getCurrentTarget();
            Mask.touchDispatchEvent(TouchEvent.TOUCH_MOVE, target, touch, event);
        }

        private static touchEnded(touch: cc.Touch, event: cc.EventTouch): void {
            let target: cc.Node = event.getCurrentTarget();
            Mask.touchDispatchEvent(TouchEvent.TOUCH_END, target, touch, event);

            if (Mask.hitTest(target, touch.getLocation()))
                Mask.touchDispatchEvent(TouchEvent.TOUCH_TAP, target, touch, event);
        }

        private static touchDispatchEvent(type: string, target: cc.Node, touch: cc.Touch, event: cc.Event): void {
            let e: TouchEvent = Event.create(TouchEvent, type);
            e.touch = touch;
            e.event = event;
            let clipper: cc.ClippingNode = <cc.ClippingNode>target;
            clipper.mask.event_dispatch(e);
        }


        private static hitTest(target: cc.Node, worldPoint: cc.Point): boolean {
            if (!lolo.inStageVisibled.call(target)) return false;// 当前节点不可见

            let clipper: cc.ClippingNode = <cc.ClippingNode>target;
            let stencil: cc.Node = clipper.stencil;
            if (stencil == null) return false;// 没有遮罩模版

            lolo.temp_rect.setTo(stencil.x, -stencil.y, stencil.width, stencil.height);
            let p: cc.Point = clipper.convertToNodeSpace(worldPoint);
            return lolo.temp_rect.contains(p.x, -p.y);
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            this.touchEnabled = false;
            this.touchListener.release();

            if (this._clipper != null) {
                this._clipper.removeAllChildren();
                this._clipper.release();
                this._clipper = null;
            }

            if (this._content != null)
                this._content = null;

            if (this._rectStencil != null) {
                this._rectStencil.release();
                this._rectStencil = null;
            }

            if (this._rect != null) {
                lolo.CachePool.recycle(this._rect);
                this._rect = null;
            }
        }


        //
    }
}