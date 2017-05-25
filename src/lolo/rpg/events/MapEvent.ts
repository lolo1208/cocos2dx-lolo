namespace lolo.rpg {


    /**
     * 地图相关事件
     * @author LOLO
     */
    export class MapEvent extends Event {
        /**触摸地图背景*/
        public static TOUCH: string = "map_touch";

        /**屏幕中心位置发生了变化*/
        public static SCREEN_CENTER_CHANGED: string = "map_screenCenterChanged";


        /**事件发生的区块点*/
        public tile: Point;


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}