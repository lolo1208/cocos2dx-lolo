/// <reference path="./ItemRenderer.ts"/>


namespace lolo {


    /**
     * 基础按钮（图形皮肤）
     * 在状态改变时，将皮肤切换到对应的状态
     * @author LOLO
     */
    export class BaseButton extends ItemRenderer {

        /**在skinName改变时，是否需要自动重置宽高。默认：true*/
        public autoResetSize: boolean = true;

        /**皮肤*/
        protected _skin: Skin;
        /**按钮容器*/
        protected _bc: ButtonContainer;

        /**渲染回调*/
        protected _renderHandler: Handler;


        public constructor() {
            super();

            this._skin = new Skin();
            this.addChild(this._skin);
            this._bc = new ButtonContainer(this._skin, false);
            this._skin.touchEnabled = false;// ButtonContainer 会默认设置为 true
            this._renderHandler = new Handler(this.doRender, this);
        }


        /**
         * 设置样式
         */
        public set style(value: any) {
            this.setStyle(value);
        }

        protected setStyle(value: any): void {
            if (value.skinName != null) this.skinName = value.skinName;
            this.render();
        }


        /**
         * 根据样式名称，在样式列表中获取并设置样式
         */
        public set styleName(value: string) {
            this.style = lolo.config.getStyle(value);
        }


        /**
         * 皮肤的名称
         */
        public set skinName(value: string) {
            this._skin.autoResetSize = this.autoResetSize;
            this._skin.skinName = value;

            this._skin.state = Skin.UP;
            this._width = this._skin.width;
            this._height = this._skin.height;
            this._skin.autoResetSize = false;

            this.render();
            this.setEventListener();
        }

        public get skinName(): string {
            return this._skin.skinName;
        }


        /**
         * 皮肤
         */
        public get skin(): Skin {
            return this._skin;
        }


        /**
         * 更新显示内容（在 Event.PRERENDER 事件中更新）
         */
        public render(): void {
            PrerenderScheduler.add(this._renderHandler);
        }

        /**
         * 立即更新显示内容，而不是等待 Event.PRERENDER 事件更新
         */
        public renderNow(): void {
            this.doRender();
        }

        /**
         * 进行渲染
         */
        protected doRender(): void {
            PrerenderScheduler.remove(this._renderHandler);
            this._bc.update();
        }


        /**
         * 当前状态
         */
        public set state(value: string) {
            this.setState(value);
        }

        protected setState(value: string): void {
            if (this._skin.skinName == null) return;
            this._skin.state = value;
        }

        public get state(): string {
            return this._skin.state;
        }


        protected setEnabled(value: boolean): void {
            super.setEnabled(value);
            this._bc.touchEnabled = value;
            this.setEventListener();
        }


        protected setSelected(value: boolean) {
            super.setSelected(value);
            this.setEventListener();
        }


        /**
         * 根据状态，侦听事件或解除事件的侦听
         */
        private setEventListener(): void {
            if (this._enabled) {
                this.event_addListener(TouchEvent.TOUCH_BEGIN, this.baseButton_touchBegin, this);
                this.state = this._selected ? Skin.SELECTED_UP : Skin.UP;
            }
            else {
                this.event_removeListener(TouchEvent.TOUCH_BEGIN, this.baseButton_touchBegin, this);
                this.event_removeListener(TouchEvent.TOUCH_END, this.baseButton_touchEnd, this);
                this.state = this._selected ? Skin.SELECTED_DISABLED : Skin.DISABLED;
            }
        }


        /**
         * touch begin
         * @param event
         */
        private baseButton_touchBegin(event: TouchEvent): void {
            if (!this._enabled) return;

            this.event_addListener(TouchEvent.TOUCH_END, this.baseButton_touchEnd, this);
            this.state = this._selected ? Skin.SELECTED_DOWN : Skin.DOWN;
        }


        /**
         * touch end
         * @param event
         */
        private baseButton_touchEnd(event: TouchEvent): void {
            this.event_removeListener(TouchEvent.TOUCH_END, this.baseButton_touchEnd, this);
            this.state = this._selected ? Skin.SELECTED_UP : Skin.UP;
        }


        /**
         * 宽
         */
        public setWidth(value: number): void {
            this._skin.width = this._width = value;
            this.render();
        }

        public getWidth(): number {
            if (this._width > 0) return this._width;
            return this._skin.width;
        }

        /**
         * 高
         */
        public setHeight(value: number): void {
            this._skin.height = this._height = value;
            this.render();
        }

        public getHeight(): number {
            if (this._height > 0) return this._height;
            return this._skin.height;
        }


        /**
         * 重置宽高（将会置成当前皮肤的默认宽高）
         */
        public resetSize(): void {
            this._skin.resetSize();
            this._width = this._skin.width;
            this._height = this._skin.height;
            this.render();
        }


        /**
         * Touch Begin 时，缩放的比例。
         * 默认将使用 BaseButton.touchZoomScale 的值。
         * 值为 1 时，表示不用缩放。
         */
        public set touchZoomScale(value: number) {
            this._bc.touchZoomScale = value;
        }

        public get touchZoomScale(): number {
            return this._bc.touchZoomScale;
        }


        /**
         * Touch时，播放的音效名称。
         * 默认将使用 ButtonContainer.touchSoundName 的值
         * 值为 null 时，表示不用播放音效。
         */
        public set touchSoundName(value: string) {
            this._bc.touchSoundName = value;
        }

        public get touchSoundName(): string {
            return this._bc.touchSoundName;
        }


        /**
         * 禁用时，没有对应的状态图像时，是否自动灰显。
         * 默认：true
         */
        public set autoGrayScaleDisabled(value: boolean) {
            this._skin.autoGrayScaleDisabled = value;
        }

        public get autoGrayScaleDisabled(): boolean {
            return this._skin.autoGrayScaleDisabled;
        }

        //


        public destroy(): void {
            PrerenderScheduler.remove(this._renderHandler);

            super.destroy();
        }


        //
    }
}