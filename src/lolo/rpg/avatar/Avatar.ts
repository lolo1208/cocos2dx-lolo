/// <reference path="./AvatarLoading.ts"/>


namespace lolo.rpg {


    /**
     * RPG角色
     * @author LOLO
     */
    export class Avatar extends DisplayObjectContainer {

        /**角色默认的loadingClass*/
        public static defaultAvatarLoadingClass: any = AvatarLoading;


        /**所属的RpgMap*/
        private _map: Map;
        /**角色在map中的唯一key*/
        private _key: string;
        /**附带的数据*/
        private _data: any;
        /**角色的外形*/
        private _pic: string;
        /**当前方向*/
        private _direction: number;
        /**当前所在的区块坐标*/
        private _tile: Point;
        /**是否已死亡*/
        private _isDead: boolean;
        /**当前移动的动作（默认：RpgConstants.A_RUN）*/
        private _moveAction: string;
        /**移动速度*/
        private _moveSpeed: number = 1;
        /**动画的播放速度*/
        private _animationSpeed: number = 1;
        /**是否正在移动中*/
        private _moveing: boolean;
        /**是否需要抛出 AvatarEvent.MOVEING 事件（默认不抛）*/
        private _dispatchMoveing: boolean;

        /**角色外形动画*/
        private _avatarAni: Animation;
        /**角色外形容器（会随着方向翻转）*/
        private _shapeC: DisplayObjectContainer;
        /**附属物 - 服饰容器*/
        private _dressC: DisplayObjectContainer;
        /**附属物 - 发型容器*/
        private _hairC: DisplayObjectContainer;
        /**附属物 - 武器容器*/
        private _weaponC: DisplayObjectContainer;

        /**Loading的类定义*/
        private _loadingClass: any;
        /**角色加载外形时，显示的Loading*/
        private _loading: AvatarLoading;
        /**外形的加载优先级，数字越大，优先级越高*/
        private _priority: number = 0;

        /**当前执行的动作*/
        private _actionInfo: {action: string, replay: boolean, endIdle: boolean};

        /**正在移动的（剩余）路径*/
        private _road: any[] = [];
        /**下一个区块点（移动结束点）的像素坐标*/
        private _endPixel: Point;
        /**每次移动需要递增的像素*/
        private _moveAddPixel: Point = new Point();
        /**现在真实的像素位置（x,y未取整前）*/
        private _realPixel: Point = new Point();

        /**角色的附属物列表*/
        private _adjuncts: {type: string, pic: string, ani: Animation}[] = [];

        /**是否为8方向素材，默认值为：RpgConstants.DIRECTION_8*/
        private _is8Direction: boolean;
        /**根据 当前方向 和 素材是否为8方向，得出的素材应该使用的方向*/
        private _assetDirection: number;

        /**用于移动*/
        private _moveTimer: Timer;


        public constructor() {
            super();
            this._is8Direction = Constants.is8Direction;
            this._loadingClass = Avatar.defaultAvatarLoadingClass;
            this._moveAction = Constants.A_RUN;

            this._shapeC = new DisplayObjectContainer();
            this.addChild(this._shapeC);

            this._avatarAni = new Animation();
            this._shapeC.addChild(this._avatarAni);

            this._dressC = new DisplayObjectContainer();
            this._dressC.name = Constants.ADJUNCT_TYPE_DRESS;
            this._shapeC.addChild(this._dressC);

            this._hairC = new DisplayObjectContainer();
            this._hairC.name = Constants.ADJUNCT_TYPE_HAIR;
            this._shapeC.addChild(this._hairC);

            this._weaponC = new DisplayObjectContainer();
            this._weaponC.name = Constants.ADJUNCT_TYPE_WEAPON;
            this._shapeC.addChild(this._weaponC);

            this._moveTimer = new Timer(16, new Handler(this.moveTimerHandler, this));
        }


        public moveToTile(tp: Point): void {
            this.moveByRoad(wayfinding(this._map.info, this._tile, tp));
        }

        public moveByRoad(road: any[]): void {
            this._road = road;
            this.moveToNextTile();
        }

        public addRoad(road: any[]): void {
            if (this._moveing) {
                for (let i = 0; i < road.length; i++) this._road.push(road[i]);
            }
            else {
                this.moveByRoad(road);
            }
        }


