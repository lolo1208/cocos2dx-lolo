namespace lolo {


    /**
     * touch内容进行滚动的滚动条
     * 注意：滚动条会将 content 放入到新创建的 Mask 中，并将 Mask 放入到 content.parent 中
     * @author LOLO
     */
    export class TouchScrollBar extends DisplayObjectContainer {

        /**内容有改变事件*/
        public static CONTENT_CHANGED: string = "contentChanged";

        /**滚动条在 content 中 创建的对应的滚动条列表属性*/
        private static SCROLLS: string = "__LOLO_SCROLLS__";


        /**开始触发滚动的位置阈值（像素）*/
        private static THRESHOLD_POSITION: number = 5;
        /**速度的权重列表。index越小，越是最近发生的*/
        private static VELOCITY_WEIGHTS: number[] = [2.33, 2, 1.66, 1.33, 1];
        /**速度值记录间隔*/
        private static VELOCITY_INTERVAL: number = 10;
        /**最多记录几次速度值*/
        private static VELOCITY_MAX_COUNT: number = 5;
        /**最小的改变速度，解决浮点数精度问题*/
        private static MINIMUM_VELOCITY: number = 0.02;
        /**当容器自动滚动时要应用的摩擦系数*/
        private static FRICTION: number = 0.998;
        /**当容器自动滚动时并且滚动位置超出容器范围时要额外应用的摩擦系数*/
        private static EXTRA_FRICTION: number = 0.95;
        /**摩擦系数的自然对数*/
        private static FRICTION_LOG: number = Math.log(TouchScrollBar.FRICTION);


        /**滑块*/
        private _thumb: Bitmap;

        /**滚动的内容*/
        private _content: cc.Node;
        /**内容的显示区域（滚动区域）*/
        private _viewableArea: Rectangle = new Rectangle();
        /**遮罩*/
        private _mask: Mask;

        /**是否启用*/
        private _enabled: boolean = true;
        /**滚动方向，水平还是垂直（默认：垂直）*/
        private _direction: string;
        /**滚动条的尺寸，水平时为width，垂直时为height*/
        private _size: number = 100;

        /**宽高属性的名称，水平:"width"，垂直:"height"*/
        private _wh: string = "height";
        /**坐标属性的名称，水平:"x"，垂直:"y"*/
        public _xy: string = "y";
        /**缓动内容到哪*/
        public _tweenContentTo: number;

        /**滚动条当前是否已显示（内容尺寸是否超出了显示区域）*/
        private _showed: boolean = false;

        /**是否启用回弹效果*/
        public bounces: boolean = true;
        /**滑块最小尺寸*/
        public thumbMinSize: number = 15;
        /**滚动条显示策略（默认：auto，滚动时，自动显示或隐藏滚动条）*/
        public scrollPolicy: string;

        /**记录的速度列表*/
        private _velocitys: number[] = [];
        /**上次记录的时间*/
        private _lastTime: number;
        /**上次记录的位置*/
        private _lastPosition: number;
        /**是否已经开始滚动了*/
        private _scrolling: boolean = false;

        /**最小滚动值*/
        private _min: number;
        /**最大滚动值*/
        private _max: number;


        public constructor() {
            super();

            this.setOpacity(0);
            this.visible = false;

            this._thumb = new Bitmap();
            this.addChild(this._thumb);

            this._direction = Constants.VERTICAL;
            this.scrollPolicy = Constants.POLICY_AUTO;
        }


        public onExit(): void {
            super.onExit();
            // 在滚动过程中将滚动条或所在父节点移除舞台时，会stopAllAction，导致滚动条不消失
            if (this.scrollPolicy != Constants.POLICY_ON) {
                this.setOpacity(0);
                this.visible = false;
            }
        }


        public set style(value: any) {
            if (value.thumbSourceName != null) this._thumb.sourceName = value.thumbSourceName;
            if (value.thumbMinSize != null) this.thumbMinSize = value.thumbMinSize;
            if (value.direction != null) this.direction = value.direction;
            if (value.scrollPolicy != null) this.scrollPolicy = value.scrollPolicy;
            if (value.bounces != null) this.bounces = value.bounces;

            this.size = (value.size != null) ? value.size : this._size;

            this.render();
        }

        public set styleName(value: string) {
            this.style = lolo.config.getStyle(value);
        }

        public set thumbProp(value: Object) {
            AutoUtil.initObject(this._thumb, value);
            this.render();
        }


        /**
         * 更新显示内容（在 Event.ENTER_FRAME 事件中更新）
         */
        public render(): void {
            lolo.stage.event_addListener(Event.ENTER_FRAME, this.doRender, this);
        }

        /**
         * 立即更新显示内容，而不是等待 Event.ENTER_FRAME 事件更新
         */
        public renderNow(): void {
            this.doRender();
        }

        /**
         * 进行渲染
         * @param event Event.ENTER_FRAME 事件
         */
        protected doRender(event?: Event): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);
            if (this._viewableArea == null || this._content == null) return;

            this._showed = this._content[this._wh] > this._viewableArea[this._wh];
            this.enabled = this._enabled;

            this._min = this._viewableArea[this._xy];
            this._max = this._viewableArea[this._wh] - this._content[this._wh] + this._min;

            if (!this._showed) this._content[this._xy] = this._viewableArea[this._xy];// 触发内容更新

            this.updateThumb();
            if (this.scrollPolicy != Constants.POLICY_AUTO) this.showOrHide(false);
        }


        /**
         * 开始拖动内容
         */
        private mask_touchBegin(event: TouchEvent): void {
            this._content.stopAllActions();
            let scrolls: TouchScrollBar[] = this._content[TouchScrollBar.SCROLLS];
            for (let i = 0; i < scrolls.length; i++)
                scrolls[i]._tweenContentTo = null;

            this._velocitys.length = 0;
            this._lastTime = TimeUtil.nowTime;
            this._lastPosition = (this._direction == Constants.HORIZONTAL)
                ? lolo.gesture.touchPoint.x
                : lolo.gesture.touchPoint.y;

            this._mask.event_addListener(TouchEvent.TOUCH_MOVE, this.mask_touchMove, this);
            this._mask.event_addListener(TouchEvent.TOUCH_END, this.mask_touchEnd, this);
        }


        /**
         * 拖动更新
         */
        private mask_touchMove(event: TouchEvent): void {
            // 还没开始滚动，检查位置是否已达到开始滚动的阈值
            let curPosition: number = (this._direction == Constants.HORIZONTAL)
                ? lolo.gesture.touchPoint.x
                : lolo.gesture.touchPoint.y;
            let offsetPosition: number = this._lastPosition - curPosition;

            if (!this._scrolling) {
                if (Math.abs(offsetPosition) > TouchScrollBar.THRESHOLD_POSITION) {
                    this._scrolling = true;
                    this.showOrHide(true);
                }
                else return;
            }

            //记录速度
            let curTime: number = TimeUtil.nowTime;
            let offsetTime: number = curTime - this._lastTime;
            if (offsetTime < TouchScrollBar.VELOCITY_INTERVAL) return;

            let velocitys: number[] = this._velocitys;
            velocitys.unshift(offsetPosition / offsetTime);
            while (velocitys.length > TouchScrollBar.VELOCITY_MAX_COUNT) {
                velocitys.pop();
            }
            this._lastTime = curTime;
            this._lastPosition = curPosition;

            //更新内容当前位置
            let min: number = this._min;
            let max: number = this._max;
            let pos: number = this._content[this._xy] - offsetPosition;
            if (pos > min) {
                if (this.bounces) pos += offsetPosition * 0.5;
                else pos = min;
            }
            else if (pos < max) {
                if (this.bounces) pos += offsetPosition * 0.5;
                else pos = max;
            }

            this._content[this._xy] = pos;
            this.updateThumb();
        }


        /**
         * 拖动结束
         */
        private mask_touchEnd(event: TouchEvent): void {
            this._mask.event_removeListener(TouchEvent.TOUCH_MOVE, this.mask_touchMove, this);
            this._mask.event_removeListener(TouchEvent.TOUCH_END, this.mask_touchEnd, this);
            if (!this._scrolling) {
                this.tweenContentEnd();
                return;
            }
            this._scrolling = false;

            // 根据速度，计算拖动重力
            let velocity: number = 0;
            let weight: number = 0;
            let velocitys: number[] = this._velocitys;
            let len: number = velocitys.length;
            for (let i = 0; i < len; i++) {
                velocity += velocitys[i] * TouchScrollBar.VELOCITY_WEIGHTS[i];
                weight += TouchScrollBar.VELOCITY_WEIGHTS[i];
            }

            // 继续滚动
            let pixelsPerMS = velocity / weight;
            let absPixelsPerMS = Math.abs(pixelsPerMS);
            let duration: number = 0;
            let posTo: number = 0;
            let min: number = this._min;
            let max: number = this._max;
            let pos: number = this._content[this._xy];
            if (absPixelsPerMS > TouchScrollBar.MINIMUM_VELOCITY) {
                posTo = pos + (pixelsPerMS - TouchScrollBar.MINIMUM_VELOCITY) / TouchScrollBar.FRICTION_LOG * 2;
                if (posTo < min || posTo > max) {
                    posTo = pos;
                    while (Math.abs(pixelsPerMS) > TouchScrollBar.MINIMUM_VELOCITY) {
                        posTo -= pixelsPerMS;
                        if (posTo > min || posTo < max) {
                            pixelsPerMS *= TouchScrollBar.FRICTION * TouchScrollBar.EXTRA_FRICTION;
                        }
                        else {
                            pixelsPerMS *= TouchScrollBar.FRICTION;
                        }
                        duration++;
                    }
                }
                else {
                    duration = Math.log(TouchScrollBar.MINIMUM_VELOCITY / absPixelsPerMS) / TouchScrollBar.FRICTION_LOG;
                }
            }
            else {
                posTo = pos;
            }

            // 慢速拖动，不需要继续再滚动了
            if (Math.abs(pos - posTo) < 100 || (TimeUtil.nowTime - this._lastTime) > 150) {
                duration = 0;
            }

            // 继续滚动
            if (duration > 0) {
                if (!this.bounces) {
                    if (posTo > min) posTo = min;
                    else if (posTo < max) posTo = max;
                }
                this.tweenContent(posTo, duration * 0.5);
            }
            else {
                this.checkBounces();
            }
        }


        /**
         * 缓动内容开始
         */
        private tweenContent(pos: number, duration: number): void {
            this._tweenContentTo = pos;

            // 可能有多个滚动条，缓动不能重复
            let props: any = {};
            let scrolls: TouchScrollBar[] = this._content[TouchScrollBar.SCROLLS];
            for (let i = 0; i < scrolls.length; i++) {
                let scrollBar: TouchScrollBar = scrolls[i];
                let tweenContentTo: number = scrollBar._tweenContentTo;
                if (tweenContentTo == null) continue;

                let xy: string = scrollBar._xy;
                props[xy] = tweenContentTo;
            }
            if (props.x == null) props.x = this._content.x;
            if (props.y == null) props.y = this._content.y;

            this._content.stopAllActions();
            this._content.runAction(cc.sequence(
                cc.moveTo(duration / 1000, props.x, props.y)
                    .easing(cc.easeSineOut()),
                cc.callFunc(this.tweenContentEnd, this)
            ));

            lolo.stage.event_addListener(Event.ENTER_FRAME, this.tweenContentUpdate, this);
        }

        /**
         * 缓动内容中，更新内容相关滚动条
         */
        private tweenContentUpdate(event?: Event): void {
            let content: cc.Node = this._content;

            // native 触发scrollList更新
            if (isNative && content instanceof ScrollList) {
                ItemGroup.prototype.render.call(content);
            }

            let scrolls: TouchScrollBar[] = content[TouchScrollBar.SCROLLS];
            for (let i = 0; i < scrolls.length; i++) {
                let scrollBar: TouchScrollBar = scrolls[i];
                scrollBar.updateThumb.call(scrollBar);
            }
        }

        /**
         * 缓动内容结束
         */
        private tweenContentEnd(): void {
            // native moveTo 需要将 c++ 对 x/y 的改动更新到 js 代码中
            if (isNative) {
                this._content.x = this._content._original_getPositionX();
                this._content.y = -this._content._original_getPositionY();
            }

            let scrolls: TouchScrollBar[] = this._content[TouchScrollBar.SCROLLS];
            for (let i = 0; i < scrolls.length; i++) {
                let scrollBar: TouchScrollBar = scrolls[i];
                scrollBar.checkBounces.call(scrollBar);
            }
        }


        // /**
        //  * 不是 native 才能使用 js 的 ease。
        //  * 要不然会报错：Invalid Native Object
        //  */
        // if (!isNative) moveTo = moveTo.easing(TouchScrollBar.easeOut);
        // private static easeOut = {
        //     easing: function (dt: number) {
        //         let invRatio: number = dt - 1.0;
        //         return invRatio * invRatio * invRatio + 1;
        //     }
        // };


        /**
         * 检查回弹
         */
        public checkBounces(): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.tweenContentUpdate, this);
            this._tweenContentTo = null;

            let pos: number = this._content[this._xy];
            let posTo: number = pos;
            if (pos > this._min) posTo = this._min;
            else if (pos < this._max) posTo = this._max;

            if (posTo != pos) {//弹回
                this.tweenContent(posTo, 300);
            }
            else {
                this.scrollEnd();
            }
        }


        /**
         * 滚动完全结束
         */
        private scrollEnd(): void {
            this._content[this._xy] = this._content[this._xy];
            this.updateThumb();
            this.showOrHide(false);
        }


        /**
         * 显示或隐藏
         * @param show
         */
        private showOrHide(show: boolean): void {
            this.stopAllActions();
            switch (this.scrollPolicy) {
                case Constants.POLICY_ON:
                    this.visible = true;
                    this.alpha = 1;
                    break;

                case Constants.POLICY_OFF:
                    this.visible = false;
                    break;

                default:
                    if (show) {
                        this.visible = true;
                        this.runAction(cc.fadeIn(0.2));
                    }
                    else {
                        this.runAction(cc.sequence(cc.fadeOut(0.3), cc.hide()))
                    }
            }
        }


        /**
         * 更新滑块的尺寸和位置
         */
        public updateThumb(): void {
            let contentPos: number = this._content[this._xy];
            let contentSize: number = this._content[this._wh];
            let viewPos: number = this._viewableArea[this._xy];
            let viewSize: number = this._viewableArea[this._wh];
            let maxSize: number = this._size;

            //-- 滑块尺寸
            let thumbSize: number = viewSize / contentSize * maxSize;
            if (thumbSize == Infinity) thumbSize = 0;
            //当前已经超出拖动区域了，滑块继续变小
            if (contentPos > this._min || contentPos < this._max) {
                let exceedValue: number = 0;
                if (contentPos > this._min) exceedValue = contentPos - this._min;
                else if (contentPos < this._max) exceedValue = this._max + Math.abs(contentPos);
                thumbSize -= exceedValue * 0.5;
            }

            //限制在最小尺寸
            if (thumbSize < this.thumbMinSize) thumbSize = this.thumbMinSize;
            this._thumb[this._wh] = thumbSize;


            //-- 滑块的位置
            let thumbPos: number = -(contentPos - viewPos) / (contentSize - viewSize) * (this._size - thumbSize);
            //限定在size范围内
            let thumbMaxPos: number = maxSize - thumbSize;
            if (thumbPos < 0) thumbPos = 0;
            else if (thumbPos > thumbMaxPos) thumbPos = thumbMaxPos;
            this._thumb[this._xy] = thumbPos;
        }


        /**
         * 初始化
         */
        private initialize(): void {
            if (this._viewableArea == null || this._content == null) return;

            let contentParent: cc.Node = this._content.parent;
            // 多滚动条的情况下，已经被初始化过了
            if (contentParent instanceof cc.ClippingNode && contentParent.mask != null) {
                this._mask = contentParent.mask;
            }
            else {
                // 将 content 放入到 Mask.clipper 中，并将 Mask.clipper 放入到 content.parent 中
                this._mask = new Mask();
                this._mask.touchEnabled = true;
                this._mask.content = this._content;
            }
            this._mask.setRect(this._viewableArea.x, this._viewableArea.y, this._viewableArea.width, this._viewableArea.height);

            this.render();
        }


        public set content(value: cc.Node) {
            let scrolls: TouchScrollBar[];

            if (this._content != null) {
                this._content.event_removeListener(TouchScrollBar.CONTENT_CHANGED, this.contentChangeHandler, this);

                // 还原当前 _content 到他原本的容器中
                let clipper: cc.Node = this._content.parent;
                if (clipper instanceof cc.ClippingNode) {
                    let contentParent: cc.Node = clipper.parent;
                    if (contentParent != null) contentParent.addChild(this._content);
                }

                // 移除内容列表中的该滚动条
                scrolls = this._content[TouchScrollBar.SCROLLS];
                if (scrolls != null) {
                    let i: number = scrolls.indexOf(this);
                    if (i != -1) scrolls.splice(i, 1);
                }
            }

            if (this._mask != null) {
                this._mask.event_removeListener(TouchEvent.TOUCH_BEGIN, this.mask_touchBegin, this);
                this._mask.event_removeListener(TouchEvent.TOUCH_MOVE, this.mask_touchMove, this);
                this._mask.event_removeListener(TouchEvent.TOUCH_END, this.mask_touchEnd, this);
                if (scrolls.length == 0) this._mask.destroy();// 当前 _content 已经没有对应的滚动条了，清理 Mask
                this._mask = null;
            }

            // destroy() 的时候，会传 null 进来
            if (value == null) return;

            this._content = value;
            this._content.event_addListener(TouchScrollBar.CONTENT_CHANGED, this.contentChangeHandler, this);

            if (this._content[TouchScrollBar.SCROLLS] == null) this._content[TouchScrollBar.SCROLLS] = [];
            scrolls = this._content[TouchScrollBar.SCROLLS];
            scrolls.push(this);

            this.initialize();
        }

        public get content(): cc.Node {
            return this._content;
        }


        public set viewableArea(value: {x: number, y: number, width: number, height: number}) {
            this._viewableArea.setTo(value.x, value.y, value.width, value.height);
            this.initialize();
        }

        public get viewableArea(): {x: number, y: number, width: number, height: number} {
            return this._viewableArea;
        }


        public set enabled(value: boolean) {
            this._enabled = value;
            if (this._mask == null) return;

            if (this._enabled && this._showed) {
                this._mask.event_addListener(TouchEvent.TOUCH_BEGIN, this.mask_touchBegin, this);
            }
            else {
                this._mask.event_removeListener(TouchEvent.TOUCH_BEGIN, this.mask_touchBegin, this);
                lolo.stage.event_removeListener(Event.ENTER_FRAME, this.tweenContentUpdate, this);
            }
        }

        public get enabled(): boolean {
            return this._enabled;
        }


        public set direction(value: string) {
            if (value == this._direction) return;
            this._direction = value;
            if (value == Constants.HORIZONTAL) {
                this._xy = "x";
                this._wh = "width";
            }
            else {
                this._xy = "y";
                this._wh = "height";
            }

            //重置尺寸
            this.size = this._size;
        }

        public get direction(): string {
            return this._direction;
        }


        public set size(value: number) {
            this._size = value;
        }

        public get size(): number {
            return this._size;
        }


        /**
         * 滚动条当前是否已显示（内容尺寸是否超出了显示区域）
         */
        public get showed(): boolean {
            return this._showed;
        }


        /**
         * 内容有改变
         * @param event
         */
        private contentChangeHandler(event: Event): void {
            this.render();
        }


        //


        /**
         * 销毁
         */
        public destroy(): void {
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.doRender, this);
            lolo.stage.event_removeListener(Event.ENTER_FRAME, this.tweenContentUpdate, this);
            this.content = null;

            super.destroy();
        }

        //
    }
}