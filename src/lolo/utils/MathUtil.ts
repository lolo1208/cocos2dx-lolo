namespace lolo {


    /**
     * 提供一些数学运算函数的工具
     * @author LOLO
     */
    export class MathUtil {


        /**
         * 随机一个分子，并返回该分子是否在 numerator 范围内
         * 例如：MathUtil.random(30, 100) 会有百分之三十的几率返回 true
         * @param numerator 分子
         * @param denominator 分母
         * @return
         */
        public static random(numerator: number = 50, denominator: number = 100): boolean {
            return Math.random() * denominator < numerator;
        }


        /**
         * 获取介于min与max之间的随机数，返回值大于等于min，小于max
         * @param min 最小值
         * @param max 最大值
         * @return
         */
        public static getBetweenRandom(min: number, max: number): number {
            let gap: number = max - min;
            return Math.random() * gap + min;
        }


        /**
         * 将百分数转换成小数
         * @param p 百分数字符串
         * @param symbol 参数p中所包含的百分比符号
         * @return
         */
        public static percentageToDecimal(p: string, symbol: string = "%"): number {
            return parseFloat(p.replace(symbol, "")) / 100;
        }


        //
    }
}