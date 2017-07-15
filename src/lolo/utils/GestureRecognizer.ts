namespace lolo {


    export interface TouchInfo {

    }


    /**
     * 手势识别，广播相关事件
     * @author LOLO
     */
    export class GestureRecognizer extends EventDispatcher {

        /**上次发生 TouchEvent 时所在的舞台坐标*/
        public touchPoint: Point = new Point();
        /**上次发生 TouchEvent 时所在的 cocos 世界坐标（可用于 cc.node.convertToNodeSpace()）*/
        public worldPoint: cc.Point = cc.p();

        private _touchEvent: TouchEvent;
        private _touchListener: cc.TouchListener;
        private _multiTouchListener: cc.TouchListener;


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
            cc.eventManager.addListener(this._touchListener, -100);

            this._multiTouchListener = <cc.TouchListener>cc.EventListener.create({
                event: cc.EventListener.TOUCH_ALL_AT_ONCE,
                swallowTouches: false,
                onTouchesBegan: this.multiTouchHandler.bind(this),
                onTouchesMoved: this.multiTouchHandler.bind(this),
                onTouchesEnded: this.multiTouchHandler.bind(this)
            });
            cc.eventManager.addListener(this._multiTouchListener, lolo.stage);
        }


        /**
         * 单点触控事件处理
         * @param touch
         * @param event
         * @return {boolean}
         */
        private touchHandler(touch: cc.Touch, event: cc.EventTouch): boolean {
            let e: TouchEvent = this._touchEvent;
            let eventCode: number = event.getEventCode();
            switch (eventCode) {
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


        private label: Label;

        /**
         * 多点触控事件处理
         * @param touchs
         * @param event
         * @return {boolean}
         */
        private multiTouchHandler(touchs: cc.Touch[], event: cc.EventTouch): boolean {
            let eventCode: number = event.getEventCode();
            let pinchActivated: boolean = this._eventMap[GestureEvent.PINCH_ZOOM] != null;// 当前是需要识别轻捏缩放手势

            switch (eventCode) {
                case 0:
                    if (pinchActivated) this.pinch_touchBegin(touchs, event);
                    break;
                case 1:
                    if (pinchActivated) this.pinch_touchMove(touchs, event);
                    break;
                case 2:
                    if (pinchActivated) this.pinch_touchEnd(touchs, event);
                    break;
            }

            let str: string = Math.random() + "  ";
            for (let i = 0; i < touchs.length; i++)
                str += touchs[i].getID() + ",";

            if (this.label == null) {
                this.label = new Label();
                this.label.width = 0;
                lolo.stage.addChild(this.label);
                this.label.setScale(2);
                this.label.touchEnabled = true;
            }
            this.label.text = (str + "|");

            return true;
        }


        /////////////////////////////////////////////////////////////
        //
        // 轻捏缩放手势识别
        //
        /////////////////////////////////////////////////////////////

        private pinch_touchBegin(touchs: cc.Touch[], event: cc.EventTouch): void {

        }

        private pinch_touchMove(touchs: cc.Touch[], event: cc.EventTouch): void {
            console.log(touchs.length);
        }

        private pinch_touchEnd(touchs: cc.Touch[], event: cc.EventTouch): void {

        }

        /////////////////////////////////////////////////////////////


        //
    }
}