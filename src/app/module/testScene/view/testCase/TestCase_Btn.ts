namespace app.testScene {


    import BaseButton = lolo.BaseButton;
    import Button = lolo.Button;
    import Label = lolo.Label;
    import Watcher = lolo.Watcher;
    import TouchEvent = lolo.TouchEvent;
    import Binding = lolo.Binding;
    import Handler = lolo.Handler;


    /**
     * 测试 BaseButton / Button / ImageButton 组件
     * @author LOLO
     */
    export class TestCase_Btn extends lolo.Container {


        public btn1: BaseButton;
        public btn2: Button;
        public label1: Label;
        public label2: Label;

        private _label2Watcher: Watcher;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            Binding.bindProperty(this.label1, "text", TestData, "str1");
            this._label2Watcher = Binding.bindSetter(new Handler(this.str2Changed, this), TestData, "str2");

            this.btn1.event_addListener(TouchEvent.TOUCH_TAP, this.btn1_touchTapHandler, this);
            this.btn2.event_addListener(TouchEvent.TOUCH_TAP, this.btn2_touchTapHandler, this);
        }

        private str2Changed(value: string): void {
            this.label2.text = value;
        }


        private _count: number = 0;

        private btn1_touchTapHandler(event: TouchEvent): void {
            TestBinding.sendHttp(++this._count + Math.random());
        }


        private btn2_touchTapHandler(event: TouchEvent): void {
            this._label2Watcher.watching ? this._label2Watcher.unwatch() : this._label2Watcher.watch();
        }


        protected startup(): void {
            super.startup();
        }


        //
    }
}