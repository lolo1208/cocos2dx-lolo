namespace lolo {


    /**
     * 向下浮动效果
     * - step1: 从 alpha=0 到 alpha=1 ，并向下浮动目标
     * - step2: 停留指定时间后，再向下浮动目标，并将 alpha 设置为0
     * - step3: 浮动结束后，将目标从父容器中移除，并将 alpha 设置为1
     * @author LOLO
     */
    export class DownFloat implements IFloat {

        /**缓存池*/
        private static _pool: DownFloat[] = [];

        /**应用该效果的目标*/
        public target: cc.Node;
        /**浮动结束后的回调。调用该方法时，将会传递一个boolean类型的参数，表示效果是否正常结束。onComplete(complete:boolean, float:IFloat)*/
        public onComplete: Handler;
        /**是否正在浮动中*/
        public floating: boolean;
        /**是否只播放一次，播放完毕后，将会自动回收到池中*/
        public once: boolean;

        /**step1 的持续时长（秒）*/
        public step1_duration: number = 0.1;
        /**step1 的移动距离（Y）*/
        public step1_y: number = 10;

        /**step2 的持续时长（秒）*/
        public step2_duration: number = 0.65;
        /**step2 的停留时长（秒）*/
        public step2_delay: number = 0.3;
        /**step2 的移动距离（Y）*/
        public step2_y: number = 40;


        /**
         * 创建，或从池中获取一个 DownFloat 实例。
         * ！！！
         * 注意：：使用 DownFloat.once() 创建的实例 once 属性默认为 true。
         * 播放完毕后，实例(_pool) 和 target(CachePool) 将会自动回收到池中。
         * ！！！
         * @param target 应用该效果的目标
         * @param onComplete 浮动结束后的回调。onComplete(complete:boolean, float:IFloat)
         * @param start 是否立即开始播放
         */
        public static once(target: cc.Node = null, onComplete: Handler = null, start: boolean = true): DownFloat {
            let float: DownFloat = (this._pool.length > 0) ? this._pool.pop() : new DownFloat();
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

            let target: cc.Node = this.target, tx: number = target.x, ty: number = target.y;
            let y1: number = ty + this.step1_y;
            let y2: number = ty + this.step2_y;

            target.setOpacity(0);
            target.stopAllActions();
            target.runAction(cc.sequence(
                cc.spawn(cc.moveTo(this.step1_duration, tx, y1), cc.fadeIn(this.step1_duration)),

                cc.delayTime(this.step2_delay),
                cc.spawn(cc.moveTo(this.step2_duration, tx, y2), cc.fadeOut(this.step2_duration)),

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
                DownFloat._pool.push(this);
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