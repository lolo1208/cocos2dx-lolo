namespace lolo {


    /**
     * 时间操作工具
     * @author LOLO
     */
    export class TimeUtil {

        /**时间类型，毫秒*/
        public static TYPE_MS: string = "ms";
        /**时间类型，秒*/
        public static TYPE_S: string = "s";
        /**时间类型，分钟*/
        public static TYPE_M: string = "m";
        /**时间类型，小时*/
        public static TYPE_H: string = "h";


        /**时间单位，天*/
        public static day: string = "Day";
        /**时间单位，天(复数)*/
        public static days: string = "Days";
        /**时间单位，小时*/
        public static hour: string = "Hour";
        /**时间单位，分钟*/
        public static minute: string = "Minute";
        /**时间单位，秒*/
        public static second: string = "Second";

        /**格式化时，天的格式["v":值，"u":单位]*/
        public static dFormat: string = "vu";
        /**格式化时，小时的格式["v":值，"u":单位]*/
        public static hFormat: string = "v:";
        /**格式化时，分钟的格式["v":值，"u":单位]*/
        public static mFormat: string = "v:";
        /**格式化时，秒的格式["v":值，"u":单位]*/
        public static sFormat: string = "v";


        /**当前Date，每帧更新一次*/
        public static nowDate: Date;
        /**当前时间（基于 nowDate，自 1970 年 1 月 1 日午夜（通用时间）以来的毫秒数）。每帧更新一次*/
        public static nowTime: number = 0;


        /**程序启动的时间*/
        private static _startupTime: number = 0;


        /**
         * 格式化时间
         * @param time 时间的值
         * @param type 时间的类型
         * @param dFormat 天的格式["v":值，"u":单位]
         * @param hFormat 小时的格式["v":值，"u":单位]
         * @param mFormat 分钟的格式["v":值，"u":单位]
         * @param sFormat 秒的格式["v":值，"u":单位]
         * @param hFilled 是否补齐小时位
         * @param dToH 是否将天位转化成小时位
         * @return 至少包含分钟和秒的格式化时间
         */
        public static format(time: number,
                             type: string = "ms",
                             dFormat: string = "",
                             hFormat: string = "",
                             mFormat: string = "",
                             sFormat: string = "",
                             hFilled: boolean = false,
                             dToH: boolean = false): string {
            //转化成毫秒
            time = lolo.TimeUtil.convertType(type, lolo.TimeUtil.TYPE_MS, time);

            let h: number = Math.floor(time / 3600000);
            let m: number = Math.floor((time % 3600000) / 60000);
            let s: number = Math.floor(Math.ceil((time % 3600000) % 60000 / 1000));
            let d: number = Math.floor(h / 24);
            if (s == 60) {
                s = 0;
                m++;
            }
            if (m == 60) {
                m = 0;
                h++;
            }

            let str: string = "";

            //天
            if (d > 0 && !dToH) {
                if (dFormat == "") dFormat = TimeUtil.dFormat;
                str += dFormat.replace(/u/g, (d > 1) ? TimeUtil.days : TimeUtil.day);
                str = str.replace(/v/g, StringUtil.leadingZero(d));
            }

            //小时
            if (h > 0 || d > 0 || hFilled) {
                if (hFormat == "") hFormat = TimeUtil.hFormat;
                str += hFormat.replace(/u/g, TimeUtil.hour);
                str = str.replace(/v/g, StringUtil.leadingZero(dToH ? h : h % 24));
            }

            //分钟
            if (mFormat == "") mFormat = TimeUtil.mFormat;
            str += mFormat.replace(/u/g, TimeUtil.minute);
            str = str.replace(/v/g, StringUtil.leadingZero(m));

            //秒
            if (sFormat == "") sFormat = TimeUtil.sFormat;
            str += sFormat.replace(/u/g, TimeUtil.second);
            str = str.replace(/v/g, StringUtil.leadingZero(s));

            return str;
        }


        /**
         * 转换时间类型
         * @param typeFrom 原来的类型
         * @param typeTo 要转换成什么类型
         * @param value 时间原来类型的值
         * @return
         */
        public static convertType(typeFrom: string, typeTo: string, value: number): number {
            if (typeFrom == typeTo) return value;

            //转换成毫秒
            switch (typeFrom) {
                case TimeUtil.TYPE_S:
                    value *= 1000;
                    break;
                case TimeUtil.TYPE_M:
                    value *= 60000;
                    break;
                case TimeUtil.TYPE_H:
                    value *= 3600000;
                    break;
            }

            //返回指定类型
            switch (typeTo) {
                case TimeUtil.TYPE_S:
                    return value / 1000;
                case TimeUtil.TYPE_M:
                    return value / 60000;
                case TimeUtil.TYPE_H:
                    return value / 3600000;
                default:
                    return value;
            }
        }


        /**
         * 获取精确时间
         * 自 1970 年 1 月 1 日午夜（通用时间）以来的毫秒数
         * @return {number}
         */
        public static getTime(): number {
            return new Date().getTime();
        }


        /**
         * 获取格式化的时间
         * @param date 已创建的 Date 对象，如果该值为 null，将使用 nowDate
         * @param ymdh 是否需要年、月、日和小时的值
         * @return
         */
        public static getFormatTime(date: Date = null, ymdh: boolean = false): string {
            if (date == null) date = this.nowDate;

            let str: string = "";
            if (ymdh) {
                str += date.getFullYear() + "/";
                str += StringUtil.leadingZero(date.getMonth() + 1) + "/";
                str += StringUtil.leadingZero(date.getDate()) + " ";
                str += StringUtil.leadingZero(date.getHours()) + ":";
            }
            str += StringUtil.leadingZero(date.getMinutes()) + ":";
            str += StringUtil.leadingZero(date.getSeconds());

            return str;
        }


        /**
         * 初始化
         */
        public static initialize(): void {
            if (TimeUtil._startupTime == 0) TimeUtil._startupTime = TimeUtil.getTime();
        }


        /**
         * 获取程序已运行时间
         */
        public static getRunningTime(): number {
            return TimeUtil.getTime() - TimeUtil._startupTime;
        }

        //
    }
}