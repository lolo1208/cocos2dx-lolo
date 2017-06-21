namespace lolo {


    /**
     * 手势识别，广播相关事件
     * @author LOLO
     */
    export class Gesture extends EventDispatcher {

        /**上次发生 TouchEvent 时所在的舞台坐标*/
        public touchPoint: Point = new Point();
        /**上次发生 TouchEvent 时所在的 cocos 世界坐标（可用于 cc.node.convertToNodeSpace()）*/
        public worldPoint: cc.Point;

        private _enabled: boolean;
        private _touchEvent: TouchEvent;
        private _touchListener: cc.TouchListener;
        // private _multitouchListener: cc.TouchListener;


        public constructor() {
            super();

            this._touchEvent = new TouchEvent("");
            this._touchListener = <cc.TouchListener>cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: this.touchHandler.bind(this),
                onTouchMoved: this.touchHandler.bind(this),
                onTouchEnded: this.touchHandler.bind(this)
            });
            this.enabled = true;
        }


        /**
         * TOUCH_ONE_BY_ONE 事件处理
         * @param touch
         * @param event
         * @return {boolean}
         */
        private touchHandler(touch: cc.Touch, event: cc.EventTouch): boolean {
            let e: TouchEvent = this._touchEvent;
            switch (event.getEventCode()) {
                case 0:
                    e.type = TouchEvent.TOUCH_BEGIN;
                    break;
                case 1:
                    e.type = TouchEvent.TOUCH_MOVE;
                    break;
                case 2:
                    e.type = TouchEvent.TOUCH_END;
                    break;
            }

            this.worldPoint = touch.getLocation();
            this.touchPoint.setTo(
                this.worldPoint.x,
                lolo.stage.stageHeight - this.worldPoint.y
            );

            e.touch = touch;
            e.event = event;
            this.event_dispatch(e, false, false);

            return true;
        }


        /**
         * 是否启用
         * @param value
         */
        public set enabled(value: boolean) {
            this._enabled = value;
            if (value) {
                cc.eventManager.addListener(this._touchListener, -100);
            }
            else {
                cc.eventManager.removeListener(this._touchListener);
            }
        }

        public get enabled(): boolean {
            return this._enabled;
        }

        //
    }
}