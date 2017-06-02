namespace lolo {


    /**
     * 与后台通信的接口信息
     * @author LOLO
     */
    export class RequestInfo {

        /**这条请求的接口名称*/
        public command: string;

        /**参数名称列表*/
        public params: string[];

        /**这条请求的代号*/
        public token: number = 0;

        /**通信时，是否需要模态*/
        public modal: boolean;


        public constructor(command: string = "", modal: boolean = true, ...params: string[]) {
            this.command = command;
            this.modal = modal;
            this.params = params;
        }

        //
    }
}