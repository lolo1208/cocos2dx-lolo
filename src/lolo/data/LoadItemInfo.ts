namespace lolo {


    /**
     * 加载项数据模型
     * @author LOLO
     */
    export class LoadItemInfo {
        /**优先级为0时，默认递增的优先级*/
        private static _priority: number = 0;

        /**在配置文件(ResConfig)中的名称*/
        public configName: string;
        /**url的替换参数*/
        public urlArgs: string[];

        /**文件的url（未格式化的url）*/
        public url: string;
        /**文件的类型（后缀为 ui 或 ani，可以不用指定类型）*/
        public type: string;
        /**文件的名称（不是必填，可重复）*/
        public name: string;
        /**在加载该文件之前，需要加载好的文件url列表（未格式化的url）*/
        public urlList: string[];

        /**是否为暗中加载项*/
        public isSecretly: boolean;
        /**加载优先级，数字越大，优先级越高（正常加载项的优先级高于一切暗中加载项）*/
        public priority: number;

        /**文件的后缀名（全小写）*/
        public extension: string;

        /**是否需要格式化文件的url*/
        public needToFormatUrl: boolean;
        /**文件是否已经加载完毕*/
        public hasLoaded: boolean;

        /**总字节数*/
        public bytesTotal: number = 1;
        /**已加载的字节数*/
        public bytesLoaded: number = 0;
        /**获得的HTTP状态码*/
        public status: number = 0;

        /**已经加载好的数据*/
        public data: any;
        /**上次加载更新的时间*/
        public lastUpdateTime: number = 0;
        /**剩余重新加载的次数*/
        public reloadCount: number = 5;

        /**加载耗时（毫秒）*/
        public loadTime: number = 0;


        /**
         * 下一个默认的优先级
         */
        public static get nextPriority(): number {
            return --LoadItemInfo._priority;
        }


        public constructor(configName: string = null,
                           isSecretly: boolean = false, priority: number = 0,
                           urlArgs: string[] = null, urlList: string[] = null,
                           url: string = null, type: string = "text", name: string = "",
                           needToFormatUrl: boolean = true) {
            this.type = type;
            this.name = name;
            this.isSecretly = isSecretly;
            this.priority = (priority == 0) ? LoadItemInfo.nextPriority : priority;
            this.urlList = (urlList == null) ? [] : urlList;
            this.needToFormatUrl = needToFormatUrl;

            if (configName) {
                this.setConfigName(configName, urlArgs);
            }
            else {
                this.parseUrl(url, urlArgs);
            }
        }


        /**
         * 在配置文件(ResConfig)中的名称。可配参数{ url, type, name }，至少应包含url
         * @param configName
         * @param urlArgs
         */
        public setConfigName(configName: string, urlArgs: string[] = null): void {
            this.configName = configName;

            if (configName) {
                let config: ResConfigItem = lolo.config.getResConfig(configName);
                this.type = config.type;
                this.parseUrl(config.url, urlArgs);
                if (config.nameID) this.name = getLanguage(config.nameID);
            }
        }


        /**
         * 解析（后缀名）和组合URL
         * @param url
         * @param urlArgs
         */
        public parseUrl(url: string, urlArgs: string[] = null): void {
            if (!url) return;

            this.urlArgs = urlArgs;
            this.url = (urlArgs == null) ? url : StringUtil.substitute(url, urlArgs);
            this.extension = this.url.substring(this.url.lastIndexOf(".") + 1).toLocaleLowerCase();
        }


        /**
         * 添加urlList(通过在Config中的名称列表)。如果url还没加载完成或没在加载队列中，将会自动添加到加载队列。
         * @param args
         * @return
         */
        public addUrlListByCN(...args: any[]): LoadItemInfo {
            let arr: string[] = (args.length == 1 && Array.isArray(args[0])) ? args[0] : args;

            for (let i = 0; i < arr.length; i++) {
                lolo.loader.add(new LoadItemInfo(arr[i], this.isSecretly));
                this.urlList.push(config.getResConfig(arr[i]).url);
            }
            return this;
        }

        //
    }
}