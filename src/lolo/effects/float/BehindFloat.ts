namespace lolo {


    /**
     * 向背后浮动效果
     * - step1: 向背后浮动目标，并且 alpha 从0 至 1（duration为持续时间的一半）
     * - step2: 向背后再移动一段距离，并将 alpha 设置为0
     * - step3: 浮动结束后，将目标从父容器中移除，并将 alpha 设置为1
     * @author LOLO
     */
    export class BehindFloat implements IFloat {

        /**缓存池*/
        private static _pool: BehindFloat[] = [];

        /**应用该效果的目标*/
        public target: cc.Node;
        /**浮动结束后的回调。调用该方法时，将会传递一个boolean类型的参数，表示效果是否正常结束。onComplete(complete:boolean, float:IFloat)*/
        public onComplete: Handler;
        /**是否正在浮动中*/
        public floating: boolean;
        /**是否只播放一次，播放完毕后，将会自动回收到池中*/
        public once: boolean;

        /**作用点（正面的位置）*/
        public actionPoint: Point;
        /**根据作用点计算出的距离偏移值*/
        private _offsetPoint: Point;

        /**step1 的持续时长（秒）*/
        public step1_duration: number = 0.2;
        /**step1 的移动距离*/
        public step1_distance: number = 40;

        /**step2 的延迟时长（秒）*/
        public step2_delay: number = 0.3;
        /**step2 的持续时长（秒）*/
        public step2_duration: number = 0.4;
        /**step2 的移动距离*/
        public step2_distance: number = 20;


        /**
         * 创建，或从池中获取一个 BehindFloat 实例。
         * ！！！
         * 注意：：使用 BehindFloat.once() 创建的实例 once 属性默认为 true。
         * 播放完毕后，实例(_pool) 和 target(CachePool) 将会自动回收到池中。
         * ！！！
         * @param target 应用该效果的目标
         * @param actionPoint 作用点（正面的位置）
         * @param onComplete 浮动结束后的回调。onComplete(complete:boolean, float:IFloat)
         * @param start 是否立即开始播放
         */
        public static once(target: cc.Node = null,
                           actionPoint: Point = null,
                           onComplete: Handler = null,
                           start: boolean = true): BehindFloat {
            let float: BehindFloat = (this._pool.length > 0) ? this._pool.pop() : new BehindFloat();
            float.once = true;
            float.target = target;
            float.onComplete = onComplete;
            float.actionPoint = actionPoint;
            if (start) float.start();
            return float;
        }


        public constructor() {
        }


        /**
         * 开始播放浮动效果
         */
        public start(): void {
            if (this.target == null || this.actionPoint == null) return;
            this.floating = true;
            let target: cc.Node = this.target;

            //得出偏移位置
            let tx: number = target.x;
            let ty: number = target.y;
            let op: Point = CachePool.getPoint(tx - this.actionPoint.x, ty - this.actionPoint.y);

            //取较小的偏移倍数
            let mx: number = Math.abs(1 / op.x);
            let my: number = Math.abs(1 / op.y);
            let m: number = Math.min(mx, my);

            //得出距离偏移值
            op.x *= m;
            op.y *= m;
            this._offsetPoint = op;

            let hx: number = op.x * this.step1_distance / 2;
            let hy: number = op.y * this.step1_distance / 2;
            let d1_h: number = this.step1_duration / 2;

            let x1: number = tx + hx;
            let y1: number = ty + hy;

            let x2: number = x1 + hx;
            let y2: number = y1 + hy;

            let x3: number = x2 + op.x * this.step2_distance;
            let y3: number = y2 + op.y * this.step2_distance;

            target.setOpacity(0);
            target.stopAllActions();
            target.runAction(cc.sequence(
                cc.spawn(cc.moveTo(d1_h, x1, y1), cc.fadeIn(d1_h)),
                cc.moveTo(d1_h, x2, y2),

                cc.delayTime(this.step2_delay),
                cc.spawn(cc.moveTo(this.step2_duration, x3, y3), cc.fadeOut(this.step2_duration)),

                cc.callFunc(this.finish, this)
            ));
        }

        private finish(): void {
            this.target.setOpacity(255);
            if (this.target.parent != null) this.target.parent.removeChild(this.target);
            this.end(true);
        }


        /**
         * 结束播放浮动效果
         * @param complete 效果是否正常结束
         */
        public end(complete: boolean = false): void {
            CachePool.recycle(this._offsetPoint);
            this._offsetPoint = null;

            this.floating = false;
            this.target.stopAllActions();

            if (this.once) {
                CachePool.recycle(this.target);

                this.step1_duration = 0.2;
                this.step1_distance = 40;
                this.step2_delay = 0.3;
                this.step2_duration = 0.4;
                this.step2_distance = 20;
                BehindFloat._pool.push(this);
            }

            let handler: Handler = this.onComplete;
            this.onComplete = null;
            if (handler != null) handler.execute(complete, this);

            this.target = null;
        }

        //
    }
}