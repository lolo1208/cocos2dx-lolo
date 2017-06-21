namespace lolo {


    /**
     * Object工具
     * @author LOLO
     */
    export class ObjectUtil {


        /**
         * 浅拷贝数据
         * 如果需要将 from 和 to 中复杂数据值（值为 Object 或 Array）拷贝成两份数据，请使用 ObjectUtil.clone()
         * @see lolo.ObjectUtil.clone()
         * @param from
         * @param to
         */
        public static copy(from: any, to: any): void {
            for (let key in from) {
                to[key] = from[key];
            }
        }


        /**
         * 深度克隆一个对象
         * @param target
         * @return
         */
        public static clone(target: any): any {
            if (target == null || typeof target != "object") return target;

            if (target instanceof Object) {
                let newObj: Object = {};
                for (let prop in target) {
                    newObj[prop] = ObjectUtil.clone(target[prop]);
                }
                return newObj;
            }

            if (ObjectUtil.isArray(target)) {
                let newArr: any[] = [];
                let len: number = target.length;
                for (let i = 0; i < len; ++i) {
                    newArr[i] = ObjectUtil.clone(target[i]);
                }
                return newArr;
            }
        }


        //


        /**
         * 获取界面配置下的指定子集
         * @param config 目标config对象
         * @param chains 子集访问链
         * @return
         */
        public static getConfigChild(config: any, chains: string | string[]): any {
            let list: string[];
            if (Array.isArray(chains)) list = <string[]>chains;
            else list = (<string>chains).split(".");

            if (list.length == 0) return config;

            for (let i = 0; i < config.children.length; i++) {
                let child: any = config.children[i];
                if (child.name == list[0]) {
                    list.shift();
                    return list.length == 0
                        ? child
                        : ObjectUtil.getConfigChild(child, list);
                }
            }
            return null;
        }


        /**
         * 验证传入的对象是否为字符串
         * @param str
         */
        public static isString(str: any): boolean {
            return Object.prototype.toString.call(str) === "[object String]";
        }


        /**
         * 验证传入的对象是否为数组
         * @param arr
         */
        public static isArray(arr: any): boolean {
            return Object.prototype.toString.call(arr) === "[object Array]";
        }


        /**
         * 获取类实例对应的类名称
         * @param target 直接创建的cc对象，只能识别显示对象。TypeScript 实现的任意类的实例
         */
        public static getClassName(target: any): string {
            let str: string = Object.getPrototypeOf(target).constructor.toString();
            let start: number = str.indexOf(" ") + 1;
            let end: number = str.indexOf("(");
            return (start == end)
                ? target._className// target 是直接创建的cc对象
                : str.substring(start, end);
        }


        //
    }
}