/**
 * cocos2dx 相关定义
 * @author LOLO
 */


declare namespace cc {

    class Class {
        static extend(props: any): void;

        __instanceId: number;// html5 才有该值

        ctor(...args: any[]): void;
    }


    class Node extends Class {

        anchorX: number;
        anchorY: number;
        x: number;
        y: number;
        width: number;
        height: number;
        scaleX: number;
        scaleY: number;
        rotation: number;
        opacity: number;
        visible: boolean;
        cascadeOpacity: boolean;
        zIndex: number;
        tag: number;
        parent: Node;
        childrenCount: number;
        shaderProgram: GLProgram;

        /**html5 才有的属性。要获取所有子节点，请通过 getChildren() 获取*/
        _children: Node[];


        getChildren(): Node[];

        setAnchorPoint(point: number | Point, y?: number): void;

        setPosition(newPosOrxValue: number | Point, yValue?: number): void;

        setPositionX(X: number): void;

        getPositionX(): number;

        setPositionY(y: number): void;

        getPositionY(): number;

        setContentSize(size: number | Size, height?: number): void;

        getContentSize(): Size;

        setScale(scale: number, scaleY?: number): void;

        setScaleX(newScaleX: number): void;

        getScaleX(): number;

        setScaleY(newScaleY: number): void;

        getScaleY(): number;

        setRotation(newRotaion: number): void;

        getRotation(): number;

        setOpacity(opacity: number): void;

        getOpacity(): number;

        setVisible(visivle: boolean): void;

        isVisible(): boolean;

        addChild(child: Node, localZOrder?: number, tagOrName?: number | string): void;

        removeChild(child: Node, cleanup: boolean = true): void;

        removeFromParent(cleanup: boolean = true): void;

        removeAllChildren(cleanup: boolean = true): void;

        getChildByName(name: string): Node;

        getChildByTag(tag: number): Node;

        setParent(parent: Node): void;

        getParent(): Node;

        setLocalZOrder(localZOrder: number): void;

        getLocalZOrder(): number;

        convertToNodeSpace(worldPoint: Point): Point;

        convertToWorldSpace(nodePoint: Point): Point;

        attr(props: any): void;

        setName(name: string): void;

        getName(): string;

        setShaderProgram(newShaderProgram: GLProgram): void;

        getShaderProgram(): GLProgram;

        update(dt: number): void;

        scheduleUpdate(): void;

        unscheduleUpdate(): void;

        runAction(action: Action): Action;

        stopAllActions(): void;

        cleanup(): void;

        onEnter(): void;

        onExit(): void;

        retain(): void;

        release(): void;


        _className: string;
        _setWidth: (value: number) => void;
        _getWidth: () => number;
        _setHeight: (value: number) => void;
        _getHeight: () => number;


        /////////////////////////////////
        //
        //   以下由 extend.ts 实现
        //
        /////////////////////////////////
        _original_ctor: (...args: any[]) => void;
        _original_onEnter: () => void;
        _original_addChild: (child: Node, localZOrder?: number, tagOrName?: number | string) => void;

        _original_setPosition: (newPosOrxValue: Point | number, yValue: number) => void;
        _original_setPositionX: (value: number) => void;
        _original_getPositionX: () => number;
        _original_setPositionY: (value: number) => void;
        _original_getPositionY: () => number;

        _original_setScale: (scale: number, scaleY?: number) => void;
        _original_setScaleX: (newScaleX: number) => void;
        _original_getScaleX: () => number;
        _original_setScaleY: (newScaleY: number) => void;
        _original_getScaleY: () => number;

        _x: number;
        _y: number;
        _width: number;
        _height: number;
        _scaleX: number;
        _scaleY: number;
        _ed: lolo.IEventDispatcher;
        _touchEnabled: boolean;
        _filter: string;

        alpha: number;
        name: string;// override
        /**是否已经被销毁了*/
        destroyed: boolean;
        /**是否还未调用过release()*/
        notRelease: boolean;
        /**是否启用touch事件，默认：false*/
        touchEnabled: boolean;
        /**是否抛出 touch 相关事件，默认：true*/
        propagateTouchEvents: boolean;
        /**touch事件侦听器*/
        touchListener: TouchListener;
        /**滤镜*/
        filter: string;

