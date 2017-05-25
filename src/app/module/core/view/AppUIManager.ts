namespace app.core {

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
            // this._requestModal = new RequestModal();
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

            this.showModule(app.AppConstants.MN_S_TEST);
        }


        /**
         * 注册好游戏内的所有模块
         */
        private addAllModule(): void {
            this.addModule(app.AppConstants.MN_S_TEST, app.testScene.TestScene, "testConfig1", "testConfig2");
        }


        //
    }
}