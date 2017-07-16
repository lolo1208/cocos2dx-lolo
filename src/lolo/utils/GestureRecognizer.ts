namespace lolo {


    export interface TouchInfo {
        /**TouchID*/
        id?: number;
        /**TouchBegin 时所在的世界坐标*/
        beginWorldPoint: Point;
        /**上次计算手势的屏幕坐标*/
        lastPoint: Point;
        /**当前屏幕坐标*/
        currentPoint: Point;
    }


    /**
     * 手势识别，广播相关事件
     * @author LOLO
     */
    export class GestureRecognizer extends EventDispatcher {

        private static _infoPool: TouchInfo[] = [];

        /**上次发生 TouchEvent 时所在的舞台坐标*/
        public touchPoint: Point = new Point();
        /**上次发生 TouchEvent 时所在的 cocos 世界坐标（可用于 cc.node.convertToNodeSpace()）*/
        public worldPoint: cc.Point = cc.p();

        private _touchEvent: TouchEvent;
        private _touchListener: cc.TouchListener;

        /**当前帧发生的 touch 信息列表*/
        private _touchInfoList: any = {};


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

            cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, this.deactivateHandler.bind(this));
        }

        private deactivateHandler(): void {
            this._touchInfoList = {};
            this._pinch_touchIDs = {};
        }


        /**
         * touch 事件处理
         */
        private touchHandler(touch: cc.Touch, event: cc.EventTouch): boolean {

            this.worldPoint = touch.getLocation();
            this.touchPoint.setTo(
                this.worldPoint.x,
                lolo.stage.stageHeight - this.worldPoint.y
            );

            let e: TouchEvent = this._touchEvent;
            let eventCode: number = event.getEventCode();
            let touchID: number = isPCWeb ? touch.__instanceId : touch.getID();
            let infoList = this._touchInfoList;
            let info: TouchInfo;

            switch (eventCode) {
                case 0:
                    e.type = TouchEvent.TOUCH_BEGIN;

                    info = infoList[touchID] = (GestureRecognizer._infoPool.length > 0)
                        ? GestureRecognizer._infoPool.pop()
                        : {
                            beginWorldPoint: CachePool.getPoint(),
                            lastPoint: CachePool.getPoint(),
                            currentPoint: CachePool.getPoint()
                        };
                    info.id = touchID;
                    info.beginWorldPoint.x = this.worldPoint.x;
                    info.beginWorldPoint.y = this.worldPoint.y;
                    info.lastPoint.x = info.currentPoint.x = this.touchPoint.x;
                    info.lastPoint.y = info.currentPoint.y = this.touchPoint.y;

                    this.stage_enterFrame();
                    break;

                case 1:
                    e.type = TouchEvent.TOUCH_MOVE;

                    info = infoList[touchID];
                    info.currentPoint.x = this.touchPoint.x;
                    info.currentPoint.y = this.touchPoint.y;
                    break;

                case 2:
                    e.type = TouchEvent.TOUCH_END;

                    GestureRecognizer._infoPool.push(infoList[touchID]);
                    delete infoList[touchID];
                    if (this._pinch_touchIDs[touchID] != null) delete this._pinch_touchIDs[touchID];
                    break;
            }

            e.touch = touch;
            e.event = event;
            this.event_dispatch(e, false, false);

            lolo.stage.event_addListener(Event.ENTER_FRAME, this.stage_enterFrame, this);

            return true;
        }


        /**
         * 在下一帧开始检测手势
         * @param event
         */
        private stage_enterFrame(event?: Event): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.stage_enterFrame, this);

            let pinchActivated: boolean = this._eventMap[GestureEvent.PINCH_ZOOM] != null;// 当前是否需要识别轻捏缩放手势
            if (pinchActivated) this.pinch_recognizer();

            // 更新 lastPoint
            let infoList = this._touchInfoList;
            for (let touchID in infoList) {
                let info: TouchInfo = infoList[touchID];
                info.lastPoint.copyFrom(info.currentPoint);
            }
        }


        /////////////////////////////////////////////////////////////
        //
        // 轻捏缩放手势识别
        //
        /////////////////////////////////////////////////////////////
        /**上次进行轻捏缩放手势识别的 touchID 标记列表*/
        private _pinch_touchIDs: any = {};
        private _lastD = 0;

        private pinch_recognizer(): void {
            // 识别两个手指即可
            let infoList = this._touchInfoList;
            let info1: TouchInfo, info2: TouchInfo;
            for (let touchID in infoList) {
                if (info1 == null)
                    info1 = infoList[touchID];
                else {
                    info2 = infoList[touchID];
                    break;
                }
            }


            if (this.label == null) {
                this.label = new Label();
                lolo.stage.addChild(this.label);
            }
            this.label.text = "";


            if (info2 == null) return;

            let touchIDs: any = this._pinch_touchIDs;
            if (touchIDs[info1.id] == null || touchIDs[info2.id] == null) {
                touchIDs[info1.id] = touchIDs[info2.id] = true;
            }
            else {
                let ox1 = info1.currentPoint.x - info1.lastPoint.x;
                let oy1 = info1.currentPoint.y - info1.lastPoint.y;
                let ox2 = info2.currentPoint.x - info2.lastPoint.x;
                let oy2 = info2.currentPoint.y - info2.lastPoint.y;
                let threshold = 2;
                if (Math.abs(ox1) < threshold && Math.abs(oy1) < threshold
                    || Math.abs(ox2) < threshold && Math.abs(oy2) < threshold
                ) return;

                let x = info2.currentPoint.x - info1.currentPoint.x;
                let y = info2.currentPoint.y - info1.currentPoint.y;
                let d = Math.abs(x * x + y * y);

                this.label.text = ""
                    + info1.currentPoint.x.toFixed(1) + ", " + info1.currentPoint.y.toFixed(1)
                    + "  ||  "
                    + info2.currentPoint.x.toFixed(1) + ", " + info2.currentPoint.y.toFixed(1)
                    + "  ||  "
                    + d.toFixed(3)
                    + "  ||  "
                    + (this._lastD <= d);

                this._lastD = d;
            }
        }

        /////////////////////////////////////////////////////////////

        private label: Label;

    }
}