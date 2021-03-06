namespace lolo {


    /**
     * 对象缓存池
     * @author LOLO
     */
    export class CachePool {

        /**Animation 缓存池*/
        private static _aniPool: Animation[] = [];
        /**Bitmap 缓存池*/
        private static _bmpPool: Bitmap[] = [];
        /**ArtText 缓存池*/
        private static _atPool: ArtText[] = [];
        /**Label 缓存池*/
        private static _labelPool: Label[] = [];

        /**Point 缓存池*/
        private static _pointPool: Point[] = [];
        /**Rectangle 缓存池*/
        private static _rectPool: Rectangle[] = [];
        /**Dictionary 缓存池*/
        private static _dicPool: Dictionary[] = [];

        /**同一个像素点上不能重叠的动画列表，[ ani.sourceName + _ + x + _ + y ] 为key*/
        private static _aniList: Object = {};


        /**
         * 获取一个 Bitmap 对象
         * @param sn
         * @param x
         * @param y
         * @return
         */
        public static getBitmap(sn: string = "", x: number = 0, y: number = 0): Bitmap {
            let bs: Bitmap;
            if (CachePool._bmpPool.length == 0) {
                bs = new Bitmap(sn);
            }
            else {
                bs = CachePool._bmpPool.pop();
                if (sn != "") bs.sourceName = sn;
            }
            bs.setPosition(x, y);

            return bs;
        }


        /**
         * 获取一个 Animation 对象
         * @param sn
         * @param x
         * @param y
         * @param fps
         * @param excludeKey 使用该属性，将不会出现 sourceName 与 excludeKey 相同的动画（忽略Animation的容器是否相同）。将会使用 ani.name 记录excludeKey。如果使用该参数，请保证在回收前不会改变 ani.name 属性。
         * @return 注意：如果 excludeKey 已经存在，将会更新已存在 ani 的 x 和 y，以及从第一帧开始播放，并返回 null
         */
        public static getAnimation(sn: string = "", x: number = 0, y: number = 0, fps: number = 0, excludeKey: string = null): Animation {
            let ani: Animation;

            //已存在 sourceName 与 excludeKey 相同的动画
            if (excludeKey != null) {
                excludeKey = sn + "_" + excludeKey;
                ani = CachePool._aniList[excludeKey];
                if (ani != null) {
                    ani.x = x;
                    ani.y = y;
                    ani.play(1, ani.repeatCount, ani.stopFrame, ani.handler);
                    return null;
                }
            }

            if (CachePool._aniPool.length == 0) {
                ani = new Animation(sn, fps);
            }
            else {
                ani = CachePool._aniPool.pop();
                if (sn != "") ani.sourceName = sn;
                if (fps != 0) ani.fps = fps;
            }
            ani.setPosition(x, y);

            if (excludeKey != null) {
                ani.name = excludeKey;
                CachePool._aniList[excludeKey] = ani;
            }

            return ani;
        }


        /**
         * 获取一个 ArtText 对象
         * @param x
         * @param y
         * @param align
         * @param valign
         * @param spacing
         * @return
         */
        public static getArtText(x: number = 0, y: number = 0, align: string = "left", valign: string = "top", spacing: number = 0): ArtText {
            let at: ArtText = CachePool._atPool.length == 0
                ? new ArtText()
                : CachePool._atPool.pop();
            at.setPosition(x, y);
            at.align = align;
            at.valign = valign;
            at.spacing = spacing;
            return at;
        }


        /**
         * 获取一个 Label 对象
         * @param x
         * @param y
         * @param styleName
         * @param width
         * @param height
         * @param align
         * @param valign
         * @return
         */
        public static getLabel(x: number = 0, y: number = 0,
                               styleName: string = "label",
                               width: number = 0, height: number = 0,
                               align: string = "left", valign: string = "top"): Label {
            let label: Label = CachePool._labelPool.length == 0
                ? new Label()
                : CachePool._labelPool.pop();
            label.styleName = styleName;
            label.setPosition(x, y);
            label._width = width;
            label._height = height;
            label.setDimensions(width, height);
            label.align = align;
            label.valign = valign;
            return label;
        }


        /**
         * 获取一个 Point 对象
         * @param x
         * @param y
         * @return
         */
        public static getPoint(x: number = 0, y: number = 0): Point {
            if (CachePool._pointPool.length == 0) {
                return new Point(x, y);
            }
            else {
                return CachePool._pointPool.pop().setTo(x, y);
            }
        }


        /**
         * 获取一个 Rectangle 对象
         * @param x
         * @param y
         * @param width
         * @param height
         * @return
         */
        public static getRectangle(x: number = 0, y: number = 0, width: number = 0, height: number = 0): Rectangle {
            if (CachePool._rectPool.length == 0) {
                return new Rectangle(x, y, width, height);
            }
            else {
                return CachePool._rectPool.pop().setTo(x, y, width, height);
            }
        }


        /**
         * 获取一个 Dictionary 对象
         */
        public static getDictionary(): Dictionary {
            if (CachePool._dicPool.length == 0) {
                return new Dictionary();
            }
            else {
                return CachePool._dicPool.pop();
            }
        }


        /**
         * 回收一个[ Bitmap / Animation / ArtText / Point / Rectangle / Dictionary ]对象。
         *
         * 该函数可用作事件Hander，比如：
         * ani.event_addListener(lolo.AnimationEvent.ANIMATION_END, lolo.CachePool.recycle, lolo.CachePool);
         *
         * 也可以传入一个需要回收的对象列表，比如：recycle( bs, ani, ani, at, p, rect );
         * @param args
         */
        public static recycle(...args: any[]): void {
            let obj: any = args[0];
            if (obj == null) return;

            // 列表循环回收
            let len: number = args.length;
            if (Object.prototype.toString.call(obj) === "[object Array]" && len == 1) {// ObjectUtil.isArray(obj)
                args = obj;
                len = args.length;
            }
            if (args.length > 1) {
                for (let i = 0; i < len; i++) CachePool.recycle(args[i]);
                return;
            }


            // event handler
            if (obj instanceof Event) {
                let event: Event = obj;
                obj = event.target;
                (<IEventDispatcher>obj).event_removeListener(event.type, CachePool.recycle, CachePool);
            }

            // 显示对象相关属性重置
            if (obj instanceof cc.Node) {
                let disObj: cc.Node = obj;
                disObj.setRotation(0);
                disObj.setOpacity(255);
                disObj.setVisible(true);
                disObj.setScale(1);
                disObj.removeFromParent();
                if (disObj._filter != null && disObj._filter != Filter.NONE)
                    disObj.setFilter(Filter.NONE);
            }

            // 各对象回收相关处理
            if (obj instanceof Point) {
                CachePool._pointPool.push(obj);
            }

            else if (obj instanceof Bitmap) {
                CachePool._bmpPool.push(obj);
            }

            else if (obj instanceof Animation) {
                let ani: Animation = obj;
                ani.stop();
                delete CachePool._aniList[ani.name];
                ani.setName("");
                CachePool._aniPool.push(ani);
            }

            else if (obj instanceof ArtText) {
                let at: ArtText = obj;
                at.prefix = null;
                at.text = null;
                CachePool._atPool.push(at);
                at.clean();
            }

            else if (obj instanceof Label) {
                let label: Label = obj;
                label.stroke = label.shadow = TextField.EFFECT_DISABLED;
                label.text = "";
                CachePool._labelPool.push(label);
            }

            else if (obj instanceof Rectangle) {
                CachePool._rectPool.push(obj);
            }

            else if (obj instanceof Dictionary) {
                (<Dictionary>obj).clean();
                CachePool._dicPool.push(obj);
            }
        }


        /**
         * 清理缓存池
         * @param type    1 : Animation 缓存池 和 不能重叠的动画列表
         *                2 : Bitmap 缓存池
         *                3 : ArtText 缓存池
         *                4 : Label 缓存池
         *                5 : Point 缓存池
         *                6 : Rectangle 缓存池
         *                7 : Dictionary 缓存池
         *                其他值 : 所有缓存池
         */
        public static clean(type: number = 0): void {
            switch (type) {
                case 1:
                    CachePool._aniPool.length = 0;
                    CachePool._aniList = {};
                    break;
                case 2:
                    CachePool._bmpPool.length = 0;
                    break;
                case 3:
                    CachePool._atPool.length = 0;
                    break;
                case 4:
                    CachePool._labelPool.length = 0;
                    break;
                case 5:
                    CachePool._pointPool.length = 0;
                    break;
                case 6:
                    CachePool._rectPool.length = 0;
                    break;
                case 7:
                    CachePool._dicPool.length = 0;
                    break;

                default:
                    CachePool.clean(1);
                    CachePool.clean(2);
                    CachePool.clean(3);
                    CachePool.clean(4);
                    CachePool.clean(5);
                    CachePool.clean(6);
                    CachePool.clean(7);
            }
        }

        //
    }
}