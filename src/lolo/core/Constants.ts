/// <reference path="../geom/Rectangle.ts"/>
/// <reference path="../geom/Point.ts"/>


namespace lolo {


    /**
     * 框架中用到的常量集合
     * @author LOLO
     */
    export class Constants {

        /**图片类型的资源*/
        public static RES_TYPE_IMG: string = "image";
        /**json类型的资源*/
        public static RES_TYPE_JSON: string = "json";
        /**文本类型的资源*/
        public static RES_TYPE_TEXT: string = "text";
        /**JS代码类型的资源*/
        public static RES_TYPE_JS: string = "js";
        /**粒子资源（plist类型的资源）*/
        public static RES_TYPE_PARTICLE: string = "particle";


        /**扩展名 - UI界面*/
        public static EXTENSION_UI: string = "ui";
        /**扩展名 - 动画*/
        public static EXTENSION_ANI: string = "ani";
        /**扩展名 - 地图图块*/
        public static EXTENSION_CHUNK: string = "chunk";
        /**扩展名 - png*/
        public static EXTENSION_PNG: string = "png";
        /**扩展名 - jpg*/
        public static EXTENSION_JPG: string = "jpg";


        /**背景层的名称*/
        public static LAYER_NAME_BG: string = "background";
        /**场景层的名称*/
        public static LAYER_NAME_SCENE: string = "scene";
        /**UI层的名称*/
        public static LAYER_NAME_UI: string = "ui";
        /**窗口层的名称*/
        public static LAYER_NAME_WINDOW: string = "window";
        /**顶级UI层*/
        public static LAYER_NAME_UI_TOP: string = "uiTop";
        /**提示层的名称*/
        public static LAYER_NAME_ALERT: string = "alert";
        /**游戏指导层的名称*/
        public static LAYER_NAME_GUIDE: string = "guide";
        /**顶级层的名称*/
        public static LAYER_NAME_TOP: string = "top";
        /**装饰层的名称*/
        public static LAYER_NAME_ADORN: string = "adorn";


        /**绝对定位（布局时表示：使用子项的x,y进行布局）*/
        public static ABSOLUTE: string = "absolute";
        /**水平方向*/
        public static HORIZONTAL: string = "horizontal";
        /**垂直方向*/
        public static VERTICAL: string = "vertical";

        /**水平对齐方式 - 左对齐*/
        public static ALIGN_LEFT: string = "left";
        /**水平对齐方式 - 水平居中*/
        public static ALIGN_CENTER: string = "center";
        /**水平对齐方式 - 右对齐*/
        public static ALIGN_RIGHT: string = "right";

        /**垂直对齐方式 - 顶对齐*/
        public static VALIGN_TOP: string = "top";
        /**垂直对齐方式 - 垂直居中*/
        public static VALIGN_MIDDLE: string = "middle";
        /**垂直对齐方式 - 底对齐*/
        public static VALIGN_BOTTOM: string = "bottom";


        /**对齐方式转换 lolo -> cocos*/
        public static ALIGN_LOLO_TO_COCOS: { left: number, center: number, right: number };
        public static VALIGN_LOLO_TO_COCOS: { top: number, middle: number, bottom: number };
        /**对齐方式转换 cocos -> lolo*/
        public static ALIGN_COCOS_TO_LOLO: string[];
        public static VALIGN_COCOS_TO_LOLO: string[];


        /**策略 - 自动*/
        public static POLICY_AUTO: string = "auto";
        /**策略 - 始终*/
        public static POLICY_ON: string = "on";
        /**策略 - 从不*/
        public static POLICY_OFF: string = "off";


        /**窗口移动效果耗时*/
        public static EFFECT_DURATION_WINDOW_MOVE: number = 0.3;


        /**1像素的空白纹理（图片或动画纹理还未加载完成时显示）*/
        public static EMPTY_TEXTURE: cc.Texture2D;
        public static EMPTY_TEXTURE_RECT: Rectangle = new Rectangle(0, 0, 1, 1);
        /**1像素的黑色纹理（模态黑背景）*/
        public static BLACK_TEXTURE: cc.Texture2D;

        /**1像素的纹理图片 cc.Scale9Sprite 图像路径*/
        public static EMPTY_S9S_URL: string = "img/other/empty.png";


        //
    }
}