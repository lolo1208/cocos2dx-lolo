namespace lolo {


    /**
     * 基本的显示对象容器
     * @author LOLO
     */
    export class DisplayObjectContainer extends cc.Node {

        /**子节点是否有变化（有变化时，会重新计算宽高）*/
        public childResized: boolean = false;

        /**根据子节点计算出来的宽高*/
        protected _childrenWidth: number = 0;
        protected _childrenHeight: number = 0;


        public constructor() {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this.event_addListener(Event.CHILD_RESIZE, this.childResizeHandler, this);
        }


        /**
         * 重写添加子对象方法
         * - 支持对 child 多次调用addChild()
         * - 标记子节点变化，用于计算宽度
         * @param args [ child: Node, localZOrder?: number, tagOrName?: number|string ]
         */
        public addChild(...args: any[]): void {
            let child: cc.Node = args[0];
            if (child == null) return;

            this.childResized = true;
            child.removeFromParent();
            super.addChild.apply(this, args);
        }


        /**
         * 重写添加子对象方法
         * - 标记子节点变化，用于计算宽度
         * @param child
         * @param cleanup
         */
        public removeChild(child: cc.Node, cleanup: boolean = true): void {
            if (child == null) return;

            this.childResized = true;
            super.removeChild(child, cleanup);
        }


        /**
         * 重写移除所有子对象方法
         * - 标记子节点变化，用于计算宽度
         * @param cleanup
         */
        public removeAllChildren(cleanup: boolean = true): void {
            if (this.childrenCount == 0) return;

            this.childResized = true;
            super.removeAllChildren(cleanup);
        }


        /**
         * 宽度
         */
        public setWidth(value: number): void {
            this._width = value;
        }

        public getWidth(): number {
            if (this._width > 0) return this._width;
            if (this.childResized) this.getChildrenSize();
            return this._childrenWidth;
        }


        /**
         * 高度
         */
        public setHeight(value: number): void {
            this._height = value;
        }

        public getHeight(): number {
            if (this._height > 0) return this._height;
            if (this.childResized) this.getChildrenSize();
            return this._childrenHeight;
        }


        /**
         * 根据子节点计算出宽高
         */
        protected getChildrenSize(): void {
            if (!this.childResized) return;
            this.childResized = false;

            let children: cc.Node[] = this.children;
            if (children.length == 0) {
                this._childrenWidth = this._childrenHeight = 0;
                return;
            }

            let count: number = children.length;
            let i: number = 0;
            let child: cc.Node;
            while (i < count) {
                child = children[i];
                i++;
                // 模态背景的宽高不计算在内
                if (child instanceof ModalBackground) {
                    child = null;
                    continue;
                }
                break;
            }

            if (child == null) {
                this._childrenWidth = this._childrenHeight = 0;
                return;
            }

            let minX: number = child.x;
            let minY: number = child.y;
            let maxX: number = minX + child.width;
            let maxY: number = minY + child.height;
            let x: number, y: number, w: number, h: number;
            for (; i < count; i++) {
                child = children[i];
                if (child instanceof ModalBackground) continue;// 模态背景的宽高不计算在内

                x = child.x;
                y = child.y;
                w = x + child.width;
                h = y + child.height;
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (w > maxX) maxX = w;
                if (h > maxY) maxY = h;
            }
            this._childrenWidth = maxX - minX;
            this._childrenHeight = maxY - minY;
        }


        /**
         * 子节点的尺寸有改变
         * @param event
         */
        protected childResizeHandler(event: Event): void {
            this.childResized = true;
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled()) return false;// 当前节点不可见

            let children: cc.Node[] = this.children;
            let len: number = children.length;
            for (let i = 0; i < len; i++) {
                let child: cc.Node = children[i];
                if (child instanceof ModalBackground) continue;// 忽略模态背景
                if (child.hitTest(worldPoint)) return true;
            }
            return false;
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            this.event_removeListener(Event.CHILD_RESIZE, this.childResizeHandler, this);

            super.destroy();
        }


        //
    }
}