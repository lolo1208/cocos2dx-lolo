namespace lolo {


    /**
     * 事件派发器接口
     * @author LOLO
     */
    export interface IEventDispatcher {
        event_addListener(type: string, listener: Function, caller: any, priority: number = 0, ...args: any[]): void;
        event_removeListener(type: string, listener: Function, caller: any): void;
        event_dispatch(event: Event, bubbles: boolean = false, recycle: boolean = true): void;
        event_hasListener(type: string): boolean;
    }

    /**
     * 事件注册者的信息
     * @author LOLO
     */
    export interface EventListenerInfo {
        type: string;
        listener: Function;
        caller: any;
        priority: number;
        args: any[];
    }


    /**
     * 事件派发器，负责进行事件的发送和侦听
     * @author LOLO
     */
    export class EventDispatcher implements IEventDispatcher {

        private _eventMap: any;

        /**事件派发器对应的目标（组合模式下）*/
        private _target: IEventDispatcher;


        public constructor(target?: IEventDispatcher) {
            this._eventMap = {};
            if (target != null) this._target = target;
        }


        public event_addListener(type: string, listener: Function, caller: any, priority: number = 0, ...args: any[]): void {
            if (this._eventMap[type] == null) this._eventMap[type] = [];
            let list: EventListenerInfo[] = this._eventMap[type];

            let index: number = -1;
            let info: EventListenerInfo;
            for (let i = 0; i < list.length; i++) {
                info = list[i];

                if (info.listener == listener && info.caller == caller)
                    return; // 已注册

                if (index == -1 && info.priority < priority)
                    index = i;
            }

            info = {type: type, listener: listener, caller: caller, priority: priority, args: args};

            if (index !== -1)
                list.splice(index, 0, info);
            else
                list.push(info);
        }


        public event_removeListener(type: string, listener: Function, caller: any): void {
            let list: EventListenerInfo[] = this._eventMap[type];
            if (list == null || list.length == 0) return;

            for (let i = 0; i < list.length; i++) {
                let info: EventListenerInfo = list[i];
                if (info.listener === listener && info.caller === caller) {
                    list.splice(i, 1);
                    break;
                }
            }

            if (list.length == 0) delete this._eventMap[type];
        }


        public event_dispatch(event: Event, bubbles: boolean = false, recycle: boolean = true): void {
            let target: IEventDispatcher = (this._target != null) ? this._target : this;
            if (event.target == null) event.target = target;
            event.currentTarget = target;

            let list: EventListenerInfo[] = this._eventMap[event.type];
            if (list != null && list.length > 0) {
                list = list.concat();
                let len: number = list.length;
                for (let i = 0; i < len; i++) {
                    let info: EventListenerInfo = list[i];
                    if (info.args.length > 0) {
                        let args: any[] = info.args.concat();
                        args.unshift(event);
                        info.listener.apply(info.caller, args);
                    }
                    else {
                        info.listener.call(info.caller, event);
                    }
                    if (event.isPropagationStopped) break;
                }
            }

            // 事件还没停止、是显示对象、需要继续冒泡
            if (bubbles && !event.isPropagationStopped
                && this._target instanceof cc.Node
                && this._target != lolo.stage
                && this._target["parent"] != null
            ) {
                (<IEventDispatcher>(<cc.Node>this._target).parent).event_dispatch(event, bubbles, recycle);
            }
            else if (recycle) {
                Event.recycle(event);
            }
        }


        public event_hasListener(type: string): boolean {
            return this._eventMap[type] != null;
        }


        //
    }
}