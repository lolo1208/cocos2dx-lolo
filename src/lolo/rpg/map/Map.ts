namespace lolo.rpg {


    /**
     * RPG地图
     * @author LOLO
     */
    export class Map extends DisplayObjectContainer {

        /**地图的ID*/
        private _id: string;
        /**地图配置信息*/
        private _info: MapInfo;

        /**背景*/
        private _background: MapBackground;
        /**角色容器*/
        private _avatarC: DisplayObjectContainer;
        /**在所有角色和遮挡物之上的容器*/
        private _aboveC: DisplayObjectContainer;
        /**在所有角色和遮挡物之下的容器*/
        private _belowC: DisplayObjectContainer;


        /**镜头跟踪的角色*/
        private _trackingAvatar: Avatar;
        /**卷屏相关的属性*/
        private _scrollInfo: {
            sw?: number, sh?: number,// 舞台宽高
            hsw?: number, hsh?: number,// 半个舞台宽高
            rb?: number, db?: number// 右和下的边界
        } = {};

        /**角色索引列表，avatars[tile.y][tile.x]=Vector.Avatar*/
        private _avatars: any[];
        /**用于对可见范围内的角色进行排序*/
        private _sortTimer: Timer;

        /**鼠标在背景上按下时，是否自动播放鼠标点击动画*/
        private _autoPlayTouchAnimation: boolean = false;
        /**角色是否可以被Touch*/
        private _avatarTouchEnabled: boolean = true;
        /**角色走到被遮挡的区块上时，是否半透明*/
        public autoCoverAvatar: boolean = true;

        /**当前屏幕中心位置（像素）*/
        private screenCenter: Point = new Point();


        public constructor(id: string = null) {
            super();

            this._background = new MapBackground(this);
            this._background.name = lolo.Constants.LAYER_NAME_BG;
            this._background.touchEnabled = true;
            this.addChild(this._background);

            this._belowC = new DisplayObjectContainer();
            this._belowC.touchEnabled = false;
            this.addChild(this._belowC);

            this._avatarC = new DisplayObjectContainer();
            this._avatarC.touchEnabled = false;
            this.addChild(this._avatarC);

            this._aboveC = new DisplayObjectContainer();
            this._aboveC.touchEnabled = false;
            this.addChild(this._aboveC);

            this.touchEnabledChanged();

            if (id != null) this.init(id);
        }


        /**
         * 初始化地图
         * @param id 地图的ID
         */
        public init(id: string): void {
            this.clear();

            this._id = id;
            this.name = "id" + id;

            // 读取地图信息
            this._info = lolo.loader.getResByUrl(lolo.config.getUIConfig(Constants.CN_MAP_DATA, id), true);

            // 显示背景（这里不需要清除，因为IMG会被ImageLoader清除）
            this._background.init(lolo.loader.getResByUrl(lolo.config.getUIConfig(Constants.CN_MAP_THUMBNAIL, id)));
            // 初始化数据
            this._avatars = [];

            // 添加事件侦听
            if (this._sortTimer == null)
                this._sortTimer = new Timer(Constants.AVATAR_DEPTH_SORT_DELAY, new Handler(this.avatarSortTimerHandler, this));

            this.screenCenter.setTo(0, 0);
            lolo.stage.event_addListener(Event.RESIZE, this.stage_resizeHandler, this);
            this.stage_resizeHandler();
        }


        /**
         * 创建一个角色，加入到地图中，并返回该角色的实例
         * @param key 角色在map中的唯一key（如果已经有角色使用该key，将会更新该角色，而不是创建）
         * @param pic 角色的pic
         * @param priority 加载优先级，数字越大，优先级越高
         * @param tile 角色所在的区块坐标，默认值null表示随机位置
         * @param direction 角色的方向，默认值0表示随机方向
         * @return
         */
        public createAvatar(key: string, pic: string = null, priority: number = 0, tile: Point = null, direction: number = 0): Avatar {
            if (tile == null) tile = getRandomCanPassTile(this._info);
            if (direction == 0) direction = Math.floor(MathUtil.getBetweenRandom(1, 9));

            let avatar: Avatar = this.getAvatarByKey(key);
            if (avatar == null) {
                avatar = new Avatar();
                avatar.key = key;
                avatar.tile = tile;// 设置map的时候，需要访问tile
                avatar.map = this;
            }

            avatar.tile = tile;
            avatar.direction = direction;
            avatar.priority = priority;
            avatar.pic = pic;
            avatar.playStand();

            return avatar;
        }


        /**
         * 将角色添加到地图中
         * @param avatar
         */
        public addAvatar(avatar: Avatar): void {
            // 同步角色的map（设置 avatar.map 属性，会调用 map.addAvatar）
            if (avatar.map != this) {
                avatar.map = this;
                return;
            }

            // 先将相同key的角色移除
            this.removeAvatar(this.getAvatarByKey(avatar.key));

            // 再将该角色添加到地图
            let a: Avatar = avatar;
            a.name = "avatar" + a.key;
            this._avatarC.addChild(a);

            // 添加到角色列表
            avatar.event_addListener(AvatarEvent.TILE_CHANGED, this.avatarTileChangedHandler, this);
            avatar.dispatchAvatarEvent(AvatarEvent.TILE_CHANGED);
        }


        /**
         * 移除角色
         * @param avatar
         */
        public removeAvatar(avatar: Avatar): void {
            if (avatar == null) return;

            // 从索引列表中移除
            let avatars: Avatar[] = this.getAvatarListFromTile(avatar.tile);
            let i: number = avatars.indexOf(avatar);
            if (i != -1) avatars.splice(i, 1);

            // 从显示列表中移除
            if (avatar.parent == this._avatarC) this._avatarC.removeChild(avatar);

            avatar.event_removeListener(AvatarEvent.TILE_CHANGED, this.avatarTileChangedHandler, this);
            avatar.clear();
        }


        /**
         * 通过key来获取角色
         * @param key
         * @return
         */
        public getAvatarByKey(key: string): Avatar {
            return <Avatar>this._avatarC.getChildByName("avatar" + key);
        }


        /**
         * 获取所有角色
         * @return
         */
        public getAllAvatar(): Avatar[] {
            return <Avatar[]>this._avatarC.children;
        }


        /**
         * 获取指定区块点上的角色列表
         * @param tile
         * @return
         */
        public getAvatarListFromTile(tile: Point): Avatar[] {
            if (tile == null) return [];// 传入的错误的值
            let avatars: any[] = this._avatars;
            if (avatars[tile.y] == null) avatars[tile.y] = [];
            if (avatars[tile.y][tile.x] == null) avatars[tile.y][tile.x] = [];
            return avatars[tile.y][tile.x];
        }


        /**
         * 地图上有角色的区块位置发生了改变
         * @param event
         */
        private avatarTileChangedHandler(event: AvatarEvent): void {
            //同步角色索引列表
            let avatar: Avatar = event.target;

            //走到了被遮挡的区块上
            let alpha: number = 1;
            if (this.autoCoverAvatar) {
                try {
                    if (this._info.data[avatar.tile.y][avatar.tile.x].cover) alpha = 0.6;
                }
                catch (error) {
                }
            }
            avatar.alpha = alpha;

            //启动透视深度排序的定时器
            if (!this._sortTimer.running) this._sortTimer.start();
        }

        /**
         * 根据角色透视深度进行排序
         */
        private avatarSortTimerHandler(): void {
            this._sortTimer.stop();

            let staggered: boolean = this._info.staggered;
            let avatars: Avatar[] = this.getScreenAvatars();
            avatars = avatars.sort(
                //根据角色的 y位置，以及 死亡状态 进行排序
                function (a1: Avatar, a2: Avatar): number {
                    if (a1.isDead && !a2.isDead) return -1;
                    if (a2.isDead && !a1.isDead) return 1;

                    if (a1.isDead && a2.isDead) {
                        if (staggered) {
                            if (a1.tile.y < a2.tile.y) return 1;
                            if (a1.tile.y > a2.tile.y) return -1;
                        }
                        else {
                            if (a1.tile.y < a2.tile.y) return -1;
                            if (a1.tile.y > a2.tile.y) return 1;
                            if (a1.tile.x < a2.tile.x) return -1;
                            if (a1.tile.x > a2.tile.x) return 1;
                        }
                    }

                    if (staggered) {
                        if (a1.tile.y < a2.tile.y) return -1;
                        if (a1.tile.y > a2.tile.y) return 1;
                    }
                    else {
                        if (a1.tile.y < a2.tile.y) return 1;
                        if (a1.tile.y > a2.tile.y) return -1;
                        if (a1.tile.x < a2.tile.x) return 1;
                        if (a1.tile.x > a2.tile.x) return -1;
                    }

                    //同一个位置，都没死亡，按key排序，保证顺序
                    if (a1.key < a2.key) return -1;
                    if (a1.key > a2.key) return 1;
                    return 0;
                }
            );

            for (let i: number = 0; i < avatars.length; i++) {
                avatars[i].setLocalZOrder(i);
            }
        }


        /**
         * 镜头跟踪的角色
         */
        public set trackingAvatar(value: Avatar) {
            if (this._trackingAvatar != null) {
                this._trackingAvatar.dispatchMoveing = false;
                this._trackingAvatar.event_removeListener(AvatarEvent.MOVEING, this.trackingAvatar_moveingHandler, this);
            }

            this._trackingAvatar = value;
            if (this._trackingAvatar != null) {
                this._trackingAvatar.dispatchMoveing = true;
                this._trackingAvatar.event_addListener(AvatarEvent.MOVEING, this.trackingAvatar_moveingHandler, this);
                this.trackingAvatar_moveingHandler();
            }
        }

        public get trackingAvatar(): Avatar {
            return this._trackingAvatar;
        }


        /**
         * 镜头跟踪的角色正在移动中
         * @param event
         */
        private trackingAvatar_moveingHandler(event: AvatarEvent = null): void {
            let p: Point = CachePool.getPoint(this._trackingAvatar.x, this._trackingAvatar.y);
            this.scroll(p, true);
            CachePool.recycle(p);
        }


        /**
         * 舞台尺寸有改变
         * @param event
         */
        private stage_resizeHandler(event: Event = null): void {
            let scrollInfo: any = this._scrollInfo;
            scrollInfo.sw = lolo.ui.stageWidth;// 舞台宽高
            scrollInfo.sh = lolo.ui.stageHeight;
            scrollInfo.hsw = scrollInfo.sw >> 1;// 半个舞台宽高
            scrollInfo.hsh = scrollInfo.sh >> 1;
            scrollInfo.rb = -(this._info.mapWidth - scrollInfo.sw);// 右和下的边界
            scrollInfo.db = -(this._info.mapHeight - scrollInfo.sh);

            this.scroll(this.screenCenter, true);
        }


        /**
         * 滚动地图
         * @param position 目标像素位置（屏幕中心）
         * @param now 是否立即滚动到该位置
         * @param duration 缓动持续时间
         */
        public scroll(position: Point, now: boolean = false, duration: number = 500): void {
            let scrollInfo: any = this._scrollInfo;
            let x: number = -(position.x - scrollInfo.hsw);
            let y: number = -(position.y - scrollInfo.hsh);
            if (x > 0) x = 0;
            else if (x < scrollInfo.rb) x = scrollInfo.rb;
            if (y > 0) y = 0;
            else if (y < scrollInfo.db) y = scrollInfo.db;

            this.screenCenter.setTo(-x + scrollInfo.hsw, -y + scrollInfo.hsh);
            this.stopAllActions();

            //背景不够大，没达到卷屏的尺寸
            if (this._info.mapWidth <= scrollInfo.sw && this._info.mapHeight <= scrollInfo.sh) {
                this.x = this.y = 0;
                return;
            }

            if (now) {
                this.x = x;
                this.y = y;
            }
            else {
                this.runAction(cc.moveTo(duration, x, y));
            }

            this.dispatchMapEvent(MapEvent.SCREEN_CENTER_CHANGED);
        }


        /**
         * 获取屏幕在整张地图中的位置（范围）
         * @param offsets 偏移（缓冲区域半径）
         * @return
         */
        public getScreenArea(offsets: number = 50): Rectangle {
            return CachePool.getRectangle(
                -this.x - offsets,
                -this.y - offsets,
                lolo.ui.stageWidth + offsets * 2,
                lolo.ui.stageHeight + offsets * 2
            );
        }


        /**
         * 获取屏幕范围内的玩家列表
         * @return
         */
        public getScreenAvatars(): Avatar[] {
            let v: number, h: number, vNum: number, hNum: number, hh: number, lt: Point, ld: Point, rt: Point, rd: Point;
            let avts: Avatar[], i: number;
            let rect: Rectangle = this.getScreenArea(30);
            let avatars: Avatar[] = [];
            let p: Point = CachePool.getPoint();

            p.setTo(rect.x, rect.y);
            lt = getTile(p, this._info);

            p.setTo(rect.x + rect.width, rect.y + rect.height);
            rd = getTile(p, this._info);

            if (this._info.staggered) {
                for (v = lt.y; v < rd.y; v++) {
                    for (h = lt.x; h < rd.x; h++) {
                        p.setTo(h, v);
                        avts = this.getAvatarListFromTile(p);
                        for (i = 0; i < avts.length; i++) avatars.push(avts[i]);
                    }
                }
            }
            else {
                p.setTo(rect.x, rect.y + rect.height);
                ld = getTile(p, this._info);

                p.setTo(rect.x + rect.width, rect.y);
                rt = getTile(p, this._info);

                hNum = (lt.x - ld.x) * 2;
                vNum = ld.y - rd.y;
                for (h = 0; h < hNum; h++) {
                    hh = h / 2;
                    for (v = 0; v < vNum; v++) {
                        p.setTo(ld.x + Math.ceil(hh) + v, ld.y + Math.floor(hh) - v);
                        avts = this.getAvatarListFromTile(p);
                        for (i = 0; i < avts.length; i++) avatars.push(avts[i]);
                    }
                }
            }

            CachePool.recycle([lt, ld, rt, rd, rect, p]);
            return avatars;
        }


        /**
         * 添加一个显示元素
         * @param element
         * @param above 是否在所有角色和遮挡物之上
         * @param depth 要添加到的图层深度（负数表示添加到最上层）
         */
        public addElement(element: cc.Node, above: boolean = true, depth: number = -1): void {
            let c: DisplayObjectContainer = above ? this._aboveC : this._belowC;
            if (depth < 0 || c.numChildren == 0) {
                c.addChild(element);
            }
            else {
                if (depth >= c.numChildren) depth = c.numChildren - 1;
                c.addChildAt(element, depth);
            }
        }


        /**
         * 鼠标在背景上按下时，是否自动播放鼠标点击动画
         */
        public set autoPlayTouchAnimation(value: boolean) {
            this._autoPlayTouchAnimation = value;
            this.touchEnabledChanged();
        }

        public get autoPlayTouchAnimation(): boolean {
            return this._autoPlayTouchAnimation;
        }

        /**
         * 角色是否可以被Touch
         */
        public set avatarTouchEnabled(value: boolean) {
            this._avatarTouchEnabled = value;
            this.touchEnabledChanged();
        }

        public get avatarTouchEnabled(): boolean {
            return this._avatarTouchEnabled;
        }

        private touchEnabledChanged(): void {
            if (this._autoPlayTouchAnimation || this._avatarTouchEnabled) {
                this._background.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.background_touchBegin, this);
            }
            else {
                this._background.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.background_touchBegin, this);
            }
        }

        /**
         * touch 背景
         */
        private background_touchBegin(event: egret.TouchEvent): void {
            if (this._avatarTouchEnabled) {
                let sx: number = event.stageX;
                let sy: number = event.stageY;
                let lx: number = event.localX;
                let ly: number = event.localY;
                let rect: egret.Rectangle = CachePool.getRectangle();
                let p: egret.Point = CachePool.getPoint();

                let c: egret.DisplayObjectContainer = this._avatarC;
                let avatar: Avatar;
                //从上往下循环搜索
                for (let i = c.numChildren - 1; i >= 0; i--) {
                    avatar = <Avatar>c.getChildAt(i);
                    avatar.getBounds(rect);
                    rect.x += lx;
                    rect.y += ly;
                    //在该Avatar的范围内
                    if (rect.contains(lx, ly)) {
                        //并且点到了像素上
                        if (avatar.hitTestPoint(sx, sy, true)) {
                            avatar.dispatchAvatarEvent(AvatarEvent.TOUCH, true);
                            return;
                        }
                    }
                }
            }

            if (this._autoPlayTouchAnimation) this._background.playTouchAnimation();
            this.dispatchMapEvent(MapEvent.TOUCH);
        }


        public get id(): string {
            return this._id;
        }


        public get info(): MapInfo {
            return this._info;
        }


        public get touchTile(): egret.Point {
            let p1: egret.Point = this.globalToLocal(lolo.ui.stageX, lolo.ui.stageY);
            let p2: egret.Point = getTile(p1, this._info);
            CachePool.recover(p1);
            return p2;
        }


        /**
         * 抛出地图相关事件
         */
        public dispatchMapEvent(type: string): void {
            let event: MapEvent = egret.Event.create(MapEvent, type);
            event.tile = this.touchTile;
            this.dispatchEvent(event);
            egret.Event.release(event);
        }


        public get cleared(): boolean {
            return this._info == null;
        }


        public clearAllAvatar(): void {
            while (this._avatarC.numChildren > 0) {
                this.removeAvatar(<Avatar>this._avatarC.removeChildAt(0));
            }

            this.trackingAvatar = null;
            this._avatars = null;
        }


        public clear(): void {
            lolo.stage.removeEventListener(egret.Event.RESIZE, this.stage_resizeHandler, this);
            if (this._sortTimer != null) this._sortTimer.stop();

            this.clearAllAvatar();
            this._background.clear();

            //移除附加的显示元素，并尝试调用 dispose() 和 clear() 方法
            let element: egret.DisplayObject;
            while (this._aboveC.numChildren > 0) {
                element = this._aboveC.removeChildAt(0);
                try {
                    element["dispose"]();
                } catch (error) {
                }
                try {
                    element["clear"]();
                } catch (error) {
                }
            }
            while (this._belowC.numChildren > 0) {
                element = this._belowC.removeChildAt(0);
                try {
                    element["dispose"]();
                } catch (error) {
                }
                try {
                    element["clear"]();
                } catch (error) {
                }
            }

            this._id = null;
            this._info = null;
        }

        //
    }
}