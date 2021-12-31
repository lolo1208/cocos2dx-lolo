namespace lolo {


    export interface RichTextElementInfo {
        type?: string;
        touchTap?: string;

        text?: string;
        textID?: string;
        styleName?: string;
        font?: string;
        size?: number;
        color?: string;
        stroke?: string;
        strokeSize?: number;
        shadow?: string;
        shadowOffset?: { x: number, y: number };
        shadowBlur?: number;

        sourceName?: string;
        fps?: number;
        playing?: boolean;
    }


    /**
     * 富文本
     * 2017/9/6
     * @author LOLO
     */
    export class RichText extends DisplayObjectContainer {

        public static TYPE_LABEL: string = "label";
        public static TYPE_LINK: string = "link";
        public static TYPE_BITMAP: string = "bmp";
        public static TYPE_ANIMATION: string = "ani";

        private _text: string = "";
        private _elements: cc.Node[] = [];


        public constructor() {
            super();
        }


        public set text(value: string) {
            if (value == null) value = "";
            this._text = value;
            this._elements.length = 0;
            this.destroyAllChildren();
            this.appendElementWithString(value);
        }

        public get text(): string {
            return this._text;
        }


        public appendText(content: string): void {
            this._text += content;
            this.appendElementWithString(content);
        }


        public appendElementWithString(content: string): void {
            // let infoList: RichTextElementInfo[] = RichText.parse(content);
        }


        public appendElement(element: cc.Node): void {
        }


        //


        /**
         * 解析带标签的符串，并创建对应的内容（作为子对象）
         * @param content
         */
        /*
        public static parse(content: string): RichTextElementInfo[] {
            let elementList: RichTextElementInfo[] = [];// 已经解析出来的子项信息列表
            let textStackList: RichTextElementInfo[] = [];// 文本元素堆栈列表（实现嵌套属性，不包含 text/textID 属性）

            let str: string, element: RichTextElementInfo, lastTextElement: RichTextElementInfo, lt: number, rt: number;
            let position: number = 0;// 当前查询位置
            let length: number = content.length;// 内容总长度
            while (position < length) {
                lt = content.indexOf("<", position);
                lastTextElement = (textStackList.length > 0) ? (textStackList[textStackList.length - 1]) : null;

                // 剩下的内容中，没有标签，是一段纯文本
                if (lt < 0) {
                    str = content.substring(position);
                    position = length;
                }
                else if (lt > 0) {
                    str = content.substring(position, lt);
                    position = lt;
                }
                else {// lt == 0
                    str = null;
                }

                // 当前段文本内容
                if (str != null) {
                    element = {};
                    if (lastTextElement != null) {
                        for (let prop in lastTextElement) {
                            element[prop] = lastTextElement[prop];
                        }
                    }
                    element.text = str;
                    elementList.push(element);
                }

                // 解析标签和属性列表
                else {
                    rt = content.indexOf(">", lt);
                }

                // 剩下的内容中，没有标签，是一段纯文本
                if (lt < 0) {
                    str = content.substring(position);
                    if (str != "") {
                        info.type = RichText.TYPE_LABEL;
                        info.text = str;
                        propList.length > 0
                            ? infoList.push({text: str, props: propList[propList.length - 1]})
                            : infoList.push({text: str});
                    }

                    firstIdx = length;
                }
                else {
                    str = content.substring(firstIdx, startIdx);
                    if (str != "") {
                        propList.length > 0
                            ? infoList.push({text: str, style: propList[propList.length - 1]})
                            : infoList.push({text: str});
                    }

                    let fontEnd = content.indexOf(">", startIdx);
                    if (fontEnd == -1) {
                        throwError("[RichText.parse] 语法错误，标签没有闭合！内容：", content);
                        fontEnd = startIdx;
                    }
                    else if (content.charAt(startIdx + 1) == "\/") {// 当前标签属性结束
                        propList.pop();
                    }
                    else {
                        str = content.substring(startIdx + 1, fontEnd).trim();
                        let info: any = {};

                        let header: string[];
                        if (header = str.match(RichText.RE_TYPE)) {
                            str = str.substring(header[0].length).trim();
                            let titles: string[], next: number;
                            while (titles = str.match(RichText.RE_PROP)) {
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

                        if (propList.length > 0) {
                            let lastInfo: Object = propList[propList.length - 1];
                            for (let key in lastInfo) {
                                if (info[key] == null) info[key] = lastInfo[key];
                            }
                        }
                        propList.push(info);
                    }

                    firstIdx = fontEnd + 1;
                }
            }

            return resutlList;
        }
*/
        //
    }
}