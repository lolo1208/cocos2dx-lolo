namespace app.core {


    import DisplayObjectContainer = lolo.DisplayObjectContainer;
    import ModalBackground = lolo.ModalBackground;
    import Animation = lolo.Animation;
    import Bitmap = lolo.Bitmap;
    import RequestInfo = lolo.RequestInfo;
    import Timer = lolo.Timer;
    import AutoUtil = lolo.AutoUtil;
    import Handler = lolo.Handler;
    import TimeUtil = lolo.TimeUtil;
    import Constants = lolo.Constants;
    import IRequestModal = lolo.IRequestModal;


    /**
     * 与服务端通信时，模态的提示界面
     * @author LOLO
     */
    export class RequestModal extends DisplayObjectContainer implements IRequestModal {

        /**请求无响应，该时间后显示加载中界面（毫秒）*/
        private DELAY_LOADING: number = 1300;
        /**请求无响应，该时间后显示加载失败界面（毫秒）*/
        private DELAY_TIMEOUT: number = 4800;

        /**模态背景*/
        public modalBG: ModalBackground;
        /**背景*/
        public bg: Bitmap;
        /**加载中动画*/
        public loadingAni: Animation;
        /**加载中提示文字*/
        public loadingText: Bitmap;
        /**加载超时提示文字*/
        public timeoutText: Bitmap;

        /**模态背景透明度{ normal, deep }*/
        public modalTransparency: {normal: number, deep: number};

        /**当前正在通信的接口列表*/
        private _list: {ri: RequestInfo, time: number}[];
        /**用于定时检查通信状态*/
        private _timer: Timer;


        public constructor() {
            super();
            AutoUtil.autoUI(this, "mainUIConfig.requestModal");

            this._list = [];
            this._timer = new Timer(500, new Handler(this.timerHandler, this));
        }


        public startModal(ri: RequestInfo): void {

            // 如果当前正在通信的接口列表中有该接口，不必继续执行
            let list = this._list;
            for (let i = 0; i < list.length; i++) {
                if (list[i].ri == ri) return;
            }
            list.push({ri: ri, time: TimeUtil.nowTime});

            // 没有正在请求的接口
            if (!this._timer.running) {
                this._timer.start();
                this.runAction(cc.fadeIn(0));
                lolo.ui.addChildToLayer(this, Constants.LAYER_NAME_TOP);
            }
            this.timerHandler();
        }


        public endModal(ri: RequestInfo): void {
            let list = this._list;
            for (let i = 0; i < list.length; i++) {
                if (list[i].ri == ri) list.splice(i, 1);
            }

            if (list.length == 0 && this._timer.running) this.reset();
        }


        /**
         * 定时检查通信状态
         */
        private timerHandler(): void {
            let list = this._list;
            if (list.length == 0) {
                this.reset();
                return;
            }
            let time: number = TimeUtil.nowTime - list[0].time;

            // 该出现 loding 了
            if (time >= this.DELAY_LOADING) {
                this.bg.visible = true;
                this.modalBG.opacity = this.modalTransparency.deep;

                this.loadingText.visible = this.loadingAni.visible = time < this.DELAY_TIMEOUT;
                this.loadingAni.playing = this.loadingText.visible;

                this.timeoutText.visible = !this.loadingText.visible;

                // 通信超时
                if (time >= this.DELAY_TIMEOUT) {
                    this._timer.reset();
                    this.runAction(cc.sequence(
                        cc.delayTime(1),
                        cc.fadeOut(0.5),
                        cc.callFunc(this.reset, this)
                    ));

                    // 将正在通信的请求全部设置为超时
                    for (let i = 0; i < list.length; i++) {
                        // service.setTimeout(list[i].ri);
                    }
                    list.length = 0;
                }
            }
            else {
                this.modalBG.opacity = this.modalTransparency.normal;

                this.loadingText.visible = this.loadingAni.visible = this.timeoutText.visible = this.bg.visible = false;
                this.loadingAni.stop();
            }
        }


        /**
         * 重置所有模态的通信
         */
        public reset(): void {
            this.loadingAni.stop();
            this._timer.reset();
            this._list.length = 0;

            this.removeFromParent();
        }


        //
    }
}