namespace app.testScene {

    import HttpRequest = lolo.HttpRequest;
    import HttpEndStatus = lolo.HttpEndStatus;


    export class TestBinding {


        public static sendHttp(num: number): void {
            let hr: HttpRequest = new HttpRequest();
            hr.open("http://httpbin.org/post", "POST");
            hr.send("num=" + num, lolo.handler(this.httpResultHandler, this));
        }


        private static httpResultHandler(hr: HttpRequest, status: string): void {
            let data: string;
            if (status == HttpEndStatus.COMPLETE) {
                data = hr.response;
            }
            else {
                data = "error";
            }
            TestData.str1 = TestData.str2 = data;
        }


    }

}