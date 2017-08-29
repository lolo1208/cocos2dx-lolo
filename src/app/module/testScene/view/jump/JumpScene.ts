namespace app.jump {


    import Container = lolo.Container;
    import Bitmap = lolo.Bitmap;
    import Event = lolo.Event;


    /**
     * 跳跃游戏场景
     * 2017/7/24
     * @author LOLO
     */
    export class JumpScene extends Container {

        public bg: Bitmap;

        public map: Map = new Map();
        public joystick: Joystick = new Joystick();


        public constructor() {
            super();
        }


        public initialize(): void {
            this.initUI("jumpScCfg");
        }


        private stage_resize(event?: Event): void {
            this.bg.width = lolo.stage.stageWidth;
            this.bg.height = lolo.stage.stageHeight;
        }


        //


        protected startup(): void {
            super.startup();

            this.map.show();
            this.joystick.show();
            this.joystick.setPosition(120, lolo.stage.stageHeight - 120);
            lolo.stage.event_addListener(Event.RESIZE, this.stage_resize, this);
            this.stage_resize();
        }


        protected reset(): void {
            super.reset();

            lolo.stage.event_removeListener(Event.RESIZE, this.stage_resize, this);
            this.map.hide();
            this.joystick.hide();
        }


        //
    }
}