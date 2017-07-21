namespace app.testScene {


    import AutoUtil = lolo.AutoUtil;
    /**
     * 测试 List
     * @author LOLO
     */
    export class TestCase_List extends lolo.Container {

        public list: lolo.List;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);
            this.list.itemRendererClass = TestCase_ItemRenderer;

            let data: lolo.HashMap = new lolo.HashMap();
            for (let i = 0; i < 8; i++) {
                data.add({text: i});
            }
            this.list.data = data;


            this.list.event_addListener(lolo.ListEvent.RENDER, this.list_renderHandler, this);
        }


        private list_renderHandler(event: lolo.ListEvent): void {
            lolo.layout.stageLayout(this);
        }


        protected startup(): void {
            super.startup();
            TestCase_ItemRenderer.labelEnabled = true;
        }


        //
    }


    //


    /**
     * 用于测试的 ItemRenderer
     * @author LOLO
     */
    export class TestCase_ItemRenderer extends lolo.ItemRenderer {

        public static labelEnabled: boolean = true;

        public bg: lolo.Bitmap;
        public at: lolo.ArtText;
        public btn: lolo.Button;


        public constructor() {
            super();
            AutoUtil.autoUI(this, "testCfg1.item");

            this.btn.touchListener.swallowTouches = false;
        }


        protected setData(value: any): void {
            super.setData(value);

            if (this._index == this._data.text)
                this.at.text = "-" + this._data.text;
            else
                this.at.text = this._index + "-" + this._data.text;

            if (TestCase_ItemRenderer.labelEnabled) {
                this.btn.label = value.text;
            }
        }

        protected setSelected(value: boolean): void {
            super.setSelected(value);

            this.at.prefix = "public.artText.num" + (value ? 2 : 1);

            if (TestCase_ItemRenderer.labelEnabled) {
                this.btn.label = value ? "selected!" : this._data.text;
                this.btn.labelProps = {color: (value ? "0xFF0000" : "0xFFFFFF")};
            }
        }


        protected getItemWidth(): number {
            return this.bg.width;
        }


    }
}