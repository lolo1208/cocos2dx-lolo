namespace lolo {


    /**
     * 验证工具类
     * @author LOLO
     */
    export class Validator {


        /**
         * 验证字符串长度大于零，并且没有空格(包括全角空格)
         * @param str 要验证的字符串
         * @return
         */
        public static noSpace(str: string): boolean {
            return str.length > 0 && str.indexOf(" ") == -1 && str.indexOf("　") == -1;
        }


        /**
         * 验证字符串不全是空格(包括全角空格)
         * @param str
         * @return
         */
        public static notExactlySpace(str: string): boolean {
            for (let i = 0; i < str.length; i++) {
                if (str.charAt(i) != " " && str.charAt(i) != "　") return true;
            }
            return false;
        }


        /**
         * 验证字符串是否为正确的邮箱地址
         * @param str
         * @return
         */
        public static rightEmail(str: string): boolean {
            let re: RegExp = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
            return re.test(str);
        }


        //
    }
}