namespace lolo {


    /**
     * 场景事件
     * @author LOLO
     */
    export class SceneEvent extends Event {


        /**进入场景事件*/
        public static ENTER_SCENE: string = "enterScene";


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}