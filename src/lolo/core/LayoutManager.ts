namespace lolo {


    /**
     * 布局目标信息
     * @author LOLO
     */
    export interface LayoutTargetInfo {
        target: cc.Node,
        args: LayoutArgsInfo,
        enabled: boolean;
    }


    /**
     * 布局目标的参数信息
     * @author LOLO
     */
    export interface LayoutArgsInfo {
        /**布局宽度。不设置该值，将使用 target.width*/
        width?: number;
        /**布局高度。不设置该值，将使用 target.height*/
        height?: number;
        /**舞台宽度的百分数对应的 x 位置，1 = 100%*/
        x?: number;
        /**舞台高度的百分数对应的 y 位置，1 = 100%*/
        y?: number;
        /**x 距离舞台右侧的值*/
        paddingRight?: number;
        /**y 距离舞台底部的值*/
        paddingBottom?: number;
        /**在居中的基础上，x 左右偏移的值*/
        offsetX?: number;
        /**在居中的基础上，y 上下偏移的值*/
        offsetY?: number;
        /**取消水平布局*/
        cancelH?: boolean;
        /**取消垂直布局*/
        cancelV?: boolean;
    }


    /**
     * 布局管理
     * @author LOLO
     */
    export class LayoutManager {

        /**需要根据舞台尺寸调整位置的显示对象列表*/
        private _stageLayoutList: Dictionary;


        public constructor() {
            this._stageLayoutList = new Dictionary();
            lolo.stage.event_addListener(Event.RESIZE, this.stage_resizeHandler, this, 100);
        }


        /**
         * 舞台尺寸有改变
         * @param event
         */
        private stage_resizeHandler(event: Event): void {
            let list: any = this._stageLayoutList.list;
            for (let key in list) {
                let info: LayoutTargetInfo = list[key];
                if (info.enabled) {
                    this.stageLayout(info.target, info.args);
                }
            }
        }


        /**
         * 添加一个需要根据舞台尺寸调整位置的显示对象
         * 在丢弃 target 对象时，一定要调用 removeStageLayout() 方法，不然会导致内存泄漏
         * @param target 参数解释见 stageLayout() 方法
         * @param args
         */
        public addStageLayout(target: cc.Node, args: LayoutArgsInfo): void {
            this._stageLayoutList.setItem(target, {target: target, args: args, enabled: true});
            this.stageLayout(target);
        }


        /**
         * 根据舞台尺寸调整显示对象的位置
         * @param target 要调整位置的显示对象
         * @param args    可用属性： { width, height, x, y, paddingRight, offsetX, paddingBottom, offsetY, cancelH, cancelV }
         *                属性解释，以水平方向为例：
         *                    1.目标默认水平居中于舞台。
         *                    　默认获取 target.width，如果有设置 width 则使用 width。
         *                    　如果有实现 IWindowLayout 接口，则使用 layoutWidth。
         *                    2.在居中的基础上，可以设置 offsetX 左右偏移目标的位置。
         *                    3.如果设置 paddingRight，将会 取消居中，只会贴于舞台右侧。
         *                    4.如果设置 x 将会 取消居中 和 贴于舞台右侧，只会使用 x 属性。
         *                    　x 的值为舞台宽度的百分数，1 = 100%。
         *                    　例如：x=0.6 在 stageWidth=1200 时表示 target.x=720
         *                    5.如果在水平方向不想具有根据舞台尺寸调整位置的功能，可以设置 cancelH=true。
         *
         *                如果该值为 null，将会在已注册的列表中寻找参数
         *                可以调用该方法，传入null，刷新target在舞台的相对位置
         */
        public stageLayout(target: cc.Node, args?: LayoutArgsInfo): void {
            let p: Point = this.getStageLayout(target, args);
            if (p != null) {
                target.x = p.x;
                target.y = p.y;
                CachePool.recycle(p);
            }
            else {
                Logger.addLog("[LFW] 指定的target: " + target.toString() + " 并没有在 LayoutManager 中注册", Logger.LOG_TYPE_WARN);
            }
        }


        /**
         * 移除一个需要根据舞台尺寸调整位置的显示对象
         * @param target
         */
        public removeStageLayout(target: cc.Node): void {
            this._stageLayoutList.removeItem(target);
        }


        /**
         * 根据参数，获取显示对象的舞台相对位置
         * @param target
         * @param args 如果该值为null，将会在已注册的列表中寻找参数
         * @return
         */
        public getStageLayout(target: cc.Node, args: LayoutArgsInfo = null): Point {
            if (args == null) args = this._stageLayoutList.getItem(target).args;
            if (args == null) return null;

            let width: number = (args.width != null) ? args.width : target.width;
            let height: number = (args.height != null) ? args.height : target.height;
            let p: Point = CachePool.getPoint();

            if (args.x != null) {//按百分比设置位置
                p.x = lolo.ui.stageWidth * args.x;
            }
            else if (args.paddingRight != null) {//靠右边对齐
                p.x = lolo.ui.stageWidth - width - args.paddingRight;
            }
            else if (args.cancelH == null) {//居中舞台
                p.x = lolo.ui.stageWidth - width >> 1;
                if (args.offsetX != null) p.x += args.offsetX;
            }
            else {//无需改变位置
                p.x = target.x;
            }

            if (args.y != null) {
                p.y = lolo.ui.stageHeight * args.y;
            }
            else if (args.paddingBottom != null) {
                p.y = lolo.ui.stageHeight - height - args.paddingBottom;
            }
            else if (args.cancelV == null) {
                p.y = lolo.ui.stageHeight - height >> 1;
                if (args.offsetY != null) p.y += args.offsetY;
            }
            else {
                p.y = target.y;
            }

            return p;
        }


        /**
         * 设置显示对象（注册列表中的）是否启用舞台布局
         * @param target
         * @param enabled
         */
        public setStageLayoutEnabled(target: cc.Node, enabled: boolean): void {
            this._stageLayoutList.getItem(target).enabled = enabled;
        }


        /**
         * 将显示对象居中于舞台
         * @param target 要居中于舞台的目标
         * @param width 不传该值将会使用 target.width
         * @param height 不传该值将会使用 target.height
         */
        public toStageCenter(target: cc.Node, width?: number, height?: number): void {
            if (width == null) width = target.width;
            if (height == null) height = target.height;
            target.x = lolo.ui.stageWidth - width >> 1;
            target.y = lolo.ui.stageHeight - height >> 1;
        }

        //
    }
}