        /**
         * 移动到路径组的下一个区块中
         */
        private moveToNextTile(): void {
            if (this._moveing) return;

            //没有需要继续移动的路径了
            if (this._road.length == 0) {
                this.playStand();
                this.dispatchAvatarEvent(AvatarEvent.MOVE_END);//追着敌人攻击，需要关注该事件
                return;
            }

            let tile: Point = this._tile;
            let moveAddPixel: Point = this._moveAddPixel;

            //取出下一个区块的位置
            let arr: number[] = this._road.shift();
            let ep: Point = CachePool.getPoint(arr[0], arr[1]);

            //当前区块的位置，就是下一个区块位置
            if (ep.x == tile.x && ep.y == tile.y) {
                this.moveToNextTile();
                return;
            }


            //得出方向，以及每次移动的像素距离
            let nowDirection: number = this._direction;//记录当前方向
            moveAddPixel.setTo(0, 0);//默认x、y都无需移动
            let el: boolean = (tile.y % 2) == 0;//是否为偶数行


            //交错地图的方向判断
            if (this._map.info.staggered) {
                if (ep.y < this._tile.y) {
                    //左上
                    if ((el && ep.x < tile.x) || (!el && tile.y - 1 == ep.y && tile.x == ep.x)) {
                        this._direction = Constants.D_LEFT_UP;
                        moveAddPixel.x = -Constants.AVATAR_MOVE_ADD_X;
                    }
                    //右上
                    else if ((el && ep.x == tile.x && ep.y == tile.y - 1) || (!el && ep.x > tile.x)) {
                        this._direction = Constants.D_RIGHT_UP;
                        moveAddPixel.x = Constants.AVATAR_MOVE_ADD_X;
                    }
                    //正上
                    else {
                        this._direction = Constants.D_UP;
                    }
                    moveAddPixel.y = -Constants.AVATAR_MOVE_ADD_Y;
                }
                else if (ep.y > tile.y) {
                    //左下
                    if ((el && ep.x < tile.x) || (!el && tile.y + 1 == ep.y && tile.x == ep.x)) {
                        this._direction = Constants.D_LEFT_DOWN;
                        moveAddPixel.x = -Constants.AVATAR_MOVE_ADD_X;
                    }
                    //右下
                    else if ((el && ep.x == tile.x && ep.y == tile.y + 1) || (!el && ep.x > tile.x)) {
                        this._direction = Constants.D_RIGHT_DOWN;
                        moveAddPixel.x = Constants.AVATAR_MOVE_ADD_X;
                    }
                    //正下
                    else {
                        this._direction = Constants.D_DOWN;
                    }
                    moveAddPixel.y = Constants.AVATAR_MOVE_ADD_Y;
                }
                else {
                    //正左
                    if (ep.x < tile.x) {
                        this._direction = Constants.D_LEFT;
                        moveAddPixel.x = -Constants.AVATAR_MOVE_ADD_X;
                    }
                    //正右
                    else {
                        this._direction = Constants.D_RIGHT;
                        moveAddPixel.x = Constants.AVATAR_MOVE_ADD_X;
                    }
                }
            }
            //大菱形地图的方向判断
            else {
                if (ep.y > tile.y) {
                    //正左
                    if (ep.x < tile.x) {
                        this._direction = Constants.D_LEFT;
                        moveAddPixel.x = -Constants.AVATAR_MOVE_ADD_X;
                    }
                    //左上
                    else if (ep.x == tile.x) {
                        this._direction = Constants.D_LEFT_UP;
                        moveAddPixel.x = -Constants.AVATAR_MOVE_ADD_X;
                        moveAddPixel.y = -Constants.AVATAR_MOVE_ADD_Y;
                    }
                    //正上
                    else {
                        this._direction = Constants.D_UP;
                        moveAddPixel.y = -Constants.AVATAR_MOVE_ADD_Y;
                    }
                }
                else if (ep.y < tile.y) {
                    //正下
                    if (ep.x < tile.x) {
                        this._direction = Constants.D_DOWN;
                        moveAddPixel.y = Constants.AVATAR_MOVE_ADD_Y;
                    }
                    //右下
                    else if (ep.x == tile.x) {
                        this._direction = Constants.D_RIGHT_DOWN;
                        moveAddPixel.x = Constants.AVATAR_MOVE_ADD_X;
                        moveAddPixel.y = Constants.AVATAR_MOVE_ADD_Y;
                    }
                    //正右
                    else {
                        this._direction = Constants.D_RIGHT;
                        moveAddPixel.x = Constants.AVATAR_MOVE_ADD_X;
                    }
                }
                else {
                    //左下
                    if (ep.x < tile.x) {
                        this._direction = Constants.D_LEFT_DOWN;
                        moveAddPixel.x = -Constants.AVATAR_MOVE_ADD_X;
                        moveAddPixel.y = Constants.AVATAR_MOVE_ADD_Y;
                    }
                    //右上
                    else {
                        this._direction = Constants.D_RIGHT_UP;
                        moveAddPixel.x = Constants.AVATAR_MOVE_ADD_X;
                        moveAddPixel.y = -Constants.AVATAR_MOVE_ADD_Y;
                    }
                }
            }

            //乘上速度值
            moveAddPixel.x *= this._moveSpeed;
            moveAddPixel.y *= this._moveSpeed;

            //下一个区块的像素位置
            CachePool.recycle(this._endPixel);
            this._endPixel = getTileCenter(ep, this._map.info);


            //开始移动
            this._moveing = true;
            this.changeTile(ep);
            this.playAction(this._moveAction, true, (nowDirection != this._direction ? 1 : 0));

            this._realPixel.setTo(this.x, this.y);
            this._moveTimer.start();

            this.dispatchAvatarEvent(AvatarEvent.TILE_CHANGED);//排序依赖该事件，所以必须抛出
        }