        setWidth(value: number): void;//
        getWidth(): number;//
        setHeight(value: number): void;//
        getHeight(): number;//

        setFilter(value: string): void;//
        getFilter(): string;//

        /**
         * 对象是否在舞台，并且可见
         * 以下情况将会返回 false：
         *  - 不在显示列表中
         *  - 自己或父级的 visible = false
         *  - 自己或父级的 opacity = 0
         *  @param worldPoint 需要检测该点是否在显示范围内（cc.ClippingNode）
         */
        inStageVisibled(worldPoint?: Point): boolean;

        /**点击测试函数*/
        hitTest(worldPoint: Point): boolean;

        /**从父节点移除，并销毁当前节点（包括所有子节点）*/
        destroy();

        /**移除并销毁所有子节点（不包括自己）*/
        destroyAllChildren(): void;

        // @see lolo.IEventDispatcher
        event_addListener(type: string, listener: (event: lolo.Event, ...args: any[]) => void, caller: any, priority: number = 0, ...args: any[]): void;//
        event_removeListener(type: string, listener: (event: lolo.Event, ...args: any[]) => void, caller: any): void;//
        event_dispatch(event: lolo.Event, bubbles: boolean = false, recycle: boolean = true): void;//
        event_hasListener(type: string): boolean;//
    }


    class Sprite extends Node {
        texture: Texture2D;
        _original_setTexture: (texture: Texture2D) => void;

        setTexture(texture: Texture2D): void;

        getTexture(): Texture2D;

        setTextureRect(rect: Rect, rotated: boolean = false, untrimmedSize?: Size): void;

        setCenterRectNormalized(rect: Rect): void;
    }


    class LabelTTF extends Sprite {

        setFontName(fontName: string): void;

        getFontName(): string;

        setFontSize(fontSize: number): void;

        getFontSize(): number;

        setFontFillColor(fillColor: Color): void;

        getFontFillColor(): Color;

        setDimensions(dim: number | Size, height: number): void;

        getDimensions(): Size;

        setHorizontalAlignment(alignment: number): void;

        getHorizontalAlignment(): number;

        setVerticalAlignment(verticalAlignment: number): void;

        getVerticalAlignment(): number;

        enableStroke(strokeColor: Color, strokeSize: number = 0): void;

        disableStroke(): void;

        enableShadow(color: Color, offset: Point | Size, blur: number): void;

        disableShadow(): void;

        setString(text: string): void;

        getString(): string;

        _setUpdateTextureDirty(): void;// html5中，只修改文本颜色时，需要调用该方法才能更新显示
    }

    class TextFieldTTF extends LabelTTF {

    }


    class Texture2D extends Class {
        width: number;
        height: number;

        initWithElement(element: HTMLElement): void;

        handleLoadedTexture(): void;

        setAliasTexParameters(): void;

        retain(): void;

        release(): void;
    }

    class RenderTexture extends Node {

        sprite: Sprite;

        constructor(width: number, height: number, format?: any, depthStencilFormat?: any);

        clear(r: number, g: number, b: number, a: number): void;
    }


    class ClippingNode extends Node {
        stencil: Node;
        alphaThreshold: number;
        inverted: boolean;
        mask: lolo.Mask;// 对应的mask。cc.ClippingNode 不能继承，lolo.Mask 需要绕开写
        /**显示范围是否包含传入的 worldPoint*/
        contains(worldPoint: Point): boolean;
    }


    class SpriteBatchNode extends Node {
        texture: Texture2D;

        constructor(fileImage: Texture2D | string, capacity?: number);
    }


    class Layer extends Node {
    }

    class Control extends Layer {
    }

    class ControlButton extends Control {
    }

    class EditBox extends ControlButton {
        placeholder: string;
        maxLength: number;

        constructor(size?: Size, normal9SpriteBg?: Scale9Sprite);

        setFontName(value: string): void;

        setFontSize(value: number): void;

        setFontColor(value: Color): void;

        setPlaceholderFontName(value: string): void;

        setPlaceholderFontSize(value: number): void;

        setPlaceholderFontColor(value: Color): void;

        setString(value: string): void;

