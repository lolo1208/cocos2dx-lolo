namespace app.testScene {


    /**
     * 测试 PageList
     * @author LOLO
     */
    export class TestCase_PageList extends lolo.Container {

        public page: lolo.Page;
        public list: lolo.PageList;
        public ulCB: lolo.CheckBox;
        private _data: lolo.HashMap;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);
            this.list.itemRendererClass = TestCase_ItemRenderer;
            this._data = new lolo.HashMap();

            this.ulCB.event_addListener(lolo.TouchEvent.TOUCH_TAP, this.ulCB_touchTap, this);
        }


        private ulCB_touchTap(event?: lolo.TouchEvent): void {
            TestCase_ItemRenderer.labelEnabled = this.ulCB.selected;
            this.list.clean();
            this.list.data = this._data;
        }


        protected startup(): void {
            super.startup();

            this.ulCB.selected = !lolo.isMobile;
            this.ulCB_touchTap();

            this._data.clean();
            let count: number = parseInt(Math.random() * 555);
            for (let i = 0; i < count; i++) {
                this._data.add({text: i});
            }
            this.list.data = this._data;
        }


        protected reset(): void {
            this.list.clean();
            super.reset();
        }


        //
    }
}