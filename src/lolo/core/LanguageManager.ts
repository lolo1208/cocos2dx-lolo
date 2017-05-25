namespace lolo {


    /**
     * 语言包管理
     * @author LOLO
     */
    export class LanguageManager {
        /**提取完成的语言包储存在此*/
        private _data: Object;


        /**
         * 构造函数
         */
        public constructor() {

        }


        /**
         * 初始化语言包
         */
        public initialize(): void {
            this._data = loader.getResByConfigName("language", true);
        }


        /**
         * 通过ID在语言包中获取对应的字符串
         * @param id 在语言包中的ID
         * @param args 用该参数替换字符串内的"{n}"标记
         * @return
         */
        public getLanguage(id: string, ...args: any[]): string {
            var str: string = this._data[id];
            if (args.length > 0) str = StringUtil.substitute(str, args);
            return str;
        }

        //
    }
    //
}