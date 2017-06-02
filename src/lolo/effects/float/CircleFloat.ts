namespace lolo {


    /**
     * 根据 原点、半径、和效果时长 播放圆形浮动效果
     * @author LOLO
     */
    export class CircleFloat implements IFloat {

        /**弧度实数（1角度等于多少弧度）*/
        private static RADIAN: number = Math.PI / 180;

        /**缓存池*/
        private static _pool: CircleFloat[] = [];

        /**应用该效果的目标*/
        public target: cc.Node;
        /**浮动结束后的回调。调用该方法时，将会传递一个boolean类型的参数，表示效果是否正常结束。onComplete(complete:boolean, float:IFloat)*/
        public onComplete: Handler;
        /**是否正在浮动中*/
        public floating: boolean;
        /**是否只播放一次，播放完毕后，将会自动回收到池中*/
        public once: boolean;

        /**中心点*/
        public pCenter: Point;
        /**效果时长（秒）*/
        public duration: number;
        /**起点位置*/
        public pStart: Point;
        /**是否为反向（逆时针）播放*/
        public reverse: boolean;

        /**半径*/
        private _radius: number;
        /**开始时间*/
        private _startTime: number;
        /**起始偏移角度*/
        private _startAngle: number;


        /**
         * 创建，或从池中获取一个 CircleFloat 实例。
         * ！！！
         * 注意：：使用 CircleFloat.once() 创建的实例 once 属性默认为 true。
         * 播放完毕后，实例(_pool) 和 target(CachePool) 将会自动回收到池中。
         * ！！！
         * @param target 应用该效果的目标
         * @param pCenter 原点
         * @param duration 效果时长（秒）
         * @param onComplete 飞行完成时的回调。onComplete(complete:boolean, float:IFloat)
         * @param pStart 起点位置，默认值null，表示使用 target 当前位置
         * @param reverse 是否为反向（逆时针）播放
         * @param start 是否立即开始播放
         */
        public static once(target: cc.Node = null,
                           pCenter: Point = null,
                           duration: number = 0,
                           onComplete: Handler = null,
                           pStart: Point = null,
                           reverse: boolean = false,
                           start: boolean = true): CircleFloat {
            let float: CircleFloat = (this._pool.length > 0) ? this._pool.pop() : new CircleFloat();
            float.target = target;
            float.once = true;
            float.pCenter = pCenter;
            float.duration = duration;
            float.onComplete = onComplete;
            float.pStart = pStart;
            float.reverse = reverse;
            if (start) float.start();
            return float;
        }


        public constructor() {
        }


        /**
         * 开始播放飞行动画
         */
        public start(): void {
            if (this.target == null || this.pCenter == null || this.duration <= 0) return;
            this.floating = true;

            let pStart: Point;
            if (this.pStart == null) pStart = this.pStart = CachePool.getPoint(this.target.x, this.target.y);
            let x: number = this.pStart.x - this.pCenter.x;
            let y: number = this.pStart.y - this.pCenter.y;
            this._radius = Point.distance(this.pStart, this.pCenter);// 得出半径
            if (pStart != null) CachePool.recycle(pStart);

            let hypotenuse: number = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));// 斜边
            let cos: number = x / hypotenuse;// 斜边长度
            let radian: number = Math.acos(cos);// 弧度
            let angle: number = 180 / (Math.PI / radian);// 角度
            if (y < 0) angle = -angle;
            else if (y == 0 && x < 0) angle = 180;
            this._startAngle = angle;// 得出起始偏移角度

            this._startTime = TimeUtil.nowTime;
            lolo.ui.event_addListener(Event.ENTER_FRAME, this.enterFrameHandler, this);
        }

        /**
         * 帧刷新
         * @param event
         */
        private enterFrameHandler(event: Event): void {
            // 根据时间计算出当前角度
            let time: number = (TimeUtil.nowTime - this._startTime) / 1000;
            let angle: number = this.reverse
                ? Math.max(0, (this.duration - time) / this.duration * 360)
                : Math.min(360, time / this.duration * 360);
            // 根据角度得出弧度
            let radian: number = CircleFloat.RADIAN * (angle + this._startAngle);
            // 根据弧度和半径得出当前位置
            this.target.x = this.pCenter.x + this._radius * Math.cos(radian);
            this.target.y = this.pCenter.y + this._radius * Math.sin(radian);

            if (angle == 360 || angle == 0) this.finish();
        }


        private finish(): void {
            if (this.target.parent != null) this.target.parent.removeChild(this.target);
            this.end(true);
        }


        /**
         * 结束播放浮动效果
         * @param complete 效果是否正常结束
         */
        public end(complete: boolean = false): void {
            lolo.ui.event_removeListener(Event.ENTER_FRAME, this.enterFrameHandler, this);
            this.floating = false;

            if (this.once) {
                CircleFloat._pool.push(this);
                CachePool.recycle(this.target);
            }
            this.target = null;

            let handler: Handler = this.onComplete;
            this.onComplete = null;
            if (handler != null) handler.execute(complete, this);
        }

        //
    }
}