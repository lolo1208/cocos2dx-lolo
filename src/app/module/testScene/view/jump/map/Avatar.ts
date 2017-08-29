namespace app.jump {


    import DisplayObjectContainer = lolo.DisplayObjectContainer;
    import Animation = lolo.Animation;
    import Bitmap = lolo.Bitmap;
    import CachePool = lolo.CachePool;
    import Label = lolo.Label;
    import AutoUtil = lolo.AutoUtil;


    /**
     * 跳跃游戏 - 角色
     * 2017/8/24
     * @author LOLO
     */
    export class Avatar extends DisplayObjectContainer {

        public static ACTION_JUMP: string = "jump";
        public static ACTION_DROP: string = "drop";
        public static ACTION_HIT: string = "hit";
        public static ACTION_MOVE1: string = "move1";
        public static ACTION_MOVE2: string = "move2";
        public static ACTION_MOVE3: string = "move3";
        public static ACTION_MOVE4: string = "move4";
        public static ACTION_MOVE8: string = "move8";


        public shadow: Bitmap;
        public ani: Animation;
        public nameText: Label;

        private _angle: number;


        public constructor() {
            super();
            AutoUtil.autoUI(this, "jumpScCfg.avatar");

            this.playAni(Avatar.ACTION_JUMP);
            this.ani.play();
        }

        public set angle(value: number) {
            this._angle = value;
        }


        public playAni(action: string): void {
            this.ani.sourceName = "test.jump.avatar." + action;
        }


        //
    }
}