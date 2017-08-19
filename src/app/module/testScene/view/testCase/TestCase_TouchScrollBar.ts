namespace app.testScene {


    /**
     * 测试 TouchScrollBar 组件
     * @author LOLO
     */
    export class TestCase_TouchScrollBar extends lolo.Container {


        public content: lolo.Image;
        public vsb: lolo.TouchScrollBar;
        public hsb: lolo.TouchScrollBar;
        public veCB: lolo.CheckBox;
        public vbCB: lolo.CheckBox;
        public heCB: lolo.CheckBox;
        public hbCB: lolo.CheckBox;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);
            this.vsb.content = this.content;
            this.hsb.content = this.content;
            this.content.hander = lolo.handler(function () {
                this.vsb.render();
                this.hsb.render();
            }, this);

            this.veCB.event_addListener(lolo.TouchEvent.TOUCH_TAP, this.checkBox_touchTap, this);
            this.vbCB.event_addListener(lolo.TouchEvent.TOUCH_TAP, this.checkBox_touchTap, this);
            this.heCB.event_addListener(lolo.TouchEvent.TOUCH_TAP, this.checkBox_touchTap, this);
            this.hbCB.event_addListener(lolo.TouchEvent.TOUCH_TAP, this.checkBox_touchTap, this);
        }


        private checkBox_touchTap(event: lolo.TouchEvent): void {
            switch (event.target) {
                case this.veCB:
                    this.vsb.enabled = this.veCB.selected;
                    break;

                case this.vbCB:
                    this.vsb.bounces = this.vbCB.selected;
                    break;

                case this.heCB:
                    this.hsb.enabled = this.heCB.selected;
                    break;

                case this.hbCB:
                    this.hsb.bounces = this.hbCB.selected;
                    break;
            }
        }


        protected startup(): void {
            super.startup();
        }

        protected reset(): void {
            super.reset();
        }


        //
    }
}