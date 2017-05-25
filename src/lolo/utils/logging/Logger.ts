namespace lolo {


    /**
     * 日志信息
     */
    export interface LogInfo {
        /**日志类型*/
            type: string;
        /**日志内容*/
        message: string;
        /**产生这条日志的时间*/
        date: string;
    }


    /**
     * 网络通信日志信息
     */
    export interface NetworkLogInfo {
        /**服务器类型*/
        serviceType: string;
        /**网络通信日志类型*/
            type: string;
        /**接口命令*/
        command: string;
        /**代号*/
        token: number;
        /**发送的数据*/
        sendData?: Object;
        /**收到的数据*/
        data: Object;
        /**通信耗时*/
        time?: number;
        /**产生这条日志的时间*/
        date: string;
    }


    /**
     * 日志记录
     * @author LOLO
     */
    export class Logger {
        /**调试的日志类型*/
        public static LOG_TYPE_DEBUG: string = "debug";
        /**记录信息的日志类型*/
        public static LOG_TYPE_INFO: string = "info";
        /**警告的日志类型*/
        public static LOG_TYPE_WARN: string = "warn";
        /**错误的日志类型*/
        public static LOG_TYPE_ERROR: string = "error";
        /**致命错误的日志类型*/
        public static LOG_TYPE_FATAL: string = "fatal";

        /**网络通信数据的日志类型 - 全部*/
        public static LOG_TYPE_NETWORK_ALL: string = "networkAll";
        /**网络通信数据的日志类型 - 通信成功*/
        public static LOG_TYPE_NETWORK_SUCC: string = "networkSucc";
        /**网络通信数据的日志类型 - 通信失败*/
        public static LOG_TYPE_NETWORK_FAIL: string = "networkFail";
        /**网络通信数据的日志类型 - 后台主动推送*/
        public static LOG_TYPE_NETWORK_PUSH: string = "networkPush";


        /**日志的最长记录条数（各类型单独统计）*/
        public static logCount: number = 50;


        /**用于事件注册和调度*/
        private static _ed: EventDispatcher = new EventDispatcher();
        /**日志列表*/
        private static _logList: Object = {};


        /**
         * 添加一条分类的普通日志（存入 string 列表）
         * @param message 日志消息
         * @param type 日志类型
         * @param disEvent 是否抛出 LogEvent.ADDED_LOG 事件
         */
        public static addLog(message: string, type: string = "debug", disEvent: boolean = false): void {
            let list: string[] = Logger._logList[type];
            if (list == undefined) list = Logger._logList[type] = [];
            if (list.length > Logger.logCount) list.shift();
            list.push(message);

            console.log("[LOG:" + type + "] " + message);

            if (disEvent) {
                Logger.dispatchLogEvent(LogEvent.ADDED_LOG, {
                    type: type,
                    message: message,
                    date: TimeUtil.getFormatTime()
                });
            }
        }


        /**
         * 添加一条错误日志（存入 LogInfo 列表）
         * @param message
         */
        public static addErrorLog(message: string): void {
            let log: LogInfo = {
                type: Logger.LOG_TYPE_ERROR,
                message: message,
                date: TimeUtil.getFormatTime()
            };

            let list: LogInfo[] = Logger._logList[Logger.LOG_TYPE_ERROR];
            if (list == undefined) list = Logger._logList[Logger.LOG_TYPE_ERROR] = [];
            if (list.length > Logger.logCount) list.shift();
            list.push(log);

            console.log("[ERROR]:", log.date, "\n" + log.message);

            Logger.dispatchLogEvent(LogEvent.ERROR_LOG, log);
        }


        /**
         * 添加一条网络通信日志（存入 NetworkLogInfo 列表）
         * @param log
         */
        public static addNetworkLog(log: NetworkLogInfo): void {
            let list: NetworkLogInfo[] = Logger._logList[log.type];
            if (list == undefined) list = Logger._logList[log.type] = [];
            if (list.length > Logger.logCount) list.shift();
            list.push(log);

            list = Logger._logList[Logger.LOG_TYPE_NETWORK_ALL];
            if (list == undefined) list = Logger._logList[Logger.LOG_TYPE_NETWORK_ALL] = [];
            if (list.length > Logger.logCount) list.shift();
            list.push(log);
        }


        /**
         * 添加一条采样日志
         * @param type 日志类型
         * @param args 日志的参数
         */
        public static addSampleLog(type: string, ...args): void {
            let message: string;
            if (ui == null || ui.currentSceneName == null) {
                message = "none";
            }
            else {
                message = ui.currentSceneName.substr(ui.currentSceneName.lastIndexOf(".") + 1);
            }

            for (let i = 0; i < args.length; i++) {
                message += "#";
                message += args[i];
            }

            Logger.addLog(message, type);
            Logger.dispatchLogEvent(LogEvent.SAMPLE_LOG, {
                type: type,
                message: message,
                date: TimeUtil.getFormatTime()
            });
        }


        /**
         * 获取指定类型的日志列表
         * @param type 日志类型
         * @return 普通日志:string[]，错误日志:LogInfo[]，网络通信日志:NetworkLogInfo[]
         */
        public static getLog(type: string = "debug"): any[] {
            if (Logger._logList[type] == undefined) return [];
            return Logger._logList[type];
        }


        /**
         * 解析并记录全局异常（程序运行时产生的错误）
         * native 没有 window.onerror()
         * @param msg
         * @param url
         * @param line
         * @param col
         * @param error
         * @return {boolean}
         */
        public static uncaughtErrorHandler(msg: string, url: string, line: number, col: number, error: any): boolean {
            setTimeout(function () {
                //不一定所有浏览器都支持col参数
                col = col || (window["event"] && window["event"]["errorCharacter"]) || 0;

                msg = "";
                msg += "url: " + url + "\n";
                msg += "line: " + line + ",  ";
                msg += "col: " + col + "\n";

                //浏览器有堆栈信息，就直接使用
                if (!!error && !!error.stack) {
                    msg += error.stack.toString();
                }
                //通过callee拿堆栈信息
                else if (!!arguments.callee) {
                    let stack: string = "";
                    let n: number = 0;
                    let caller: Function = arguments.callee.caller;
                    while (caller != null) {
                        if (stack != "") stack += "\n";
                        stack += caller.toString();

                        //最多取5层堆栈信息
                        n++;
                        caller = (n == 5) ? null : caller.caller;
                    }
                    msg += "stack: \n" + stack;
                }

                Logger.addErrorLog(msg);
            }, 0);
            return true;
        }


        /**
         * 抛出日志相关事件
         */
        private static dispatchLogEvent(type: string, info: LogInfo): void {
            let event: LogEvent = Event.create(LogEvent, type);
            event.info = info;
            this._ed.event_dispatch(event);
        }


        public static event_addListener(type: string, listener: Function, caller: any, priority: number = 0, ...args: any[]): void {
            if (args.length == 0) {
                this._ed.event_addListener(type, listener, caller, priority);
            }
            else {
                args = [type, listener, caller, priority].concat(args);
                this._ed.event_addListener.apply(this._ed, args);
            }
        }

        public static event_removeListener(type: string, listener: Function, caller: any): void {
            this._ed.event_removeListener(type, listener, caller);
        }

        public static event_dispatch(event: Event, bubbles: boolean = false, release: boolean = true): void {
            this._ed.event_dispatch(event, bubbles, release);
        }

        public static event_hasListener(type: string): boolean {
            return this._ed.event_hasListener(type);
        }

        //
    }
}