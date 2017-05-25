namespace lolo {


    /**
     * Watcher 在 _data 中创建的对应的绑定相关属性
     * @author LOLO
     */
    interface WatcherPropInfo {
        /**正在侦听该属性改变的 Watcher 列表*/
        watchers?: Watcher[];
        /**当前值*/
        value?: any;
        /**绑定该值前，指定的 setter 方法*/
        setter?(value: any): void;
        /**绑定该值前，指定的 getter 方法*/
        getter?(): any;
    }


    /**
     * 用于监听数据值的改变
     * @author LOLO
     */
    export class Watcher {

        /**Watcher 在 data 中创建的对应的绑定相关属性*/
        private static WATCHERS: string = "__LOLO_WATCHERS__";

        /**数据源对象*/
        private _data: Object;
        /**数据源的属性名称*/
        private _dataProp: string;

        /**要绑定数据的目标对象*/
        private _target: Object;
        /**要绑定数据的目标对象的属性名称*/
        private _targetProp: string;

        /**数据改变时，触发的回调*/
        private _handler: Handler;

        /**当前是否正在监听数据的改变*/
        private _watching: boolean;


        /**
         * 获取对象的属性定义
         * @param obj 目标对象
         * @param prop 对象的属性名称
         */
        private static getPropertyDescriptor(obj: Object, prop: string): PropertyDescriptor {
            let data: Object = Object.getOwnPropertyDescriptor(obj, prop);
            if (data != null) return data;

            let prototype: Object = Object.getPrototypeOf(obj);
            if (prototype != null) return this.getPropertyDescriptor(prototype, prop);

            return null;
        }


        public constructor(data: Object, dataProp: string, handler: Handler = null, target: Object = null, targetProp: string = "") {
            this._data = data;
            this._dataProp = dataProp;
            this._handler = handler;
            this._target = target;
            this._targetProp = targetProp;

            this.watch();
        }


        /**
         * 启动并监听数据的改变
         */
        public watch(): void {
            if (this._watching) return;
            this._watching = true;

            //在 _data 中创建 ._dataProp 相关属性
            let data: Object = this._data[Watcher.WATCHERS];
            if (data == null) this._data[Watcher.WATCHERS] = data = {};

            //从未绑定过该属性
            let info: WatcherPropInfo = data[this._dataProp];
            if (info == null) {
                data[this._dataProp] = info = {
                    watchers: [],
                    value: this._data[this._dataProp]
                };

                //记录原来的 get 和 set 方法
                let propDesc: PropertyDescriptor = Watcher.getPropertyDescriptor(this._data, this._dataProp);
                if (propDesc != null) {
                    info.setter = propDesc.set;
                    info.getter = propDesc.get;
                }

                //重写 get 和 set 方法
                propDesc.set = function (value: any): void {
                    if (info.setter != null) info.setter.call(this, value);

                    //值有改变
                    if (value != info.value) {
                        info.value = value;
                        for (let i = 0; i < info.watchers.length; i++) {
                            let w: Watcher = info.watchers[i];
                            w.valueChanged.call(w, value);
                        }
                    }
                };

                propDesc.get = function (): any {
                    if (info.getter != null)
                        return info.getter.call(this);
                    else
                        return info.value;
                };

                delete propDesc.value;
                delete propDesc.writable;
                propDesc.enumerable = true;
                propDesc.configurable = true;
                Object.defineProperty(this._data, this._dataProp, propDesc);
            }
            info.watchers.push(this);
        }


        /**
         * 值已经改变
         * @param value 当前值
         */
        public valueChanged(value: any): void {
            if (this._handler != null) {
                this._handler.execute(value);
            }
            if (this._target != null) {
                this._target[this._targetProp] = value;
            }
        }


        /**
         * 停止监听数据的改变。
         * 停止后，您可以调用 watch() 方法，再次启用侦听
         */
        public unwatch(): void {
            if (!this._watching) return;
            this._watching = false;

            let watchers: Watcher[] = this._data[Watcher.WATCHERS][this._dataProp].watchers;
            for (let i = 0; i < watchers.length; i++) {
                if (watchers[i] == this) {
                    watchers.splice(i, 1);
                    break;
                }
            }
        }


        /**
         * 当前是否正在监听数据的改变
         */
        public get watching(): Boolean {
            return this._watching;
        }

        //
    }
}