namespace lolo {


    /**
     * 先向上浮动，停留一会，再浮动到某一点
     * - step1: 从 alpha=0 到 alpha=1 ，并向上浮动目标
     * - step2: 停留指定时间后，移动到目标位置，并缓动更新 scaleX、scaleY
     * - step3: 浮动结束后，将目标从父容器中移除，并将 scaleX、scaleY 设置为 1
     * @author LOLO
     */
    export class PositionFloat implements IFloat {

        /**缓存池*/
        private static _pool: PositionFloat[] = [];

        /**应用该效果的目标*/
        public target: cc.Node;
        /**浮动结束后的回调。调用该方法时，将会传递一个boolean类型的参数，表示效果是否正常结束。onComplete(complete:boolean, float:IFloat)*/
        public onComplete: Handler;
        /**是否正在浮动中*/
        public floating: boolean;
        /**是否只播放一次，播放完毕后，将会自动回收到池中*/
        public once: boolean;

        /**step1 的持续时长（秒）*/
        public step1_duration: number = 0.3;
        /**step1 的移动距离（Y）*/
        public step1_y: number = -10;

        /**step2 的停留时长（秒）*/
        public step2_delay: number = 0.3;
        /**step2 的持续时长（秒）*/
        public step2_duration: number = 0.5;
        /**step2 的 scaleX*/
        public step2_scaleX: number = 0.5;
        /**step2 的 scaleY*/
        public step2_scaleY: number = 0.5;

        /**step2 的目标位置*/
        public step2_p: Point;


        /**
         * 创建，或从池中获取一个 PositionFloat 实例。
         * ！！！
         * 注意：：使用 PositionFloat.once() 创建的实例 once 属性默认为 true。
         * 播放完毕后，实例(_pool) 和 target(CachePool) 将会自动回收到池中。
         * ！！！
         * @param target 应用该效果的目标
         * @param p 最终移动到该位置
         * @param onComplete 浮动结束后的回调。onComplete(complete:boolean, float:IFloat)
         * @param start 是否立即开始播放
         */
        public static once(target: cc.Node = null,
                           p: Point = null,
                           onComplete: Handler = null,
                           start: boolean = true): PositionFloat {
            let float: PositionFloat = (this._pool.length > 0) ? this._pool.pop() : new PositionFloat();
            float.once = true;
            float.target = target;
            float.onComplete = onComplete;
            float.step2_p = p;
            if (start) float.start();
            return float;
        }


        public constructor() {
        }


        /**
         * 开始播放浮动效果
         */
        public start(): void {
            if (this.target == null || this.step2_p == null) return;
            this.floating = true;

            let target: cc.Node = this.target;
            let y1: number = target.y + this.step1_y;
            let y2: number = this.step2_p.y;

            target.setOpacity(0);
            target.stopAllActions();
            target.runAction(cc.sequence(
                cc.spawn(cc.moveTo(this.step1_duration, target.x, y1), cc.fadeIn(this.step1_duration)),

                cc.delayTime(this.step2_delay),
                cc.spawn(
                    cc.moveTo(this.step2_duration, this.step2_p.x, y2),
                    cc.scaleTo(this.step2_duration, this.step2_scaleX, this.step2_scaleY)
                ),

                cc.callFunc(this.finish, this)
            ));
        }

        private finish(): void {
            this.target.setOpacity(255);
            this.target.setScale(1);
            if (this.target.parent != null) this.target.parent.removeChild(this.target);
            this.end(true);
        }


        /**
         * 结束播放浮动效果
         * @param complete 效果是否正常结束
         */
        public end(complete: boolean = false): void {
            this.floating = false;
            this.target.stopAllActions();

            if (this.once) {
                CachePool.recycle(this.target);

                this.step1_duration = 0.3;
                this.step1_y = -10;
                this.step2_delay = 0.3;
                this.step2_duration = 0.5;
                this.step2_scaleX = 0.5;
                this.step2_scaleY = 0.5;
                PositionFloat._pool.push(this);
            }

            let handler: Handler = this.onComplete;
            this.onComplete = null;
            if (handler != null) handler.execute(complete, this);

            this.target = null;
        }

        //
    }
}