        getString(): string;

        setInputMode(value: number): void;

        setInputFlag(value: number): void;

        setReturnType(value: number): void;

        setDelegate(value: EditBoxDelegate): void;

        /**打开键盘（native 使用）*/
        openKeyboard(): void;

        // html5下使用
        _editBoxInputMode: number;
        _renderCmd: {
            /**输入文本控件 document.createElement(" input / textarea ")*/
            _edTxt: any,
            /**输入的内容*/
            _textLabel: LabelTTF;
            /**提示内容*/
            _placeholderLabel: LabelTTF,

            show: () => void,
            hidden: () => void
        };
        _updateEditBoxSize: (width: number, height: number) => void;
    }

    class Scale9Sprite extends Node {// ccui.Scale9Sprite = cc.Scale9Sprite
        constructor(file: string, rect?: Rect, capInsets?: Rect);
    }

    class EditBoxDelegate extends Class {
    }


    class ParticleSystem extends Node {
        sourceName: string;// lolo.Particle 实现该属性
        duration: number;
        texture: Texture2D;
        emissionRate: number;

        initWithDictionary(dictionary: any): void;

        stopSystem(): void;

        resetSystem(): void;
    }

    class ParticleBatchNode extends Node {
        initWithTexture(texture: Texture2D): void;

        setTexture(texture: Texture2D): void;
    }


    class MotionStreak extends Node {
        texture: Texture2D;
        fastMode: boolean;// default:true

        constructor(fade: number, minSeg: number, stoke: number, color: Color, texture: Texture2D)

        initWithFade(fade: number, minSeg: number, stoke: number, color: Color, texture: Texture2D): void;

        tintWithColor(color: Color): void;

        setStroke(value: number): void;

        getStroke(): number;

        setTexture(value: Texture2D): void;

        getTexture(): Texture2D;

        reset(): void;
    }


    class Scene extends Node {
    }


    class Director extends Class {
        static EVENT_AFTER_UPDATE: string;

        getTotalFrames(): number;
    }


    class GLProgram extends Class {
        filterType: string;// Filter 中创建的值

        initWithString(vertShaderStr: string, fragShaderStr: string): boolean;

        addAttribute(attributeName: string, index: number): void;

        link(): boolean;

        updateUniforms(): void;

        use(): void;

        retain(): void;

        release(): void;
    }
}


// Event 和 Touch 相关
declare namespace cc {

    class Event extends Class {
        getCurrentTarget(): Node;

        getType(): number;

        isStopped(): boolean;

        stopPropagation(): void;
    }

    class EventTouch extends Event {
        getEventCode(): number;

        getTouches(): any[];
    }


    class Touch extends Class {
        getID(): number;// isPCWeb 环境下值为：undefined。请使用 getTouchID()，在任何环境下都能获取到值

        getTouchID(): number;// 所有环境下都能获取到 touchID 值

        getDelta(): Point;

        getLocationX(): number;

        getLocationY(): number;

        getLocation(): Point;

        getPreviousLocation(): Point;

        getStartLocation(): Point;
    }

    class EventManager extends Class {
        addListener(listener: EventListener, nodeOrPriority: Node | number): void;

        addCustomListener(eventName: string, callback: Function): EventListener;

        removeListener(listener: EventListener): void;

        setPriority(listener: EventListener, fixedPriority: number): void;
    }

    class EventListener extends Class {
        static TOUCH_ONE_BY_ONE: number;
        static TOUCH_ALL_AT_ONCE: number;

        static create(argObj: any): EventListener;

        _type: number;// _type 就是 event
        _registered: boolean;// html5中，onEnter 的时候需要知道是否已经注册过 touchListener 了

        retain(): void;

        release(): void;

        clo(): EventListener;
    }

    class TouchListener extends EventListener {
        event: number;
        swallowTouches: boolean;
        bubbles: boolean;

        onTouchBegan(touch: Touch, event: EventTouch): boolean;

        onTouchMoved(touch: Touch, event: EventTouch): void;

        onTouchEnded(touch: Touch, event: EventTouch): void;

        setSwallowTouches(value: boolean): void;

        isSwallowTouches(): boolean;
    }
}


