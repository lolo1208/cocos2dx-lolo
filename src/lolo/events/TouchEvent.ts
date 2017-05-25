namespace lolo {


    /**
     * Touch 相关事件
     * @author LOLO
     */
    export class TouchEvent extends Event {


        /**
         * Touch 开始
         */
        public static TOUCH_BEGIN: string = "touchBegin";

        /**
         * Touch 移动
         */
        public static TOUCH_MOVE: string = "touchMove";

        /**
         * Touch 结束
         */
        public static TOUCH_END: string = "touchEnd";

        /**
         * Touch 点击
         */
        public static TOUCH_TAP: string = "touchTap";


        /**对应的 cc.Touch */
        public touch: cc.Touch;

        /**对应的 cc.Event */
        public event: cc.Event;


        constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}