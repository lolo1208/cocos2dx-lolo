declare namespace lolo {

    /**
     * WebSocket（接口）定义
     */
    interface IWebSocket {
        binaryType: string;
        readonly bufferedAmount: number;
        readonly extensions: string;
        readonly protocol: string;
        readonly readyState: number;
        readonly url: string;

        onclose: (this: this, ev: CloseEvent) => any;
        onerror: (this: this, ev: ErrorEvent) => any;
        onmessage: (this: this, ev: MessageEvent) => any;
        onopen: (this: this, ev: Event) => any;

        send(data: any): void;
        close(): void;
    }

    /**对原始 WebSocket Class 的引用*/
    let __WebSocket: any = WebSocket;
}


namespace lolo {


    /**
     * WebSocket
     * @author LOLO
     */
    export class WebSocket extends EventDispatcher {

        /**是否正在建立连接中*/
        protected _connecting: boolean;
        /**是否已经建立好连接了*/
        protected _connected: boolean;

        protected _ws: IWebSocket;
        protected _data: string|ArrayBuffer;


        public constructor() {
            super();
        }


        //


        /**
         * 建立连接
         */
        protected onOpen(event: Event): void {
            this._connecting = false;
            this._connected = true;
            this.event_dispatch(Event.create(SocketEvent, SocketEvent.CONNECT));
        }


        /**
         * 收到消息
         */
        protected onMessage(event: MessageEvent): void {
            this._data = event.data;
            this.event_dispatch(Event.create(SocketEvent, SocketEvent.DATA));
        }


        /**
         * 连接错误
         */
        protected onError(event: ErrorEvent): void {
            this._connected = this._connecting = false;
            this.close();
            this.event_dispatch(Event.create(SocketEvent, SocketEvent.ERROR));
        }


        /**
         * 连接关闭
         */
        protected onClose(event: CloseEvent): void {
            this._connected = this._connecting = false;
            this.close();
            this.event_dispatch(Event.create(SocketEvent, SocketEvent.CLOSE));
        }


        //


        /**
         * 通过 host 与 port 与服务器建立连接
         * @param host
         * @param port
         */
        public connect(host: string, port: number): void {
            this.connectByUrl("ws://" + host + ":" + port);
        }


        /**
         * 通过 url 与服务器建立连接
         * @param url
         */
        public connectByUrl(url: string): void {
            this.close();

            this._connecting = true;

            this._ws = new __WebSocket(url);
            this._ws.binaryType = "arraybuffer";
            this._ws.onopen = this.onOpen.bind(this);
            this._ws.onmessage = this.onMessage.bind(this);
            this._ws.onerror = this.onError.bind(this);
            this._ws.onclose = this.onClose.bind(this);
        }


        /**
         * 发送数据
         * @param data
         */
        public send(data: string|ArrayBuffer|ByteArray): void {
            if (!this._connected) return;

            if (data instanceof ByteArray) {
                this._ws.send(data.buffer);
            }
            else {
                this._ws.send(data);
            }
        }


        /**
         * 关闭当前连接，并丢弃 WebSocket 对象
         */
        public close(): void {
            if (this._ws == null) return;

            let connected: boolean = this._connected;
            let connecting: boolean = this._connecting;
            this._connecting = this._connected = false;

            let ws: IWebSocket = this._ws;
            ws.onopen = ws.onmessage = ws.onerror = ws.onclose = WebSocket.emptyCallback;
            this._ws = null;

            if (connecting || connected) {
                ws.close();
                if (connected) this.event_dispatch(Event.create(SocketEvent, SocketEvent.CLOSE));
            }
        }


        /**
         * 是否正在建立连接中
         */
        public get connecting(): boolean {
            return this._connecting;
        }


        /**
         * 当前是否已经建立连接
         */
        public get connected(): boolean {
            return this._connected;
        }


        /**
         * 读取上次收到的数据。
         * 数据在读取后将会被置为null。
         * 如果数据在 SocketEvent.DATA 事件抛出后没有被读取，在下次收到数据时将会被覆盖
         */
        public readData(): string|ArrayBuffer {
            if (this._data != null) {
                let data: any = this._data;
                this._data = null;
                return data;
            }
            return null;
        }


        //


        // /**
        //  * 建立连接，但是已被丢弃，需要马上关闭。
        //  * HTML5 在建立连接前调用 close() 会有警告
        //  */
        // protected static onOpen_close(event: Event): void {
        //     let ws: IWebSocket = <IWebSocket>this;
        //     ws.onopen = WebSocket.emptyCallback;
        //     ws.close();
        // }


        /**
         * native 回调不能设为 null，会报错
         */
        protected static emptyCallback(): void {
        }


        /**
         * 销毁
         */
        public destroy(): void {
            this.close();
        }


        //
    }
}