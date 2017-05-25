namespace lolo.rpg {


    /**
     * 角色加载外形时，默认显示的Loading
     * @author LOLO
     */
    export class AvatarLoading extends DisplayObjectContainer {

        /**剪影*/
        public sketch: Bitmap;
        /**加载进度显示文本*/
        public progressText: Label;

        /**加载进度（0~1）*/
        private _progress: number = 0;


        public constructor() {
            super();
            this.initUI();
        }


        protected initUI(): void {
            AutoUtil.autoUI(this, "mainUIConfig.avatarLoading");
        }


        /**
         * 加载进度（0~1）
         */
        public set progress(value: number) {
            this.setProgress(value);
        }

        protected setProgress(value: number): void {
            this._progress = value;
            this.progressText.text = Math.floor(value * 100) + "%";
        }

        public get progress(): number {
            return this._progress;
        }


        /**
         * 清除并丢弃该Loading
         */
        public clean(): void {
            if (this.parent != null) this.parent.removeChild(this);
        }

        //
    }
}