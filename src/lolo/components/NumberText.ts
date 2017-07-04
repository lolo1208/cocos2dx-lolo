namespace lolo {


    /**
     * 显示数字的文本
     * 在值上升或下降时，闪动颜色
     * @author LOLO
     */
    export class NumberText extends Label {

        /**每次切换的间隔（秒）*/
        public delay: number;
        /**动画播放完成后，更新成新值时的回调函数*/
        public handler: Handler;

        /**文本正常的颜色*/
        private _normalColor: cc.Color = new cc.Color();
        /**值增加时，切换的颜色*/
        private _upColor: cc.Color = new cc.Color();
        /**值减少时，切换的颜色*/
        private _downColor: cc.Color = new cc.Color();

        /**当前值*/
        private _value: number;
        /**新值*/
        private _newValue: number;
        /**用于定时切换值*/
        private _effectHandler: Handler;


        public constructor() {
            super();

            this.style = lolo.config.getStyle("numberText");
            this._normalColor._val = this._color._val;
        }


        protected setStyle(value: any): void {
            super.setStyle(value);

            if (value.color != null) this.color = value.color;
            if (value.upColor != null) this.upColor = value.upColor;
            if (value.downColor != null) this.downColor = value.downColor;
            if (value.delay != null) this.delay = value.delay;
        }


        /**
         * 当前值
         */
        public set value(value: number) {
            if (value == this._value) return;

            if (this._effectHandler != null) {
                this._effectHandler.clean();
                this._effectHandler = null;
            }

            this._newValue = value;
            if (isNaN(this._value)) {
                this.effectEnd();
            }
            else {
                let color: cc.Color = <cc.Color>(this._newValue > this._value ? this.upColor : this.downColor);
                this.playEffect(color, 0);
            }
        }

        public get value(): number {
            return this._newValue;
        }


        /**
         * 播放上升或下降效果
         * @param color 上升或下降的颜色值
         * @param count 已经播放的次数
         */
        private playEffect(color: cc.Color, count: number): void {
            count++;

            this.setFontFillColor((count % 2) == 1 ? color : this._normalColor);
            if (!isNative) this._setUpdateTextureDirty();

            if (count < 10) {
                this._effectHandler = lolo.delayedCall(this.delay, this.playEffect, this, color, count);
            }
            else {
                this.effectEnd();
            }
        }


        /**
         * 效果结束
         */
        private effectEnd(): void {
            if (this._effectHandler != null) {
                this._effectHandler.clean();
                this._effectHandler = null;
            }

            this._value = this._newValue;
            this.text = this._value.toString();//设置成value

            let handler: Handler = this.handler;
            this.handler = null;
            if (handler != null) handler.execute();
        }


        /**
         * 设置颜色值
         * @param value
         */
        protected setColor(value: string | cc.Color): void {
            super.setColor(value);
            if (this._color != null && this._normalColor != null)
                this._normalColor._val = this._color._val;
        }


        /**
         * 值增加时，切换的颜色
         */
        public set upColor(value: string | cc.Color) {
            if (typeof value === "string") this._upColor.parseHex(value);
            else this._upColor._val = value._val;
        }

        public get upColor(): string | cc.Color {
            return this._upColor;
        }


        /**
         * 值减少时，切换的颜色
         */
        public set downColor(value: string | cc.Color) {
            if (typeof value === "string") this._downColor.parseHex(value);
            else this._downColor._val = value._val;
        }

        public get downColor(): string | cc.Color {
            return this._downColor;
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            if (this._effectHandler != null) {
                this._effectHandler.clean();
                this._effectHandler = null;
            }

            super.destroy();
        }

        //
    }
}