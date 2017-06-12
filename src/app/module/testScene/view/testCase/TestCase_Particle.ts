namespace app.testScene {


    import ItemGroup = lolo.ItemGroup;
    import ListEvent = lolo.ListEvent;
    import RadioButton = lolo.RadioButton;
    import TouchEvent = lolo.TouchEvent;
    import Particle = lolo.Particle;
    import MathUtil = lolo.MathUtil;
    import Constants = lolo.Constants;
    import delayedCall = lolo.delayedCall;
    import LoadItemInfo = lolo.LoadItemInfo;
    import Handler = lolo.Handler;

    /**
     * 测试 粒子效果
     * @author LOLO
     */
    export class TestCase_Particle extends lolo.Container {

        public weatherG: ItemGroup;
        public touchG: ItemGroup;

        private _weather: cc.ParticleSystem;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            this._weather = new cc.ParticleSystem();
            this.addChild(this._weather);

            this.weatherG.event_addListener(ListEvent.ITEM_SELECTED, this.weatherG_itemSelectedHandler, this);
        }


        private weatherG_itemSelectedHandler(event: ListEvent): void {
            let value: string = (<RadioButton>this.weatherG.selectedItem).label;
            if (value == "none") {
                this._weather.stopSystem();
            }
            else {
                this._weather.sourceName = "weather." + value;
            }
        }


        private touchStageHandler(event: TouchEvent): void {
            let sn: string = (<RadioButton>this.touchG.selectedItem).label;
            if (sn == "none") return;

            let p: cc.ParticleSystem = Particle.create(sn);
            lolo.ui.addChildToLayer(p, Constants.LAYER_NAME_ADORN);

            p.setPosition(lolo.gesture.touchPoint);
            p.runAction(cc.sequence(
                cc.moveTo(Math.random() * 1.5 + 0.5, Math.random() * lolo.ui.stageWidth, Math.random() * lolo.ui.stageHeight),
                cc.callFunc(function () {
                    p.stopSystem();
                    delayedCall(2000, p.destroy, p);
                })
            ));
        }


        //


        protected startup(): void {
            super.startup();

            lolo.gesture.event_addListener(TouchEvent.TOUCH_BEGIN, this.touchStageHandler, this);
            this.weatherG.selectItemByIndex(2);
            this.touchG.selectItemByIndex(3);
        }


        protected reset(): void {
            super.reset();
            lolo.gesture.event_removeListener(TouchEvent.TOUCH_BEGIN, this.touchStageHandler, this);
            this.weatherG.selectItemByIndex(0);
        }

        //
    }
}