namespace lolo {


    /**
     * 加载事件
     * @author LOLO
     */
    export class LoadEvent extends Event {
        /**开始加载*/
        public static START: string = "loadStart";
        /**加载资源中*/
        // public static PROGRESS: string = "loadProgress";
        /**加载单个资源完成*/
        public static ITEM_COMPLETE: string = "loadItemComplete";
        /**显示加载项全部加载完成*/
        public static LOAD_COMPLETE: string = "loadComplete";
        /**所有加载项全部加载完毕（包括显示加载项和暗中加载项）*/
        public static ALL_COMPLETE: string = "loadAllComplete";
        /**加载某个资源失败*/
        public static ERROR: string = "loadError";
        /**加载某个资源超时*/
        public static TIMEOUT: string = "loadTimeout";


        /**触发该事件的加载项*/
        public lii: LoadItemInfo;


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}