declare namespace cc {
    interface Game {
        EVENT_HIDE: string;
        EVENT_SHOW: string;
        CONFIG_KEY: {
            engineDir: string;
            dependencies: string;
            debugMode: string;
            showFPS: string;
            frameRate: string;
            id: string;
            renderMode: string;
            jsList: string;
            classReleaseMode: string;
        };

        config: any;

        setFrameRate(frameRate: number): void;
        run(id?: string): void;
    }

    interface EGLView {
        enableRetina(enabled: boolean): void;
        adjustViewPort(enabled: boolean): void;
        setDesignResolutionSize(width: number, height: number, resolutionPolicy: number): void;
        resizeWithBrowserSize(enabled: boolean): void;
        setResizeCallback(callback: () => void): void;
    }

    interface TextureCache {
        removeTexture(texture): void;
    }

}


// 全局变量
declare namespace cc {
    let winSize: Size;
    let director: Director;
    let eventManager: EventManager;
    let game: Game;
    let view: EGLView;
    let textureCache: TextureCache;

    // EditBox
    let EDITBOX_INPUT_MODE_ANY: number;// 文本键盘（含换行）[ 默认 ]
    let EDITBOX_INPUT_MODE_EMAILADDR: number;// 邮箱地址键盘
    let EDITBOX_INPUT_MODE_NUMERIC: number;// 数字符号键盘
    let EDITBOX_INPUT_MODE_PHONENUMBER: number;// 电话号码键盘
    let EDITBOX_INPUT_MODE_URL: number;// URL键盘
    let EDITBOX_INPUT_MODE_DECIMAL: number;// 输入键盘（含小数点）
    let EDITBOX_INPUT_MODE_SINGLELINE: number;// 文本键盘（不含换行）

    let EDITBOX_INPUT_FLAG_PASSWORD: number;// 密码形式
    let EDITBOX_INPUT_FLAG_SENSITIVE: number;// 敏感数据输入[ 默认 ]
    let EDITBOX_INPUT_FLAG_INITIAL_CAPS_WORD: number;// 每个单词首字符大写，并有提示
    let EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE: number;// 第一句首字符大写，并有提示
    let EDITBOX_INPUT_FLAG_INITIAL_CAPS_ALL_CHARACTERS: number;// 自动大写

    let KEYBOARD_RETURNTYPE_DEFAULT: number;// 默认类型[ 默认 ]
    let KEYBOARD_RETURNTYPE_DONE: number;// Done字样
    let KEYBOARD_RETURNTYPE_SEND: number;// Send字样
    let KEYBOARD_RETURNTYPE_SEARCH: number;// Search字样
    let KEYBOARD_RETURNTYPE_GO: number;// Go字样

    // Shader
    let ATTRIBUTE_NAME_POSITION: string;
    let ATTRIBUTE_NAME_TEX_COORD: string;
    let ATTRIBUTE_NAME_COLOR: string;

    let VERTEX_ATTRIB_POSITION: number;
    let VERTEX_ATTRIB_TEX_COORDS: number;
    let VERTEX_ATTRIB_COLOR: number;
}


// 全局函数
declare namespace cc {

    function log(str: string): void;

    function p(x: number | Point = 0, y: number = 0): Point;

    function size(w: number | Size = 0, h: number = 0): Size;

    function rect(x: number | Rect = 0, y: number = 0, w: number = 0, h: number = 0): Rect;

    /**返回一个新的 cc.Color 对象*/
    function color(r: number | string | Color = 0, g: number = 0, b: number = 0, a?: number = 255): Color;

    /**返回一个新的 cc.Color 对象*/
    function hexToColor(hex: string): Color;

    function colorToHex(color: Color): string;

}


// 数据类型
declare namespace cc {

    interface Size {
        width: number;
        height: number;
    }

    interface Point {
        x: number;
        y: number;
    }

    interface Rect {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    class Color {
        _val: number;

        r: number;
        g: number;
        b: number;
        a: number;

        constructor(r?: number | string | Color, g?: number, b?: number, a?: number);

        /**
         * 解析16进制字符串
         * @param hex 例如："0xFF66CC"
         */
        parseHex(hex: string): Color;

