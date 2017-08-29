namespace app.jump {


    import Container = lolo.Container;
    import TouchEvent = lolo.TouchEvent;
    import Bitmap = lolo.Bitmap;
    import Point = lolo.Point;


    /**
     * 跳跃游戏 - 摇杆
     * 2017/7/24
     * @author LOLO
     */
    export class Joystick extends Container {

        public bg: Bitmap;
        public sight: Bitmap;

        /**可摇动半径*/
        public radius: number = 45;

        private _enabled: boolean;
        private _touchID: number = null;


        public constructor() {
            super();
            this._enabled = true;
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);


        }


        private touchHandler(event: TouchEvent): void {
            let touchID: number = event.touch.getTouchID();
            switch (event.type) {

                case TouchEvent.TOUCH_BEGIN:
                    if (this._touchID != null) return;

                    // 屏幕左下方 300x300 像素是点击区域
                    let pStage: Point = lolo.gesture.touchPoint;
                    if (pStage.x > 300 || pStage.y < lolo.stage.stageHeight - 300) return;

                    this._touchID = touchID;
                    this.sight.stopAllActions();

                    // 至少距左下 110 像素
                    this.x = Math.max(110, pStage.x);
                    this.y = Math.min(pStage.y, lolo.stage.stageHeight - 110);
                    this.fade(true);

                    lolo.gesture.event_addListener(TouchEvent.TOUCH_MOVE, this.touchHandler, this);
                    lolo.gesture.event_addListener(TouchEvent.TOUCH_END, this.touchHandler, this);
                    break;

                case TouchEvent.TOUCH_END:
                    if (touchID == this._touchID) this.end();
                    return;
            }

            if (touchID != this._touchID) return;

            let p: cc.Point = this.convertToNodeSpace(event.touch.getLocation());
            let x: number = p.x, y: number = -p.y;
            let hypotenuse: number = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));// 斜边
            let radian: number = Math.cos(x / hypotenuse);// 弧度
            let angle: number = 180 / (Math.PI / radian);// 角度
            if (y < 0) angle = -angle;
            else if (y == 0 && x < 0) angle = 180;

            let radius: number = Math.sqrt(x * x + y * y);
            if (radius > this.radius) {
                let relativeThickness: number = this.radius / radius;
                x *= relativeThickness;
                y *= relativeThickness;
            }
            this.sight.x = x;
            this.sight.y = y;
        }


        /**
         * 是否启用虚拟摇杆
         */
        public set enabled(value: boolean) {
            this._enabled = value;
            if (value && this._showed) {
                lolo.gesture.event_addListener(TouchEvent.TOUCH_BEGIN, this.touchHandler, this);
            }
            else {
                lolo.gesture.event_removeListener(TouchEvent.TOUCH_BEGIN, this.touchHandler, this);
                this.end();
            }
        }

        public get enabled(): boolean {
            return this._enabled;
        }


        /**
         * 结束使用虚拟摇杆
         */
        private end(): void {
            this._touchID = null;
            lolo.gesture.event_removeListener(TouchEvent.TOUCH_MOVE, this.touchHandler, this);
            lolo.gesture.event_removeListener(TouchEvent.TOUCH_END, this.touchHandler, this);
            this.sight.stopAllActions();
            this.sight.runAction(cc.moveTo(0.15, 0, 0));
            this.fade(false);
        }

        /**
         * 显示或逐渐隐藏（半透）
         * @param fadeIn
         */
        private fade(fadeIn: boolean): void {
            this.stopAllActions();
            if (fadeIn)
                this.runAction(cc.fadeIn(0.15));
            else
                this.runAction(cc.sequence(cc.delayTime(0.8), cc.fadeTo(0.3, 50)));
        }


        //


        protected startup(): void {
            super.startup();
            this.fade(false);
            if (this._enabled) this.enabled = this._enabled;
        }


        protected reset(): void {
            super.reset();
            if (this._enabled) this.enabled = this._enabled;
        }


        //
    }
}