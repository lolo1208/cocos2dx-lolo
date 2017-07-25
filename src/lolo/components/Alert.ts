/// <reference path="../display/DisplayObjectContainer.ts"/>


namespace lolo {


    /**
     * 弹出提示框
     * @author LOLO
     */
    export class Alert extends DisplayObjectContainer {

        /**[确定]按钮显示的Label*/
        public static OK: string;
        /**[取消]按钮显示的Label*/
        public static CANCEL: string;
        /**[是]按钮显示的Label*/
        public static YES: string;
        /**[否]按钮显示的Label*/
        public static NO: string;
        /**[关闭]按钮显示的Label*/
        public static CLOSE: string;
        /**[返回]按钮显示的Label*/
        public static BACK: string;


        /**模态背景*/
        private _modalBG: ModalBackground;
        /**背景*/
        private _background: Bitmap;
        /**内容文本*/
        private _contentText: Label;
        /**按钮组容器*/
        private _btnC: DisplayObjectContainer;

        /**内容*/
        public text: string;
        /**按钮列表（显示的Label文本，或Button实例）*/
        public buttons: any[];
        /**关闭弹出框时的回调（点击任意按钮都会关闭）。触发回调时，将会传入 detail:string 参数，值为所点按钮的label*/
        public hander: Handler;
        /**是否显示模态背景*/
        public modal: boolean;
        /**使用样式的名称*/
        public styleName: string;


        /**
         * 创建、显示提示框，并返回该提示框的实例
         * @param text 内容
         * @param buttons 按钮列表（显示的Label），默认为[Alert.OK]
         * @param handler 关闭弹出框时的回调（点击任意按钮都会关闭）。触发回调时，将会传入 detail:string 参数，值为所点按钮的label
         * @param modal 是否显示模态背景
         * @param styleName 使用样式的名称
         * @return
         */
        public static show(text: string,
                           buttons?: any[],
                           handler?: Handler,
                           modal: boolean = true,
                           styleName: string = "alert"): Alert {
            let alert: Alert = new Alert();
            if (buttons == null) buttons = [Alert.OK];

            alert.text = text;
            alert.buttons = buttons;
            alert.hander = handler;
            alert.modal = modal;
            alert.styleName = styleName;

            alert.show();
            return alert;
        }


        public constructor() {
            super();

            this._background = new Bitmap();
            this.addChild(this._background);
            this._contentText = new Label();
            this.addChild(this._contentText);
            this._btnC = new DisplayObjectContainer();
            this.addChild(this._btnC);
        }


        /**
         * 显示
         */
        public show(): void {
            this.clean();

            let style: any = lolo.config.getStyle(this.styleName);

            //根据需要，生成模态背景
            if (this.modal) {
                if (this._modalBG == null) this._modalBG = new ModalBackground(this);
                if (style.modalAlpha != null) this._modalBG.alpha = style.modalAlpha;
            }

            let bg: Bitmap = this._background;
            let tf: Label = this._contentText;
            let btnC: DisplayObjectContainer = this._btnC;

            // 背景
            bg.sourceName = style.background;

            // 内容显示文本
            AutoUtil.initObject(tf, style.labelProp);
            tf.width = style.minWidth - style.labelPaddingLeft - style.labelPaddingRight;
            tf.text = this.text;

            // 根据列表生成按钮
            let btn: Button, x: number = 0;
            for (let i = 0; i < this.buttons.length; i++) {
                let item: any = this.buttons[i];
                if (item instanceof Button) {
                    btn = item;
                    btnC.addChild(btn);
                }
                else {
                    btn = AutoUtil.init(new Button(), btnC);
                    btn.styleName = style.buttonStyleName;
                    AutoUtil.initObject(btn, style.buttonProp);
                    btn.label = item;
                }
                btn.x = x;
                btn.renderNow();
                x += btn.width + style.buttonGap;

                btn.event_addListener(TouchEvent.TOUCH_TAP, this.btn_touchTap, this);
            }

            //内容、按钮等高度相加，已经超过了限制的最小高度，将以最大高度方式显示
            if ((style.labelPaddingTop + tf.height + style.labelPaddingBottom + btnC.height + style.buttonPaddingBottom) > style.minHeight) {
                tf.width = style.maxWidth - style.labelPaddingLeft - style.labelPaddingRight;
                this._background.width = style.maxWidth;
                this._background.height = style.maxHeight;
            }
            else {//最小高度方式显示
                this._background.width = style.minWidth;
                this._background.height = style.minHeight;
            }

            //计算文本的位置
            tf.x = (this._background.width - style.labelPaddingLeft - style.labelPaddingRight - tf.width) / 2 + style.labelPaddingLeft;
            tf.y = (this._background.height - style.labelPaddingTop - style.labelPaddingBottom - btnC.height - style.buttonPaddingBottom - tf.height) / 2 + style.labelPaddingTop;
            // 计算按钮组的位置（水平居中）
            btnC.x = this._background.width - btnC.width >> 1;
            btnC.y = this._background.height - style.buttonPaddingBottom - btnC.height;

            lolo.layout.addStageLayout(this, {});
            lolo.ui.addChildToLayer(this, Constants.LAYER_NAME_ALERT);
        }


        /**
         * 点击按钮
         * @param event
         */
        private btn_touchTap(event: TouchEvent): void {
            let btn: Button = event.currentTarget as Button;
            let hander: Handler = this.hander;
            this.hander = null;
            if (hander != null) hander.execute(btn.label);

            this.clean();
        }


        public setWidth(value: number): void {
        }

        public getWidth(): number {
            return this._background.width;
        }


        public setHeight(value: number): void {
        }

        protected getHeight(): number {
            return this._background.height;
        }


        //


        /**
         * 清空
         */
        public clean(): void {
            this.removeFromParent();
            lolo.layout.removeStageLayout(this);

            let buttons: Button[] = <Button[]>this._btnC.getChildren();
            let len: number = buttons.length;
            for (let i = 0; i < len; i++) {
                let btn: Button = buttons[i];
                btn.event_removeListener(TouchEvent.TOUCH_TAP, this.btn_touchTap, this);
                btn.destroy();
            }
        }


        /**
         * 销毁
         */
        public destroy(): void {
            this.clean();
            super.destroy();
        }

        //
    }
}