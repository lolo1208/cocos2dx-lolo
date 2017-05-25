namespace lolo {


    /**
     * 数据绑定工具
     * @author LOLO
     */
    export class Binding {


        /**
         * 将公用属性(target.targetProp) 与 数据源(data.dataPorp) 进行绑定
         * 当 数据源(data.dataPorp) 的值有改变时，公用属性(target.targetProp) 也会随之改变
         * @param target 要绑定数据的宿主
         * @param targetProp 要绑定数据的宿主的属性
         * @param data 数据源宿主
         * @param dataPorp 数据源宿主的属性
         * @param exec 是否需要将公用属性(target.targetProp)初始化成数据源(data.dataPorp)的值
         * @return
         */
        public static bindProperty(target: Object, targetProp: string, data: Object, dataPorp: string, exec: boolean = false): Watcher {
            if (exec) target[targetProp] = data[dataPorp];

            return new Watcher(data, dataPorp, null, target, targetProp);
        }


        /**
         * 将函数与 数据源(data.dataPorp) 进行绑定
         * 当 数据源(data.dataPorp) 的值有改变时，将会调用handler函数
         * @param handler 数据改变时，触发的回调
         * @param data 数据源宿主
         * @param dataPorp 数据源宿主的属性
         * @param exec 初始化时，是否需要执行一次handler函数
         * @return
         */
        public static bindSetter(handler: Handler, data: Object, dataPorp: string, exec: boolean = false): Watcher {
            if (exec) handler.execute(data[dataPorp]);

            return new Watcher(data, dataPorp, handler);
        }

        //
    }
}