        /**
         * 移动定时器回调
         */
        private moveTimerHandler(): void {
            let moveAddPixel: Point = this._moveAddPixel;
            let realPixel: Point = this._realPixel;
            let endPixel: Point = this._endPixel;

            realPixel.x += moveAddPixel.x;
            realPixel.y += moveAddPixel.y;

            //已经移出界了
            if ((moveAddPixel.x < 0 && realPixel.x < endPixel.x)
                || (moveAddPixel.x > 0 && realPixel.x > endPixel.x)
                || (moveAddPixel.x == 0 && realPixel.x != endPixel.x)
            ) {
                realPixel.x = endPixel.x;
            }

            if ((moveAddPixel.y < 0 && realPixel.y < endPixel.y)
                || (moveAddPixel.y > 0 && realPixel.y > endPixel.y)
                || (moveAddPixel.y == 0 && realPixel.y != endPixel.y)
            ) {
                realPixel.y = endPixel.y;
            }

            // this.x = Math.round(realPixel.x);
            // this.y = Math.round(realPixel.y);
            this.x = realPixel.x;
            this.y = realPixel.y;

            if (this._dispatchMoveing) {
                this.dispatchAvatarEvent(AvatarEvent.MOVEING);
            }

            //已经移动到目标区块的中心点了
            if (this.x == endPixel.x && this.y == endPixel.y) {
                this.stopMove();
                this.moveToNextTile();
            }
        }


        public stopMove(): void {
            this._moveing = false;
            this._moveTimer.reset();
        }


        public playStand(direction: number = 0): void {
            if (direction != 0) this._direction = direction;
            this.playAction(Constants.A_STAND, true, 1, false);
        }

        private _playStandHandler: Handler;


