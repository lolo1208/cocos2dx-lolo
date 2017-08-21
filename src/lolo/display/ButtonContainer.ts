namespace lolo {


    /**
     * 按钮容器，实现 touch 缩放效果
     *
     * 使用 ButtonContainer 时，会改变被遮罩对象的显示层级，伪代码如下：
     * var oldParent = target.parent;
     * target.parent = buttonContainer;
     * buttonContainer.parent = oldParent;
     *
     * 会将 target.touchListener.swallowTouches 设置为：false，以便事件的传递，
     * 当 touch 事件传递到该按钮容器时，再将事件吞噬
     * @author LOLO
     */
    export class ButtonContainer extends DisplayObjectContainer {

        /**Touch Begin 时，播放的音效名称。默认值：null，表示不用播放*/
        public static touchAudioName: string = null;
        /**Touch Begin 时，缩放的比例。值为 1 时，表示不用缩放。默认值：0.95*/
        public static touchZoomScale: number = 0.95;


        /**
         * Touch时，播放的音效名称。
         * 默认将使用 ButtonContainer.touchAudioName 的值
         * 值为 null 时，表示不用播放音效。
         */
        public touchAudioName: string = null;

        /**
         * Touch begin 时，缩放的比例。
         * 默认将使用 ButtonContainer.touchZoomScale 的值。
         * 值为 1 时，表示不用缩放。
         */
        public touchZoomScale: number;

        /**效果应用的目标*/
        private _target: cc.Node;
        private _target_setPositionX: Function;
        private _target_setPositionY: Function;
        private _target_hitTest: Function;


        public constructor(target?: cc.Node, swallowTouches: boolean = true) {
            super();
            this.touchZoomScale = ButtonContainer.touchZoomScale;
            this.touchAudioName = ButtonContainer.touchAudioName;
            this.target = target;

            this.touchEnabled = true;
            this.touchListener.swallowTouches = swallowTouches;
            this.event_addListener(TouchEvent.TOUCH_BEGIN, this.bc_touchBegin, this);
        }


        public onExit(): void {
            super.onExit();
            this.setScale(1);
        }


        /**
         * 更新 position 和 scale。
         * 在 target 的 width / height / x / y / scaleX / scaleY 有变化时，请调用该方法
         */
        public update(): void {
            this.childResizeHandler();
        }

        protected childResizeHandler(event?: Event): void {
            this.childResized = true;

            let target: cc.Node = this._target;
            let w = target.getWidth(), h = target.getHeight();
            let hw = w / 2, hh = h / 2;
            let ox = target.anchorX * w, oy = (1 - target.anchorY) * h;
            target._original_setPosition(-hw + ox, hh - oy);

            this._original_setPosition(this._x + hw - ox, -(this._y + hh - oy));
        }


        /**
         * 效果应用的目标
         */
        public set target(target: cc.Node) {
            this.removeTarget();
            this._target = target;
            if (target == null) return;

            target.touchEnabled = true;
            target.touchListener.swallowTouches = false;

            target.parent.addChild(this);
            this.addChild(target);

            this._x = target.x;
            this._y = target.y;
            this.childResizeHandler();

            this._target_setPositionX = target.setPositionX;
            this._target_setPositionY = target.setPositionY;
            this._target_hitTest = target.hitTest;
            target.setPositionX = this.target_setPositionX;
            target.setPositionY = this.target_setPositionY;
            target.hitTest = this.target_hitTest;
        }

        public get target(): cc.Node {
            return this._target;
        }

        private removeTarget(): void {
            let target: cc.Node = this._target;
            if (target != null) {
                this._target = null;
                this.parent.addChild(target);
                this.removeFromParent();

                target.touchListener.swallowTouches = true;

                target.setPositionX = this._target_setPositionX;
                target.setPositionY = this._target_setPositionY;
                target.hitTest = this._target_hitTest;
                target.setPosition(this._x, this._y);
                this._target_setPositionX = this._target_setPositionY = this._target_hitTest = null;
            }
        }

        private target_setPositionX(value: number): void {
            let bc: ButtonContainer = <ButtonContainer>this.parent;
            bc._x = this._x = value;
            bc.update();
        }

        private target_setPositionY(value: number): void {
            let bc: ButtonContainer = <ButtonContainer>this.parent;
            bc._y = this._y = value;
            bc.update();
        }

        private target_hitTest(worldPoint: cc.Point): boolean {
            return (<ButtonContainer>this.parent).hitTest(worldPoint);
        }


        /**
         * touch begin
         * @param event
         */
        private bc_touchBegin(event: TouchEvent): void {
            this.event_addListener(TouchEvent.TOUCH_END, this.bc_touchEnd, this);
            lolo.stage.event_addListener(Event.DEACTIVATE, this.bc_touchEnd, this);

            let scale: number = this.touchZoomScale;
            if (scale != 1) {
                this.stopAllActions();
                this.runAction(cc.scaleTo(0.05, scale));
            }

            let snd: string = (this.touchAudioName != null) ? this.touchAudioName : ButtonContainer.touchAudioName;
            if (snd != null) lolo.audio.playEffect(snd);
        }

        /**
         * touch end
         * @param event
         */
        private bc_touchEnd(event: TouchEvent): void {
            this.event_removeListener(TouchEvent.TOUCH_END, this.bc_touchEnd, this);
            lolo.stage.event_removeListener(Event.DEACTIVATE, this.bc_touchEnd, this);

            let scale: number = this.touchZoomScale;
            if (scale != 1) {
                this.stopAllActions();
                this.runAction(cc.scaleTo(0.05, 1));
            }
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled(worldPoint)) return false;// 当前节点不可见

            // 当前缩小了，先还原 scale，再测试点击
            let scale: number = this.getScaleX();
            let zooming: boolean = scale < 1;
            if (zooming) this.setScale(1);
            let hitted: boolean = this._target_hitTest.call(this._target, worldPoint);
            if (zooming) this.setScale(scale);
            return hitted;
        }


        //


        public destroy(): void {
            lolo.stage.event_removeListener(Event.DEACTIVATE, this.bc_touchEnd, this);

            super.destroy();
        }


        //
    }
}