        /**
         * 获取当前颜色的16进制字符串描述
         * @param prefix 添加的字符串前缀
         * @param alpha 是否需要包含 alpha 值，默认：false。
         * @return 例如：alpha = false，返回 rgb："0xFFCC33"。alpha = true，返回 rgba："0xFFCC33FF"
         */
        getHex(prefix: string = "0x", alpha: boolean = false): string;
    }

}


//


declare namespace jsb {
    let fileUtils: {
        getWritablePath(): string;
        createDirectory(path: string): boolean;
        isFileExist(filePath: string): boolean;
        writeStringToFile(data: string, fullPath: string): boolean;
    };
}


declare namespace cc.sys {
    let OS_ANDROID: string;
    let OS_IOS: string;
    let OS_WINDOWS: string;
    let OS_OSX: string;
    let OS_LINUX: string;
    let OS_UNIX: string;
    let OS_UNKNOWN: string;

    let os: string;
    let isNative: boolean;
    let isMobile: boolean;

    let localStorage: {
        setItem(key: string, value: string): void;
        getItem(key: string): string;
        removeItem(key: string): void;
    };
}


declare namespace cc {
    let loader: {
        load(resources: any | any[], optionOrCB?: any, cb?: Function): void;
        loadImg(url: string, option: any, cb: Function): void;
        loadJson(url: string, cb: Function): void;
        loadTxt(url: string, cb: Function): void;
        loadJs(url: string | string[], cb: Function): void;
        getXMLHttpRequest(): XMLHttpRequest;
    };
}


//


// Action
declare namespace cc {

    class Action extends Class {
        // target: Node;// native 会取到 undefined，请使用 getTarget()
        // originalTarget: Node;
        tag: number;

        clone(): Action;

        update(dt: number): void;

        getTarget(): Node;

        getOriginalTarget(): Node;

        stop(): void;

        isDone(): boolean;
    }

    class FiniteTimeAction extends Action {
        setDuration(value: number): void;

        getDuration(): number;

        reverse(): void;
    }

    class Follow extends Action {
        constructor(followedNode: Node, rect: Rect);
    }
    function follow(followedNode: Node, rect: Rect): Follow;

    class Speed extends Action {
        constructor(action: ActionInterval, speed: number);
    }
    function speed(action: ActionInterval, speed: number): Speed;

    //

    class ActionInstant extends FiniteTimeAction {
    }

    class ActionInterval extends FiniteTimeAction {
        easing(...easeObj: ActionEase[]): ActionInterval;// return this
        repeatForever(): ActionInterval;// return this
        repeat(times: number): ActionInterval;// return this
        speed(speed: number): ActionInterval;// return this
    }

    //
    //

    /** 延时调用函数 */
    class CallFunc extends ActionInstant {
        constructor(selector: Function, selectorTarget: any, data?: any);
    }
    function callFunc(selector: Function, selectorTarget?: any, data?: any): CallFunc;

    /** visible = true */
    class Show extends ActionInstant {
        constructor();
    }
    function show(): Show;

    /** visible = false */
    class Hide extends ActionInstant {
        constructor();
    }
    function hide(): Hide;

    /** visible = !visible */
    class ToggleVisibility extends ActionInstant {
        constructor();
    }
    function toggleVisibility(): ToggleVisibility;

    /** 立即设置 x / y 坐标 */
    class Place extends ActionInstant {
        constructor(pos: Point | number, y?: number);
    }
    function place(pos: Point | number, y?: number): Place;

    /** 立即从父级容器中移除自己 */
    class RemoveSelf extends ActionInstant {
        constructor(isNeedCleanUp: boolean = true);
    }
    function removeSelf(isNeedCleanUp: boolean = true): RemoveSelf;

    /** 立即水平翻转 */
    class FlipX extends ActionInstant {
        constructor(flip: boolean = false);
    }
    function flipX(flip: boolean = false): FlipX;

    /** 立即垂直翻转 */
    class FlipY extends ActionInstant {
        constructor(flip: boolean = false);
    }
    function flipY(flip: boolean = false): FlipY;


    class ReuseGrid extends ActionInstant {
        constructor(times: number);
    }
    function reuseGrid(times: number): ReuseGrid;

