namespace lolo {


    /**
     * 浮动效果的接口
     * @author LOLO
     */
    export interface IFloat {

        /**
         * 应用该效果的目标
         */
        target: cc.Node;

        /**
         * 浮动结束后的回调
         * 调用该方法时，将会传递一个boolean类型的参数，表示效果是否正常结束
         * onComplete(complete:boolean, float:IFloat)
         */
        onComplete: Handler;

        /**
         * 是否正在浮动中
         */
        floating: boolean;

        /**
         * 开始播放浮动效果
         */
        start(): void;

        /**
         * 结束播放浮动效果
         * @param complete 效果是否正常结束
         */
        end(complete?: boolean): void;


        //
    }

}