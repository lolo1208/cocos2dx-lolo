namespace lolo {


    /**
     * 多选框（图形皮肤 + 链接文本）
     * 链接文本的属性，需要通过labelProp方法来控制
     * @author LOLO
     */
    export class CheckBox extends Button {

        public constructor() {
            super();

            this.touchZoomScale = 1;
            this.deselect = true;
            this.event_addListener(TouchEvent.TOUCH_TAP, this.checkBox_touchTap, this);
        }


        protected setStyle(value: any): void {
            super.setStyle(value);
            this._labelText.x = this._labelPaddingLeft;
            this._labelText.y = this._labelPaddingTop;
        }


        /**
         * touch tap
         * @param event
         */
        private checkBox_touchTap(event: TouchEvent): void {
            if (this._group == null) {
                if (this._selected) {
                    if (this.deselect) this.selected = false;
                }
                else {
                    this.selected = true;
                }
            }
        }


        public render(): void {
            this._width = this._height = 0;
        }

        public getWidth(): number {
            return DisplayObjectContainer.prototype.getWidth.call(this);
        }

        public getHeight(): number {
            return DisplayObjectContainer.prototype.getHeight.call(this);
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            let hitted: boolean = this._labelText.hitTest(worldPoint);
            if (hitted) return true;
            return this._skin.hitTest(worldPoint);
        }


        //
    }
}