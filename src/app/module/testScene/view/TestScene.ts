/// <reference path="./rpg/RpgScene.ts"/>

namespace app.testScene {


    import Button = lolo.Button;
    import Container = lolo.Container;
    import TouchEvent = lolo.TouchEvent;
    import DisplayObjectContainer = lolo.DisplayObjectContainer;
    import Bitmap = lolo.Bitmap;
    import Animation = lolo.Animation;
    import Scene = lolo.Scene;
    import Constants = lolo.Constants;
    import TouchEvent = lolo.TouchEvent;
    import Binding = lolo.Binding;
    import Handler = lolo.Handler;
    import MathUtil = lolo.MathUtil;
    import Particle = lolo.Particle;
    import delayedCall = lolo.delayedCall;
    import Image = lolo.Image;
    import AppUIManager = app.core.AppUIManager;
    import RpgScene = app.rpgScene.RpgScene;
    import Label = lolo.Label;


    /**
     * 测试场景
     * @author LOLO
     */
    export class TestScene extends Scene {

        public static instance: TestScene;

        public backBtn: Button;
        public c: DisplayObjectContainer;
        public testBtn: Button;
        public errorBtn: Button;

        public rpgScene: RpgScene = new RpgScene();

        public p: TestCase_Page = new TestCase_Page();
        public nt: TestCase_NumberText = new TestCase_NumberText();
        public it: TestCase_InputText = new TestCase_InputText();
        public btn: TestCase_Btn = new TestCase_Btn();
        public tsb: TestCase_TouchScrollBar = new TestCase_TouchScrollBar();
        public ig: TestCase_ItemGroup = new TestCase_ItemGroup();
        public l: TestCase_List = new TestCase_List();
        public pl: TestCase_PageList = new TestCase_PageList();
        public sl: TestCase_ScrollList = new TestCase_ScrollList();
        public http: TestCase_HTTP = new TestCase_HTTP();
        public ws: TestCase_WebSocket = new TestCase_WebSocket();
        public upd: TestCase_Update = new TestCase_Update();
        public eff: TestCase_Effect = new TestCase_Effect();
        public par: TestCase_Particle = new TestCase_Particle();

        private _currentCase: Container;


        public constructor() {
            super();
            TestScene.instance = this;
        }


        public initialize(): void {
            this.initUI("testCfg1");
            this.initUI("testCfg2");
            this.initUI("testRpgCfg");

            let children: cc.Node[] = this.c.children;
            for (let i = 0; i < children.length; i++) {
                let btn: Button = <Button>children[i];
                btn.event_addListener(TouchEvent.TOUCH_TAP, this.btns_touchTapHandler, this);
            }

            this.backBtn.removeFromParent();
            this.backBtn.event_addListener(TouchEvent.TOUCH_TAP, this.backBtn_touchTapHandler, this);
            this.testBtn.event_addListener(TouchEvent.TOUCH_TAP, this.testBtn_touchTapHandler, this);
            this.errorBtn.event_addListener(TouchEvent.TOUCH_TAP, this.errorBtn_touchTapHandler, this);
        }


        private testBtn_touchTapHandler(event: TouchEvent): void {
            // (<AppUIManager>lolo.ui).loadRpgMap(RpgScene.TEST_MAP_ID, lolo.handler(() => {
            //     this.rpgScene.show();
            // }, this));
            // return;

            let t: number = new Date().getTime();
            let n1: number = 999;
            let n2: number = 888;
            let n3: number = 0;
            for (let i = 1; i < 1234567; i++) {
                n3 = n1 + n2 + i;
                n3 = n1 - n2 - i;
                n3 = n1 * n2 * i;
                n3 = n1 / n2 / i;
            }
            console.log("test:::" + (new Date().getTime() - t));
        }


        private errorBtn_touchTapHandler(event: TouchEvent): void {
            throw new Error("test ERROR!!!");
        }


        private backBtn_touchTapHandler(event: TouchEvent): void {
            this.c.visible = true;
            this.backBtn.removeFromParent();

            this._currentCase.hide();
            this._currentCase = null;
        }


        private btns_touchTapHandler(event: TouchEvent): void {
            this._currentCase = this[event.target.name];
            if (this._currentCase == null) return;
            this._currentCase.show();

            this.addChild(this.backBtn);
            this.c.visible = false;
        }


        //


        private testTouch(): void {
            for (let i = 1; i < 5; i++) {
                let bmp: Bitmap | Animation = (i > 3)
                    ? new Bitmap("mainUI.loadBar.bg")
                    : new Animation("avatar.banShouRen.run3");
                bmp.x = 200 + (i * 80);
                bmp.y = 100 + (i * 30);
                bmp.name = "bmp" + i;
                if (i < 3) {
                    lolo.stage.getLayer(Constants.LAYER_NAME_ALERT).addChild(bmp);
                }
                else {
                    lolo.stage.getLayer(Constants.LAYER_NAME_ADORN).addChild(bmp);
                    lolo.stage.getLayer(Constants.LAYER_NAME_ALERT).addChild(bmp);
                    lolo.stage.getLayer(Constants.LAYER_NAME_ALERT).addChild(bmp);
                    lolo.stage.getLayer(Constants.LAYER_NAME_ALERT).addChild(bmp);
                    lolo.stage.getLayer(Constants.LAYER_NAME_SCENE).addChild(bmp);
                }

                bmp.touchEnabled = true;
                bmp.event_addListener(TouchEvent.TOUCH_BEGIN, this.testTouchHandler, this);
                bmp.event_addListener(TouchEvent.TOUCH_MOVE, this.testTouchHandler, this);
                bmp.event_addListener(TouchEvent.TOUCH_END, this.testTouchHandler, this);
                bmp.event_addListener(TouchEvent.TOUCH_TAP, this.testTouchHandler, this);
            }
        }

        private touchLocalZOrder: number = 0;

        private testTouchHandler(event: TouchEvent): void {
            let bmp: Bitmap = event.target;
            console.log(bmp.name, event.type);
            if (event.type == TouchEvent.TOUCH_END) bmp.setLocalZOrder(++this.touchLocalZOrder);
        }


        private testAni(): void {
            let type: string[] = ["banShouRen", "female", "jiangShi", "jinQianBao", "kuLouSheShou", "langRenZhanShi", "male", "shuangTouMo"];
            let action: string[] = ["attack", "dead", "run", "stand"];
            let reverse: boolean[] = [true, false, false];

            for (let i = 0; i < 500; i++) {
                let ani: Animation = new Animation("avatar."
                    + type[Math.floor(Math.random() * type.length)] + "."
                    + action[Math.floor(Math.random() * action.length)]
                    + Math.ceil(Math.random() * 8)
                );
                ani.x = Math.floor(Math.random() * (lolo.ui.stageWidth - 100) + 50);
                ani.y = Math.floor(Math.random() * (lolo.ui.stageHeight - 100) + 50);
                ani.fps = Math.random() * 55 + 5;
                ani.reverse = reverse[Math.floor(Math.random() * reverse.length)];
                ani.play();
                this.addChild(ani);
            }
        }


        private testTexture(): void {
            let ani: Animation = new Animation("avatar.female.attack8");
            ani.x = ani.y = 400;
            ani.scaleX = ani.scaleY = 3;
            this.addChild(ani);
            ani.play();
        }


        //


        protected startup(): void {
            super.startup();
            lolo.layout.stageLayout(this.c);
        }


        protected reset(): void {
            super.reset();
        }

        //
    }
}