    class StopGrid extends ActionInstant {
        constructor();
    }
    function stopGrid(): StopGrid;

    //
    //

    class DelayTime extends ActionInterval {
        constructor(delay: number);
    }
    function delayTime(delay: number): DelayTime;

    class Sequence extends ActionInterval {
        constructor(...tempArray: FiniteTimeAction[]);
    }
    function sequence(...tempArray: FiniteTimeAction[]): Sequence;

    class Spawn extends ActionInterval {
        constructor(...tempArray: FiniteTimeAction[]);
    }
    function spawn(...tempArray: FiniteTimeAction[]): Spawn;


    class Repeat extends ActionInterval {
        constructor(action: FiniteTimeAction, times: number);
    }
    function repeat(action: FiniteTimeAction, times: number): Repeat;

    class RepeatForever extends ActionInterval {
        constructor(action: FiniteTimeAction);
    }
    function repeatForever(action: FiniteTimeAction): RepeatForever;

    class ReverseTime extends ActionInterval {
        constructor(action: FiniteTimeAction);
    }
    function reverseTime(action: FiniteTimeAction): ReverseTime;

    //

    class BezierBy extends ActionInterval {
        constructor(t: number, c: Point[]);
    }
    function bezierBy(t: number, c: Point[]): BezierBy;

    class BezierTo extends BezierBy {
        constructor(t: number, c: Point[]);
    }
    function bezierTo(t: number, c: Point[]): BezierTo;

    class Blink extends ActionInterval {
        constructor(duration: number, blinks: number);
    }
    function blink(duration: number, blinks: number): Blink;

    class FadeTo extends ActionInterval {
        constructor(duration: number, opacity: number);
    }
    function fadeTo(duration: number, opacity: number): FadeTo;

    class FadeIn extends FadeTo {
        constructor(duration: number);
    }
    function fadeIn(duration: number): FadeIn;

    class FadeOut extends FadeTo {
        constructor(duration: number);
    }
    function fadeOut(duration: number): FadeOut;

    class JumpBy extends ActionInterval {
        constructor(duration: number);
    }
    function jumpBy(duration: number, position: Point | number, y: number, height: number, jumps?: number): JumpBy;

    class JumpTo extends JumpBy {
        constructor(duration: number);
    }
    function jumpTo(duration: number, position: Point | number, y: number, height: number, jumps?: number): JumpTo;

    class MoveBy extends ActionInterval {
        constructor(duration: number, deltaPos: number | Point, deltaY?: number);
    }
    function moveBy(duration: number, deltaPos: number | Point, deltaY?: number): MoveBy;

    class MoveTo extends MoveBy {
        constructor(duration: number, position: number | Point, y?: number);
    }
    function moveTo(duration: number, position: number | Point, y?: number): MoveTo;

    class RotateBy extends ActionInterval {
        constructor(duration: number, deltaAngleX: number, deltaAngleY?: number);
    }
    function rotateBy(duration: number, deltaAngleX: number, deltaAngleY?: number): RotateBy;

    class RotateTo extends ActionInterval {
        constructor(duration: number, deltaAngleX: number, deltaAngleY?: number);
    }
    function rotateTo(duration: number, deltaAngleX: number, deltaAngleY?: number): RotateTo;

    class ScaleTo extends ActionInterval {
        constructor(duration: number, sx: number, sy?: number);
    }
    function scaleTo(duration: number, sx: number, sy?: number): ScaleTo;

    class ScaleBy extends ScaleTo {
        constructor(duration: number, sx: number, sy?: number);
    }
    function scaleBy(duration: number, sx: number, sy?: number): ScaleBy;

    class SkewTo extends ActionInterval {
        constructor(t: number, sx: number, sy: number);
    }
    function skewTo(t: number, sx: number, sy: number): SkewTo;

    class SkewBy extends SkewTo {
        constructor(t: number, sx: number, sy: number);
    }
    function skewBy(t: number, sx: number, sy: number): SkewBy;

    class TargetedAction extends ActionInterval {
        constructor(target: Node, action: FiniteTimeAction);
    }
    function targetedAction(target: Node, action: FiniteTimeAction): TargetedAction;

