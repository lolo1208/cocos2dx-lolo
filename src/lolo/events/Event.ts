namespace lolo {


    /**
     * 事件基类
     * @author LOLO
     */
    export class Event {

        /**
         * 事件：进入新的一帧。
         * 需要注意：该事件只会在 UIManager（lolo.ui） 上抛出！
         */
        public static ENTER_FRAME: string = "enterFrame";

        /**
         * 事件：舞台尺寸有改变。
         * 需要注意：该事件只会在 UIManager 上抛出！
         */
        public static RESIZE: string = "stageResize";

        /**
         * 事件：子对象的尺寸有改变
         * DisplayObjectContainer 会对自己侦听该事件，如果子节点的尺寸有改变，应冒泡抛出该事件
         */
        public static CHILD_RESIZE: string = "childResize";


        /**事件类型*/
        public type: string;
        /**事件附带的数据*/
        public data: any;

        /**当前事件的侦听者*/
        public currentTarget: any;
        /**事件的真正抛出者*/
        public target: any;
        /**事件传播是否已停止*/
        public isPropagationStopped: boolean = false;


        constructor(type: string, data?: any) {
            this.type = type;
            this.data = data;
        }


        /**
         * 停止传播事件
         */
        public stopPropagation(): void {
            this.isPropagationStopped = true;
        }


        /**
         * 从池中获取一个事件对象
         * @param EventClass 事件class
         * @param type 事件类型
         * @param data 附带数据
         * @return {T}
         */
        public static create<T extends Event>(EventClass: {new (type: string): T; _eventPool?: Event[]},
                                              type: string,
                                              data?: any): T {
            let eventPool: Event[] = EventClass._eventPool;
            if (eventPool == null) {
                eventPool = EventClass._eventPool = [];
            }
            if (eventPool.length > 0) {
                let event: T = <T> eventPool.pop();
                event.type = type;
                event.data = data;
                event.isPropagationStopped = false;
                return event;
            }
            return new EventClass(type);
        }


        /**
         * 将事件对象回收到对应的池中
         * @param event
         */
        public static recycle(event: Event): void {
            event.target = event.currentTarget = event.data = null;
            let EventClass: any = Object.getPrototypeOf(event).constructor;
            EventClass._eventPool.push(event);
        }


        //
    }
}