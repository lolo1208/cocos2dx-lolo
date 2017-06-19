/// <reference path="../display/Bitmap.ts"/>


namespace lolo {


    /**
     * 可以切换状态的皮肤
     * @author LOLO
     */
    export class Skin extends Bitmap {

        /**状态 - 正常*/
        public static UP: string = "up";
        /**状态 - 鼠标移上来*/
        public static OVER: string = "over";
        /**状态 - 鼠标按下*/
        public static DOWN: string = "down";
        /**状态 - 禁用*/
        public static DISABLED: string = "disabled";
        /**状态 - 选中：正常*/
        public static SELECTED_UP: string = "selectedUp";
        /**状态 - 选中：鼠标移上来*/
        public static SELECTED_OVER: string = "selectedOver";
        /**状态 - 选中：鼠标按下*/
        public static SELECTED_DOWN: string = "selectedDown";
        /**状态 - 选中：禁用*/
        public static SELECTED_DISABLED: string = "selectedDisabled";

        /**所有状态列表*/
        public static STATES: string[] = [
            Skin.UP, Skin.OVER, Skin.DOWN, Skin.DISABLED,
            Skin.SELECTED_UP, Skin.SELECTED_OVER, Skin.SELECTED_DOWN, Skin.SELECTED_DISABLED
        ];


        /**皮肤的名称*/
        private _skinName: string;
        /**当前皮肤包含的状态列表*/
        private _stateList: Object;
        /**当前状态*/
        private _state: string;
        /**图片源名称的前缀*/
        private _prefix: string;


        public constructor(skinName: string = null) {
            super();
            this.skinName = skinName;
        }


        /**
         * 皮肤的名称
         */
        public set skinName(value: string) {
            if (value == this._skinName) return;
            this._skinName = value;

            //清空皮肤， _skinName=null 或 _skinName="" 的时候，啥也不显示
            if (this._skinName == null || this._skinName == "") {
                this._stateList = null;
                this.texture = Constants.EMPTY_TEXTURE;
                return;
            }

            this._stateList = lolo.config.getSkin(value);

            if (this._stateList == null)
                Logger.addLog("[LFW] Skin: " + value + "不存在！！", Logger.LOG_TYPE_INFO);
        }

        public get skinName(): string {
            return this._skinName;
        }


        /**
         * 图片源名称的前缀（根据该前缀解析相对应的皮肤状态）
         */
        public set prefix(value: string) {
            if (value == this._prefix) return;
            this._prefix = value;

            this.texture = Constants.EMPTY_TEXTURE;
            this._stateList = {};

            for (let i = 0; i < Skin.STATES.length; i++) {
                let state: string = Skin.STATES[i];
                let sn: string = this._prefix + "." + state;
                if (Bitmap.getConfigInfo(sn) != null) this.addState(state, sn);
            }
        }

        public get prefix(): string {
            return this._prefix;
        }


        /**
         * 添加或修改一个状态
         * @param state 状态的名称
         * @param sourceName 状态对应的图像源名称
         */
        public addState(state: string, sourceName: string): void {
            this._stateList[state] = sourceName;
        }


        /**
         * 移除一个状态
         * @param state
         */
        public removeState(state: string): void {
            delete this._stateList[state];
        }


        /**
         * 指定的状态是否存在
         * @param state
         * @return
         */
        public hasState(state: string): Boolean {
            return this._stateList[state] != null;
        }


        /**
         * 当前状态
         */
        public set state(value: string) {
            if (this._stateList == null) return;
            this._state = value;

            let state: string = value;
            if (!this.hasState(value)) {
                if (value == Skin.SELECTED_OVER || value == Skin.SELECTED_DOWN || value == Skin.SELECTED_DISABLED)
                    state = this.hasState(Skin.SELECTED_UP) ? Skin.SELECTED_UP : Skin.UP;
                else
                    state = Skin.UP;
            }

            this.sourceName = this._stateList[state];
        }

        public get state(): string {
            return this._state;
        }


        //
    }
}