    class TintBy extends ActionInterval {
        constructor(duration: number, deltaRed: number, deltaGreen: number, deltaBlue: number);
    }
    function tintBy(duration: number, deltaRed: number, deltaGreen: number, deltaBlue: number): TintBy;

    class TintTo extends ActionInterval {
        constructor(duration: number, red: number, green: number, blue: number);
    }
    function tintTo(duration: number, red: number, green: number, blue: number): TintTo;


    class ActionTween extends ActionInterval {
        constructor(duration: number, key: string, from: number, to: number);
    }
    function actionTween(duration: number, key: string, from: number, to: number): ActionTween;


    class CardinalSplineTo extends ActionInterval {
        constructor(duration: number, points: Point[], tension: number);
    }
    function cardinalSplineTo(duration: number, points: Point[], tension: number): CardinalSplineTo;

    class CardinalSplineBy extends CardinalSplineTo {
        constructor(duration: number, points: Point[], tension: number);
    }
    function cardinalSplineBy(duration: number, points: Point[], tension: number): CardinalSplineBy;

    class CatmullRomBy extends CardinalSplineBy {
        constructor(dt: number, points: Point[]);
    }
    function catmullRomBy(dt: number, points: Point[]): CatmullRomBy;

    class CatmullRomTo extends CardinalSplineTo {
        constructor(dt: number, points: Point[]);
    }
    function catmullRomTo(dt: number, points: Point[]): CatmullRomTo;
}


// ease
declare namespace cc {

    class ActionEase extends ActionInterval {
    }

    class EaseBezierAction extends ActionEase {
    }
    function easeBezierAction(p0: number, p1: number, p2: number, p3: number): EaseBezierAction;


    //
    class EaseBackIn extends ActionEase {
    }
    function easeBackIn(): EaseBackIn;

    class EaseBackOut extends ActionEase {
    }
    function easeBackOut(): EaseBackOut;

    class EaseBackInOut extends ActionEase {
    }
    function easeBackInOut(): EaseBackInOut;


    //
    class EaseBounce extends ActionEase {
    }

    class EaseBounceIn extends EaseBounce {
    }
    function easeBounceIn(): EaseBounceIn;

    class EaseBounceOut extends EaseBounce {
    }
    function easeBounceOut(): EaseBounceOut;

    class EaseBounceInOut extends EaseBounce {
    }
    function easeBounceInOut(): EaseBounceInOut;


    //
    class EaseCircleActionIn extends ActionEase {
    }
    function easeCircleActionIn(): EaseCircleActionIn;

    class EaseCircleActionOut extends ActionEase {
    }
    function easeCircleActionOut(): EaseCircleActionOut;

    class EaseCircleActionInOut extends ActionEase {
    }
    function easeCircleActionInOut(): EaseCircleActionInOut;


    //
    class EaseCubicActionIn extends ActionEase {
    }
    function easeCubicActionIn(): EaseCubicActionIn;

    class EaseCubicActionOut extends ActionEase {
    }
    function easeCubicActionOut(): EaseCubicActionOut;

    class EaseCubicActionInOut extends ActionEase {
    }
    function easeCubicActionInOut(): EaseCubicActionInOut;


    //
    class EaseElastic extends ActionEase {
    }

    class EaseElasticIn extends EaseElastic {
    }
    function easeElasticIn(period: number = 0.3): EaseElasticIn;

    class EaseElasticOut extends EaseElastic {
    }
    function easeElasticOut(period: number = 0.3): EaseElasticOut;

    class EaseElasticInOut extends EaseElastic {
    }
    function easeElasticInOut(period: number = 0.3): EaseElasticInOut;


    //
    class EaseExponentialIn extends ActionEase {
    }
    function easeExponentialIn(): EaseExponentialIn;

    class EaseExponentialOut extends ActionEase {
    }
    function easeExponentialOut(): EaseExponentialOut;

    class EaseExponentialInOut extends ActionEase {
    }
    function easeExponentialInOut(): EaseExponentialInOut;


    //
    class EaseQuadraticActionIn extends ActionEase {
    }
    function easeQuadraticActionIn(): EaseQuadraticActionIn;

    class EaseQuadraticActionOut extends ActionEase {
    }
    function easeQuadraticActionOut(): EaseQuadraticActionOut;

