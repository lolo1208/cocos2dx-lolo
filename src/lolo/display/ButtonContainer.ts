namespace lolo {


    /**
     * 按钮容器，实现 touch 缩放效果
     *
     * 使用 ButtonContainer 时，会改变被遮罩对象的显示层级，伪代码如下：
     * var oldParent = target.parent;
     * target.parent = buttonContainer;
     * buttonContainer.parent = oldParent;
     *
     * @author LOLO
     */
    export class ButtonContainer extends DisplayObjectContainer {

        /**Touch Begin 时，播放的音效名称。默认值：null，表示不用播放*/
        public static touchSoundName: string = null;
        /**Touch Begin 时，缩放的比例。值为 1 时，表示不用缩放。默认值：0.9*/
        public static touchZoomScale: number = 0.9;


        /**
         * Touch时，播放的音效名称。
         * 默认将使用 ButtonContainer.touchSoundName 的值
         * 值为 null 时，表示不用播放音效。
         */
        public touchSoundName: string = null;

        /**
         * Touch begin 时，缩放的比例。
         * 默认将使用 ButtonContainer.touchZoomScale 的值。
         * 值为 1 时，表示不用缩放。
         */
        public touchZoomScale: number;


        /**设置的缩放比例*/
        private _scale: Point;
        /**效果应用的目标*/
        private _target: cc.Node;


        public constructor(target: cc.Node) {
            super();
            this._scale = CachePool.getPoint(1, 1);
            this.touchZoomScale = ButtonContainer.touchZoomScale;
            this.touchSoundName = ButtonContainer.touchSoundName;
            this.target = target;

            this.touchEnabled = true;
            this.touchListener.swallowTouches = false;
            this.event_addListener(TouchEvent.TOUCH_BEGIN, this.bc_touchBegin, this);
        }


        public onExit(): void {
            super.onExit();
            this.setScale(this._scale.x, this._scale.y);
        }


        /**
         * 更新 position 和 scale
         */
        public update(): void {
            let target: cc.Node = this._target;
            let hw: number = target.width / 2;
            let hh: number = target.height / 2;
            target.setPosition(-hw, -hh);

            let x = this._x, y = this._y;
            super.setPositionX(x + hw);
            super.setPositionY(y + hh);
            this._x = x;
            this._y = y;

            this._scale.setTo(target._scaleX, target._scaleY);
        }


        /**
         * 效果应用的目标
         */
        public set target(target: cc.Node) {
            this.removeTarget();
            this._target = target;
            if (target == null) return;

            target.parent.addChild(this);
            this.addChild(target);

            this._x = target.x;
            this._y = target.y;
            this.update();
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

                target.setScale(this._scale.x, this._scale.y);
                target.setPosition(this._x, this._y);
            }
        }


        /**
         * touch begin
         * @param event
         */
        private bc_touchBegin(event: TouchEvent): void {
            this.event_addListener(TouchEvent.TOUCH_END, this.bc_touchEnd, this);

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
        private bc_touchEnd(event: TouchEvent): void {
            this.event_removeListener(TouchEvent.TOUCH_END, this.bc_touchEnd, this);

            let scale: number = this.touchZoomScale;
            if (scale != 1) {
                this.stopAllActions();
                this.runAction(cc.scaleTo(0.05, this._scale.x, this._scale.y));
            }
        }

        //

        public setPositionX(value: number): void {
            this._x = value;
            this.update();
        }

        public setPositionY(value: number): void {
            this._y = value;
            this.update();
        }


        /**
         * 通过 scale 属性来设置 scaleX / scaleY
         */
        public get scale(): Point {
            return this._scale;
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled()) return false;// 当前节点不可见

            // 当前scale比原始scale小，需用原始的 scale 来测试点击
            let sx: number = this._original_getScaleX(), sy: number;
            let zooming: boolean = sx < this._scale.x;
            if (zooming) {
                sy = this._original_getScaleY();
                this.setScale(this._scale.x, this._scale.y);
            }

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            p.y = -p.y;
            let w: number = this._target.getWidth(), h: number = this._target.getHeight();
            lolo.temp_rect.setTo(-w / 2, -h / 2, w, h);
            let hitted: boolean = lolo.temp_rect.contains(p.x, p.y);

            if (zooming) this.setScale(sx, sy);
            return hitted;
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            this.removeTarget();
            if (this._scale != null) {
                CachePool.recycle(this._scale);
                this._scale = null;
            }

            super.destroy();
        }


        //
    }
}