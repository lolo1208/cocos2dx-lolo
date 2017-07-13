namespace app.rpgScene {


    import Module = lolo.Module;
    import Container = lolo.Container;
    import Map = lolo.rpg.Map;
    import MapEvent = lolo.rpg.MapEvent;
    import Avatar = lolo.rpg.Avatar;
    import Point = lolo.Point;
    import closestCanPassTile = lolo.rpg.closestCanPassTile;
    import TouchEvent = lolo.TouchEvent;


    /**
     * 测试场景
     * @author LOLO
     */
    export class RpgScene extends Container {

        public static TEST_MAP_ID: string = "101";


        private _map: Map;
        private _role: Avatar;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            this._map = new Map();
            this.addChild(this._map);
        }


        private touchMap(event: MapEvent): void {
            let role: Avatar = this._role;
            let tile: Point = closestCanPassTile(role.tile, this._map.touchTile, this._map.info);
            role.moveToTile(tile);
        }


        protected startup(): void {
            super.startup();

            this._map.init(RpgScene.TEST_MAP_ID);
            this._role = this._map.createAvatar("lolo", "female");
            this._map.trackingAvatar = this._role;
            this._map.event_addListener(MapEvent.TOUCH, this.touchMap, this);
        }


        protected reset(): void {
            super.reset();
        }

        //
    }
}