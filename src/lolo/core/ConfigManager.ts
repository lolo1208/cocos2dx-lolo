namespace lolo {
    /**
     * 资源配置项
     * @author LOLO
     */
    export interface ResConfigItem {
        /**资源的URL*/
        url: string;

        /**资源的类型*/
        type: string;

        /**资源名称（在语言包中的ID）*/
        nameID: string;
    }


    /**
     * 配置信息管理
     * @author LOLO
     */
    export class ConfigManager {
        /**资源配置*/
        private _resConfig: Object;
        /**样式配置*/
        private _styleConfig: Object;
        /**皮肤配置*/
        private _skinConfig: Object;
        /**界面配置*/
        private _uiConfig: Object;


        /**
         * 构造函数
         */
        public constructor() {

        }


        /**
         * 初始化资源配置
         * @param url
         */
        public initResConfig(url: string): void {
            this._resConfig = loader.getResByUrl(url, true);
        }


        /**
         * 初始化样式配置
         * @param url
         */
        public initStyleConfig(url: string): void {
            this._styleConfig = loader.getResByUrl(url, true);
        }


        /**
         * 初始化皮肤配置
         * @param url
         */
        public initSkinConfig(url: string): void {
            this._skinConfig = loader.getResByUrl(url, true);
        }

        /**
         * 初始化界面配置
         * @param url
         */
        public initUIConfig(url: string): void {
            this._uiConfig = loader.getResByUrl(url, true);
        }


        /**
         * 获取资源配置信息
         * @param name 配置的名称
         * @return
         */
        public getResConfig(name: string): ResConfigItem {
            return this._resConfig[name];
        }


        /**
         * 获取样式配置信息
         * @param name 配置的名称
         * @return
         */
        public getStyle(name: string): any {
            return this._styleConfig[name];
        }


        /**
         * 获取皮肤配置信息
         * @param name 配置的名称
         * @return
         */
        public getSkin(name: string): any {
            return this._skinConfig[name];
        }


        /**
         * 获取界面配置信息
         * @param name 配置的名称
         * @return
         */
        public getUIConfig(name: string, ...args: any[]): any {
            return StringUtil.substitute(this._uiConfig[name], args);
        }

        //
    }
}