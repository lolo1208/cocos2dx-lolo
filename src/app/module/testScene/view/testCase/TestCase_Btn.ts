namespace app.testScene {


    import BaseButton = lolo.BaseButton;
    import Button = lolo.Button;
    import Label = lolo.Label;


    /**
     * 测试 BaseButton / Button / ImageButton 组件
     * @author LOLO
     */
    export class TestCase_Btn extends lolo.Container {


        public btn1: BaseButton;
        public btn2: Button;
        public label1: Label;
        public label2: Label;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);
        }


        //
    }
}