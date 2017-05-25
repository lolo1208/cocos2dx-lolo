namespace lolo {


    /**
     * LRUCache的Itme数据
     * @author LOLO
     */
    export interface LRUCacheItem {
        /**该Item的值*/
        value: any;
        /**该Item占用的内存量（字节）*/
        memory: number;
        /**上次访问该Item的时间*/
        time: number;
    }


    /**
     * LRUCache的日志信息
     * @author LOLO
     */
    export interface LRUCacheLog {
        /**总占用内存量*/
        memory: number;
        /**缓存对象总数*/
        valueCount: number;
        /**总访问次数*/
        requestCount: number;
        /**命中次数（访问时，该内容已被缓存）*/
        hitCacheCount: number;
    }


    /**
     * 该数据集为哈希表数据。
     * 主要用途：缓存对象，并自动释放最近最少使用的对象(LRU:Least Recently Used)。
     * 满足其中一个情况，将会自动释放对象：
     *    1.超过了设置的最大内存值。
     *    2.对象在指定失效时间内未被使用过。
     * @author LOLO
     */
    export class LRUCache {
        /**缓存数据链表*/
        private _list: LinkedList;
        /**用于定期清理缓存数据*/
        private _clearTimer: Timer;
        /**日志和状态信息*/
        private _log: LRUCacheLog;

        /**
         * LRU缓存的最大内存，单位：字节
         */
        public maxMemorySize: number = 100 * 1024 * 1024;

        /**
         * 已缓存对象的失效时间，单位：毫秒
         */
        public deadline: number = 30 * 60 * 1000;

        /**
         * 缓存对象被清理时，调用的回调函数。
         * 该函数应有两个参数，handler(key:any, value:any):void
         */
        public disposeHandler: Handler;


        /**
         * 构造函数
         */
        public constructor() {
            this._list = new LinkedList();
            this._log = {memory: 0, valueCount: 0, requestCount: 0, hitCacheCount: 0};

            this._clearTimer = new Timer(5 * 60 * 1000, new Handler(this.clearTimerHandler, this));
            this._clearTimer.start();
        }


        /**
         * 添加一个值，以及对应的键。
         * 如果该键已经存在，将会释放掉之前的对象（值），替换成新的对象
         * @param key
         * @param value
         * @param memory 指定value的内存大小
         */
        public add(key: any, value: any, memory: number = 0): void {
            if (this._list.contains(key)) this.remove(key);
            this._list.push({value: value, memory: memory, time: TimeUtil.nowTime}, key);

            //缓存超标，删除激活时间较久（表头）的缓存
            this._log.memory += memory;
            if (this._log.memory > this.maxMemorySize) {
                while (this._log.memory > this.maxMemorySize && this._list.head != null) this.remove(this._list.head.key);
            }
        }


        /**
         * 移除一个已缓存的对象
         * @param key
         * @return 返回移除的对象
         */
        public remove(key: any): any {
            let item: LRUCacheItem = this._list.getValue(key);
            if (item == null) return;

            this._log.memory -= item.memory;//减少总内存使用量
            this._list.remove(key);

            if (this.disposeHandler != null) this.disposeHandler.execute(key, item.value);
            return item.value;
        }


        /**
         * 通过键获取值
         * @param key
         */
        public getValue(key: any): any {
            this._log.requestCount++;//增加请求总数
            let item: LRUCacheItem = this._list.getValue(key);
            if (item == null) return null;

            this._log.hitCacheCount++;//增加缓存命中数
            item.time = TimeUtil.nowTime;//更新激活时间
            this._list.moveToTail(key);

            return item.value;
        }


        /**
         * 指定的key是否已经被添加到缓存中了
         * @param key
         * @return
         */
        public contains(key: any): boolean {
            return this._list.contains(key);
        }


        /**
         * 周期查询对象在指定失效时间内是否未被使用过，并清除
         */
        private clearTimerHandler(): void {
            let curTime: number = TimeUtil.nowTime;
            while (this._list.head != null) {
                if (curTime - this._list.head.value.time > this.deadline)
                    this.remove(this._list.head.key);
                else
                    break;
            }
        }


        /**
         * 当前已经使用内存大小，单位：字节
         */
        public get currentMemorySize(): number {
            return this._log.memory;
        }


        /**
         * 日志和状态信息
         * @see lolo.LRUCacheLog
         * @return
         */
        public get log(): LRUCacheLog {
            this._log.valueCount = 0;
            let node: LinkedListNode = this._list.head;
            while (node != null) {
                this._log.valueCount++;
                node = node.next;
            }
            return this._log;
        }


        /**
         * 清空
         */
        public clean(): void {
            this._list.clean();
            let log: LRUCacheLog = this._log;
            log.memory = log.valueCount = log.requestCount = log.hitCacheCount = 0;
        }


        /**
         * 销毁
         * 在丢弃时，一定要调用该方法，以免导致内存泄漏
         */
        public destroy(): void {
            this._list.clean();
            this._clearTimer.reset();
            this._clearTimer = this._log = null;
        }

        //
    }
}