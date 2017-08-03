namespace lolo {


    /**
     * 贝塞尔飞行动画
     * @author LOLO
     */
    export class BezierFloat implements IFloat {

        /**角度换算值*/
        private static RAD2DEG: number = 180 / Math.PI;
        /**缓存池*/
        private static _pool: BezierFloat[] = [];

        /**应用该效果的目标*/
        public target: cc.Node;
        /**浮动结束后的回调。调用该方法时，将会传递一个boolean类型的参数，表示效果是否正常结束。onComplete(complete:boolean, float:IFloat)*/
        public onComplete: Handler;
        /**是否正在浮动中*/
        public floating: boolean;
        /**是否只播放一次，播放完毕后，将会自动回收到池中*/
        public once: boolean;

        /**起始点*/
        public pStrat: Point;
        /**结束点*/
        public pEnd: Point;
        /**贝塞尔取点距离（值越大，曲线幅度越大）*/
        public distance: number = 0.5;
        /**动态计算出的贝塞尔点*/
        private _pCenter: Point;

        /**飞行时长（秒，默认值：0）。值为 0 时，将会根据 飞行距离 和 durationFactor，动态计算飞行时长*/
        public duration: number = 0;
        /**动态时长的计算参数，值越大，数度越快*/
        public durationFactor: number = 800;
        /**目标是否跟随贝塞尔曲线旋转*/
        public orientToBezier: boolean;

        /**开始时间*/
        private _startTime: number;
        /**计算出来的持续时间（秒）*/
        private _duration: number;


        /**
         * 创建，或从池中获取一个 BezierFloat 实例。
         * ！！！
         * 注意：：使用 BezierFloat.once() 创建的实例 once 属性默认为 true。
         * 播放完毕后，实例(_pool) 和 target(CachePool) 将会自动回收到池中。
         * ！！！
         * @param target 飞行的目标
         * @param pStrat 起始点
         * @param pEnd 结束点
         * @param onComplete 飞行完成时的回调。onComplete(complete:boolean, float:IFloat)
         * @param start 是否立即开始播放
         * @param orientToBezier 目标是否跟随贝塞尔曲线旋转
         */
        public static once(target: cc.Node = null,
                           pStrat: Point = null,
                           pEnd: Point = null,
                           onComplete: Handler = null,
                           orientToBezier: boolean = true,
                           start: boolean = true): BezierFloat {
            let bf: BezierFloat = (this._pool.length > 0) ? this._pool.pop() : new BezierFloat();
            bf.once = true;
            bf.pStrat = pStrat;
            bf.pEnd = pEnd;
            bf.target = target;
            bf.onComplete = onComplete;
            bf.orientToBezier = orientToBezier;
            if (start) bf.start();
            return bf;
        }


        public constructor() {
        }


        /**
         * 开始播放飞行动画
         */
        public start(): void {
            if (this.target == null) return;
            this.floating = true;

            this.target.x = this.pStrat.x;
            this.target.y = this.pStrat.y;

            this._pCenter = Point.interpolate(this.pStrat, this.pEnd, 0.5);
            this._pCenter.y -= Math.abs(this._pCenter.x - this.pStrat.x) * this.distance;

            this._duration = this.duration;
            if (this._duration <= 0) this._duration = Point.distance(this.pStrat, this.pEnd) / this.durationFactor;

            this._startTime = TimeUtil.nowTime;
            lolo.stage.event_addListener(Event.PRERENDER, this.prerenderHandler, this);
        }

        /**
         * 每帧开始渲染前
         * @param event
         */
        private prerenderHandler(event: Event): void {
            let p: number = (TimeUtil.nowTime - this._startTime) / 1000 / this._duration;
            if (p > 1) p = 1;

            let nx: number = (1 - p) * (1 - p) * this.pStrat.x + 2 * p * (1 - p) * this._pCenter.x + p * p * this.pEnd.x;
            let ny: number = (1 - p) * (1 - p) * this.pStrat.y + 2 * p * (1 - p) * this._pCenter.y + p * p * this.pEnd.y;
            if (this.orientToBezier) {
                let ox: number = this.target.x;
                let oy: number = this.target.y;
                this.target.rotation = Math.atan2(ny - oy, nx - ox) * BezierFloat.RAD2DEG;
            }
            this.target.x = nx;
            this.target.y = ny;

            if (p == 1) this.finish();
        }


        private finish(): void {
            CachePool.recycle(this._pCenter);
            this._pCenter = null;

            if (this.target.parent != null) this.target.parent.removeChild(this.target);
            this.end(true);
        }


        /**
         * 结束播放浮动效果
         * @param complete 效果是否正常结束
         */
        public end(complete: boolean = false): void {
            lolo.stage.event_removeListener(Event.PRERENDER, this.prerenderHandler, this);
            this.floating = false;

            if (this.once) {
                BezierFloat._pool.push(this);
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