namespace lolo {


    /**
     * 原地停留一段时间后隐藏
     * - step1: 渐显
     * - step2: 停留指定时间后，渐隐
     * - step3: 浮动结束后，将目标从父容器中移除，并将 alpha 设置为1
     * @author LOLO
     */
    export class DelayedHide implements IFloat {

        /**缓存池*/
        private static _pool: DelayedHide[] = [];

        /**应用该效果的目标*/
        public target: cc.Node;
        /**浮动结束后的回调。调用该方法时，将会传递一个boolean类型的参数，表示效果是否正常结束。onComplete(complete:boolean, float:IFloat)*/
        public onComplete: Handler;
        /**是否正在浮动中*/
        public floating: boolean;
        /**是否只播放一次，播放完毕后，将会自动回收到池中*/
        public once: boolean;

        /**step1 的持续时长（秒）*/
        public step1_duration: number = 0.2;

        /**step2 的持续时长（秒）*/
        public step2_duration: number = 0.5;
        /**step2 的停留时长（秒）*/
        public step2_delay: number = 0.5;


        /**
         * 创建，或从池中获取一个 DelayedHide 实例。
         * ！！！
         * 注意：：使用 DelayedHide.once() 创建的实例 once 属性默认为 true。
         * 播放完毕后，实例(_pool) 和 target(CachePool) 将会自动回收到池中。
         * ！！！
         * @param target 应用该效果的目标
         * @param onComplete 浮动结束后的回调。onComplete(complete:boolean, float:IFloat)
         * @param start 是否立即开始播放
         */
        public static once(target: cc.Node = null,
                           onComplete: Handler = null,
                           start: boolean = true): DelayedHide {
            let float: DelayedHide = (this._pool.length > 0) ? this._pool.pop() : new DelayedHide();
            float.once = true;
            float.target = target;
            float.onComplete = onComplete;
            if (start) float.start();
            return float;
        }


        public constructor() {
        }


        /**
         * 开始播放浮动效果
         */
        public start(): void {
            if (this.target == null) return;
            this.floating = true;

            let target: cc.Node = this.target;
            target.setOpacity(0);

            target.stopAllActions();
            target.runAction(cc.sequence(
                cc.fadeIn(this.step1_duration),

                cc.delayTime(this.step2_delay),
                cc.fadeOut(this.step2_duration),

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
            this.floating = false;
            this.target.stopAllActions();

            if (this.once) {
                DelayedHide._pool.push(this);
                CachePool.recycle(this.target);
            }

            let handler: Handler = this.onComplete;
            this.onComplete = null;
            if (handler != null) handler.execute(complete, this);

            this.target = null;
        }

        //
    }
}