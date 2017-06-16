namespace app.core {


    import LoadItemInfo = lolo.LoadItemInfo;
    import Bitmap = lolo.Bitmap;
    import Button = lolo.Button;
    import CheckBox = lolo.CheckBox;
    import TouchEvent = lolo.TouchEvent;
    import InputText = lolo.InputText;
    import Animation = lolo.Animation;
    import Particle = lolo.Particle;
    import Label = lolo.Label;
    import AlertText = lolo.AlertText;
    import BaseButton = lolo.BaseButton;
    import Image = lolo.Image;
    import ButtonContainer = lolo.ButtonContainer;
    import ImageButton = lolo.ImageButton;


    /**
     * 应用用户界面管理
     * @author LOLO
     */
    export class AppUIManager extends lolo.UIManager {


        public constructor() {
            super();
        }


        public initialize(): void {
            super.initialize();

            // this._loadBar = new LoadBar();
            this._requestModal = new RequestModal();
            this._loadBar = {
                isListener: false,
                autoShow: false,
                text: "",
                progress: 0,
                modalTransparency: 0,
                show: function () {
                },
                hide: function () {
                }
            };

            this.addAllModule();

            // this.showModule(AppConstants.MN_S_TEST);
            // return;

            // let img: Image = new Image();
            // img.directory = "background/cat";
            // img.extension = "jpg";
            // img.fileName = "1";
            // img.x = img.y = 100;
            // img.width = img.height = 200;
            // this.addChild(img);
            // img.touchEnabled = true;
            // img.touchListener.swallowTouches = false;
            // let bc = new ButtonContainer(img);
            // setTimeout(() => {
            //     bc.update();
            // }, 5000);
            // img.event_addListener(TouchEvent.TOUCH_TAP, this.echoTap, this);


            let btn: ImageButton = this._btn = new ImageButton();
            btn.styleName = "button1";
            btn.x = btn.y = 100;
            btn.width = btn.height = 200;
            btn.touchZoomScale = 1.2;
            btn.imagePrefix = "test.text.imageBtn";
            btn.style = {imagePaddingBottom: 100};
            this.addChild(btn);
            btn.event_addListener(TouchEvent.TOUCH_TAP, this.echoTap, this);


            let bmp: Bitmap = this._bmp = new Bitmap("test.rpgScene.hpBar.bar");
            // let bmp: Bitmap = new Bitmap("test.s9");
            bmp.x = bmp.y = 100;
            bmp.width = bmp.height = 200;
            this.addChild(bmp);


            let ani: Animation = this._ani = new Animation("ui.mainUI.requestModal.loading");
            ani.x = ani.y = 300;
            ani.play();
            this.addChild(ani);


            // let p: cc.ParticleSystem = Particle.create("sun1");
            // p.x = p.y = 100;
            // p.runAction(cc.sequence(
            //     cc.delayTime(1),
            //     cc.moveTo(2, 300, 300),
            //     cc.delayTime(1),
            //     cc.callFunc(() => {
            //         p.destroy();
            //     })
            // ));
            // this.addChild(p);


            let label: Label = this._label = new Label();
            label.x = label.y = 100;
            label.text = "asdasd阿萨德sadasdasdasd速度达到";
            label.width = label.height = 100;
            this.addChild(label);
            lolo.delayedCall(2000, () => {
                label.text = "ok!!";
            });
        }

        private _label;
        private _btn;
        private _ani;
        private _bmp;


        private echoTap(event): void {
            // console.log("tap " + Math.random());
            console.log("_bmp");
            this._bmp.destroy();
            console.log("_ani");
            this._ani.destroy();
            console.log("_label");
            this._label.destroy();
            console.log("_btn");
            this._btn.destroy();
        }


        public loadRpgMap(id: String, handler: lolo.Handler = null): void {
            let lii: LoadItemInfo = new LoadItemInfo();
            lii.url = lolo.config.getUIConfig(lolo.rpg.Constants.CN_MAP_DATA, id);
            lii.type = lolo.Constants.RES_TYPE_JSON;
            lii.name = lolo.language.getLanguage("020197");
            lolo.loader.add(lii);

            lii = new LoadItemInfo();
            lii.url = lolo.config.getUIConfig(lolo.rpg.Constants.CN_MAP_THUMBNAIL, id);
            lii.type = lolo.Constants.RES_TYPE_IMG;
            lii.name = lolo.language.getLanguage("020198");
            lolo.loader.add(lii);

            lolo.loader.start(handler);
        }


        /**
         * 注册好游戏内的所有模块
         */
        private addAllModule(): void {
            this.addModule(AppConstants.MN_S_TEST, app.testScene.TestScene, "testCfg1", "testCfg2", "testRpgCfg");
        }


        //
    }
}