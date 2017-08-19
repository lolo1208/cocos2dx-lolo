/// <reference path="./rpg/RpgScene.ts"/>
/// <reference path="./jump/JumpScene.ts"/>

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
    import RpgScene = app.rpg.RpgScene;
    import Label = lolo.Label;
    import Mask = lolo.Mask;
    import TouchEvent = lolo.TouchEvent;
    import ButtonContainer = lolo.ButtonContainer;
    import CheckBox = lolo.CheckBox;
    import InputText = lolo.InputText;
    import SimpleBitmap = lolo.SimpleBitmap;
    import GestureEvent = lolo.GestureEvent;
    import Event = lolo.Event;
    import JumpScene = app.jump.JumpScene;
    import Filter = lolo.Filter;


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
        public jumpScene: JumpScene = new JumpScene();

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
            this.initUI("rpgScCfg");
            this.jumpScene.initialize();
            this.addChild(this.jumpScene);

            let children: cc.Node[] = this.c.getChildren();
            for (let i = 0; i < children.length; i++) {
                let btn: Button = <Button>children[i];
                btn.event_addListener(TouchEvent.TOUCH_TAP, this.btns_touchTapHandler, this);
            }

            this.backBtn.removeFromParent();
            this.backBtn.event_addListener(TouchEvent.TOUCH_TAP, this.backBtn_touchTapHandler, this);
            this.testBtn.event_addListener(TouchEvent.TOUCH_TAP, this.testBtn_touchTapHandler, this);
            this.errorBtn.event_addListener(TouchEvent.TOUCH_TAP, this.errorBtn_touchTapHandler, this);


            // this.c.visible = false;

            // lolo.audio.preload("music/3", lolo.handler(() => {
            //     console.log(this.backBtn.label + " ---");
            // }, this));

            lolo.audio.effectVolume = 0.3;
        }


        private testBtn_touchTapHandler(event: TouchEvent): void {

            let audio = lolo.audio.playEffect("effect/13", 3);
            audio.completeHandler = lolo.handler(() => {
                console.log("-----", audio.repeatCount, audio.currentRepeatCount, Math.random());
            }, this);

            // delayedCall(3000, () => {
            //     lolo.audio.stopAll(true);
            //     // cc.audioEngine.unloadEffect(lolo.getResUrl("audio/" + audio.path + ".mp3"));
            // });


            return;

            this.jumpScene.show();
            this.c.removeFromParent();
            return;

            (<AppUIManager>lolo.ui).loadRpgMap(RpgScene.TEST_MAP_ID, lolo.handler(() => {
                this.rpgScene.show();
            }, this));
            return;

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