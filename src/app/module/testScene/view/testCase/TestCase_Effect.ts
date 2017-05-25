namespace app.testScene {


    import ItemGroup = lolo.ItemGroup;
    import TouchEvent = lolo.TouchEvent;
    import Button = lolo.Button;
    import Constants = lolo.Constants;
    import BehindFloat = lolo.BehindFloat;
    import UpFloat = lolo.UpFloat;
    import DownFloat = lolo.DownFloat;
    import DelayedHide = lolo.DelayedHide;
    import PositionFloat = lolo.PositionFloat;
    import BezierFloat = lolo.BezierFloat;
    import Point = lolo.Point;
    import Bitmap = lolo.Bitmap;
    import CachePool = lolo.CachePool;


    /**
     * 测试 lolo.effects 包
     * @author LOLO
     */
    export class TestCase_Effect extends lolo.Container {


        public group: ItemGroup;


        public constructor() {
            super();

        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);
        }


        private stage_touchBeginHandler(event: TouchEvent): void {
            let hp: Point = lolo.CachePool.getPoint(lolo.ui.halfStageWidth, lolo.ui.halfStageHeight);
            let tp: Point = lolo.CachePool.getPoint(lolo.gesture.touchPoint.x, lolo.gesture.touchPoint.y);

            let at: lolo.ArtText = lolo.CachePool.getArtText(tp.x, tp.y, Constants.ALIGN_CENTER, Constants.VALIGN_MIDDLE);
            lolo.stage.addChildToLayer(at, lolo.Constants.LAYER_NAME_ALERT);
            at.prefix = "public.artText.num" + parseInt(Math.random() * 2 + 1);
            at.text = "-" + parseInt(Math.random() * 9999);

            switch ((<Button>this.group.selectedItem).label) {

                case "UpFloat":
                    UpFloat.once(at);
                    break;

                case "DownFloat":
                    DownFloat.once(at);
                    break;

                case "BehindFloat":
                    at.x = hp.x;
                    at.y = hp.y;
                    BehindFloat.once(at, tp);
                    break;

                case "BezierFloat":
                    CachePool.recycle(at);
                    let arrow: Bitmap = CachePool.getBitmap("test.arrow");
                    lolo.stage.addChildToLayer(arrow, lolo.Constants.LAYER_NAME_ALERT);
                    BezierFloat.once(tp, hp, arrow);
                    break;

                case "DelayedHide":
                    DelayedHide.once(at);
                    break;

                case "PositionFloat":
                    PositionFloat.once(at, hp);
                    break;
            }
        }


        protected startup(): void {
            super.startup();

            lolo.gesture.event_addListener(TouchEvent.TOUCH_BEGIN, this.stage_touchBeginHandler, this);
        }


        protected reset(): void {
            super.reset();

            lolo.gesture.event_removeListener(TouchEvent.TOUCH_BEGIN, this.stage_touchBeginHandler, this);
        }


        //
    }
}