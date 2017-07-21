namespace lolo {


    export interface TouchInfo {
        /**TouchID*/
        id?: number;
        /**TouchBegin 时所在的世界坐标*/
        beginWorldPoint: Point;
        /**当前屏幕坐标*/
        currentPoint: Point;
    }


    /**
     * 手势识别，广播相关事件。
     * 单例，请通过 lolo.gesture 访问
     * @author LOLO
     */
    export class GestureRecognizer extends EventDispatcher {

        /**TouchInfo 缓存池*/
        private _infoPool: TouchInfo[] = [];

        /**上次发生 TouchEvent 时所在的舞台坐标*/
        public touchPoint: Point = new Point();
        /**上次发生 TouchEvent 时所在的 cocos 世界坐标（可用于 cc.node.convertToNodeSpace()）*/
        public worldPoint: cc.Point = cc.p();

        private _touchListener: cc.TouchListener;
        private _touchEvent: TouchEvent;
        private _gestureEvent: GestureEvent;

        /**当前帧发生的 touch 信息列表*/
        private _touchInfoList: any = {};


        public constructor() {
            super();

            this._touchEvent = new TouchEvent("");
            this._gestureEvent = new GestureEvent("");

            this._touchListener = <cc.TouchListener>cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: this.touchHandler.bind(this),
                onTouchMoved: this.touchHandler.bind(this),
                onTouchEnded: this.touchHandler.bind(this)
            });
            cc.eventManager.addListener(this._touchListener, -100);

            lolo.stage.event_addListener(Event.DEACTIVATE, this.deactivateHandler, this);
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
            let info: TouchInfo = infoList[touchID];

            switch (eventCode) {
                case 0:
                    e.type = TouchEvent.TOUCH_BEGIN;

                    info = infoList[touchID] = (this._infoPool.length > 0)
                        ? this._infoPool.pop()
                        : {
                            beginWorldPoint: CachePool.getPoint(),
                            lastPoint: CachePool.getPoint(),
                            currentPoint: CachePool.getPoint()
                        };
                    info.id = touchID;
                    info.beginWorldPoint.x = this.worldPoint.x;
                    info.beginWorldPoint.y = this.worldPoint.y;
                    break;

                case 1:
                    e.type = TouchEvent.TOUCH_MOVE;
                    break;

                case 2:
                    e.type = TouchEvent.TOUCH_END;

                    if (info != null) {
                        this._infoPool.push(info);
                        delete infoList[touchID];
                    }

                    if (this._pinch_touchPoints[touchID] != null) {
                        CachePool.recycle(this._pinch_touchPoints[touchID]);
                        delete this._pinch_touchPoints[touchID];
                    }
                    break;
            }
            if (info != null) {// deactivate 发生时，touchMove 值会为 null
                info.currentPoint.x = this.touchPoint.x;
                info.currentPoint.y = this.touchPoint.y;
            }

            e.touch = touch;
            e.event = event;
            this.event_dispatch(e, false, false);

            lolo.stage.event_addListener(Event.PRERENDER, this.prerenderHandler, this);

            return true;
        }


        /**
         * 在渲染前开始检测手势
         * @param event
         */
        private prerenderHandler(event: Event): void {
            lolo.stage.event_removeListener(Event.PRERENDER, this.prerenderHandler, this);

            let pinchActivated: boolean = this._eventMap[GestureEvent.PINCH_ZOOM] != null;// 当前是否需要识别轻捏缩放手势
            if (pinchActivated) this.pinch_recognizer();
        }


        /////////////////////////////////////////////////////////////
        //
        // 轻捏缩放手势识别
        //
        /////////////////////////////////////////////////////////////
        /**进行轻捏缩放手势识别的信息列表，touchID 为 key，值为 Point*/
        private _pinch_touchPoints: any = {};

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
            if (info2 == null) return;

            // 初始化用于识别的两个手指
            let touchIDs: any = this._pinch_touchPoints;
            let p1: Point = touchIDs[info1.id];
            let p2: Point = touchIDs[info2.id];
            if (p1 == null) {
                touchIDs[info1.id] = CachePool.getPoint(info1.currentPoint.x, info1.currentPoint.y);
            } else if (p2 == null) {
                touchIDs[info2.id] = CachePool.getPoint(info2.currentPoint.x, info2.currentPoint.y);
            }

            else {
                // 与上次记录的位置算出间距，得出缩放比例
                let dLast = Point.distance(p1, p2);
                let dCurrent = Point.distance(info1.currentPoint, info2.currentPoint);
                let d = dCurrent - dLast;
                if (Math.abs(d) < 20) return;// 每次判断的最少间距

                // 更新，记录当前位置
                p1.copyFrom(info1.currentPoint);
                p2.copyFrom(info2.currentPoint);

                // 抛出事件
                let e: GestureEvent = this._gestureEvent;
                e.touchInfos.length = 0;
                e.touchInfos.push(info1, info2);
                e.type = GestureEvent.PINCH_ZOOM;
                e.delta = d / 200;// 得出 scale
                this.event_dispatch(e, false, false);
            }
        }

        /////////////////////////////////////////////////////////////


        private deactivateHandler(event: Event): void {
            // recycle TouchInfo
            for (let key in this._touchInfoList)
                this._infoPool.push(this._touchInfoList[key]);
            this._touchInfoList = {};

            // recycle Point
            for (let key in this._pinch_touchPoints)
                CachePool.recycle(this._pinch_touchPoints[key]);
            this._pinch_touchPoints = {};
        }

        //
    }
}