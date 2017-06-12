namespace lolo {


    /**
     * 可以以窗口形式进行布局的显示对象接口
     * @author LOLO
     */
    export interface IWindowLayout {
        /**布局宽度*/
        layoutWidth: number;
        /**布局高度*/
        layoutHeight: number;
        /**布局方向。 可选值 [ horizontal:从左到右水平方向布局（默认）, vertical:从上至下垂直方向布局 ]*/
        layoutDirection: string;
        /**布局索引。该值越小就越靠左或靠上*/
        layoutIndex: number;
        /**组合布局时，与下一个窗口的间距*/
        layoutGap: number;
        /**水平x坐标*/
        x: number;
        /**垂直y坐标*/
        y: number;
    }


    /**
     * 窗口模块
     * @author LOLO
     */
    export class Window extends Module implements IWindowLayout {

        /**是否自动隐藏*/
        protected _autoHide: boolean = false;
        /**互斥的，不能同时存在的窗口moduleName列表*/
        protected _excludeList: string[] = null;
        /**可以与该窗口组合的窗口moduleName列表*/
        protected _comboList: string[] = [];

        /**布局方向*/
        protected _layoutDirection: string = "horizontal";
        /**布局索引*/
        protected _layoutIndex: number;
        /**组合布局时，与下一个窗口的间距*/
        protected _layoutGap: number;


        public constructor() {
            super();
        }


        /**
         * 关闭窗口
         * @param event
         */
        protected closeWindow(event: Event = null): void {
            lolo.ui.closeWindow(this);
        }


        /**
         * 隐藏
         */
        public hide(): void {
            if (!this._showed) return;
            super.hide();

            this.closeWindow();
        }


        /**
         * 是否自动隐藏。
         * 如果该 Window 已显示，再次调用 Common.ui.openWindow(this) 时，
         * 如果该值为 true，将会自动隐藏；
         * 如果该值为 false（默认值），将会把该Window调整至最上层。
         */
        public set autoHide(value: boolean) {
            this._autoHide = value;
        }

        public get autoHide(): boolean {
            return this._autoHide;
        }


        /**
         * 互斥的，不能同时存在的窗口 moduleName 列表。
         * 如果该值为 null（默认值），表示该窗口与所有窗口都是互斥关系（comboList 中的除外）。
         * 如果该值为 []（空数组），表示该窗口与所有窗口都不是互斥关系。
         */
        public set excludeList(value: string[]) {
            this._excludeList = value;
        }

        public get excludeList(): string[] {
            return this._excludeList;
        }


        /**
         * 可以与该窗口组合的窗口 moduleName 列表
         */
        public set comboList(value: string[]) {
            this._comboList = value;
        }

        public get comboList(): string[] {
            return this._comboList;
        }


        /**
         * 布局宽度
         */
        public get layoutWidth(): number {
            return this.width;
        }

        /**
         * 布局高度
         */
        public get layoutHeight(): number {
            return this.height;
        }


        /**
         * 布局方向。
         * 可选值 [ horizontal:从左到右水平方向布局（默认）, vertical:从上至下垂直方向布局 ]
         */
        public set layoutDirection(value: string) {
            this._layoutDirection = value;
        }

        public get layoutDirection(): string {
            return this._layoutDirection;
        }


        /**
         * 布局索引。该值越小就越靠左或靠上
         */
        public set layoutIndex(value: number) {
            this._layoutIndex = value;
        }

        public get layoutIndex(): number {
            return this._layoutIndex;
        }


        /**
         * 组合布局时，与下一个窗口的间距
         */
        public set layoutGap(value: number) {
            this._layoutGap = value;
        }

        public get layoutGap(): number {
            return this._layoutGap;
        }


        //
    }
}