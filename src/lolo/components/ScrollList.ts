namespace lolo {


    /**
     * 滚动列表
     * @author LOLO
     */
    export class ScrollList extends List {

        /**对应的滚动条*/
        private _scrollBar: TouchScrollBar;

        /**设置的item宽度*/
        protected _itemWidth: number = 0;
        /**设置的item高度*/
        protected _itemHeight: number = 0;
        /**用来布局的item宽度（_itemWidth + _horizontalGap）*/
        protected _itemLayoutWidth: number = 0;
        /**用来布局的item高度（_itemHeight + _verticalGap）*/
        protected _itemLayoutHeight: number = 0;


        /**通过itemWidth和data.length计算出来的宽度*/
        private _width: number;
        /**通过itemHeight和data.length计算出来的高度*/
        private _height: number;

        /**本次更新，数据是否有改变*/
        private _dataHasChanged: boolean;


        public constructor() {
            super();
        }


        public set scrollBar(value: TouchScrollBar) {
            if (value == this._scrollBar) return;
            this._scrollBar = value;
            this.render();
        }

        public get scrollBar(): TouchScrollBar {
            return this._scrollBar;
        }


        /**
         * 更新显示内容（在 Event.ENTER_FRAME 事件中更新）
         */
        public render(): void {
            if (this._scrollBar == null) {
                super.render();//没有滚动条，在 PrerenderScheduler 的回调中更新内容
            }
            else {
                this._scrollBar.render();//有滚动条，在 x/y 有改变时更新内容
            }
        }


        /**
         * 进行渲染
         */
        protected doRender(): void {
            if (this._scrollBar == null) {
                super.doRender();
                return;
            }

            this.recycleAllItem();
            // 属性或数据不完整，不能显示
            let dataLength: number = (this._data != null) ? this._data.length : 0;
            if (dataLength == 0 || this._itemRendererClass == null) {
                this._width = this._height = 0;
                if (this._selectedItem != null) this.selectedItem = null;//取消选中
                PrerenderScheduler.remove(this._renderHandler);
                this.dispatchListEvent(ListEvent.RENDER);
                return;
            }

            // 先得到item的宽高
            let item: ItemRenderer;
            if (this._itemWidth == 0 || this._itemHeight == 0) {
                item = this.getItemByIndex(0);
                if (this._itemWidth == 0) {
                    this._itemWidth = item.itemWidth;
                    this._itemLayoutWidth = this._itemWidth + this._horizontalGap;
                }
                if (this._itemHeight == 0) {
                    this._itemHeight = item.itemHeight;
                    this._itemLayoutHeight = this._itemHeight + this._verticalGap;
                }
                this.recycleAllItem();
            }

            // 只用显示该范围内的item
            let isVertical: boolean = this._scrollBar.direction == Constants.VERTICAL;
            let viewableArea: { x: number, y: number, width: number, height: number } = this._scrollBar.viewableArea;
            let p: number, minP: number, maxP: number, minI: number, maxI: number;
            if (isVertical) {
                p = (this.y > viewableArea.y) ? viewableArea.y : this.y;
                minP = Math.abs(p - viewableArea.y);
                maxP = minP + viewableArea.height;
                minI = Math.floor(minP / this._itemLayoutHeight) * this._columnCount;
                maxI = Math.ceil(maxP / this._itemLayoutHeight) * this._columnCount;
            }
            else {
                p = (this.x > viewableArea.x) ? viewableArea.x : this.x;
                minP = Math.abs(p - viewableArea.x);
                maxP = minP + viewableArea.width;
                minI = Math.floor(minP / this._itemLayoutWidth) * this._rowCount;
                maxI = Math.ceil(maxP / this._itemLayoutWidth) * this._rowCount;
            }
            if (maxI > dataLength) maxI = dataLength;

            // 根据数据显示（创建）子项
            let lastItem: ItemRenderer = null;
            for (let i = minI; i < maxI; i++) {
                item = this.getItem();
                item.touchListener.swallowTouches = false;// 不能吞噬事件，TouchScrollBar(Mask) 还在侦听 touch
                this.addChild(item);
                this.addItem(item);
                item.index = i;// addItem 和 set index 顺序不能反
                item.data = this._data.getValueByIndex(i);

                if (lastItem != null) {
                    if (isVertical) {
                        if ((i % this._columnCount) == 0) {
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
                            item.x = lastItem.x + lastItem.itemWidth + this._horizontalGap;
                            item.y = 0
                        }
                        else {
                            item.x = lastItem.x;
                            item.y = lastItem.y + lastItem.itemHeight + this._verticalGap;
                        }
                    }
                }
                else {
                    if (isVertical) {
                        item.x = 0;
                        item.y = minI / this._columnCount * this._itemLayoutHeight;
                    }
                    else {
                        item.x = minI / this._rowCount * this._itemLayoutWidth;
                        item.y = 0;
                    }
                }
                lastItem = item;
            }

            let oldValue: number;
            if (isVertical) {
                oldValue = this._height;
                this._height = Math.ceil(dataLength / this._columnCount) * this._itemLayoutHeight - this._verticalGap;
            }
            else {
                oldValue = this._width;
                this._width = Math.ceil(dataLength / this._rowCount) * this._itemLayoutWidth - this._horizontalGap;
            }

            // 内容或宽高有变化时，通知滚动条更新
            let newValue: number = isVertical ? this._height : this._width;
            if (this._dataHasChanged || newValue != oldValue) {
                this._dataHasChanged = false;
                this._scrollBar.renderNow();
            }

            this.updateSelectedItem();
            PrerenderScheduler.remove(this._renderHandler);
            this.dispatchListEvent(ListEvent.RENDER);
        }


        protected autoSelectItemByIndex(index: number): void {
            if (index >= this._data.length) index = this._data.length - 1;
            this.selectItemByIndex(index);
        }

        public selectItemByIndex(index: number): void {
            if (this._data == null) return;
            this.selectedItem = this.getItemByIndex(index);
        }

        public getItemByIndex(index: number): ItemRenderer {
            if (this._data == null) return null;
            if (index < 0 || index >= this._data.length) return null;

            // 在已创建的item中（显示范围内），寻找指定index的item
            for (let i = 0; i < this._itemList.length; i++) {
                if (this._itemList[i].index == index) {
                    return this._itemList[i];
                }
            }

            // 已创建的item中，没有对应index的item（表示item在显示范围外），直接创建
            let item: ItemRenderer = this.getItem();
            this.addChild(item);
            item.data = this._data.getValueByIndex(index);
            this.addItem(item);
            item.index = index;
            if (this._scrollBar.direction == Constants.VERTICAL) {
                item.x = index % this._columnCount * this._itemLayoutWidth;
                item.y = Math.floor(index / this._columnCount) * this._itemLayoutHeight;
            }
            else {
                item.x = Math.floor(index / this._rowCount) * this._itemLayoutWidth;
                item.y = index % this._rowCount * this._itemLayoutHeight;
            }
            return item;
        }


        protected setData(value: HashMap) {
            this._dataHasChanged = true;
            super.setData(value);
        }


        protected dataChangedHandler(event: DataEvent): void {
            this._dataHasChanged = true;
            super.dataChangedHandler(event);
        }


        public setPositionX(value: number): void {
            super.setPositionX(value);
            super.render();
        }

        public setPositionY(value: number): void {
            super.setPositionY(value);
            super.render();
        }


        public set itemWidth(value: number) {
            if (value == this._itemWidth) return;
            this._itemWidth = value;
            this._itemLayoutWidth = this._itemWidth + this._horizontalGap;
            if (this._scrollBar != null) this.doRender();
        }

        public get itemWidth(): number {
            return this._itemWidth;
        }


        public set itemHeight(value: number) {
            if (value == this._itemHeight) return;
            this._itemHeight = value;
            this._itemLayoutHeight = this._itemHeight + this._verticalGap;
            if (this._scrollBar != null) this.doRender();
        }

        public get itemHeight(): number {
            return this._itemHeight;
        }


        protected setHorizontalGap(value: number): void {
            super.setHorizontalGap(value);
            this._itemLayoutWidth = this._itemWidth + value;
        }


        protected setVerticalGap(value: number): void {
            super.setVerticalGap(value);
            this._itemLayoutHeight = this._itemHeight + value;
        }


        protected getIsHorizontalSort(): boolean {
            if (this._scrollBar != null) return this._scrollBar.direction == Constants.VERTICAL;
            return this._isHorizontalSort;
        }


        /**
         * 通过 itemWidth 和 data.length 计算出来的宽度
         */
        public getWidth(): number {
            return this._width > 0 ? this._width : super.getWidth();
        }

        /**
         * 通过 itemHeight 和 data.length 计算出来的高度
         */
        public getHeight(): number {
            return this._height > 0 ? this._height : super.getHeight();
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
                super.render();// 这里改用调用 super.render()
            }
        }


        //


        /**
         * 清空
         */
        public clean(): void {
            this._width = this._height = 0;
            super.clean();
            if (this._scrollBar != null) this._scrollBar.render();
        }

        //
    }
}