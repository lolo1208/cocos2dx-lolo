namespace lolo {

    /**舞台*/
    export let stage: UIManager;
    /**配置信息*/
    export let config: ConfigManager;
    /**语言包*/
    export let language: LanguageManager;
    /**资源加载器*/
    export let loader: LoadManager;
    /**用户界面管理*/
    export let ui: UIManager;
    /**布局管理*/
    export let layout: LayoutManager;
    /**控制台界面*/
    // export var consoleView:Console;
    /**手势管理*/
    export let gesture: Gesture;

    /**核心框架版本号，修改该值，在动更时会强制重新下载APP。定义在 project.json 中*/
    export let coreVersion: string;
    /**项目版本号，打包时会自动生成在 Updater.js 中*/
    export let version: string;
    /**初始化版本号（APP安装包的版本号），APP第一次启动时，记录在 writablePath/assets/version/init.js 文件内*/
    export let initVersion: string;

    /**资源库的 语言和区域*/
    export let locale: string;
    /**当前是否在 debug 环境中*/
    export let isDebug: boolean;
    /**当前是否在 native 环境中*/
    export let isNative: boolean;
    /**当前是否在 mobile 环境中*/
    export let isMobile: boolean;

    /**资源映射列表（在打包时会自动生成）*/
    export let resList: any;


    /**
     * 初始化框架
     * @param stage
     * @param locale
     */
    export function initialize(stage: UIManager, locale: string): void {

        LocalData.initialize("ShibaInu");
        TimeUtil.initialize();

        lolo.isDebug = cc.game.config.debugMode != 0;
        lolo.stage = lolo.ui = stage;
        lolo.locale = locale;
        lolo.config = new ConfigManager();
        lolo.language = new LanguageManager();
        lolo.loader = new LoadManager();
        lolo.layout = new LayoutManager();
        lolo.gesture = new Gesture();
        // consoleView = new Console();

        if (!isNative && !isDebug) window["onerror"] = Logger.uncaughtErrorHandler;// native 无效

        Constants.ALIGN_LOLO_TO_COCOS = {left: 0, center: 1, right: 2};
        Constants.ALIGN_COCOS_TO_LOLO = [Constants.ALIGN_LEFT, Constants.ALIGN_CENTER, Constants.ALIGN_RIGHT];
        Constants.VALIGN_LOLO_TO_COCOS = {top: 0, middle: 1, bottom: 2};
        Constants.VALIGN_COCOS_TO_LOLO = [Constants.VALIGN_TOP, Constants.VALIGN_MIDDLE, Constants.VALIGN_BOTTOM];


        // 创建1像素的空白纹理
        let rt: cc.RenderTexture = new cc.RenderTexture(1, 1);
        rt.clear(0, 0, 0, 0);
        Constants.EMPTY_TEXTURE = rt.sprite.texture;
        if (isNative) Constants.EMPTY_TEXTURE.retain();

        // 创建1像素的黑色纹理
        rt = new cc.RenderTexture(1, 1);
        rt.clear(0, 0, 0, 255);
        Constants.BLACK_TEXTURE = rt.sprite.texture;
        if (isNative) Constants.BLACK_TEXTURE.retain();
    }


    /**
     * 延迟指定毫秒后，执行一次回调
     * @param delay 延迟时间（毫秒）
     * @param callback 回调函数
     * @param caller 执行域（this）
     * @param args 附带的参数
     */
    export function delayedCall(delay: number, callback: Function, caller: any = null, ...args: any[]): Handler {
        let handler: Handler = Handler.once(callback, caller);
        handler.args = args;
        setTimeout(function () {
            handler.execute.call(handler);
        }, delay);
        return handler;
    }

    /**
     * 快速创建一个 指定执行域（this），携带参数的 Handler 对象
     * @param callback 回调函数
     * @param caller 执行域（this）
     * @param once 是否只用执行一次
     * @param args 附带的参数
     */
    export function handler(callback: Function, caller: any = null, once: boolean = true, ...args: any[]): Handler {
        let handler: Handler = Handler.once(callback, caller);
        handler.once = once;
        handler.args = args;
        return handler;
    }


    /**
     * 通过ID在语言包中获取对应的字符串
     * @param id 在语言包中的ID
     * @param args 用该参数替换字符串内的"{n}"标记
     * @return
     */
    export function getLanguage(id: string, ...args: any[]): string {
        args.unshift(id);
        return language.getLanguage.apply(lolo.language, args);
    }


    /**
     * 抛出一个错误
     * @param args 参数列表，最终会拼接成一段字符串
     */
    export function throwError(...args: any[]): void {
        let str: string = "";
        for (let i = 0; i < args.length; i++) {
            if (i != 0) str += " ";
            str += args[i];
        }
        Logger.addErrorLog(str);
    }


    /**
     * 数组数字降序（从小到大）排序方法
     */
    export function arrayNumericAscending(a: number, b: number): number {
        return a - b;
    }


    /**
     * 数组数字降序（从大到小）排序方法
     */
    export function arrayNumericDescending(a: number, b: number): number {
        return b - a;
    }


    //
}


namespace lolo {

    /**
     * 将16进制字符串转换成 cc.Color
     * @param hex 如："0xFF66CC"
     * @return {Color}
     */
    export function hexToColor(hex: string): cc.Color {
        let c = parseInt(hex);
        return cc.color(
            c >> 16,
            (c >> 8) % 256,
            c % 256
        );
    }


    /**
     * 将16进制数字转换成 cc.Color
     * @param c 如：16737996（0xFF66CC）
     * @return {Color}
     */
    export function numToColor(c: number): cc.Color {
        return cc.color(
            c >> 16,
            (c >> 8) % 256,
            c % 256
        );
    }


    /**
     * 将 cc.Color 转换成16进制字符串
     * @param color
     * @param prefix 添加的字符串前缀
     * @return {string}
     */
    export function colorToHex(color: cc.Color, prefix: string = "0x") {
        let hR = color.r.toString(16), hG = color.g.toString(16), hB = color.b.toString(16);
        return prefix + (color.r < 16 ? ("0" + hR) : hR) + (color.g < 16 ? ("0" + hG) : hG) + (color.b < 16 ? ("0" + hB) : hB);
    }

}


// 临时对象
namespace lolo {
    export let temp_rect: Rectangle = new Rectangle();
    export let temp_p: Point = new Point();
}


/////////////////////////////////
//
//      由native或其他js文件实现的类和方法
//
/////////////////////////////////
declare namespace lolo {

    /**
     * 根据传入的url，解析出真实的url地址（在 main.js 中实现）
     * @param url
     */
    function getResUrl(url: string): string;


    /**
     * 线上动更 native 实现部分
     */
    class Updater {
        static enableAssetsDir(): void;

        static start(zipUrl: string, version: string, md5: string): void;

        static getState(): number;

        static getByteLoaded(): number;

        static getByteTotal(): number;

        static getSpeed(): number;

        static clearUpdateDirectory(): void;

        static resetApp(): void;
    }


    //# 这是用来在编译阶段匹配替换 call super() 的关键字符
    function CALL_SUPER_REPLACE_KEYWORD();
}


/////////////////////////////////
//
//      全局变量、函数
//
/////////////////////////////////


