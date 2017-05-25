namespace app.core {
    /**
     * Loading界面
     * @author LOLO
     */
    export class Loading extends lolo.DisplayObjectContainer {

        /**Loading文字*/
        private _loadingText: cc.LabelTTF;


        /**
         * 构造函数
         */
        public constructor() {
            super();
            this.setAnchorPoint(0.5, 0.5);

            let tf: cc.LabelTTF = this._loadingText = new cc.LabelTTF();
            tf.setDimensions(500, 100);
            tf.setString("Loading...");
            tf.setHorizontalAlignment(1);
            tf.setVerticalAlignment(1);
            tf.setFontSize(30);
            this.addChild(tf);

            this.resizeHandler();
        }


        /**
         * 开始侦听
         */
        public start(): void {
            lolo.loader.event_addListener(lolo.LoadEvent.ITEM_COMPLETE, this.completeHandler, this);
            // lolo.loader.event_addListener(lolo.LoadEvent.PROGRESS, this.progressHandler, this);
            lolo.loader.event_addListener(lolo.LoadEvent.ERROR, this.errorHandler, this);
            lolo.stage.event_addListener(lolo.Event.RESIZE, this.resizeHandler, this);
        }


        /**
         * 销毁
         */
        public dispose(): void {
            lolo.loader.event_removeListener(lolo.LoadEvent.ITEM_COMPLETE, this.completeHandler, this);
            // lolo.loader.event_removeListener(lolo.LoadEvent.PROGRESS, this.progressHandler, this);
            lolo.loader.event_removeListener(lolo.LoadEvent.ERROR, this.errorHandler, this);
            lolo.stage.event_removeListener(lolo.Event.RESIZE, this.resizeHandler, this);
            this.removeFromParent();
        }


        private resizeHandler(event?: lolo.Event): void {
            this.setPosition(lolo.stage.halfStageWidth, -lolo.stage.halfStageHeight);// anchor(0.5, 0.5)
        }


        /**
         * 资源加载中
         * @param event
         */
        private progressHandler(event: lolo.LoadEvent): void {
            let progress: number = (event.lii.bytesLoaded / event.lii.bytesTotal + lolo.loader.numCurrent) / lolo.loader.numTotal;
            this.progress = progress;

            if (event.lii.name == "") {
                this.text = "Loading...   " + (lolo.loader.numCurrent + 1) + "/" + lolo.loader.numTotal;
            }
            else {
                this.text = lolo.language.getLanguage(
                    "010101", event.lii.name,
                    Math.floor(progress * 100),
                    lolo.loader.numCurrent + 1, lolo.loader.numTotal
                );
            }
        }

        /**
         * 加载单个资源完成
         * @param event
         */
        private completeHandler(event: lolo.LoadEvent): void {
            if (event.lii.name == "") {
                this.text = "Loading...   " + lolo.loader.numCurrent + "/" + lolo.loader.numTotal;
            }
            else {
                this.text = lolo.language.getLanguage("010103", event.lii.name);
            }
        }

        /**
         * 加载所有资源完成
         * @param event
         */
        private allCompleteHandler(event: lolo.LoadEvent): void {
            this.progress = 1;
            this.text = lolo.language.getLanguage("010104");
        }

        /**
         * 加载资源失败
         * @param event
         */
        private errorHandler(event: lolo.LoadEvent): void {
            this.progress = 1;
            this.text = lolo.language.getLanguage("010105", event.lii.name);
        }


        private set text(value: string) {
            this._loadingText.setString(value);
            // console.log(value);
        }

        private set progress(value: number) {

        }

        //
    }
}