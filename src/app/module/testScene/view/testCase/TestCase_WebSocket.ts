namespace app.testScene {


    import Button = lolo.Button;
    import DisplayObjectContainer = lolo.DisplayObjectContainer;
    import Label = lolo.Label;
    import TouchScrollBar = lolo.TouchScrollBar;
    import TouchEvent = lolo.TouchEvent;
    import WebSocket = lolo.WebSocket;
    import SocketEvent = lolo.SocketEvent;
    import ByteArray = lolo.ByteArray;
    import Endian = lolo.Endian;


    /**
     * 测试 WebSocket
     * @author LOLO
     */
    export class TestCase_WebSocket extends lolo.Container {

        public c: DisplayObjectContainer;
        public text: Label;
        public vsb: TouchScrollBar;

        public btn: Button;
        public sendStrBtn: Button;
        public senBytesBtn: Button;
        public clearBtn: Button;


        private _ws: WebSocket;
        private _count: number;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            this._ws = new WebSocket();
            this._ws.event_addListener(SocketEvent.CONNECT, this.ws_eventHandler, this);
            this._ws.event_addListener(SocketEvent.DATA, this.ws_eventHandler, this);
            this._ws.event_addListener(SocketEvent.ERROR, this.ws_eventHandler, this);
            this._ws.event_addListener(SocketEvent.CLOSE, this.ws_eventHandler, this);

            this.btn.event_addListener(TouchEvent.TOUCH_TAP, this.btn_touchTapHandler, this);
            this.sendStrBtn.event_addListener(TouchEvent.TOUCH_TAP, this.sendStrBtn_touchTapHandler, this);
            this.senBytesBtn.event_addListener(TouchEvent.TOUCH_TAP, this.senBytesBtn_touchTapHandler, this);
            this.clearBtn.event_addListener(TouchEvent.TOUCH_TAP, this.clearBtn_touchTapHandler, this);
        }


        private btn_touchTapHandler(event: TouchEvent): void {
            if (this._ws.connected) {
                this._ws.close();
            }
            else {
                this.btn.label = "connecting...";
                this._ws.connectByUrl("ws://echo.websocket.org");
            }
        }


        private sendStrBtn_touchTapHandler(event: TouchEvent): void {
            this._ws.send("asdasdas动物第三方圣地哦额123123*&#@&*#&对佛但法国！!Oo。.");
        }


        private senBytesBtn_touchTapHandler(event: TouchEvent): void {
            let bytes: ByteArray = new ByteArray();
            bytes.writeByte(++this._count);
            bytes.writeByte(-123);
            bytes.writeDouble(Math.random());
            bytes.writeUnsignedInt(4007654321);
            bytes.writeUTFBytes("aaa啊啊啊bbb");
            this._ws.send(bytes);
        }


        private clearBtn_touchTapHandler(event: TouchEvent): void {
            this.text.text = "";
            this.vsb.render();
        }


        private ws_eventHandler(event: SocketEvent): void {
            let str: string = this.text.text;
            str += "Event : " + event.type + "\n";
            switch (event.type) {

                case SocketEvent.CONNECT:
                    this.btn.label = "close";
                    this._count = 0;
                    break;

                case SocketEvent.CLOSE:
                    this.btn.label = "connect";
                    break;

                case SocketEvent.ERROR:
                    break;

                case SocketEvent.DATA:
                    let data: string|ArrayBuffer = this._ws.readData();
                    if (data instanceof ArrayBuffer) {
                        let bytes: ByteArray = new ByteArray(data);
                        str += "  -readUnsignedByte : " + bytes.readUnsignedByte() + "\n";
                        str += "  -readByte : " + bytes.readByte() + "\n";
                        str += "  -readDouble : " + bytes.readDouble() + "\n";
                        str += "  -readUnsignedInt : " + bytes.readUnsignedInt() + "\n";
                        str += "  -readUTFBytes : " + bytes.readUTFBytes() + "\n";
                    }
                    else {
                        str += "  -string : " + data + "\n";
                    }
                    break;
            }
            this.text.text = str;
            this.vsb.render();
        }


        protected startup(): void {
            super.startup();
        }


        //
    }
}