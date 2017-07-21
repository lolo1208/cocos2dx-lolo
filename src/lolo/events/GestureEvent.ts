namespace lolo {


    /**
     * 手势事件
     * @author LOLO
     */
    export class GestureEvent extends Event {

        /**手势：两个手指轻捏缩放*/
        public static PINCH_ZOOM: string = "pinchZoom";


        //


        /**
         * 手势的增量值
         * type = PINCH_ZOOM 时，值为 scale
         */
        public delta: number;

        /**触发事件的 TouchInfo 列表*/
        public touchInfos: TouchInfo[] = [];


        /**
         * 检测该手势是否是在 target 上发生的
         * @param target
         */
        public hitTest(target: cc.Node): boolean {
            let len: number = this.touchInfos.length;
            for (let i = 0; i < len; i++) {
                if (!target.hitTest(this.touchInfos[i].beginWorldPoint)) return false;
            }
            return true;
        }


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}