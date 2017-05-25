namespace lolo {


    /**
     * 剩余时间（CD时间）
     * @author LOLO
     */
    export class LastTime {

        /**开始计时的时间戳*/
        private _initTime: number;
        /**剩余时间*/
        private _lastTime: number;


        /**
         * 构造函数
         * @param time
         * @param type
         */
        public constructor(time: number = 0, type: string = "ms") {
            this.setTime(time, type);
        }


        /**
         * 设置剩余时间
         * @param time 时间的值
         * @param type 时间的类型
         */
        public setTime(time: number, type: string = "ms"): void {
            this._initTime = TimeUtil.nowTime;
            this._lastTime = TimeUtil.convertType(type, TimeUtil.TYPE_MS, time);
        }


        /**
         * 获取剩余时间
         * @param type 时间的类型
         * @return
         */
        public getTime(type: string = "ms"): number {
            let time: number = this._lastTime - (TimeUtil.nowTime - this._initTime);
            time = TimeUtil.convertType(TimeUtil.TYPE_MS, type, time);
            if (time < 0) time = 0;
            return time;
        }


        /**
         * 获取初始化时的时间
         * @return
         */
        public get initTime(): number {
            return this._initTime;
        }

        //
    }
}