    class EaseQuadraticActionInOut extends ActionEase {
    }
    function easeQuadraticActionInOut(): EaseQuadraticActionInOut;


    //
    class EaseQuarticActionIn extends ActionEase {
    }
    function easeQuarticActionIn(): EaseQuarticActionIn;

    class EaseQuarticActionOut extends ActionEase {
    }
    function easeQuarticActionOut(): EaseQuarticActionOut;

    class EaseQuarticActionInOut extends ActionEase {
    }
    function easeQuarticActionInOut(): EaseQuarticActionInOut;


    //
    class EaseQuinticActionIn extends ActionEase {
    }
    function easeQuinticActionIn(): EaseQuinticActionIn;

    class EaseQuinticActionOut extends ActionEase {
    }
    function easeQuinticActionOut(): EaseQuinticActionOut;

    class EaseQuinticActionInOut extends ActionEase {
    }
    function easeQuinticActionInOut(): EaseQuinticActionInOut;


    //
    class EaseRateAction extends ActionEase {
    }

    class EaseIn extends EaseRateAction {
    }
    function easeIn(rate: number): EaseIn;

    class EaseOut extends EaseRateAction {
    }
    function easeOut(rate: number): EaseOut;

    class EaseInOut extends EaseRateAction {
    }
    function easeInOut(rate: number): EaseInOut;


    //
    class EaseSineIn extends ActionEase {
    }
    function easeSineIn(): EaseSineIn;

    class EaseSineOut extends ActionEase {
    }
    function easeSineOut(): EaseSineOut;

    class EaseSineInOut extends ActionEase {
    }
    function easeSineInOut(): EaseSineInOut;

}


// html5 audioEngine or SimpleAudioEngine
declare namespace cc {
    let audioEngine: {
        playMusic(url: string, loop: boolean = false): void;
        stopMusic(releaseData: boolean = false): void;
        pauseMusic(): void;
        resumeMusic(): void;
        isMusicPlaying(): boolean;
        rewindMusic(): void;
        willPlayMusic(): boolean;

        playEffect(url: string, loop: boolean = false): number;// return audioID or null
        stopEffect(audioID: number): void;
        pauseEffect(audioID: number): void;
        resumeEffect(audioID: number): void;
        pauseAllEffects(): void;
        resumeAllEffects(): void;
        stopAllEffects(): void;
        unloadEffect(url: string): void;

        getMusicVolume(): number;// 0~1
        setMusicVolume(volume: number): void;
        getEffectsVolume(): number;
        setEffectsVolume(volume: number): void;
        end(): void;// stopMusic() & stopAllEffects()
    };
}


// native AudioEngine
declare namespace jsb {
    interface AudioProfile {
        name: string;
        maxInstances: number;
        minDelay: number;
    }

    let AudioEngine: {
        INVALID_AUDIO_ID: number;// -1
        TIME_UNKNOWN: number;// -1

        AudioState: {
            ERROR: number;// -1
            INITIALZING: number;// 0
            PLAYING: number;// 1
            PAUSED: number;// 2
        };

        // return audioID or INVALID_AUDIO_ID
        play2d(filePath: string, loop: boolean = false, volume: number = 1, profile?: AudioProfile): number;

        pause(audioID: number): void;
        resume(audioID: number): void;
        stop(audioId: number): void;

        setVolume(audioID: number, volume: number): void;
        getVolume(audioID: number): number;
        setLoop(audioID: number, loop: boolean): void;
        isLoop(audioID: number): boolean;
        setCurrentTime(audioID: number, sec: number): boolean;
        getCurrentTime(audioID: number): number;

        setFinishCallback(audioID: number, callback: Function): void;
        getState(audioID: number): number;// return AudioState
        getProfile(audioID_or_profileName: number | string): AudioProfile;

        preload(filePath: string, callback?: Function): void;
        uncache(filePath: string): void;
        uncacheAll(): void;

        getMaxAudioInstance(): number;
        setMaxAudioInstance(maxInstances: number): boolean;
        getDefaultProfile(): AudioProfile;

        pauseAll(): void;
        resumeAll(): void;
        stopAll(): void;
        end(): void;
    };
}