/// <reference path="../events/Event.ts"/>


namespace lolo {


    /**
     * 数据相关事件
     * @author LOLO
     */
    export class DataEvent extends Event {


        /**数据已改变*/
        public static DATA_CHANGED: string = "dataChanged";


        /**值在HashMap中的索引*/
        public index: number;
        /**原值*/
        public oldValue: any;
        /**新值*/
        public newValue: any;


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}