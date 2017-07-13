namespace lolo {


    /**
     * 日志事件
     * @author LOLO
     */
    export class LogEvent extends Event {

        /**添加了一条可分类的普通日志*/
        public static ADDED_LOG: string = "addedLog";

        /**添加了一条错误日志*/
        public static ERROR_LOG: string = "errorLog";

        /**添加了一条采样日志*/
        public static SAMPLE_LOG: string = "sampleLog";


        /**日志信息*/
        public info: LogInfo;


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}