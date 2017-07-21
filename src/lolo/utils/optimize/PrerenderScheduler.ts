namespace lolo {


    /**
     * 预渲染回调详情
     * @author LOLO
     */
    export interface PrerenderHandlerInfo {
        priority?: number;
        handler?: Handler;
    }


    /**
     * 当前帧即将开始渲染时，进行回调的控制器
     * @author LOLO
     */
    export class PrerenderScheduler {

        /**待处理的回调信息列表*/
        private static _handlers: Dictionary = new Dictionary();
        /**正在处理的回调信息列表*/
        private static _curHandlers: Dictionary = new Dictionary();
        /**当前是否正在处理回调*/
        private static _executing: boolean = false;


        /**
         * 添加一个 Handler，程序会在当前帧即将开始渲染时调用它。
         * - handler 在一帧内只会被调用一次
         * - 同一个 handler 只能被添加一次，再次添加只会覆盖之前的 priority
         * @param handler 回调 Handler
         * @param priority 优先级
         */
        public static add(handler: Handler, priority: number = 0): void {
            let info: PrerenderHandlerInfo = this._handlers.getItem(handler);
            if (info == null)
                this._handlers.setItem(handler, {handler: handler, priority: priority});
            else
                info.priority = priority;

            lolo.stage.event_addListener(Event.PRERENDER, this.prerenderHandler, this);
        }


        /**
         * 移除一个 handler
         * @param handler
         */
        public static remove(handler: Handler): void {
            this._handlers.removeItem(handler);
            this._curHandlers.removeItem(handler);
        }


        /**
         * 当前帧即将开始渲染，处理回调
         * @param event
         */
        private static prerenderHandler(event?: Event): void {
            lolo.stage.event_removeListener(Event.PRERENDER, this.prerenderHandler, this);
            if (this._executing) return;

            let infoList: PrerenderHandlerInfo[] = [];
            let list: any = this._handlers.list;
            for (let key in list) infoList.push(list[key]);
            let len: number = infoList.length;
            if (len == 0) return;

            this._executing = true;
            let handlers: Dictionary = this._curHandlers;
            this._curHandlers = this._handlers;
            this._handlers = handlers;
            handlers.clean();

            infoList = infoList.sort(this.sortHandlerByPriority);
            for (let i = 0; i < len; i++) {
                let handler: Handler = infoList[i].handler;
                // 当前回调 没有在 其他回调 中被移除
                if (this._curHandlers.hasItem(handler)) {
                    handler.execute();
                }
            }

            this._executing = false;
            // 回调中新加了回调，在这帧中继续处理
            for (let key in this._handlers.list) {
                this.prerenderHandler();
                return;
            }
        }


        /**
         * 根据 handler 优先级进行排序的方法
         */
        private static sortHandlerByPriority(info1: PrerenderHandlerInfo, info2: PrerenderHandlerInfo): number {
            return info2.priority - info1.priority;
        }


        //
    }
}