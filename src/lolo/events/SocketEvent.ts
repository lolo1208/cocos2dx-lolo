/// <reference path="../events/Event.ts"/>


namespace lolo {


    /**
     * Socket / WebSocket 相关事件
     * @author LOLO
     */
    export class SocketEvent extends Event {


        /**建立连接*/
        public static CONNECT: string = "connect";

        /**收到数据*/
        public static DATA: string = "data";

        /**连接错误*/
        public static ERROR: string = "error";

        /**关闭*/
        public static CLOSE: string = "close";


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}