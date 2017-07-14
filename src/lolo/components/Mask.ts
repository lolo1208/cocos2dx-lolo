/// <reference path="../events/EventDispatcher.ts"/>


namespace lolo {


    /**
     * 遮罩对象（native cc.ClippingNode 不能继承，所以继承至 EventDispatcher，只关注遮罩相关业务逻辑）
     *
     * 使用 Mask 时，会改变被遮罩对象的显示层级，伪代码如下：
     * var oldParent = mask.content.parent;
     * mask.content.parent = mask.clipper;
     * mask.clipper.parent = oldParent;
     *
     * @author LOLO
     */
    export class Mask extends EventDispatcher {

        public touchListener: cc.TouchListener;

        /**是否已经被销毁了*/
        public destroyed: boolean = false;

        private _clipper: cc.ClippingNode;
        private _content: cc.Node;
        private _touchEnabled: boolean = false;
        private _rectStencil: cc.Sprite;
        private _rect: lolo.Rectangle;


        public constructor() {
            super();

            this._clipper = new cc.ClippingNode();
            this._clipper.setAnchorPoint(0, 1);
            this._clipper.mask = this;

            this.touchListener = <cc.TouchListener>cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: true,
                bubbles: false,
                onTouchBegan: Mask.touchBegan,
                onTouchMoved: Mask.touchMoved,
                onTouchEnded: Mask.touchEnded
            });
            this.touchListener.retain();
        }


        public get clipper(): cc.ClippingNode {
            return this._clipper;
        }


        /**
         * 遮罩的内容（目标）
         */
        public set content(value: cc.Node) {
            if (value.parent == this._clipper) return;

            this._content = value;
            this._content.parent.addChild(this._clipper);
            this._clipper.removeAllChildren();
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
                this._rectStencil.setAnchorPoint(0, 1);
                this._rectStencil.setTexture(Constants.EMPTY_TEXTURE);

                this._rect = lolo.CachePool.getRectangle();
                this._rect.setTo(0, 0, width, height);
                this._rectStencil.setTextureRect(this._rect);
            }

            this._rect.setTo(0, 0, width, height);
            this._rectStencil.setTextureRect(this._rect);
            this._rectStencil.x = x;
            this._rectStencil.y = y;
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
            if (value && this._touchEnabled) {
                if (isNative) return;
                else if (this.touchListener._registered) return;
            }

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
            let clipper: cc.ClippingNode = <cc.ClippingNode>event.getCurrentTarget();
            let worldPoint: cc.Point = touch.getLocation();
            if (!lolo.expend_inStageVisibled.call(clipper.mask.content, worldPoint)) return false;// 遮罩内容不可见

            let hited: boolean = Mask.hitTest(clipper, worldPoint);
            if (hited)
                Mask.touchDispatchEvent(TouchEvent.TOUCH_BEGIN, clipper, touch, event);
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


        /**
         * 点击测试
         * @param target
         * @param worldPoint
         * @return {boolean}
         */
        private static hitTest(target: cc.Node, worldPoint: cc.Point): boolean {
            if (!lolo.expend_inStageVisibled.call(target, worldPoint)) return false;// 当前节点不可见

            let clipper: cc.ClippingNode = <cc.ClippingNode>target;
            let stencil: cc.Node = clipper.stencil;
            if (stencil == null) return false;// 没有遮罩模版

            let p: cc.Point = clipper.convertToNodeSpace(worldPoint);
            return clipper.mask._rect.contains(p.x, -p.y);
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            if (this.touchListener != null) {
                this.touchEnabled = false;
                this.touchListener.release();
                this.touchListener = null
            }

            if (this._clipper != null) {
                // 将子节点还回 parent 中
                let children: cc.Node[] = this._clipper.children;
                if (!isNative) children = children.concat();
                let len: number = children.length;
                let parent: cc.Node = this._clipper.getParent();
                for (let i = 0; i < len; i++) parent.addChild(children[i]);

                this._clipper.destroy();
                this._clipper = null;
            }

            if (this._content != null)
                this._content = null;

            if (this._rectStencil != null) {
                this._rectStencil.destroy();
                this._rectStencil = null;
            }

            if (this._rect != null) {
                lolo.CachePool.recycle(this._rect);
                this._rect = null;
            }

            this.destroyed = true;
        }


        //
    }
}