namespace lolo.rpg {


    /**
     * RPG相关的常量
     * @author LOLO
     */
    export class Constants {

        /**地图数据在UIConfig中的名称*/
        public static CN_MAP_DATA: string = "mapData";
        /**地图缩略图在UIConfig中的名称*/
        public static CN_MAP_THUMBNAIL: string = "mapThumbnail";
        /**地图图块地址*/
        public static CN_MAP_CHUNK: string = "mapChunk";
        /**地图遮挡物在UIConfig中的名称*/
        public static CN_MAP_COVER: string = "mapCover";

        /**touch地图时，播放的动画在UIConfig中的名称*/
        public static CN_ANI_TOUCH_MAP: string = "mapTouchAni";

        /**角色动画在UIConfig中的名称*/
        public static CN_ANI_AVATAR: string = "avatarAnimation";
        /**坐骑动画在UIConfig中的名称*/
        public static CN_ANI_HORSE: string = "horseAnimation";
        /**附属物动画在UIConfig中的名称*/
        public static CN_ANI_ADJUNCT: string = "adjunctAnimation";


        /**附属物类型 - 服饰*/
        public static ADJUNCT_TYPE_DRESS: string = "dress";
        /**附属物类型 - 发型*/
        public static ADJUNCT_TYPE_HAIR: string = "hair";
        /**附属物类型 - 武器*/
        public static ADJUNCT_TYPE_WEAPON: string = "weapon";


        /**偏移和代价，偶数行(0,2,4...)[direction]=[offsetX, offsetY, cost]*/
        public static O_EVEN: any[] = [null, [0, -1, 10], [1, 0, 14], [0, 1, 10], [0, 2, 14], [-1, 1, 10], [-1, 0, 14], [-1, -1, 10], [0, -2, 14]];
        /**偏移和代价，奇数行*/
        public static O_ODD: any[] = [null, [1, -1, 10], [1, 0, 14], [1, 1, 10], [0, 2, 14], [0, 1, 10], [-1, 0, 14], [0, -1, 10], [0, -2, 14]];
        /**偏移和代价，大菱形地图*/
        public static O_RHO: any[] = [null, [1, 0, 10], [1, -1, 14], [0, -1, 10], [-1, -1, 14], [-1, 0, 10], [-1, 1, 14], [0, 1, 10], [1, 1, 14]];


        /**角色每次移动的X像素距离*/
        public static AVATAR_MOVE_ADD_X: number = 3.0;
        /**角色每次移动的Y像素距离*/
        public static AVATAR_MOVE_ADD_Y: number = 1.5;


        /**方向 - 上↑*/
        public static D_UP: number = 8;
        /**方向 - 下↓*/
        public static D_DOWN: number = 4;
        /**方向 - 左←*/
        public static D_LEFT: number = 6;
        /**方向 - 右→*/
        public static D_RIGHT: number = 2;
        /**方向 - 左上↖*/
        public static D_LEFT_UP: number = 7;
        /**方向 - 左下↙*/
        public static D_LEFT_DOWN: number = 5;
        /**方向 - 右上↗*/
        public static D_RIGHT_UP: number = 1;
        /**方向 - 右下↘*/
        public static D_RIGHT_DOWN: number = 3;


        /**武器在不同方向的层叠位置（透视角度） data[direction]=depth */
        public static WEAPON_DEPTH: any[] = [null, 3, 3, 3, 3, 0, 0, 0, 0];


        /**动作 - 出场*/
        public static A_APPEAR: string = "appear";
        /**动作 - 站立*/
        public static A_STAND: string = "stand";
        /**动作 - 跑动*/
        public static A_RUN: string = "run";
        /**动作 - 攻击*/
        public static A_ATTACK: string = "attack";
        /**动作 - 施法*/
        public static A_CONJURE: string = "conjure";
        /**动作 - 受击*/
        public static A_HITTED: string = "hitted";
        /**动作 - 死亡*/
        public static A_DEAD: string = "dead";
        /**动作 - 休闲*/
        public static A_LEISURE: string = "leisure";


        /**是否为8方向素材*/
        public static is8Direction: boolean = true;

        /**根据角色透视深度进行排序的间隔（毫秒）*/
        public static AVATAR_DEPTH_SORT_DELAY: number = 10;

        /**帧频 - 出场*/
        public static FPS_APPEAR: number = 9;
        /**帧频 - 站立*/
        public static FPS_STAND: number = 3;
        /**帧频 - 跑动*/
        public static FPS_RUN: number = 21;
        /**帧频 - 攻击*/
        public static FPS_ATTACK: number = 12;
        /**帧频 - 施法*/
        public static FPS_CONJURE: number = 12;
        /**帧频 - 受击*/
        public static FPS_HITTED: number = 0;
        /**帧频 - 死亡*/
        public static FPS_DEAD: number = 9;
        /**帧频 - 休闲*/
        public static FPS_LEISURE: number = 0;


        /**加载优先级 - 角色动画*/
        public static PRIORITY_AVATAR: number = 100;


        //
    }
}