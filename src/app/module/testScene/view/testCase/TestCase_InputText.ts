namespace app.testScene {


    /**
     * 测试 InputText
     * @author LOLO
     */
    export class TestCase_InputText extends lolo.Container {

        public unIT: lolo.InputText;
        public pwIT: lolo.InputText;
        public ageIT: lolo.InputText;
        public emIT: lolo.InputText;
        public hpIT: lolo.InputText;
        public introIT: lolo.InputText;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            this.unIT.placeholder = "用户名";
            this.unIT.inputMode = cc.EDITBOX_INPUT_MODE_SINGLELINE;

            this.pwIT.placeholder = "密码";
            this.pwIT.inputMode = cc.EDITBOX_INPUT_MODE_SINGLELINE;
            this.pwIT.inputFlag = cc.EDITBOX_INPUT_FLAG_PASSWORD;

            this.ageIT.placeholder = "年龄";
            this.ageIT.inputMode = cc.EDITBOX_INPUT_MODE_DECIMAL;

            this.emIT.placeholder = "电子邮箱";
            this.emIT.inputMode = cc.EDITBOX_INPUT_MODE_EMAILADDR;

            this.hpIT.placeholder = "主页地址";
            this.hpIT.inputMode = cc.EDITBOX_INPUT_MODE_URL;

            this.introIT.placeholder = "个人简介";
        }

        protected startup(): void {
            super.startup();
        }


        //
    }
}