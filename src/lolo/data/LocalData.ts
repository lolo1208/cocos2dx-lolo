namespace lolo {


    /**
     * 本地数据
     * 当无法在本地磁盘储存数据时，数据只存在内存中（防止后续操作报错）
     * @author LOLO
     */
    export class LocalData {

        /**当前key对应在内存中的数据*/
        public static data: any;
        /**存储到本地使用的 key*/
        public static key: string;


        public constructor() {
            throw new Error("不允许创建 LocalData 的实例");
        }


        /**
         * 初始化
         * @param key 储存 localStorage 时使用的 key
         */
        public static initialize(key: string): void {
            if (this.data != null) return;

            this.key = key;
            try {
                let data: string = cc.sys.localStorage.getItem(key);
                this.data = JSON.parse(data);
            }
            catch (error: Error) {
            }
            if (this.data == null) this.data = {};
        }


        /**
         * 保存数据到本地
         * @return 无法在本地储存数据时，将会返回 false
         */
        public static save(): boolean {
            try {
                cc.sys.localStorage.setItem(this.key, JSON.stringify(this.data));
                return true;
            }
            catch (error: Error) {
                return false;
            }
        }


        /**
         * 清空数据
         */
        public static clean(): void {
            this.data = {};
            try {
                cc.sys.localStorage.removeItem(this.key);
            } catch (error: Error) {
            }
        }


        //
    }
}