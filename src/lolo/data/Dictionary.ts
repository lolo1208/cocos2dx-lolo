namespace lolo {


    /**
     * 字典类型数据集合
     * @author LOLO
     */
    export class Dictionary {

        /**字典在各函数传入的 key 对象上 创建的唯一 key 属性*/
        private static ONLY_KEY: string = "__LOLO_DOK__";
        /**key 计数，不重复的 key 值*/
        private static _keyCount: number = 0;

        /**已创建好映射关系的键值列表*/
        public list: any;


        /**
         * 构造函数
         */
        public constructor() {
            this.list = {};
        }


        /**
         * 设置一个值，以及对应的键
         * @param key
         * @param value
         */
        public setItem(key: any, value: any): void {
            // 尝试添加 ONLY_KEY 属性
            if (key[Dictionary.ONLY_KEY] == undefined) {
                key[Dictionary.ONLY_KEY] = Dictionary.ONLY_KEY + (++Dictionary._keyCount);
            }
            // 添加成功，key 值改为 ONLY_KEY
            if (key[Dictionary.ONLY_KEY] != undefined) {
                key = key[Dictionary.ONLY_KEY];
            }
            this.list[key] = value;
        }


        /**
         * 通过键获取对应的值
         * @param key
         */
        public getItem(key: any): any {
            if (key[Dictionary.ONLY_KEY] != undefined) key = key[Dictionary.ONLY_KEY];
            return this.list[key];
        }


        /**
         * 通过键移除对应的 Item
         * @param key
         */
        public removeItem(key: any): void {
            if (key[Dictionary.ONLY_KEY] != undefined) key = key[Dictionary.ONLY_KEY];
            delete this.list[key];
        }


        /**
         * 是否已经包含该 key 与 value
         */
        public hasItem(key: any): boolean {
            if (key[Dictionary.ONLY_KEY] != undefined) key = key[Dictionary.ONLY_KEY];
            return this.list[key] != undefined;
        }


        /**
         * 清空字典
         */
        public clean(): void {
            this.list = {};
        }

        //
    }
}