namespace app.testScene {


    /**
     * 测试 翻页组件
     * @author LOLO
     */
    export class TestCase_Page extends lolo.Container {

        public page: lolo.Page;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);
        }


        protected startup(): void {
            super.startup();

            this.page.initialize(10, Math.round(Math.random() * 100 + 10));
        }


        //
    }
}