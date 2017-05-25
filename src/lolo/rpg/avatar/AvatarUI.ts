namespace lolo.rpg {


    /**
     * RPG角色身上的UI
     * @author LOLO
     */
    export class AvatarUI extends DisplayObjectContainer {

        /**对应的角色*/
        protected _avatar: Avatar;


        public constructor() {
            super();
        }


        /**
         * 该UI对应的角色
         */
        public set avatar(value: Avatar) {
            this.setAvatar(value);
        }

        protected setAvatar(value: Avatar): void {
            this._avatar = value;
        }

        public get avatar(): Avatar {
            return this._avatar;
        }


        /**
         * 清除，销毁，释放
         */
        public destroy(): void {
            super.destroy();
            this._avatar = null;
        }


        //
    }
}