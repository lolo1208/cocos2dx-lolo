/// <reference path="./ItemRenderer.ts"/>


namespace lolo {


    /**
     * 基础按钮（图形皮肤）
     * 在状态改变时，将皮肤切换到对应的状态
     * @author LOLO
     */
    export class BaseButton extends ItemRenderer {

        /**Touch时，播放的音效名称。默认值：null，表示不用播放*/
        public static touchSoundName: string = null;
        /**Touch时，缩放的比例。值为 1 时，表示不用缩放。默认值：0.9*/
        public static touchZoomScale: number = 0.9;

        /**皮肤*/
        protected _skin: Skin;
        /**设置的水平缩放比例*/
        private _scale: lolo.Point;

        /**在skinName改变时，是否需要自动重置宽高*/
        public autoResetSize: boolean = true;

        /**
         * Touch时，播放的音效名称。
         * 默认将使用 BaseButton.touchSoundName 的值
         * 值为 null 时，表示不用播放音效。
         */
        public touchSoundName: string;

        /**
         * Touch begin 时，缩放的比例。
         * 默认将使用 BaseButton.touchZoomScale 的值。
         * 值为 1 时，表示不用缩放。
         */
        public touchZoomScale: number;


        public constructor() {
            super();

            this._skin = new Skin();
            this.addChild(this._skin);

            this.touchSoundName = BaseButton.touchSoundName;
            this.touchZoomScale = BaseButton.touchZoomScale;
            this._scale = lolo.CachePool.getPoint(1, 1);
        }


        public onExit(): void {
            super.onExit();
            this.setScale(this._scale.x, this._scale.y);
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
         * 更新显示内容（在 Event.ENTER_FRAME 事件中更新）
         */
        public render(): void {
            lolo.stage.event_addListener(Event.ENTER_FRAME, this.doRender, this);
        }

        /**
         * 立即更新显示内容，而不是等待 Event.ENTER_FRAME 事件更新
         */
        public renderNow(): void {
            this.doRender();
        }

        /**
         * 进行渲染
         * @param event Event.ENTER_FRAME 事件
         */
        protected doRender(event?: Event): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);

            let hw: number = this._width / 2;
            let hh: number = this._height / 2;
            this._original_setPositionX(this._x + hw);
            this._original_setPositionY(-(this._y + hh));
            this._skin.x = -hw;
            this._skin.y = -hh;
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

            let scale: number = this.touchZoomScale;
            if (scale != 1) {
                this.stopAllActions();
                this.runAction(cc.scaleTo(0.05, scale * this._scale.x, scale * this._scale.y));
            }

            // var snd:string = (this.touchSoundName != null) ? this.touchSoundName : BaseButton.touchSoundName;
            // if(snd != null || snd != "") lolo.sound.play(snd);
        }


        /**
         * touch end
         * @param event
         */
        private baseButton_touchEnd(event: TouchEvent): void {
            this.event_removeListener(TouchEvent.TOUCH_END, this.baseButton_touchEnd, this);
            this.state = this._selected ? Skin.SELECTED_UP : Skin.UP;

            let scale: number = this.touchZoomScale;
            if (scale != 1) {
                this.stopAllActions();
                this.runAction(cc.scaleTo(0.05, this._scale.x, this._scale.y));
            }
        }


        /**
         * 设置宽高
         */
        protected setWidth(value: number): void {
            this._skin.width = this._width = value;
            this.render();
        }

        protected setHeight(value: number): void {
            this._skin.height = this._height = value;
            this.render();
        }


        protected _xChanged(): void {
            this.render();
        }


        protected _yChanged(): void {
            this.render();
        }


        /**
         * 设置缩放
         */
        public setScaleX(value: number): void {
            this._scale.x = value;
            super.setScaleX(value);
        }

        public setScaleY(value: number): void {
            this._scale.y = value;
            super.setScaleY(value);
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
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled()) return false;// 当前节点不可见

            // 当前scale比原始scale小，需用原始的 scale 来测试点击
            let sx: number = this.getScaleX(), sy: number;
            let zooming: boolean = sx < this._scale.x;
            if (zooming) {
                sy = this.getScaleY();
                this.setScale(this._scale.x, this._scale.y);
            }

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            p.y = -p.y;
            let w: number = this.width, h: number = this.height;
            lolo.temp_rect.setTo(-w / 2, -h / 2, w, h);
            let hitted: boolean = lolo.temp_rect.contains(p.x, p.y);

            if (zooming) this.setScale(sx, sy);
            return hitted;
        }


        //


        public recycle(): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);

            super.recycle();
        }


        /**
         * 销毁
         */
        public destroy(): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);
            lolo.CachePool.recycle(this._scale);
            this._scale = null;

            super.destroy();
        }


        //
    }
}