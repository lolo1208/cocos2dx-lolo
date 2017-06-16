namespace lolo {


    /**
     * 子项集合
     * 排列（创建）子项
     * 子项间的选中方式会互斥
     * @author LOLO
     */
    export class ItemGroup extends DisplayObjectContainer {

        /**在 render()、touchBegin、touchTap 发生时，是否自动切换子项的选中状态*/
        public autoSelectItem: boolean = true;

        /**布局方式（默认：Constants.ABSOLUTE）*/
        protected _layout: string;
        /**水平方向子项间的像素间隔*/
        protected _horizontalGap: number = 0;
        /**垂直方向子项间的像素间隔*/
        protected _verticalGap: number = 0;
        /**包含的子项的列表*/
        protected _itemList: ItemRenderer[];
        /**当前选中的子项*/
        protected _selectedItem: ItemRenderer;
        /**是否启用*/
        protected _enabled: boolean = true;


        public constructor() {
            super();

            this._layout = Constants.ABSOLUTE;
            this._itemList = [];
        }


        /**
         * 更新显示内容（在 Event.ENTER_FRAME 事件中更新）
         */
        public render(): void {
            lolo.stage.event_addListener(Event.ENTER_FRAME, this.doRender, this);
        }

        /**
         * 立即更新显示内容，而不是等待 Event.ENTER_FRAME 事件更新
         */
        public renderNow(): void {
            this.doRender();
        }

        /**
         * 进行渲染
         * @param event Event.ENTER_FRAME 事件
         */
        protected doRender(event?: Event): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);
            if (this._layout == Constants.ABSOLUTE || this._itemList.length == 0) return;

            let item: ItemRenderer;
            let position: number = 0;
            for (let i = 0; i < this._itemList.length; i++) {
                item = this._itemList[i];

                //只对父级是当前集合的可见的子项进行布局排序
                if (item.parent == this && item.visible) {
                    switch (this._layout) {
                        case Constants.HORIZONTAL:
                            item.x = position;
                            item.y = 0;
                            position += item.itemWidth + this._horizontalGap;
                            break;

                        case Constants.VERTICAL:
                            item.x = 0;
                            item.y = position;
                            position += item.itemHeight + this._verticalGap;
                            break;
                    }
                }
            }
        }


        /**
         * 添加一个子项
         * @param item
         */
        public addItem(item: ItemRenderer): void {
            // 已经是该集合的子项，不再重复添加
            if (this._itemList.indexOf(item) != -1) return;

            this._itemList.push(item);
            item.group = this;
            item.enabled = this._enabled;
            item.index = this._itemList.length - 1;
            item.event_addListener(TouchEvent.TOUCH_BEGIN, this.item_touchBegin, this);
            item.event_addListener(TouchEvent.TOUCH_TAP, this.item_touchTap, this);
        }


        /**
         * 移除一个子项
         * @param item
         */
        public removeItem(item: ItemRenderer): void {
            let delIndex: number = -1;

            //重排子项
            for (let i: number = 0; i < this._itemList.length; i++) {
                if (delIndex != -1) {
                    this._itemList[i].index = i - 1;
                }
                else if (this._itemList[i] == item) {
                    delIndex = i;
                }
            }

            //移除指定的子项
            if (delIndex != -1) {
                this._itemList.splice(delIndex, 1);
                this.render();

                item.event_removeListener(TouchEvent.TOUCH_BEGIN, this.item_touchBegin, this);
                item.event_removeListener(TouchEvent.TOUCH_TAP, this.item_touchTap, this);
                if (item == this._selectedItem) this._selectedItem = null;
                if (item.selected) item.selected = false;
                item.group = null;
                if (item.parent == this) item.removeFromParent();
            }
        }


        /**
         * 子项 touch begin
         * @param event
         */
        protected item_touchBegin(event: TouchEvent): void {
            let item: ItemRenderer = event.currentTarget;
            this.dispatchListEvent(ListEvent.ITEM_TOUCH_BEGIN, item);
        }


        /**
         * 子项 touch tap
         * @param event
         */
        protected item_touchTap(event: TouchEvent): void {
            let item: ItemRenderer = event.currentTarget;
            this.switchItem(item);
            this.dispatchListEvent(ListEvent.ITEM_TOUCH_TAP, item);
        }


        /**
         * 切换子项的选中状态
         * @param item
         */
        protected switchItem(item: ItemRenderer): void {
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
         * 通过索引获取子项
         * @param index
         * @return
         */
        public getItemByIndex(index: number): ItemRenderer {
            return this._itemList[index];
        }


        /**
         * 通过索引选中子项
         * @param index
         */
        public selectItemByIndex(index: number): void {
            index = Math.floor(index);
            if (index < 0) index = 0;
            else if (index >= this._itemList.length) index = this._itemList.length - 1;
            this.selectedItem = this._itemList[index];
        }


        /**
         * 当前选中的子项（设置该值时，如果value的group属性不是当前集合，或者为null，将什么都不选中）
         */
        public set selectedItem(value: ItemRenderer) {
            this.setSelectedItem(value);
        }

        protected setSelectedItem(value: ItemRenderer): void {
            let oldItem: ItemRenderer = this._selectedItem;
            this._selectedItem = value;

            if (value != null && value.group == this) this._selectedItem.selected = true;

            if (oldItem != null) {
                //是同一个子项
                if (oldItem == value) {
                    if (oldItem.deselect) oldItem.selected = false;//可以取消选中
                    return;
                }
                oldItem.selected = false;
            }

            this.dispatchListEvent(ListEvent.ITEM_SELECTED, value);
        }

        public get selectedItem(): ItemRenderer {
            return this._selectedItem;
        }


        /**
         * 当前选中子项的数据
         */
        public get selectedItemData(): any {
            return (this._selectedItem != null) ? this._selectedItem.data : null;
        }


        /**
         * 子项的数量
         */
        public get numItems(): number {
            return this._itemList.length;
        }


        /**
         * 是否启用
         */
        public set enabled(value: boolean) {
            if (this._enabled == value) return;

            this._enabled = value;
            for (let i = 0; i < this._itemList.length; i++) this._itemList[i].enabled = value;
        }

        public get enabled(): boolean {
            return this._enabled;
        }


        /**
         * 布局方式（默认：Constants.ABSOLUTE）
         */
        public set layout(value: string) {
            this._layout = value;
            this.render();
        }

        public get layout(): string {
            return this._layout;
        }


        /**
         * 水平方向子项间的像素间隔
         */
        public set horizontalGap(value: number) {
            this.setHorizontalGap(value);
        }

        protected setHorizontalGap(value: number): void {
            this._horizontalGap = value;
            this.render();
        }

        public get horizontalGap(): number {
            return this._horizontalGap;
        }


        /**
         * 垂直方向子项间的像素间隔
         */
        public set verticalGap(value: number) {
            this.setVerticalGap(value);
        }

        protected setVerticalGap(value: number): void {
            this._verticalGap = value;
            this.render();
        }

        public get verticalGap(): number {
            return this._verticalGap;
        }


        /**
         * 抛出列表相关事件
         */
        protected dispatchListEvent(type: string, item: ItemRenderer = null): void {
            // 冒泡抛出子对象尺寸改变事件
            if (type == ListEvent.RENDER)
                this.event_dispatch(Event.create(Event, Event.CHILD_RESIZE), true);

            let event: ListEvent = Event.create(ListEvent, type);
            event.item = item;
            this.event_dispatch(event);
        }


        //


        /**
         * 清空
         */
        public clean(): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);

            let item: ItemRenderer;
            while (this._itemList.length > 0) {
                item = this._itemList.pop();
                item.group = null;
                item.event_removeListener(TouchEvent.TOUCH_BEGIN, this.item_touchBegin, this);
                item.event_removeListener(TouchEvent.TOUCH_TAP, this.item_touchTap, this);
                if (item.parent == this) item.destroy();
            }
            this._selectedItem = null;
        }


        /**
         * 销毁
         */
        public destroy(): void {
            this.clean();

            super.destroy();
        }

        //
    }
}