namespace app.jump {


    import Container = lolo.Container;
    import Bitmap = lolo.Bitmap;
    import CachePool = lolo.CachePool;
    import MathUtil = lolo.MathUtil;


    /**
     * 跳跃游戏 - 地图
     * 2017/7/24
     * @author LOLO
     */
    export class Map extends Container {


        private _role: Avatar;


        public constructor() {
            super();
        }


        public initUI(chains: string, config: any = null): void {
            super.initUI(chains, config);

            for (let x = 0; x < 30; x++) {
                for (let y = 0; y < 20; y++) {
                    let type: number = MathUtil.random(50) ? Math.ceil(Math.random() * 6) : 0;
                    let color: Bitmap = CachePool.getBitmap("test.jump.colors." + type + "_" + Math.ceil(Math.random() * 4));
                    color.x = x * 50 + 1;
                    color.y = y * 50 + 1;
                    this.addChild(color);
                }
            }

            this._role = new Avatar();
            this.addChild(this._role);
            this._role.setPosition(500, 300);
        }


        //


        protected startup(): void {
            super.startup();
        }


        protected reset(): void {
            super.reset();
        }


        //
    }
}