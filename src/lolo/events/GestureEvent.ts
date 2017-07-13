namespace lolo {


    /**
     * 手势事件
     * @author LOLO
     */
    export class GestureEvent extends Event {


        /**两个手指轻捏缩放*/
        public static PINCH_ZOOM: string = "pinchZoom";


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}