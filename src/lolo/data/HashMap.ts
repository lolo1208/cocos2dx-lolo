namespace lolo {


    /**
     * 类描述
     * @author LOLO
     */
    export class HashMap extends EventDispatcher {

        /**值列表*/
        private _values: any[];
        /**与值列表对应的键列表*/
        private _keys: Dictionary;

        /**
         * 在数据有改变时，是否需要抛出 DataEvent.DATA_CHANGED 事件（默认不抛）
         */
        public dispatchChanged: boolean;


        /**
         * 构造一个哈希表数据
         * @param values 初始的值列表（Array 或 Vector）
         * @param keys 与值列表对应的键列表
         */
        public constructor(values?: any[], keys?: Dictionary) {
            super();
            this._values = (values == null) ? [] : values;
            this._keys = (keys == null) ? new Dictionary() : keys;
        }


        /**
         * 通过键获取值
         * @param key
         * @return
         */
        public getValueByKey(key: any): any {
            let index: number = this._keys.getItem(key);
            if (index == undefined) return null;
            return this.getValueByIndex(index);
        }

        /**
         * 通过索引获取值
         * @param index
         * @return
         */
        public getValueByIndex(index: number): any {
            return this._values[index];
        }

        /**
         * 通过键获取索引
         * @param key
         * @return
         */
        public getIndexByKey(key: any): number {
            let index: number = this._keys.getItem(key);
            return (index != undefined) ? index : -1;
        }

        /**
         * 通过值获取索引
         * @param value
         * @return
         */
        public getIndexByValue(value: any): number {
            for (let i = 0; i < this._values.length; i++) {
                if (this._values[i] == value) return i;
            }
            return -1;
        }

        /**
         * 通过键列表获取索引
         * @param keys
         * @return
         */
        public getIndexByKeys(keys: any[]): number {
            if (keys == null || keys.length == 0) return -1;

            let index: number = -1;
            let key: any;
            for (let i = 0; i < keys.length; i++) {
                key = keys[i];

                let valueIndex: number = this._keys.getItem(key);
                if (valueIndex == undefined) return -1;// 没有这个key

                if (index != -1) {
                    if (valueIndex != index) return -1;// 列表中的key不一致
                } else {
                    index = valueIndex;
                }
            }
            return index;
        }

        /**
         * 通过索引获取键列表
         * @param index
         * @return
         */
        public getKeysByIndex(index: number): any[] {
            let keys: any[] = [];
            for (let key in this._keys.list) {
                if (this._keys.getItem(key) == index) keys.push(key);
            }
            return keys;
        }


        /**
         * 通过索引设置值
         * @param index
         * @param value
         */
        public setValueByIndex(index: number, value: any): void {
            let oldValue: any = this._values[index];
            this._values[index] = value;
            this.dispatchDataEvent(index, oldValue, value);
        }

        /**
         * 通过键设置值
         * @param key
         * @param value
         */
        public setValueByKey(key: any, value: any): void {
            let index: number = this._keys.getItem(key);
            if (index != undefined) this.setValueByIndex(index, value);
        }


        /**
         * 移除某个键与值的映射关系
         * 注意，该方法并不是移除数据的方法。
         * 要移除数据请参考：removeByKey()、removeByIndex() 方法
         * @param key
         */
        public removeKey(key: any): void {
            this._keys.removeItem(key);
        }

        /**
         * 通过键移除对应的键与值
         * @param key
         */
        public removeByKey(key: any): void {
            let index: number = this._keys.getItem(key);
            if (index != undefined) this.removeByIndex(index);
        }

        /**
         * 通过索引移除对应的键与值
         * @param index
         */
        public removeByIndex(index: number): void {
            this._values.splice(index, 1);

            for (let key in this._keys.list) {
                //移除相关的key
                let valueIndex: number = this._keys.getItem(key);
                if (valueIndex == index) {
                    this._keys.removeItem(key);
                }
                //后面的索引减一
                else if (valueIndex > index) {
                    this._keys.setItem(key, valueIndex - 1);
                }
            }

            this.dispatchDataEvent();
        }


        /**
         * 添加一个值，以及对应的键列表，并返回该值的索引
         * @param value
         * @param keys
         * @return
         */
        public add(value: any, ...keys: any[]): number {
            let index: number = this._values.length;
            this._values.push(value);
            for (let i = 0; i < keys.length; i++) this._keys.setItem(keys[i], index);
            this.dispatchDataEvent();
            return index;
        }

        /**
         * 通过索引为该值添加一个键，并返回该值的索引
         * @param newKey
         * @param index
         * @return
         */
        public addKeyByIndex(newKey: any, index: number): number {
            this._keys.setItem(newKey, index);
            return index;
        }

        /**
         * 通过键为该值添加一个键，并返回该值的索引。如果没有源键将添加失败，并返回-1
         * @param newKey
         * @param key
         * @return
         */
        public addKeyByKey(newKey: any, key: any): number {
            let index: number = this._keys.getItem(key);
            if (index == undefined) {
                this.addKeyByIndex(newKey, index);
            }
            else {
                return -1;
            }
        }

        /**
         * 值列表
         */
        public set values(value: any[]) {
            this._values = value;
        }

        public get values(): any[] {
            return this._values;
        }

        /**
         * 与值列表对应的键列表
         */
        public set keys(value: Dictionary) {
            this._keys = value;
        }

        public get keys(): Dictionary {
            return this._keys;
        }

        /**
         * 值的长度
         */
        public get length(): number {
            return (this._values == null) ? 0 : this._values.length;
        }


        /**
         * 抛出数据改变事件
         */
        private dispatchDataEvent(index: number = -1, oldValue?: any, newValue?: any): void {
            if (!this.dispatchChanged) return;

            let event: DataEvent = Event.create(DataEvent, DataEvent.DATA_CHANGED);
            event.index = index;
            if (oldValue != null) event.oldValue = oldValue;
            if (newValue != null) event.newValue = newValue;
            this.event_dispatch(event);
        }


        /**
         * 克隆
         */
        public clone(): HashMap {
            let keys: Dictionary = new Dictionary();
            for (let key in this._keys.list) {
                keys.list[key] = this._keys.list[key];
            }
            return new HashMap(this._values.concat(), keys);
        }


        /**
         * 清空
         */
        public clean(): void {
            (this._values == null) ? this._values.length = 0 : this._values = [];
            this._keys.clean();
            this.dispatchDataEvent();
        }

        //
    }
}