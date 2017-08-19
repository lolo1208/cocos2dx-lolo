namespace lolo {


    /**
     * HTTP 请求方式枚举值
     * @author LOLO
     */
    export class HttpMethod {
        public static GET: string = "GET";
        public static POST: string = "POST";
    }


    /**
     * HTTP 请求返回数据类型的枚举值
     * @author LOLO
     */
    export class HttpResponseType {
        public static TEXT: string = "text";
        public static ARRAY_BUFFER: string = "arraybuffer";
    }


    /**
     * HTTP 结束状态的枚举值
     * @author LOLO
     */
    export class HttpEndStatus {
        /**请求完成（成功）*/
        public static COMPLETE: string = "complete";
        /**请求错误*/
        public static ERROR: string = "error";
        /**请求超时*/
        public static TIMEOUT: string = "timeout";
        /**请求被终止了*/
        public static ABORT: string = "abort";
    }


    /**
     * 使用 XMLHttpRequest 对象，发送 HTTP 请求
     * @author LOLO
     */
    export class HttpRequest extends EventDispatcher {

        /**表明在进行跨站（cross-site)的访问控制（Access-Control）请求时，是否使用认证信息（例如cookie或授权的header）。（这个标志不会影响同站的请求，默认 false）*/
        public withCredentials: boolean;
        /**返回数据类型。文本（HttpResponseType.TEXT）[默认] 或 二进制数据（HttpResponseType.ArrayBuffer）*/
        public responseType: string = "text";

        /**已加载的字节数*/
        public bytesLoaded: number = 0;
        /**总字节数*/
        public bytesTotal: number = 1;
        /**上次请求的结束状态*/
        public endStatus: string;
        /**上次请求的HTTP状态码*/
        public statusCode: number;

        protected _xhr: XMLHttpRequest;
        protected _url: string;
        protected _method: string;
        protected _timeout: number;

        /**设置的请求头列表*/
        protected _requestHeaders: Object;
        /**结束时的回调*/
        protected _handler: Handler;


        public constructor() {
            super();

            this.responseType = HttpResponseType.TEXT;
            this.withCredentials = false;

            this._timeout = 8000;
            this._requestHeaders = {};
        }


        //


        /**
         * 结束当前请求
         * @param status
         */
        protected end(status: string): void {
            if (this._xhr == null) return;

            this.endStatus = status;

            this.removeCallbacks();
            let event: HttpRequestEvent = Event.create(HttpRequestEvent, HttpRequestEvent.END);
            event.endStatus = status;
            this.event_dispatch(event);

            this.doHandler(status);
        }

        protected doHandler(status: string): void {
            let handler: Handler = this._handler;
            if (handler != null) {
                this._handler = null;
                handler.execute(this, status);
            }
        }


        /**
         * readyState 有改变时
         */
        protected readyStateChangeHandler(): void {
            let xhr: XMLHttpRequest = this._xhr;
            this.statusCode = xhr.status;
            if (xhr.readyState == 4) {// 4 = "loaded"
                if (xhr.status > 199 && xhr.status < 300) {// 200 - 299
                    this.bytesLoaded = this.bytesTotal;
                    this.end(HttpEndStatus.COMPLETE);
                }
            }
        }

        /**
         * 请求错误
         */
        protected onerrorHandler(): void {
            this.end(HttpEndStatus.ERROR);
        }

        /**
         * 请求超时
         */
        protected timeoutHandler(): void {
            this.end(HttpEndStatus.TIMEOUT);
        }

        /**
         * 请求被终止了
         */
        protected abortHandler(): void {
            this.end(HttpEndStatus.ABORT);
        }


        /**
         * 加载进度有变化（native 不会产生该回调）
         * @param event
         */
        protected progressHandler(event: ProgressEvent): void {
            if (event.lengthComputable) {
                this.bytesLoaded = event.loaded;
                this.bytesTotal = event.total;
                this.event_dispatch(Event.create(HttpRequestEvent, HttpRequestEvent.PROGRESS));
            }
        }


        //


        /**
         * 初始化一个请求（并不是发送请求）
         * 注意: 若在已经发出请求的对象上调用此方法，相当于立即调用abort()
         * @param url 该请求所要访问的URL
         * @param method 请求所使用的HTTP方法（请使用 HttpMethod 定义的枚举值）
         */
        public open(url: string, method: string = "GET"): void {
            this.destroy();

            this._url = url;
            this._method = method;
            this.bytesLoaded = 0;
            this.bytesTotal = 1;

            let xhr: XMLHttpRequest = this._xhr = cc.loader.getXMLHttpRequest();
            xhr.onreadystatechange = this.readyStateChangeHandler.bind(this);
            xhr.onerror = this.onerrorHandler.bind(this);
            xhr.ontimeout = this.timeoutHandler.bind(this);
            xhr.onabort = this.abortHandler.bind(this);
            if (!isNative) xhr.onprogress = this.progressHandler.bind(this);

            xhr.open(method, url);
        }


        /**
         * 发送请求
         * @param data 需要发送的数据
         * @param handler 请求结束时的回调，该回调包含两个参数，本身以及结束状态（状态类型见 HttpRequestEvent）。
         *                resultHandler(hr:HttpRequest, status: string): void
         */
        public send(data?: any, handler?: Handler): void {
            if (this._xhr == null) return;

            if (this._handler != null && this._handler.once) this._handler.recycle();
            this._handler = handler;

            this._xhr.responseType = <any>this.responseType;
            this._xhr.withCredentials = this.withCredentials;
            this._xhr.timeout = this._timeout;
            for (let key in this._requestHeaders) {
                this._xhr.setRequestHeader(key, this._requestHeaders[key]);
            }

            this._xhr.send(data);
        }


        /**
         * 如果请求已经被发送，则立刻中止请求
         */
        public abort(): void {
            if (this._xhr == null) return;
            this._xhr.abort();
        }


        /**
         * 给指定的HTTP请求头赋值。
         * @param header 要设置的头部的名称。这个参数不应该包括空白、冒号或换行
         * @param value 头部的值。这个参数不应该包括换行
         */
        public setRequestHeader(header: string, value: string): void {
            this._requestHeaders[header] = value;
        }


        /**
         * 超时时间（毫秒）
         * 默认：8000
         */
        public set timeout(value: number) {
            this._timeout = value;
            if (this._xhr != null) this._xhr.timeout = value;
        }

        public get timeout(): number {
            return this._timeout;
        }


        /**
         * 当前请求的 url 地址
         */
        public get url(): string {
            return this._url;
        }

        /**
         * 当前请求的方式
         */
        public get method(): string {
            return this._method;
        }


        //


        /**
         * 获取指定响应头的值, 如果响应头还没被接受，或该响应头不存在，则返回""
         * @param header 要返回的响应头名称
         */
        public getResponseHeader(header: string): string {
            if (this._xhr == null) return null;
            return this._xhr.getResponseHeader(header);
        }

        /**
         * 返回所有响应头信息（响应头名和值），如果服务器还没接受响应头，则返回null
         */
        public getAllResponseHeaders(): string {
            if (this._xhr == null) return null;
            return this._xhr.getAllResponseHeaders();
        }


        /**
         * 请求返回的数据（根据 responseType 确定类型）
         */
        public get response(): any {

            if (this._xhr == null) return null;

            if (this._xhr.response != null) return this._xhr.response;

            if (this.responseType == "text") return this._xhr.responseText;

            if (this.responseType == "arraybuffer" && /msie 9.0/i.test(navigator.userAgent)) {
                return window["convertResponseBodyToText"](this._xhr["responseBody"]);
            }

            return null;
        }


        //


        /**
         * 移除当前 XMLHttpRequest 对象的回调
         */
        protected removeCallbacks(): void {
            if (this._xhr == null) return;

            let xhr: XMLHttpRequest = this._xhr;
            xhr.onreadystatechange = null;
            xhr.ontimeout = null;
            xhr.onabort = null;
            xhr.onerror = null;
            if (!isNative) xhr.onprogress = null;
        }


        /**
         * 销毁
         */
        public destroy(): void {
            this.removeCallbacks();
            if (this._xhr != null) this._xhr.abort();
        }


        //
    }
}