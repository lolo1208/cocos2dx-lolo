namespace app.rpg {


    import Module = lolo.Module;
    import Container = lolo.Container;
    import Map = lolo.rpg.Map;
    import MapEvent = lolo.rpg.MapEvent;
    import Avatar = lolo.rpg.Avatar;
    import Point = lolo.Point;
    import closestCanPassTile = lolo.rpg.closestCanPassTile;
    import TouchEvent = lolo.TouchEvent;
    import Button = lolo.Button;
    import Image = lolo.Image;
    import Animation = lolo.Animation;
    import delayedCall = lolo.delayedCall;


    /**
     * 测试场景
     * @author LOLO
     */
    export class RpgScene extends Container {

        public static TEST_MAP_ID: string = "101";


        public backBtn: Button;

        private _map: Map;
        private _role: Avatar;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            this._map = new Map();
            this.addChild(this._map);
            this.addChild(this.backBtn);

            this.backBtn.event_addListener(TouchEvent.TOUCH_TAP, this.backBtn_touchTap, this);
        }


        private touchMap(event: MapEvent): void {
            let role: Avatar = this._role;
            let tile: Point = closestCanPassTile(role.tile, this._map.touchTile, this._map.info);
            role.moveToTile(tile);
        }


        private backBtn_touchTap(event: TouchEvent): void {
            this.hide();
        }


        protected startup(): void {
            super.startup();

            this._map.init(RpgScene.TEST_MAP_ID);
            this._role = this._map.createAvatar("lolo", "female");
            this._map.trackingAvatar = this._role;
            this._map.event_addListener(MapEvent.TOUCH, this.touchMap, this);


            let ani1: Animation = new Animation("avatar.female.attack.3");
            ani1.x = 800;
            ani1.y = 1000;
            ani1.play();
            this._map.addElementToAvatarLayer(ani1);

            delayedCall(2000, () => {
                this._map.removeElementFromAvatarLayer(ani1);
            }, this);
        }


        protected reset(): void {
            super.reset();
        }

        //
    }
}