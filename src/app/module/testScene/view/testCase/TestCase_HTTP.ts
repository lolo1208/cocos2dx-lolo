namespace app.testScene {


    import HttpRequest = lolo.HttpRequest;
    import HttpResponseType = lolo.HttpResponseType;
    import HttpEndStatus = lolo.HttpEndStatus;
    import HttpRequestEvent = lolo.HttpRequestEvent;
    import Button = lolo.Button;
    import Label = lolo.Label;
    import DisplayObjectContainer = lolo.DisplayObjectContainer;
    import TouchScrollBar = lolo.TouchScrollBar;


    /**
     * 测试 HttpRequest
     * @author LOLO
     */
    export class TestCase_HTTP extends lolo.Container {

        public sendBtn: Button;
        public contentVSB: TouchScrollBar;
        public contentC: DisplayObjectContainer;
        public contentText: Label;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            this.sendBtn.event_addListener(lolo.TouchEvent.TOUCH_TAP, this.sendBtn_touchTapHandler, this);
        }


        private sendBtn_touchTapHandler(event: lolo.TouchEvent): void {
            let hr: HttpRequest = new HttpRequest();
            // hr.responseType = HttpResponseType.ARRAY_BUFFER;
            hr.open("http://httpbin.org/post", "POST");
            hr.send("a=hello&b=world&r=" + Math.random(), lolo.handler(this.httpResultHandler, this));
        }


        private httpResultHandler(hr: HttpRequest, status: string): void {
            let str: string = "status：" + status;
            if (status == HttpEndStatus.COMPLETE) {
                str += "\n-----------------------------------------------------\n";
                str += hr.response;
            }
            this.contentText.text = str;
            this.contentVSB.render();
            lolo.layout.stageLayout(this);

            return;

            let t: number = new Date().getTime();
            let n1: number = 999;
            let n2: number = 888;
            let n3: number = 0;
            for (let i = 1; i < 1234567; i++) {
                n3 = n1 + n2 + i;
                n3 = n1 - n2 - i;
                n3 = n1 * n2 * i;
                n3 = n1 / n2 / i;
            }
            console.log("test:::" + (new Date().getTime() - t));
        }


        protected startup(): void {
            super.startup();
        }


        //
    }
}