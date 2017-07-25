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
        public radius: number = 30;

        private _enabled: boolean;
        private _touchID: number;


        public constructor() {
            super();
            this._enabled = true;
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);


        }


        private touchHandler(event: TouchEvent): void {
            let touchID: number = event.touch.getTouchID();
            if (event.type == TouchEvent.TOUCH_BEGIN) {
                if (this._touchID != null) return;
                this.sight.stopAllActions();
                let pStage: Point = lolo.gesture.touchPoint;
                if (pStage.y > lolo.stage.stageHeight - 300) {// 屏幕下方 300px 是点击区域
                    // padding 120px
                    this.x = Math.min(Math.max(pStage.x, 120), lolo.stage.halfStageWidth - 120);
                    this.y = Math.min(Math.max(pStage.y, 120), lolo.stage.halfStageHeight - 120);
                }
            }


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


            switch (event.type) {
                case TouchEvent.TOUCH_BEGIN:

                    break;

                // case TouchEvent.TOUCH_MOVE:
                //     break;

                case TouchEvent.TOUCH_END:
                    this.end();
                    break;
            }
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
            if (this._enabled) this.enabled = this._enabled;
        }


        protected reset(): void {
            super.reset();
            if (this._enabled) this.enabled = this._enabled;
        }


        //
    }
}