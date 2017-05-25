namespace lolo {


    /**
     * 倒计时工具（类中涉及到的时间单位均为 毫秒）
     * @author LOLO
     */
    export class Countdown {

        /**倒计时总时间*/
        private _totalTime: number;
        /**间隔时间*/
        private _intervalTime: number;
        /**倒计时开始时间（设置totalTime的那一刻）*/
        private _startTime: number;
        /**定时器运行时的回调函数，回调时会传递一个Boolean类型的参数，表示倒计时是否已经结束*/
        private _hander: Handler;
        /**倒计时工具是否正在运行中*/
        private _running: boolean;
        /**用于倒计时*/
        private _timer: Timer;


        public constructor(hander: Handler = null, totalTime: number = 0, intervalTime: number = 1000) {
            this._hander = hander;
            this._intervalTime = intervalTime;
            this.totalTime = totalTime;
        }


        /**
         * 开始运行倒计时工具
         * @param totalTime 倒计时总时间，0表示未变动
         */
        public start(totalTime: number = 0): void {
            if (totalTime != 0) this.totalTime = totalTime;

            if (this._intervalTime <= 0) {
                throwError("[Countdown] intervalTime 的值不能为：" + this._intervalTime);
            }

            this._running = true;
            if (this._timer == null) this._timer = new Timer(this._intervalTime, new Handler(this.timerHandler, this));
            this._timer.delay = this._intervalTime;
            this._timer.start();
            this.timerHandler();
        }

        /**
         * 计时器回调
         */
        private timerHandler(): void {
            let t: number = TimeUtil.nowTime - this._startTime;
            t = this._totalTime - t;
            let end: boolean = t <= 0;
            if (end) {
                this._running = false;
                this._timer.reset();
            }
            if (this._hander != null) this._hander.execute(end);
        }


        /**
         * 停止运行倒计时工具
         */
        public stop(): void {
            this._running = false;
            if (this._timer != null) this._timer.stop();
        }


        /**
         * 倒计时总时间
         */
        public set totalTime(value: number) {
            this._totalTime = value;
            this._startTime = TimeUtil.nowTime;
        }

        public get totalTime(): number {
            return this._totalTime;
        }


        /**
         * 间隔时间
         */
        public set intervalTime(value: number) {
            if (value == this._intervalTime) return;
            this._intervalTime = value;
            if (this._running) this.start();
        }

        public get intervalTime(): number {
            return this._intervalTime;
        }


        /**
         * 定时器运行时的回调。
         * 回调时会传递一个Boolean类型的参数，表示倒计时是否已经结束
         */
        public set hander(value: Handler) {
            this._hander = value;
        }

        public get hander(): Handler {
            return this._hander;
        }


        /**
         * 倒计时工具是否正在运行中
         */
        public get running(): boolean {
            return this._running;
        }


        /**
         * 倒计时开始时间（设置totalTime的那一刻）
         */
        public get startTime(): number {
            return this._startTime;
        }


        /**
         * 剩余时间（从设置totalTime的那一刻开始计算）
         */
        public get time(): number {
            if (this._totalTime <= 0 || isNaN(this._startTime)) return 0;
            let t: number = TimeUtil.nowTime - this._startTime;
            t = this._totalTime - t;
            if (t < 0) t = 0;
            return t;
        }

        /**
         * 剩余次数
         */
        public get count(): number {
            if (this._intervalTime > this._totalTime) return 0;
            if (this._intervalTime < 0 || this._intervalTime < 0) return 0;
            if (this._totalTime <= 0 || isNaN(this._startTime)) return 0;

            let t: number = TimeUtil.nowTime - this._startTime;
            t = this._totalTime - t;
            return Math.ceil(t / this._intervalTime);
        }

        //
    }
}