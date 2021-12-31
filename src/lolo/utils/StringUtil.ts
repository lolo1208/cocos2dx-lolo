namespace lolo {


    /**
     * 字符串工具
     * @author LOLO
     */
    export class StringUtil {


        /**
         * 将指定字符串内的 "{n}" 标记替换成传入的参数
         * @param str 要替换的字符串
         * @param args 参数列表
         * @return
         */
        public static substitute(str: string, ...args: any[]): string {
            if (str == null) return "";

            let arr: string[] = (args.length == 1 && ObjectUtil.isArray(args[0])) ? args[0] : args;

            for (let i = 0; i < arr.length; i++) {
                str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arr[i]);
            }
            return str;
        }


        /**
         * 当num小于length指定的长度时，在num前面加上前导零
         * @param num
         * @param length
         * @return
         */
        public static leadingZero(num: number, length: number = 2): string {
            let str: string = num.toString();
            while (str.length < length) str = "0" + str;
            return str;
        }


        /**
         * 将目标字符串组合成html文本标签包含的字符串
         * @param str 要组合的字符串
         * @param color 颜色
         * @param size 文本尺寸
         * @return
         */
        public static toHtmlFont(str: string, color?: string, size?: number): String {
            let s: string = "<font";
            if (color != null) {
                if (color.charAt(0) != "#") color = "#" + color;
                s += " color='" + color + "'";
            }
            if (size != null) s += " size='" + size + "'";
            s += ">" + str + "</font>";
            return s;
        }


        /**
         * 千分位格式化数字
         * @param value 要格式化的值
         * @param decimals 保留小数的位数（小于0为保留所有）
         * @param thousandsSep 千位分隔符
         */
        public static numberFormat(value: number, decimals: number = 2, thousandsSep: string = ","): string {
            let str: string = "";
            let arr: any[] = value.toString().split(".");

            let count: number = Math.ceil(arr[0].length / 3);
            for (let i = 0; i < arr[0].length; i++) {
                if (i % 3 == 0 && str != "") str = thousandsSep + str;
                str = arr[0].charAt(arr[0].length - i - 1) + str;
            }

            if (arr[1] != null) {
                let d: number = arr[1].slice(0, (decimals > 0) ? decimals : arr[1].length);
                if (d > 0) str += "." + d.toString();
            }

            //负数
            if (str.charAt(0) == "-" && str.charAt(1) == thousandsSep) {
                str = "-" + str.slice(2, str.length);
            }
            return str;
        }


        /**
         * 将字符串中的所有正斜杠转换成反斜杠
         * @param str
         */
        public static slashToBackslash(str: string): string {
            return str.replace(/\//g, "\\");
        }

        /**
         * 将字符串中的所有反斜杠转换成正斜杠
         * @param str
         */
        public static backslashToSlash(str: string): string {
            return str.replace(/\\/g, "/");
        }


        /**
         * 删除字符串开头和末尾的所有空格字符。
         * 请直接使用：str.trim()
         * @param str
         */
        public static trim(str: String): String {
            return str.trim();
        }


        /**
         * 字符是否为：空格、制表符、回车符、换行符或换页符
         * @param character
         * @return
         */
        public static isWhitespace(character: string): boolean {
            switch (character) {
                case " ":
                case "　":
                case "\t":
                case "\r":
                case "\n":
                case "\f":
                    return true;
            }
            return false;
        }


        /**
         * 获取uint颜色值的16位字符串格式
         * @param color 颜色值
         * @param prefix 前缀
         * @return
         */
        public static getColorString(color: number, prefix: string = "0x"): string {
            let str: string = color.toString(16);
            while (str.length < 6) str = "0" + str;
            str = prefix + str.toLocaleUpperCase();
            return str;
        }


        public static parseHtmlText(htmltext: string): any[] {
            let stackList = [];
            let resutlList = [];
            let tagReg: RegExp = /^(font|a)\s/;
            let headReg: RegExp = /^(color|textColor|strokeColor|stroke|b|bold|size|fontFamily|href|target)(\s)*=/;

            let str: string;
            let firstIdx = 0;// 文本段开始位置
            let length: number = htmltext.length;
            while (firstIdx < length) {
                let startIdx: number = htmltext.indexOf("<", firstIdx);
                if (startIdx < 0) {
                    str = htmltext.substring(firstIdx);
                    if (str != "") {
                        stackList.length > 0
                            ? resutlList.push({text: str, style: stackList[stackList.length - 1]})
                            : resutlList.push({text: str});
                    }

                    firstIdx = length;
                }
                else {
                    str = htmltext.substring(firstIdx, startIdx);
                    if (str != "") {
                        stackList.length > 0
                            ? resutlList.push({text: str, style: stackList[stackList.length - 1]})
                            : resutlList.push({text: str});
                    }

                    let fontEnd = htmltext.indexOf(">", startIdx);
                    if (fontEnd == -1) {
                        throwError("[StringUtil.parseHtmlText] 语法错误，标签没有闭合！", htmltext);
                        fontEnd = startIdx;
                    }
                    else if (htmltext.charAt(startIdx + 1) == "\/") {// 关闭
                        stackList.pop();
                    }
                    else {
                        str = htmltext.substring(startIdx + 1, fontEnd).trim();
                        let info: any = {};

                        let header = [];
                        if (str.charAt(0) == "b") {
                            info[str] = "true";
                        }
                        else if (header = str.match(tagReg)) {
                            str = str.substring(header[0].length).trim();
                            let titles, next: number;
                            while (titles = str.match(headReg)) {
                                let title = titles[0];
                                let value = "";
                                str = str.substring(title.length).trim();
                                if (str.charAt(0) == "\"") {
                                    next = str.indexOf("\"", 1);
                                    value = str.substring(1, next);
                                    next++;
                                }
                                else if (str.charAt(0) == "\'") {
                                    next = str.indexOf("\'", 1);
                                    value = str.substring(1, next);
                                    next++;
                                }
                                else {
                                    value = str.match(/(\S)+/)[0];
                                    next = value.length;
                                }
                                info[title.substring(0, title.length - 1).trim()] = value.trim();

                                str = str.substring(next).trim();
                            }
                        }

                        if (stackList.length > 0) {
                            let lastInfo: Object = stackList[stackList.length - 1];
                            for (let key in lastInfo) {
                                if (info[key] == null) info[key] = lastInfo[key];
                            }
                        }
                        stackList.push(info);
                    }

                    firstIdx = fontEnd + 1;
                }
            }

            return resutlList;
        }


        //
    }
}