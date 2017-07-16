namespace lolo {


    /**
     * 模态背景
     * @author LOLO
     */
    export class ModalBackground extends cc.Sprite {

        private _textureRect: Rectangle;


        public constructor(target?: cc.Node) {
            super();
            lolo.CALL_SUPER_REPLACE_KEYWORD();

            this._textureRect = CachePool.getRectangle();
            this.touchEnabled = true;

            this.alpha = 0.1;
            this.zIndex = -100;
            if (target != null) target.addChild(this);
        }


        /**
         * 进行渲染更新
         * @param event
         */
        public render(event?: Event): void {
            this.setTexture(Constants.BLACK_TEXTURE);
            this._textureRect.width = lolo.stage.stageWidth;
            this._textureRect.height = lolo.stage.stageHeight;
            this.setTextureRect(this._textureRect);// 不能用 setScale()，native 不支持

            // 计算舞台左上角相对于父节点的位置
            let parent: cc.Node = this.parent;
            if (parent != null) {
                lolo.temp_p.setTo(0, lolo.stage.stageHeight);// 舞台左上角
                let p: cc.Point = parent.convertToNodeSpace(lolo.temp_p);
                this.x = p.x;
                this.y = -p.y;
            }
        }


        public onEnter(): void {
            super.onEnter();
            this.render();
            lolo.stage.event_addListener(Event.RESIZE, this.render, this, -100);
        }

        public onExit(): void {
            super.onExit();
            lolo.stage.event_removeListener(Event.RESIZE, this.render, this);
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled(worldPoint)) return false;// 当前节点不可见

            let p: cc.Point = this.convertToNodeSpace(worldPoint);
            lolo.temp_rect.setTo(0, 0, this._getWidth(), this._getHeight());
            return lolo.temp_rect.contains(p.x, p.y);
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            lolo.stage.event_removeListener(Event.RESIZE, this.render, this);
            if (this._textureRect != null) {
                CachePool.recycle(this._textureRect);
                this._textureRect = null;
            }

            super.destroy();
        }

        //
    }
}