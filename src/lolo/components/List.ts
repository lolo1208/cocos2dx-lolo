namespace lolo {


    /**
     * 列表
     * @author LOLO
     */
    export class List extends ItemGroup {

        /**刷新列表时，根据索引来选中子项*/
        public static SELECT_MODE_INDEX: string = "index";
        /**刷新列表时，根据键来选中子项*/
        public static SELECT_MODE_KEY: string = "key";

        /**数据*/
        protected _data: HashMap;
        /**子项的渲染类*/
        protected _itemRendererClass: any;
        /**列数（默认值：3）*/
        protected _columnCount: number = 3;
        /**行数（默认值：3）*/
        protected _rowCount: number = 3;
        /**刷新列表时，根据什么来选中子项，可选值["index", "key"]，默认值："index"*/
        protected _selectMode: string;
        /**在还未选中过子项时，创建列表（设置数据，翻页）是否自动选中第一个子项，默认值：true*/
        protected _autoSelectDefaultItem: boolean;
        /**是否水平方向排序，默认值：true*/
        protected _isHorizontalSort: boolean;

        /**当前选中子项的索引*/
        protected _curSelectedIndex: number = -1;
        /**当前选中子项的键列表*/
        protected _curSelectedKeys: any[];

        /**子项的缓存池，已移除的子项实例不会立即销毁，将会回收到池中*/
        protected _itemPool: ItemRenderer[];


        public constructor() {
            super();

            this._selectMode = List.SELECT_MODE_INDEX;
            this._autoSelectDefaultItem = true;
            this._isHorizontalSort = true;
            this._itemPool = [];
        }


        /**
         * 数据（将根据该数据来创建子项，呈现列表）
         */
        public set data(value: HashMap) {
            this.setData(value);
        }

        protected setData(value: HashMap): void {
            if (value == this._data) return;
            if (this._data != null) {
                this._data.dispatchChanged = false;
                this._data.event_removeListener(DataEvent.DATA_CHANGED, this.dataChangedHandler, this);
            }

            this._data = value;
            if (this._data != null) {
                this._data.dispatchChanged = true;
                this._data.event_addListener(DataEvent.DATA_CHANGED, this.dataChangedHandler, this);
            }

            this.selectedItem = null;
            this.render();
        }

        public get data(): HashMap {
            return this._data;
        }


        /**
         * 进行渲染
         * @param event Event.ENTER_FRAME 事件
         */
        protected doRender(event?: Event): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);
            this.recycleAllItem();

            //属性或数据不完整，不能显示
            if (this._data == null || this._data.length == 0 || this._itemRendererClass == null) {
                if (this._selectedItem != null) this.selectedItem = null;//取消选中
                this.dispatchListEvent(ListEvent.RENDER);
                return;
            }


            //根据数据显示（创建）子项
            let length: number = Math.min(this._data.length, this._rowCount * this._columnCount);
            let i: number, item: ItemRenderer, lastItem: ItemRenderer = null;
            for (i = 0; i < length; i++) {
                item = this.getItem();
                this.addChild(item);
                this.addItem(item);
                item.index = i;
                item.data = this._data.getValueByIndex(i);

                if (lastItem != null) {
                    if (this._isHorizontalSort) {
                        if ((i % this._columnCount) == 0) {//新行的开始
                            item.x = 0;
                            item.y = lastItem.y + lastItem.itemHeight + this._verticalGap;
                        }
                        else {
                            item.x = lastItem.x + lastItem.itemWidth + this._horizontalGap;
                            item.y = lastItem.y;
                        }
                    }
                    else {
                        if ((i % this._rowCount) == 0) {
                            item.y = 0;
                            item.x = lastItem.x + lastItem.itemWidth + this._horizontalGap;
                        }
                        else {
                            item.y = lastItem.y + lastItem.itemHeight + this._verticalGap;
                            item.x = lastItem.x;
                        }
                    }
                }
                else {
                    item.x = item.y = 0;
                }
                lastItem = item;
            }

            this.updateSelectedItem();
            this.dispatchListEvent(ListEvent.RENDER);
        }


        /**
         * 在update之后，更新选中的item
         */
        protected updateSelectedItem(): void {
            // 还没有选中过任何子项
            if (this._curSelectedIndex == -1) {
                if (this._autoSelectDefaultItem && this.autoSelectItem) this.selectItemByIndex(0);
            }

            // 通过索引来选中子项
            else if (this._selectMode == List.SELECT_MODE_INDEX) {
                this.autoSelectItemByIndex(this._curSelectedIndex);
            }

            // 根据键来选中子项
            else {
                let index: number = this._data.getIndexByKeys(this._curSelectedKeys);
                (index != -1) ? this.selectItemByIndex(index) : this.autoSelectItemByIndex(this._curSelectedIndex);
            }
        }


        /**
         * 通过索引来选中子项
         * 如果指定的index不存在，将会自动选中index-1的子项
         * @param index 指定的索引
         */
        protected autoSelectItemByIndex(index: number): void {
            if (index >= this._itemList.length || this._itemList[index] != null) {
                this.selectItemByIndex(index);
            }
            else {
                index--;
                if (index >= 0) this.autoSelectItemByIndex(index);
            }
        }


        /**
         * 子项鼠标按下
         * @param event
         */
        protected item_touchBegin(event: TouchEvent): void {
            super.item_touchBegin(event);
            let item: ItemRenderer = event.currentTarget;

            if (this.autoSelectItem) {
                if (this._selectedItem == item) {
                    if (item.deselect) this.selectedItem = null;
                }
                else {
                    this.selectedItem = item;
                }
            }
        }

        /**
         * 子项鼠标单击
         * @param event
         */
        protected item_touchTap(event: TouchEvent): void {
            let item: ItemRenderer = event.currentTarget;
            this.dispatchListEvent(ListEvent.ITEM_TOUCH_TAP, item);
        }


        /**
         * 子项的渲染类
         */
        public set itemRendererClass(value: any) {
            if (value == this._itemRendererClass) return;

            let data: HashMap = this._data;
            this.clean();
            this._data = data;

            this._itemRendererClass = value;
            this.render();
        }

        public get itemRendererClass(): any {
            return this._itemRendererClass;
        }


        /**
         * 列数（默认值：3）
         */
        public set columnCount(value: number) {
            if (value == this._columnCount) return;
            this._columnCount = value;
            this.render();
        }

        public get columnCount(): number {
            return this._columnCount;
        }


        /**
         * 行数（默认值：3）
         */
        public set rowCount(value: number) {
            if (value == this._rowCount) return;
            this._rowCount = value;
            this.render();
        }

        public get rowCount(): number {
            return this._rowCount;
        }


        /**
         * 刷新列表时，根据什么来选中子项，可选值["index", "key"]，默认值："index"
         */
        public set selectMode(value: string) {
            if (value == this._selectMode) return;

            if (this._selectedItem != null && this._curSelectedKeys == null)
                this._curSelectedKeys = this._data.getKeysByIndex(this._curSelectedIndex);

            this._selectMode = value;
            this.render();
        }

        public get selectMode(): string {
            return this._selectMode;
        }


        /**
         * 在还未选中过子项时，创建列表（设置数据，翻页）是否自动选中第一个子项，默认值：true
         */
        public set autoSelectDefaultItem(value: boolean) {
            if (value == this._autoSelectDefaultItem) return;
            this._autoSelectDefaultItem = value;
            this.render();
        }

        public get autoSelectDefaultItem(): boolean {
            return this._autoSelectDefaultItem;
        }


        /**
         * 是否水平方向排序，默认值：true。
         * ScrollList 中，该值为与 ScrollBar.direction 相对应
         */
        public set isHorizontalSort(value: boolean) {
            if (value == this._isHorizontalSort) return;
            this._isHorizontalSort = value;
            this.render();
        }

        public get isHorizontalSort(): boolean {
            return this.getIsHorizontalSort();
        }

        protected getIsHorizontalSort(): boolean {
            return this._isHorizontalSort;
        }


        /**
         * 当前选中的子项（设置该值时，如果value的group属性不是当前集合，或者为null，将什么都不选中）
         */
        protected setSelectedItem(value: ItemRenderer): void {
            if (value == this._selectedItem) {
                if (this._selectedItem == null) return;
                if (this._selectedItem.deselect)
                    value = null;//取消选中
                else
                    return;
            }

            super.setSelectedItem(value);
            if (this._selectedItem != null) {
                this._curSelectedIndex = this._selectedItem.index;
                if (this._selectMode == List.SELECT_MODE_KEY)// 数据过多时，该方法效率会比较低
                    this._curSelectedKeys = this._data.getKeysByIndex(this._curSelectedIndex);
            }
            else {
                this._curSelectedIndex = -1;
                this._curSelectedKeys = null;
            }
        }


        /**
         * 通过数据中的索引来选中子项
         * @param index
         */
        public selectItemByDataIndex(index: number): void {
            index = Math.floor(index);
            if (index >= this._data.length) index = this._data.length - 1;
            else if (index < 0) index = 0;
            this.selectedItem = this.getItemByIndex(index);
        }


        /**
         * 通过数据中的键列表来选中子项
         * @param keys
         */
        public selectItemByDataKeys(keys: any[]): void {
            this.selectItemByDataIndex(this._data.getIndexByKeys(keys));
        }


        /**
         * 通过索引获取子项
         * @param index
         * @return
         */
        public getItemByIndex(index: number): ItemRenderer {
            if (this._data == null) return null;
            if (index < 0 || index >= this._itemList.length) return null;
            return this._itemList[index];
        }


        /**
         * 通过数据中的键来获取子项
         * @param key
         * @return
         */
        public getItemByKey(key: any): ItemRenderer {
            return this.getItemByIndex(this._data.getIndexByKey(key));
        }


        /**
         * 设置子项的数据，该方法会在设置 item.data 前，调用 item.recover()
         * 如果设置 item.data 会导致 item 的宽高有变化，你需要主动调用 update() 方法来更新布局
         * @param item
         * @param data
         */
        public setItemData(item: ItemRenderer, data: any): void {
            if (item == null) return;
            item.recycle();
            item.data = data;
            item.group = this;
            this.dispatchListEvent(ListEvent.RENDER, item);
        }


        /**
         * 通过列表中的索引，获取对应的在数据中的索引
         * @param listIndex
         * @return
         */
        public getDataIndexByListIndex(listIndex: number): number {
            return listIndex;
        }


        /**
         * 子项的数量（该值返回的是 list.data.length）
         */
        public get numItems(): number {
            return this._data == null ? 0 : this._data.length;
        }


        /**
         * 数据有改变
         * @param event
         */
        protected dataChangedHandler(event: DataEvent): void {
            //修改item的数据
            if (event.index != -1) {
                this.setItemData(this.getItemByIndex(event.index), event.newValue);
            }
            //数据列表有变动
            else {
                this.render();
            }
        }


        /**
         * 获取一个Item，先尝试从缓存池中拿，如果没有，将创建一个新的item
         * @return
         */
        protected getItem(): ItemRenderer {
            if (this._itemPool.length > 0) {
                return this._itemPool.pop();
            }
            else {
                return (this._itemRendererClass == null) ? null : new this._itemRendererClass();
            }
        }

        /**
         * 移除所有子项，并回收到缓存池中
         */
        public recycleAllItem(): void {
            let item: ItemRenderer;
            while (this._itemList.length > 0) {
                item = this._itemList.pop();
                item.group = null;
                item.selected = false;
                item.recycle();
                this.removeChild(item);

                this._itemPool.push(item);
            }
            this._selectedItem = null;
        }

        /**
         * 清空子项缓存池
         */
        protected cleanItemPool(): void {
            let item: ItemRenderer;
            while (this._itemPool.length > 0) {
                item = this._itemPool.pop();
                item.destroy();
            }
        }


        //


        /**
         * 清空
         */
        public clean(): void {
            this.recycleAllItem();
            this.cleanItemPool();

            if (this._data != null) {
                this._data.dispatchChanged = false;
                this._data.event_removeListener(DataEvent.DATA_CHANGED, this.dataChangedHandler, this);
                this._data = null;
            }
            this._curSelectedIndex = -1;
            this._curSelectedKeys = null;
            this.dispatchListEvent(ListEvent.RENDER);
        }


        //
    }
}