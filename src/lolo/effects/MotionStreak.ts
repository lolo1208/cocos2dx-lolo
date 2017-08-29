namespace lolo {


    /**
     * 拖尾效果
     * 2017/8/28
     * @author LOLO
     */
    export class MotionStreak extends cc.MotionStreak {

        /**默认颜色（不变色）*/
        private static DEFAULT_COLOR: cc.Color = cc.color(255, 255, 255);


        private _target: cc.Sprite;


        /**
         * 构造函数
         * @param target 追踪的目标。this.parent = target.parent
         * @param fade  拖尾渐隐时间（秒）
         * @param minSeg 拖尾最小间距
         * @param start 是否立即开始追踪目标，显示特效
         * @param switchZOrder 是否改变显示层级（将 target 放在拖尾效果上面）
         * @param stoke 如果值为 0（默认），该值等于 target.height
         * @param color 颜色值
         * @param texture 如果值为 EMPTY_TEXTURE（默认），该值等于 target.texture
         */
        public constructor(target: cc.Sprite,
                           fade: number = 0.5,
                           minSeg: number = 10,
                           start: boolean = true,
                           switchZOrder: boolean = true,
                           stoke: number = 0,
                           color: cc.Color = MotionStreak.DEFAULT_COLOR,
                           texture: cc.Texture2D = Constants.EMPTY_TEXTURE//
        ) {
            super(fade, minSeg, stoke, color, texture);
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this.retain();
            this.notRelease = true;

            if (!isNative) {
                this.setPosition = expend_setPosition;
                Object.defineProperty(this, "x", expend_x);
                Object.defineProperty(this, "y", expend_y);
            }

            this._target = target;
            if (texture == Constants.EMPTY_TEXTURE) texture = target.texture;
            this.setTexture(texture);
            if (stoke == 0) stoke = target.getWidth();
            this.setStroke(stoke);
            let parent = target.getParent();
            if (parent != null) {
                parent.addChild(this);
                if (switchZOrder) parent.addChild(target);
            }
            this.prerenderHandler();

            start ? this.start() : this.unscheduleUpdate();
        }


        /**
         * 根据目标的纹理，更新 texture 和 stroke
         */
        public updateTexture(): void {
            let texture: cc.Texture2D = this._target.getTexture();
            if (texture == null) texture = Constants.EMPTY_TEXTURE;
            this.setTexture(texture);
            this.setStroke(this._target.getWidth());
        }


        /**
         * 拖尾效果追踪的目标
         */
        public get target(): cc.Sprite {
            return this._target;
        }


        /**
         * 开始追踪目标，显示特效
         */
        public start(): void {
            if (this._target == null) return;
            this.prerenderHandler();
            this.reset();
            this.scheduleUpdate();
            lolo.stage.event_addListener(Event.PRERENDER, this.prerenderHandler, this);
        }

        private prerenderHandler(event?: Event): void {
            let target = this._target;
            this.setPositionX(target._x + target.getWidth() * (target.anchorX + 0.5));
            this.setPositionY(target._y + target.getHeight() * (target.anchorY - 0.5));
        }


        /**
         * 停止追踪目标，结束特效
         */
        public stop(): void {
            lolo.stage.event_removeListener(Event.PRERENDER, this.prerenderHandler, this);
            this.unscheduleUpdate();
            this.reset();
        }


        //


        public setPositionX(value: number) {
            if (value != this._x) {
                this._x = value;
                super.setPositionX(value);
            }
        }

        public getPositionX(): number {
            return this._x;
        }


        public setPositionY(value: number) {
            if (value != this._y) {
                this._y = value;
                super.setPositionY(isNative ? value : -value);
            }
        }

        public getPositionY(): number {
            return this._y;
        }


        //


        public destroy(): void {
            lolo.stage.event_removeListener(Event.PRERENDER, this.prerenderHandler, this);
            super.destroy();
        }


        //
    }
}