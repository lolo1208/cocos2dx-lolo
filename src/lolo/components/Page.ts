namespace lolo {


    /**
     * 翻页组件，包含：
     *  - 首页按钮
     *  - 尾页按钮
     *  - 上一页按钮
     *  - 下一页按钮
     *  - 页码显示文本
     *
     * @author LOLO
     */
    export class Page extends DisplayObjectContainer {

        /**首页按钮*/
        protected _firstBtn: Button;
        /**尾页按钮*/
        protected _lastBtn: Button;
        /**上一页按钮*/
        protected _prevBtn: Button;
        /**下一页按钮*/
        protected _nextBtn: Button;
        /**页码显示文本*/
        protected _pageText: Label;

        /**当前页*/
        protected _currentPage: number = 0;
        /**总页数*/
        protected _totalPage: number = 0;
        /**是否启用*/
        protected _enabled: boolean = true;

        /**页码显示文本的格式化字符串，替换符{0}表示当前页，{1}表示总页数*/
        public pageTextFormat: string = "{0}/{1}";


        public constructor() {
            super();

            this._firstBtn = AutoUtil.init(new Button(), this, {enabled: false});
            this._lastBtn = AutoUtil.init(new Button(), this, {enabled: false});
            this._prevBtn = AutoUtil.init(new Button(), this, {enabled: false});
            this._nextBtn = AutoUtil.init(new Button(), this, {enabled: false});
            this._pageText = AutoUtil.init(new Label(), this);

            this._firstBtn.event_addListener(TouchEvent.TOUCH_TAP, this.firstBtn_touchTap, this);
            this._lastBtn.event_addListener(TouchEvent.TOUCH_TAP, this.lastBtn_touchTap, this);
            this._prevBtn.event_addListener(TouchEvent.TOUCH_TAP, this.prevBtn_touchTap, this);
            this._nextBtn.event_addListener(TouchEvent.TOUCH_TAP, this.nextBtn_touchTap, this);
        }


        /**
         * 首页按钮的属性
         */
        public set firstBtnProp(value: Object) {
            AutoUtil.initObject(this._firstBtn, value);
        }

        /**
         * 尾页按钮的属性
         */
        public set lastBtnProp(value: Object) {
            AutoUtil.initObject(this._lastBtn, value);
        }

        /**
         * 上一页按钮的属性
         */
        public set prevBtnProp(value: Object) {
            AutoUtil.initObject(this._prevBtn, value);
        }

        /**
         * 下一页按钮的属性
         */
        public set nextBtnProp(value: Object) {
            AutoUtil.initObject(this._nextBtn, value);
        }

        /**
         * 页码显示文本的属性
         */
        public set pageTextProp(value: Object) {
            AutoUtil.initObject(this._pageText, value);
        }


        /**
         * 当前页
         */
        public set currentPage(value: number) {
            this._currentPage = value;
            this.render();
        }

        public get currentPage(): number {
            return this._currentPage;
        }


        /**
         * 总页数
         */
        public set totalPage(value: number) {
            this._totalPage = value;
            this.render();
        }

        public get totalPage(): number {
            return this._totalPage;
        }


        /**
         * 是否启用
         */
        public set enabled(value: boolean) {
            this._enabled = value;
            if (!this._enabled) {
                this._firstBtn.enabled = this._lastBtn.enabled = this._prevBtn.enabled = this._nextBtn.enabled = false;
            }
            else {
                this.render();
            }
        }

        public get enabled(): boolean {
            return this._enabled;
        }


        /**
         * 首页按钮
         */
        public get firstBtn(): Button {
            return this._firstBtn;
        }

        /**
         * 尾页按钮
         */
        public get lastBtn(): Button {
            return this._lastBtn;
        }

        /**
         * 上一页按钮
         */
        public get prevBtn(): Button {
            return this._prevBtn;
        }

        /**
         * 下一页按钮
         */
        public get nextBtn(): Button {
            return this._nextBtn;
        }

        /**
         * 页码显示文本
         */
        public get pageText(): Label {
            return this._pageText;
        }


        /**
         * 点击首页按钮
         * @param event
         */
        private firstBtn_touchTap(event: TouchEvent): void {
            this.currentPage = 1;
            this.dispatchPageEvent();
        }

        /**
         * 点击尾页按钮
         * @param event
         */
        private lastBtn_touchTap(event: TouchEvent): void {
            this.currentPage = this._totalPage;
            this.dispatchPageEvent();
        }

        /**
         * 点击上一页按钮
         * @param event
         */
        private prevBtn_touchTap(event: TouchEvent): void {
            this.currentPage = this._currentPage - 1;
            this.dispatchPageEvent();
        }

        /**
         * 点击下一页按钮
         * @param event
         */
        private nextBtn_touchTap(event: TouchEvent): void {
            this.currentPage = this._currentPage + 1;
            this.dispatchPageEvent();
        }


        /**
         * 根据数量初始化
         * 如果有与 PageList 相关联，PageList 将会自动调用该方法
         * @param numPage 每页显示的数量
         * @param numTotal 总数量
         */
        public initialize(numPage: number, numTotal: number): void {
            this._totalPage = Math.ceil(numTotal / numPage);
            if (this._currentPage == 0 && this._totalPage > 0) this._currentPage = 1;
            if (this._currentPage > this._totalPage) this._currentPage = this._totalPage;
            this.render();
        }


        /**
         * 显示更新
         */
        public render(): void {
            this._firstBtn.enabled = this._enabled && this._currentPage > 1;
            this._lastBtn.enabled = this._enabled && this._currentPage < this._totalPage;
            this._prevBtn.enabled = this._firstBtn.enabled;
            this._nextBtn.enabled = this._lastBtn.enabled;
            this._pageText.text = StringUtil.substitute(this.pageTextFormat, this._currentPage, this._totalPage);
        }


        /**
         * 抛出翻页相关事件
         */
        private dispatchPageEvent(): void {
            let event: PageEvent = Event.create(PageEvent, PageEvent.FLIP);
            event.currentPage = this._currentPage;
            event.totalPage = this._totalPage;
            this.event_dispatch(event);
        }


        /**
         * 重置
         */
        public reset(): void {
            this._totalPage = this._currentPage = 0;
            this.render();
        }


        //
    }
}