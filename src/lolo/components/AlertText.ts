/// <reference path="../display/TextField.ts"/>


namespace lolo {


    /**
     * 提示文本
     * 文本会在指定时间后显示（可设置显示动画持续时间），
     * 指定时间后隐藏（可设置隐藏动画持续时间），
     * 并且可以在隐藏结束后回调指定函数
     * @author LOLO
     */
    export class AlertText extends TextField {

        /**y轴默认偏移*/
        public static offsetY: number = -50;

        /**实例列表*/
        private static _instanceList: Object = {};


        /**该时间后显示（该时间后播放显示动画。单位：秒）*/
        public showDelay: number;
        /**该时间后隐藏（显示动画结束到隐藏动画开始之间的间隔。单位：秒）*/
        public hideDelay: number;
        /**显示动画的持续时间（alpha）*/
        public showEffectDuration: number;
        /**隐藏动画的持续时间（alpha）*/
        public hideEffectDuration: number;

        /**隐藏结束后的回调*/
        public handler: Handler;
        /**是否在提示层显示*/
        public alertLayerShow: boolean = true;
        /**设定的颜色列表（style默认值["red", "green"]）*/
        public colorList: string[];

        /**在实例列表中的key*/
        private _key: string;
        /**对父级的引用*/
        private _parent: cc.Node;


        /**
         * 通过key来获取实例
         * @param key
         * @return
         */
        public static getInstance(key: string = "common"): AlertText {
            if (this._instanceList[key] == null) {
                this._instanceList[key] = new AlertText();
                this._instanceList[key].key = key;
            }
            return this._instanceList[key];
        }


        /**
         * 显示
         * @param text 内容
         * @param key 在实例列表中的key
         * @param handler 隐藏结束后的回调函数
         */
        public static show(text: string, key: string = "common", handler: Handler = null): AlertText {
            return this.getInstance(key).show(text, handler);
        }


        public constructor() {
            super();
            this.style = lolo.config.getStyle("alertText");
        }


        protected setStyle(value: any): void {
            super.setStyle(value);

            if (value.colorList != null) this.colorList = value.colorList;
            if (value.showDelay != null) this.showDelay = value.showDelay;
            if (value.hideDelay != null) this.hideDelay = value.hideDelay;
            if (value.showEffectDuration != null) this.showEffectDuration = value.showEffectDuration;
            if (value.hideEffectDuration != null) this.hideEffectDuration = value.hideEffectDuration;
        }


        /**
         * 显示
         * @param text 内容
         * @param handler 隐藏结束后的回调
         */
        public show(text: string, handler: Handler = null): AlertText {
            this.text = text;
            this.handler = handler;

            if (this.alertLayerShow) {
                lolo.ui.addChildToLayer(this, Constants.LAYER_NAME_ALERT);
            }
            else {
                if (this.parent) this._parent = this.parent;
                if (this._parent != null) this._parent.addChild(this);
            }

            this.stopAllActions();
            this.setOpacity(0);
            this.runAction(cc.sequence(
                cc.delayTime(this.showDelay),
                cc.fadeIn(this.showEffectDuration),
                cc.delayTime(this.hideDelay),
                cc.fadeOut(this.hideEffectDuration),
                cc.callFunc(this.hideComplete, this)
            ));

            return this;
        }


        /**
         * 隐藏
         * @param complete 是否为正常结束
         */
        public hide(complete: boolean = false): void {
            this.removeFromParent();
            if (this.alertLayerShow) this._parent = null;

            let handler: Handler = this.handler;
            this.handler = null;
            if (complete && handler != null) handler.execute();
        }


        /**
         * 隐藏动画结束
         */
        private hideComplete(): void {
            this.hide(true);
        }


        /**
         * 移到舞台中上次Touch的位置
         */
        public moveToStageTouchPosition(): void {
            this.x = lolo.gesture.touchPoint.x - this.width / 2;
            this.y = lolo.gesture.touchPoint.y + AlertText.offsetY;
        }


        /**
         * 在实例列表中的key
         */
        public set key(value: string) {
            if (this._key != null) delete AlertText._instanceList[this._key];

            this._key = value;
            if (value != null) AlertText._instanceList[value] = this;
        }

        public get key(): string {
            return this._key;
        }


        /**
         * 通过index在colorList中获取颜色值，并设置为color属性
         * @param value
         */
        public set colorIndex(value: number) {
            value = Math.floor(value);
            this.color = this.colorList[value];
        }


        /**
         * 获取居中宽度
         * @return
         */
        public get centerWidth(): number {
            return this.getWidth();
        }

        /**
         * 获取居中高度
         * @return
         */
        public get centerHeight(): number {
            return this.getHeight();
        }


        protected setText(value: string): void {
            super.setText(value);
            this.setPosition(this._x, this._y);
        }


        public setPositionX(value: number): void {
            // 超出舞台的情况
            if (value + this.width > lolo.ui.stageWidth) value = lolo.ui.stageWidth - this.width;
            else if (value < 0) value = 0;
            super.setPositionX(value);
        }

        public setPositionY(value: number): void {
            // 超出舞台的情况
            if (value + this.height > lolo.ui.stageHeight) value = lolo.ui.stageHeight - this.height;
            else if (value < 0) value = 0;
            super.setPositionY(value);
        }


        //
    }
}