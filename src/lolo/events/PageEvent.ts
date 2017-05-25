namespace lolo {


    /**
     * 翻页事件
     * @author LOLO
     */
    export class PageEvent extends Event {
        /**翻页*/
        public static FLIP: string = "flip";


        /**当前页*/
        public currentPage: number;
        /**总页数*/
        public totalPage: number;


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}