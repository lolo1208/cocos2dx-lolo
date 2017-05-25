namespace lolo.rpg {


    /**
     * 角色相关事件
     * @author LOLO
     */
    export class AvatarEvent extends Event {

        /**角色所在的区块已经改变*/
        public static TILE_CHANGED: string = "avatar_tileChanged";
        /**角色移动中（像素坐标有改变）*/
        public static MOVEING: string = "avatar_moveing";
        /**角色移动结束*/
        public static MOVE_END: string = "avatar_moveEnd";


        /**角色开始执行某个动作*/
        public static ACTION_START: string = "avatar_actionStart";
        /**角色执行某个动作完成（不包含无限执行的动作，idle、run 等）*/
        public static ACTION_END: string = "avatar_actionEnd";


        /**触摸该角色（TouchBeign）*/
        public static TOUCH: string = "avatar_touch";


        public constructor(type: string, data?: any) {
            super(type, data);
        }

        //
    }
}