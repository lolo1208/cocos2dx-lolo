namespace lolo {


    /**
     * 模块基类
     * @author LOLO
     */
    export class Module extends Container {

        /**模块的名称*/
        public moduleName: string;


        public constructor() {
            super();
        }


        /**
         * 初始化该模块
         * 该方法只会被 UIManager 调用一次，请将 initUI() 等初始化事务放在该方法内
         */
        public initialize(): void {
            throwError("请重写 initialize() 方法，并将 initUI() 等初始化事务放在该方法内");
        }

        //
    }
}