namespace app.testScene {


    /**
     * 测试 NumberText
     * @author LOLO
     */
    export class TestCase_NumberText extends lolo.Container {

        public nt: lolo.NumberText;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);
        }


        private gesture_touchBegin(event?: lolo.TouchEvent): void {
            this.nt.value = parseInt(Math.random() * 999999);
        }


        protected startup(): void {
            super.startup();

            this.nt.text = "please touch stage";
            lolo.gesture.event_addListener(lolo.TouchEvent.TOUCH_BEGIN, this.gesture_touchBegin, this);
        }

        protected reset(): void {
            lolo.gesture.event_removeListener(lolo.TouchEvent.TOUCH_BEGIN, this.gesture_touchBegin, this);
            super.reset();
        }


        //
    }
}