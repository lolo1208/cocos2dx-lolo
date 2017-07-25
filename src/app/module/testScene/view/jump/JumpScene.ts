namespace app.jump {


    import Container = lolo.Container;


    /**
     * 跳跃游戏场景
     * 2017/7/24
     * @author LOLO
     */
    export class JumpScene extends Container {

        public map: Map = new Map();
        public joystick: Joystick = new Joystick();


        public constructor() {
            super();
        }


        public initialize(): void {
            this.initUI("jumpScCfg");

            let lb = new lolo.Label();
            lb.x = 100;
            lb.y = 100;
            lb.color = "0xFFFFFF";
            lb.text = "sadasdasd";
            this.addChild(lb);
        }


        //


        protected startup(): void {
            super.startup();

            this.map.show();
            this.joystick.show();
        }


        protected reset(): void {
            super.reset();

            this.joystick.hide();
            this.map.hide();
        }


        //
    }
}