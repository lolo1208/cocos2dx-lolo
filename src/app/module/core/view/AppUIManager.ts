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
    import TextField = lolo.TextField;


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
            this.showModule(AppConstants.MN_S_TEST);
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
            this.addModule(AppConstants.MN_S_TEST, app.testScene.TestScene, "testCfg1", "testCfg2", "rpgScCfg", "jumpScCfg");
        }


        //
    }
}