namespace lolo {


    /**
     * Item渲染器
     * @author LOLO
     */
    export class ItemRenderer extends DisplayObjectContainer {

        /**在已选中时，是否可以取消选中*/
        public deselect: boolean = false;

        /**是否启用*/
        protected _enabled: boolean = true;
        /**是否已选中*/
        protected _selected: boolean = false;

        /**所属的组*/
        protected _group: ItemGroup;
        /**在组中的索引*/
        protected _index: number = -1;
        /**数据*/
        protected _data: any;

        /**Item的宽度*/
        protected _itemWidth: number = 0;
        /**Item的高度*/
        protected _itemHeight: number = 0;


        public constructor() {
            super();

            this.touchEnabled = true;
            this.event_addListener(TouchEvent.TOUCH_BEGIN, this.itemRenderer_touchBegin, this, 1);
            this.event_addListener(TouchEvent.TOUCH_TAP, this.itemRenderer_touchTap, this, 1);
        }


        /**
         * 是否已选中
         */
        public set selected(value: boolean) {
            this.setSelected(value);
        }

        protected setSelected(value: boolean): void {
            this._selected = value;
            if (this._group != null) {
                if (this._selected) {
                    if (this._group.selectedItem != this) this._group.selectedItem = this;
                }
                else {
                    if (this._group.selectedItem == this) this._group.selectedItem = null;
                }
            }
        }

        public get selected(): boolean {
            return this._selected;
        }


        /**
         * 是否启用
         */
        public set enabled(value: boolean) {
            this.setEnabled(value);
        }

        protected setEnabled(value: boolean): void {
            this._enabled = value;
        }

        public get enabled(): boolean {
            return this._enabled;
        }


        /**
         * 数据
         */
        public set data(value: any) {
            this.setData(value);
        }

        protected setData(value: any): void {
            this._data = value;
        }

        public get data(): any {
            return this._data;
        }


        /**
         * 在组中的索引
         */
        public set index(value: number) {
            this.setIndex(value);
        }

        protected setIndex(value: number): void {
            this._index = value;
        }

        public get index(): number {
            return this._index;
        }


        /**
         * 所属的组
         */
        public set group(value: ItemGroup) {
            this.setGroup(value);
        }

        protected setGroup(value: ItemGroup): void {
            if (this._group == value) return;
            if (this._group != null) this._group.removeItem(this);
            this._group = value;
            if (this._group != null) this._group.addItem(this);
        }

        public get group(): ItemGroup {
            return this._group;
        }


        /**
         * Item的宽度
         */
        public set itemWidth(value: number) {
            this.setItemWidth(value);
        }

        protected setItemWidth(value: number): void {
            this._itemWidth = value;
        }

        public get itemWidth(): number {
            return this.getItemWidth();
        }

        protected getItemWidth(): number {
            return (this._itemWidth > 0) ? this._itemWidth : this.width;
        }


        /**
         * Item的高度
         */
        public set itemHeight(value: number) {
            this.setItemHeight(value);
        }

        protected setItemHeight(value: number): void {
            this._itemHeight = value;
        }

        public get itemHeight(): number {
            return this.getItemHeight();
        }

        protected getItemHeight(): number {
            return (this._itemHeight > 0) ? this._itemHeight : this.height;
        }


        /**
         * touch begin
         * @param event
         */
        private itemRenderer_touchBegin(event: TouchEvent): void {
            if (!this._enabled) event.stopPropagation();
        }

        /**
         * touch tap
         * @param event
         */
        private itemRenderer_touchTap(event: TouchEvent): void {
            if (!this._enabled) event.stopPropagation();
        }


        //


        /**
         * 在被回收到缓存池时，回调的方法
         * 所在的列表进行回收时，会自动调用该方法，无需手动调用
         */
        public recycle(): void {
            this._group = null;
        }


        //
    }
}