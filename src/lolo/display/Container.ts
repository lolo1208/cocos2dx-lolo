/// <reference path="../display/DisplayObjectContainer.ts"/>


namespace lolo {


    /**
     * 容器
     * @author LOLO
     */
    export class Container extends DisplayObjectContainer {

        /**是否自动添加到显示对象、从显示对象中移除*/
        public autoRemove: boolean = true;
        /**在初始化界面完成后，是否立即显示*/
        public initShow: boolean;

        /**是否已经显示*/
        protected _showed: boolean = false;
        /**对父级容器的引用*/
        protected _target_parent: cc.Node;


        public constructor() {
            super();

            this.visible = false;
        }


        /**
         * 初始化用户界面
         * @param chains Object(JSON)访问链。如果 config 传入 null，将根据访问链第一位的值去 lolo.loader 中获取Object(JSON)。否则根据 chains 在 config 中取子集
         * @param config 界面的配置信息
         */
        public initUI(chains: string, config: any = null): void {
            AutoUtil.autoUI(this, chains, config);
            if (this.initShow) this.show();
        }


        /**
         * 显示
         */
        public show(): void {
            if (!this._showed) {
                this._showed = true;
                this.visible = true;
                if (this.autoRemove /*&& this.getParent() == null*/ && this._target_parent != null)
                    this._target_parent.addChild(this);
                this.startup();
            }
        }


        /**
         * 隐藏
         */
        public hide(): void {
            if (this._showed) {
                this._showed = false;
                this.visible = false;

                let p: cc.Node = this.getParent();
                if (p != null) this._target_parent = p;

                if (this.autoRemove) this.removeFromParent();
                this.reset();
            }
        }


        /**
         * 当前如果为显示状态，将会切换到隐藏状态。
         * 相反，如果为隐藏状态，将会切换到显示状态
         */
        public showOrHide(): void {
            this._showed ? this.hide() : this.show();
        }


        /**
         * 当前是否已经显示
         */
        public get showed(): boolean {
            return this._showed;
        }


        /**
         * 启动
         */
        protected startup(): void {

        }


        /**
         * 重置
         */
        protected reset(): void {

        }

        //
    }
}