namespace app.testScene {


    import Button = lolo.Button;
    import Label = lolo.Label;
    import TouchEvent = lolo.TouchEvent;


    /**
     * 测试动态更新
     * @author LOLO
     */
    export class TestCase_Update extends lolo.Container {

        public clearBtn: Button;
        public resetBtn: Button;
        public versionText: Label;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            this.clearBtn.event_addListener(TouchEvent.TOUCH_TAP, this.clearBtn_touchTapHandler, this);
            this.resetBtn.event_addListener(TouchEvent.TOUCH_TAP, this.resetBtn_touchTapHandler, this);
        }


        private clearBtn_touchTapHandler(event: TouchEvent): void {
            if (!lolo.isNative) return;
            lolo.Updater.clearUpdateDirectory();
        }


        private resetBtn_touchTapHandler(event: TouchEvent): void {
            if (!lolo.isNative) return;
            lolo.Updater.resetApp();
        }


        protected startup(): void {
            super.startup();

            this.versionText.text = " app version : " + lolo.version + "\n"
                + "core version : " + lolo.coreVersion;
        }


        //
    }
}