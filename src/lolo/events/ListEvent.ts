namespace lolo {


    /**
     * 列表与子项相关事件
     * @author LOLO
     */
    export class ListEvent extends Event {

        /**子项鼠标按下*/
        public static ITEM_TOUCH_BEGIN: string = "itemTouchBegin";
        /**子项鼠标点击*/
        public static ITEM_TOUCH_TAP: string = "itemTouchTap";
        /**子项被选中*/
        public static ITEM_SELECTED: string = "itemSelected";

        /**渲染更新*/
        public static RENDER: string = "listRender";


        /**触发事件的子项*/
        public item: ItemRenderer;


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}