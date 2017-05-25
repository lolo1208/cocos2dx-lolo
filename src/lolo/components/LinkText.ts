namespace lolo {


    /**
     * 类描述
     * @author LOLO
     */
    export class LinkText extends Label {

        /**弹起状态样式名称*/
        public static STYlE_UP: string = "upStyle";
        /**鼠标经过状态样式名称*/
        public static STYLE_OVER: string = "overStyle";
        /**鼠标按下状态样式名称*/
        public static STYLE_DOWN: string = "downStyle";
        /**禁用状态样式名称*/
        public static STYLE_DISABLED: string = "disabledStyle";
        /**选中状态样式名称*/
        public static STYLE_SELECTED: string = "selectedStyle";

        /**所有样式列表*/
        protected static STYLES: string[] = [
            LinkText.STYlE_UP, LinkText.STYLE_OVER, LinkText.STYLE_DOWN,
            LinkText.STYLE_DISABLED, LinkText.STYLE_SELECTED
        ];

        /**弹起状态的文本样式*/
        public upStyle: any;
        /**鼠标经过状态的文本样式*/
        public overStyle: any;
        /**鼠标按下状态的文本样式*/
        public downStyle: any;
        /**禁用状态的文本样式*/
        public disabledStyle: any;
        /**选中状态的文本样式*/
        public selectedStyle: any;


        /**当前文本样式*/
        protected _currentStyle: any;
        /**是否启用，是否侦听touch事件自动改变状态*/
        protected _enabled: boolean;


        public constructor(enabled: boolean = true) {
            super();

            this.enabled = enabled;
            this.style = lolo.config.getStyle("textField");
        }


        protected setStyle(value: any): void {

            // 设置所有样式的属性
            super.setStyle(value);

            // 设置单种样式的所有属性
            if (value.upStyle != null) this.setStyleByName(LinkText.STYlE_UP, value.upStyle);
            if (value.overStyle != null) this.setStyleByName(LinkText.STYLE_OVER, value.overStyle);
            if (value.downStyle != null) this.setStyleByName(LinkText.STYLE_DOWN, value.downStyle);
            if (value.disabledStyle != null) this.setStyleByName(LinkText.STYLE_DISABLED, value.disabledStyle);
            if (value.selectedStyle != null) this.setStyleByName(LinkText.STYLE_SELECTED, value.selectedStyle);

            this._currentStyle = this.upStyle;
            this.render();
        }


        protected setFont(value: string): void {
            this.setStyleProp("font", value);
            super.setFont(value);
        }

        protected setColor(value: string|cc.Color): void {
            this.setStyleProp("color", value);
            super.setColor(value);
        }

        protected setSize(value: number): void {
            this.setStyleProp("size", value);
            super.setSize(value);
        }

        protected setAlign(value: string|number): void {
            this.setStyleProp("align", value);
            super.setAlign(value);
        }

        protected setValign(value: string|number): void {
            this.setStyleProp("valign", value);
            super.setValign(value);
        }

        protected setStroke(value: string|cc.Color): void {
            this.setStyleProp("stroke", value);
            super.setStroke(value);
        }

        protected setStrokeSize(value: number): void {
            this.setStyleProp("strokeSize", value);
            super.setStrokeSize(value);
        }


        /**
         * 设置单种样式的所有属性
         * @param styleName 样式的名称
         * @param value 样式的值
         */
        private setStyleByName(styleName: string, value: Object): void {
            for (let key in value) {
                this[styleName][key] = value[key];
            }
        }


        /**
         * 设置所有样式的属性
         * @param propName 属性的名称
         * @param value 属性的值
         */
        private setStyleProp(propName: string, value: any): void {
            for (let i = 0; i < LinkText.STYLES.length; i++) {
                let style: any = this[LinkText.STYLES[i]];
                if (style == null) style = this[LinkText.STYLES[i]] = {};// 调用 super() 时，style 还未初始化
                style[propName] = value;
            }
        }


        /**
         * 更新显示当前样式
         */
        private render(): void {
            super.setFont(this._currentStyle.font);
            super.setSize(this._currentStyle.size);
            super.setColor(this._currentStyle.color);
            super.setAlign(this._currentStyle.align);
            super.setValign(this._currentStyle.valign);
            super.setStroke(this._currentStyle.stroke);
            super.setStrokeSize(this._currentStyle.strokeSize);
        }


        /**
         * 切换到指定样式
         * @param styleName 样式的名称
         */
        public switchStyle(styleName: string): void {
            if (this._currentStyle == this[styleName]) return;

            this._currentStyle = this[styleName];
            this.render();
        }


        /**
         * 是否启用，是否侦听touch事件自动改变状态
         * @param value
         */
        public set enabled(value: boolean) {
            this.touchEnabled = value;
            this._enabled = value;
            if (value) {
                this.event_addListener(TouchEvent.TOUCH_BEGIN, this.linkText_touchBegin, this);
                this.switchStyle(LinkText.STYlE_UP);
            }
            else {
                this.event_removeListener(TouchEvent.TOUCH_BEGIN, this.linkText_touchBegin, this);
                this.event_removeListener(TouchEvent.TOUCH_END, this.linkText_touchEnd, this);
                this.switchStyle(LinkText.STYLE_DISABLED);
            }
        }

        public get enabled(): boolean {
            return this._enabled;
        }


        /**
         * touch begin
         * @param event
         */
        private linkText_touchBegin(event: TouchEvent): void {
            this.switchStyle(LinkText.STYLE_DOWN);
            this.event_addListener(TouchEvent.TOUCH_END, this.linkText_touchEnd, this);
        }

        /**
         * touch end
         * @param event
         */
        private linkText_touchEnd(event: TouchEvent): void {
            this.event_removeListener(TouchEvent.TOUCH_END, this.linkText_touchEnd, this);
            this.switchStyle(LinkText.STYlE_UP);
        }


        //
    }
}