        public playAction(action: string, replay: boolean = false, startFrame: number = 1, endIdle: boolean = true): void {
            if (this._playStandHandler != null) {
                this._playStandHandler.clean();
                this._playStandHandler = null;
            }

            this._actionInfo = {action: action, replay: replay, endIdle: endIdle};

            //5方向时，右侧的动画，直接用左侧的图像，并翻转
            this._assetDirection = this._direction;
            let assetScaleX: number = 1;
            if (!this._is8Direction) {
                switch (this._direction) {
                    case Constants.D_LEFT:
                        this._assetDirection = Constants.D_RIGHT;
                        assetScaleX = -1;
                        break;
                    case Constants.D_LEFT_UP:
                        this._assetDirection = Constants.D_RIGHT_UP;
                        assetScaleX = -1;
                        break;
                    case Constants.D_LEFT_DOWN:
                        this._assetDirection = Constants.D_RIGHT_DOWN;
                        assetScaleX = -1;
                        break;
                }
            }
            let scaleXChanged: boolean = this._shapeC.scaleX != assetScaleX;
            this._shapeC.scaleX = assetScaleX;

            if (this._pic == null) return;//还没设置过角色外形

            let avatarAni: Animation = this._avatarAni;
            let sn: string = "avatar." + this._pic + "." + action + this._assetDirection;
            //动画有改变，或者动画没在播放
            if (avatarAni.sourceName != sn || !avatarAni.playing || scaleXChanged) {
                avatarAni.sourceName = sn;
                avatarAni.play(startFrame, replay ? 0 : 1, 0, this._actionAnimationEndHandler);
                this.changeFPS();

                //这个动画还没被缓存
                if (!Animation.hasAnimation(sn)) {
                    // lolo.loader.addEventListener(LoadEvent.PROGRESS, this.loadItemEventHandler, this);
                    lolo.loader.event_addListener(LoadEvent.ITEM_COMPLETE, this.loadItemEventHandler, this);
                    if (this._loading == null) this._loading = new this._loadingClass();
                    if (this._loading.parent == null) {
                        this._loading.progress = 0;
                        this.addChild(this._loading);
                    }
                }
                else {
                    if (this._loading && this._loading.parent) {
                        // lolo.loader.removeEventListener(LoadEvent.PROGRESS, this.loadItemEventHandler, this);
                        lolo.loader.event_removeListener(LoadEvent.ITEM_COMPLETE, this.loadItemEventHandler, this);
                        this._loading.removeFromParent();
                    }
                }

                this.dispatchAvatarEvent(AvatarEvent.ACTION_START);
            }
        }


        /**
         * 动作的动画播放结束
         */
        private actionAnimationEnd(): void {
            this._actionInfo.action = null;//置空，表示现在没有执行任何动作
            if (this._actionInfo.endIdle) {
                if (this._playStandHandler != null) this._playStandHandler.clean();
                this._playStandHandler = delayedCall(1000 / this.avatarAni.fps, this.playStand, this);
            }

            this.dispatchAvatarEvent(AvatarEvent.ACTION_END);
        }

        private _actionAnimationEndHandler: Handler = new Handler(this.actionAnimationEnd, this);


        /**
         * 加载资源事件
         * @param event
         */
        private loadItemEventHandler(event: LoadEvent): void {
            if (event.lii.url != Animation.getUrl(this._avatarAni.sourceName)) return;//不是当前动画对应的资源

            // if (event.type == LoadEvent.PROGRESS) {
            //     this._loading.progress = event.lii.bytesLoaded / event.lii.bytesTotal;
            // }
            // else {
            //     lolo.loader.removeEventListener(LoadEvent.PROGRESS, this.loadItemEventHandler, this);
            lolo.loader.event_removeListener(LoadEvent.ITEM_COMPLETE, this.loadItemEventHandler, this);
            this._loading.removeFromParent();
            // }
        }


        /**
         * 根据动作和速度，改变当前的帧频
         */
        private changeFPS(): void {
            let avatarAni: Animation = this._avatarAni;
            let animationSpeed: number = this._animationSpeed;
            switch (this._actionInfo.action) {
                case Constants.A_APPEAR:
                    avatarAni.fps = Constants.FPS_APPEAR * animationSpeed;
                    break;
                case Constants.A_STAND:
                    avatarAni.fps = Constants.FPS_STAND * animationSpeed;
                    break;
                case Constants.A_RUN:
                    avatarAni.fps = Constants.FPS_RUN * animationSpeed;
                    break;
                case Constants.A_ATTACK:
                    avatarAni.fps = Constants.FPS_ATTACK * animationSpeed;
                    break;
                case Constants.A_CONJURE:
                    avatarAni.fps = Constants.FPS_CONJURE * animationSpeed;
                    break;
                case Constants.A_HITTED:
                    avatarAni.fps = Constants.FPS_HITTED * animationSpeed;
                    break;
                case Constants.A_DEAD:
                    avatarAni.fps = Constants.FPS_DEAD * animationSpeed;
                    break;
                case Constants.A_LEISURE:
                    avatarAni.fps = Constants.FPS_LEISURE * animationSpeed;
                    break;
            }
            this.playAdjunctAnimation();
        }


