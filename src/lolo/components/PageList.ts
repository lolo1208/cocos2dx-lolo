namespace lolo {


    /**
     * 翻页列表
     * @author LOLO
     */
    export class PageList extends List {

        /**对应的翻页组件*/
        private _page: Page;


        public constructor() {
            super();
        }


        /**
         * 进行渲染
         */
        protected doRender(): void {
            PrerenderScheduler.remove(this._renderHandler);
            this.recycleAllItem();

            // 属性或数据不完整，不能显示
            if (this._data == null || this._data.length == 0 || this._itemRendererClass == null || this._columnCount == 0 || this._rowCount == 0) {
                if (this._selectedItem != null) this.selectedItem = null;//取消选中
                this.dispatchListEvent(ListEvent.RENDER);
                return;
            }

            let numPerPage: number = this.numPerPage;
            // 有对应的翻页组件
            if (this._page != null) {
                let currentPage: number = this._page.currentPage;
                this._page.initialize(numPerPage, (this._data == null) ? 0 : this._data.length);
                // 当前页有改变，清除索引
                if (this._page.currentPage != currentPage) {
                    this._curSelectedIndex = -1;
                    this._curSelectedKeys = null;
                }
            }

            // 计算出当前页要显示多少条子项
            let length: number = Math.min(numPerPage, this._data.length);
            if (this._page != null && (this._page.currentPage * numPerPage) > this._data.length) {
                length = this._data.length - (this._page.currentPage - 1) * numPerPage;
            }

            // 根据数据显示（创建）子项
            let pageIndex: number = (this._page != null) ? (this._page.currentPage - 1) * numPerPage : 0;
            let i: number, item: ItemRenderer;
            let lastItem: ItemRenderer = null;
            for (i = 0; i < length; i++) {
                item = this.getItem();
                this.addChild(item);
                this.addItem(item);
                item.index = i;
                item.data = this._data.getValueByIndex(i + pageIndex);

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
         * 通过数据中的索引来选中子项
         * @param index
         */
        public selectItemByDataIndex(index: number): void {
            super.selectItemByDataIndex(index);
            if (this._page != null) this._page.currentPage = Math.ceil((index + 1) / this.numPerPage);
        }


        /**
         * 通过索引获取子项
         * @param index
         * @return
         */
        public getItemByIndex(index: number): ItemRenderer {
            if (this._data == null) return null;
            if (this._page != null) index -= (this._page.currentPage - 1) * this.numPerPage;
            if (index < 0 || index >= this._itemList.length) return null;
            return this._itemList[index];
        }


        /**
         * 通过列表中的索引，获取对应的在数据中的索引
         * @param listIndex
         * @return
         */
        public getDataIndexByListIndex(listIndex: number): number {
            if (this._page != null) {
                return (this._page.currentPage - 1) * this.numPerPage + listIndex;
            }
            else {
                return listIndex;
            }
        }


        /**
         * 每页显示的数量
         */
        public get numPerPage(): number {
            return this._rowCount * this._columnCount;
        }


        /**
         * 对应的翻页组件
         */
        public set page(value: Page) {
            if (this._page == value) return;

            if (this._page != null) this._page.event_removeListener(PageEvent.FLIP, this.page_flipHandler, this);

            this._page = value;
            if (this._page != null) this._page.event_addListener(PageEvent.FLIP, this.page_flipHandler, this);

            this.render();
        }

        public get page(): Page {
            return this._page;
        }


        /**
         * 翻页组件触发翻页事件
         * @param event
         */
        private page_flipHandler(event: PageEvent): void {
            this._curSelectedIndex = -1;
            this._curSelectedKeys = null;
            this.render();
        }


        //


        /**
         * 清空
         */
        public clean(): void {
            if (this._page != null) this._page.reset();

            super.clean();
        }

        //
    }
}