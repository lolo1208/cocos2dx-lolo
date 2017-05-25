/// <reference path="../events/Event.ts"/>


namespace lolo {


    /**
     * 动画相关事件
     * @author LOLO
     */
    export class AnimationEvent extends Event {

        /**帧刷新（与Event.ENTER_FRAME不同的是，动画只有在播放时，切换帧时才会触发该事件）*/
        public static ENTER_FRAME: string = "animationEnterFrame";

        /**动画进入了停止帧*/
        public static ENTER_STOP_FRAME: string = "animationEnterStopFrame";

        /**动画在完成了指定重复次数，并到达了停止帧*/
        public static ANIMATION_END: string = "animationEnd";


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}