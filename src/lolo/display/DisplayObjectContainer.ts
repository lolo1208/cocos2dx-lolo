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
         * @param child
         * @param localZOrder
         * @param tagOrName
         */
        public addChild(child: cc.Node, localZOrder?: number, tagOrName?: number | string): void {
            if (child == null) return;

            this.childResized = true;
            child.removeFromParent();
            super.addChild.apply(this, arguments);
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
            super.removeChild.apply(this, arguments);
        }


        /**
         * 重写移除所有子对象方法
         * - 标记子节点变化，用于计算宽度
         * @param cleanup
         */
        public removeAllChildren(cleanup: boolean = true): void {
            if (this.childrenCount == 0) return;

            this.childResized = true;
            super.removeAllChildren.apply(this, arguments);
        }


        /**
         * 宽度
         */
        public setWidth(value: number): void {
            this._width = value;
        }

        public getWidth(): number {
            let w: number;
            if (this._width > 0) w = this._width;
            else {
                if (this.childResized) this.getChildrenSize();
                w = this._childrenWidth;
            }
            return w * this._scaleX;
        }


        /**
         * 高度
         */
        public setHeight(value: number): void {
            this._height = value;
        }

        public getHeight(): number {
            let h: number;
            if (this._height > 0) h = this._height;
            else {
                if (this.childResized) this.getChildrenSize();
                h = this._childrenHeight;
            }
            return h * this._scaleY;
        }


        /**
         * 根据子节点计算出宽高
         */
        protected getChildrenSize(): void {
            if (!this.childResized) return;
            this.childResized = false;

            let children: cc.Node[] = this.getChildren();
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