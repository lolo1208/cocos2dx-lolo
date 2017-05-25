namespace lolo {


    /**
     * HTTP请求相关事件
     * @author LOLO
     */
    export class HttpRequestEvent extends Event {


        /**HTTP请求结束（侦听该事件，如果 status="complete" 表示请求成功）*/
        public static END: string = "requestEnd";

        /**HTTP请求进度有变化（native 不会产生该事件）*/
        public static PROGRESS: string = "progress";


        /**结束状态（LOADEND 事件才会有该属性）*/
        public endStatus: string;


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}