        public addAdjunct(type: string = null, pic: string = null): void {
            if (type == null || pic == null) return;

            let ani: Animation = new Animation();
            this._shapeC.getChildByName(type).addChild(ani);
            this._adjuncts.push({type: type, pic: pic, ani: ani});

            this.playAdjunctAnimation();
        }

        public removeAdjunct(type: string = null, pic: string = null): void {
            for (let i: number = 0; i < this._adjuncts.length; i++) {
                let info: any = this._adjuncts[i];
                if (type == null || type == info.type) {
                    if (pic == null || pic == info.pic) {
                        info.ani.removeFromParent();
                        this._adjuncts.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        /**
         * 播放附属物的动画
         */
        private playAdjunctAnimation(): void {
            for (let i: number = 0; i < this._adjuncts.length; i++) {
                let info: any = this._adjuncts[i];
                let ani: Animation = info.ani;
                let avatarAni: Animation = this._avatarAni;

                ani.sourceName = "adjunct." + info.type + "." + info.pic + "." + this._actionInfo.action + this._assetDirection;
                ani.fps = avatarAni.fps;
                ani.play(avatarAni.currentFrame, avatarAni.repeatCount, avatarAni.stopFrame);

                //武器需要根据方向调换透视深度
                if (info.type == Constants.ADJUNCT_TYPE_WEAPON) {
                    this._shapeC.addChild(this._shapeC.getChildByName(info.type), Constants.WEAPON_DEPTH[this._assetDirection]);
                }
            }
        }


        public addUI(ui: AvatarUI, name: string = "basic", index: number = -1): void {
            //已存在该名称的UI，先移除
            let oldUI: AvatarUI = <AvatarUI>this.getChildByName(name);
            if (oldUI != null) {
                if (oldUI != ui) oldUI.destroy();
            }

            ui.name = name;
            ui.avatar = this;
            // TODO AvatarUI 添加深度效果还未测试
            if (index < 0) this.addChild(ui);
            else this.addChild(ui, index);
        }


        public removeUI(name: string = "basic"): AvatarUI {
            let ui: AvatarUI = <AvatarUI>this.getChildByName(name);
            if (ui != null) ui.destroy();
            return ui;
        }


        public getUI(name: string = "basic"): AvatarUI {
            return <AvatarUI>this.getChildByName(name);
        }


        public set map(value: Map) {
            if (this._map != null) this._map.removeAvatar(this);
            this._map = value;
            this._map.addAvatar(this);
        }

        public get map(): Map {
            return this._map;
        }


        public set key(value: string) {
            if (value == null) {
                Logger.addLog("[RPG] 角色的 key 不能为 null", Logger.LOG_TYPE_WARN);
                return;
            }

            this._key = value;
            this.name = "avatar" + this._key;
        }

        public get key(): string {
            return this._key;
        }


        public set data(value: any) {
            this._data = value;
        }

        public get data(): any {
            return this._data;
        }


        public set pic(value: string) {
            if (value == this._pic) return;
            this._pic = value;

            let url1: string = lolo.config.getUIConfig(Constants.CN_ANI_AVATAR, value, 1);
            let url2: string = lolo.config.getUIConfig(Constants.CN_ANI_AVATAR, value, 2);

            //还没加载好所有的动画资源
            if (!lolo.loader.hasLoaded(url1) && !lolo.loader.hasLoaded(url2)) {
                let priority: number = (this._priority != 0) ? this._priority : Constants.PRIORITY_AVATAR;
                //加载角色外形，第1部分，基础资源，站立行走等
                let lii: LoadItemInfo = new LoadItemInfo();
                lii.isSecretly = true;
                lii.priority = priority;
                lii.type = lolo.Constants.RES_TYPE_IMG;
                lii.url = url1;
                lolo.loader.add(lii);

                //第2部分，战斗相关动画等
                lii = new LoadItemInfo();
                lii.isSecretly = true;
                lii.priority = priority;
                lii.type = lolo.Constants.RES_TYPE_IMG;
                lii.url = url2;
                lolo.loader.add(lii);

                lolo.loader.start();
            }
            //正在执行动作
            if (this._actionInfo != null) {
                this.playAction(this._actionInfo.action, this._actionInfo.replay, this._avatarAni.currentFrame, this._actionInfo.endIdle);
            }
        }

        public get pic(): string {
            return this._pic;
        }


        public set direction(value: number) {
            this._direction = value;
        }

        public get direction(): number {
            return this._direction;
        }


        public set is8Direction(value: boolean) {
            this._is8Direction = value;
        }

        public get is8Direction(): boolean {
            return this._is8Direction;
        }


        public set tile(value: Point) {
            this.changeTile(value);
            this._moveing = false;

            //map=null 表示还在createAvatar阶段
            if (this._map != null) {
                let p: Point = getTileCenter(this._tile, this._map.info);
                this.x = p.x;
                this.y = p.y;
                CachePool.recycle(p);

                this.dispatchAvatarEvent(AvatarEvent.TILE_CHANGED);//排序依赖该事件，所以必须抛出
            }
        }

        public get tile(): Point {
            return this._tile;
        }

        /**
         * 更新tile
         */
        private changeTile(newTile: Point): void {
            if (this._map == null) {
                this._tile = newTile;
                return;
            }

            //从之前的列表中移除
            let avatars: Avatar[] = this._map.getAvatarListFromTile(this._tile);
            let i: number = avatars.indexOf(this);
            if (i != -1) avatars.splice(i, 1);

            //更新tile
            this._tile = newTile;

            //添加到现在的列表中
            this._map.getAvatarListFromTile(this._tile).push(this);
        }


        public set isDead(value: boolean) {
            this._isDead = value;
        }

        public get isDead(): boolean {
            return this._isDead;
        }


        public set moveAction(value: string) {
            this._moveAction = value;
        }

        public get moveAction(): string {
            return this._moveAction;
        }


        public set moveSpeed(value: number) {
            if (value == this._moveSpeed) return;
            this._moveSpeed = value;

            let moveAddPixel: Point = this._moveAddPixel;
            if (moveAddPixel.x != 0) {
                moveAddPixel.x = moveAddPixel.x < 0 ? -Constants.AVATAR_MOVE_ADD_X : Constants.AVATAR_MOVE_ADD_X;
                moveAddPixel.x *= value;
            }
            if (moveAddPixel.y != 0) {
                moveAddPixel.y = moveAddPixel.y < 0 ? -Constants.AVATAR_MOVE_ADD_Y : Constants.AVATAR_MOVE_ADD_Y;
                moveAddPixel.y *= value;
            }
        }

        public get moveSpeed(): number {
            return this._moveSpeed;
        }


        public set animationSpeed(value: number) {
            this._animationSpeed = value;
            this.changeFPS();
        }

        public get animationSpeed(): number {
            return this._animationSpeed;
        }


        public set speed(value: number) {
            this.moveSpeed = value;
            this.animationSpeed = value;
        }


        public get road(): any[] {
            return this._road;
        }


        public get moveing(): boolean {
            return this._moveing;
        }


        public set priority(value: number) {
            this._priority = value;
        }

        public get priority(): number {
            return this._priority;
        }


        public set loadingClass(value: any) {
            this._loadingClass = value;
            if (this._loading != null) {
                let progress: number = this._loading.progress;
                this._loading.destroy();

                this._loading = new value();
                this._loading.progress = progress;
            }
        }


        public set dispatchMoveing(value: boolean) {
            this._dispatchMoveing = value;
        }

        public get dispatchMoveing(): boolean {
            return this._dispatchMoveing;
        }


        public get action(): string {
            return this._actionInfo.action;
        }

        public get avatarAni(): Animation {
            return this._avatarAni;
        }

        public get destroyed(): boolean {
            return this._moveTimer == null;
        }


        /**
         * 抛出角色相关事件
         */
        public dispatchAvatarEvent(type: string, bubbles: boolean = false): void {
            let event: AvatarEvent = Event.create(AvatarEvent, type, bubbles);
            this.event_dispatch(event);
        }


        public destroy(): void {
            // lolo.loader.removeEventListener(LoadEvent.PROGRESS, this.loadItemEventHandler, this);
            lolo.loader.event_removeListener(LoadEvent.ITEM_COMPLETE, this.loadItemEventHandler, this);

            this._moveTimer.stop();
            this._moveTimer = null;

            if (this._loading != null) {
                this._loading.destroy();
                this._loading = null;
            }

            this._avatarAni.destroy();
            this._avatarAni = null;

            while (this._adjuncts.length > 0) this._adjuncts.shift().ani.destroy();

            super.destroy();
        }

        //
    }
}