namespace lolo {


    /**
     * 音频管理。
     * 在代码或注释中，music 是指背景音乐，effect 是指音效
     * 2017/8/16
     * @author LOLO
     */
    export class AudioManager {

        /**当前正在播放的背景音乐*/
        public currentMusic: Audio;

        private _musicEnabled: boolean = true;
        private _effectEnabled: boolean = true;


        /**
         * 预加载音频数据
         * @param pathOrList 音频路径 或 音频路径列表
         * @param handler 加载完成时的回调
         */
        public preload(pathOrList: string | string[], handler?: Handler): void {
            let list: string[] = ObjectUtil.isString(pathOrList)
                ? [<string>pathOrList]
                : <string[]>pathOrList;
            let len = list.length;
            for (let i = 0; i < len; i++)
                list[i] = lolo.getResUrl("audio/" + list[i] + ".mp3");

            if (isNative) {
                this.native_preloadCallback(true, -1, list, handler);
            }
            else {
                if (handler != null)
                    cc.loader.load(list, handler.execute.bind(handler));
                else
                    cc.loader.load(list);
            }
        }

        private native_preloadCallback(success: boolean, index: number, list: string[], handler: Handler): void {
            index++;
            if (index < list.length) {
                let cb = lolo.handler(this.native_preloadCallback, this, true, index, list, handler);
                jsb.AudioEngine.preload(list[index], cb.execute.bind(cb));
            }
            else {
                if (handler != null) handler.execute();
            }
        }


        //


        /**
         * 播放背景音乐
         * @param path 路径
         * @param repeatCount 重复次数。
         *                     * html5  : 值 = 1 表示播放一次，其他值表示无限循环播放。
         *                     * native : 值 < 1 表示无限循环播放。
         * @param restart 如果当前 path 对应的音频正在播放，是否需要重新开始播放
         */
        public playMusic(path: string, repeatCount: number = 0, restart: boolean = false): Audio {
            if (!this._musicEnabled) return;

            let audio = this.currentMusic;
            if (audio != null) {
                if (audio.path == path) {
                    if (restart) {
                        audio.stop(false);
                    }
                    else {
                        if (isNative) {
                            audio.currentRepeatCount = 0;
                            audio.repeatCount = repeatCount;
                            return audio;
                        }
                        // html5
                        else if (audio.repeatCount == repeatCount) return audio;
                    }
                }
                // 换背景音乐了
                else {
                    audio.stop();
                }
            }

            audio = this.currentMusic = new Audio(path, true, repeatCount);
            return audio;
        }

        /**
         * 停止背景音乐
         * @param fadeOut 是否淡出然后停止（html5 不支持）
         */
        public stopMusic(fadeOut: boolean = true): void {
            if (this.currentMusic != null) this.currentMusic.stop(fadeOut);
        }

        /**
         * 背景音乐音量
         */
        public set musicVolume(value: number) {
            if (value > 1) value = 1;
            else if (value < 0) value = 0;
            if (value == Audio._musicVolume) return;
            Audio._musicVolume = value;

            if (isNative) {
                if (this.currentMusic != null) this.currentMusic.volume = value;
            }
            else
                cc.audioEngine.setMusicVolume(value);
        }

        public get musicVolume(): number {
            return Audio._musicVolume;
        }

        /**
         * 是否启用播放背景音乐
         */
        public set musicEnabled(value: boolean) {
            if (value == this._musicEnabled) return;
            this._musicEnabled = value;

            if (!value) this.stopMusic(false);
        }

        public get mouseEnabled(): boolean {
            return this._musicEnabled;
        }


        //


        /**
         * 播放音效。
         * 注意：
         *  - html5 环境下，如果未预加载就直接播放音效，将会无法调用 stop() 停止播放。
         *  - 如果音效只播放一次，不用关心该差异
         *  - 可以调用 stopAllEffects() 停止所有音效（也就停止了该无限循环的音效）
         * @param path 路径，例如："effect/btnTap"，"bgMusic1"
         * @param repeatCount 重复次数。
         *                     * html5  : 值 = 1 表示播放一次，其他值表示无限循环播放。
         *                     * native : 值 < 1 表示无限循环播放。
         * @param restart 如果当前 path 对应的音频正在播放，是否需要重新开始播放
         */
        public playEffect(path: string, repeatCount: number = 1, restart: boolean = true): Audio {
            if (!this._effectEnabled) return;

            if (restart) this.stop(path);

            return new Audio(path, false, repeatCount);
        }

        /**
         * 停止所有音效
         * @param fadeOut 是否淡出然后停止
         */
        public stopAllEffects(fadeOut: boolean = false): void {
            if (!isNative) cc.audioEngine.stopAllEffects();

            let effectList = Audio._effectList;
            Audio._effectList = {};
            for (let path in effectList) {
                let effects: Audio[] = effectList[path];
                let len = effects.length;
                for (let i = 0; i < len; i++)
                    effects[i].stop(fadeOut);
            }
        }

        /**
         * 音效音量
         */
        public set effectVolume(value: number) {
            if (value > 1) value = 1;
            else if (value < 0) value = 0;
            if (value == Audio._effectVolume) return;
            Audio._effectVolume = value;

            if (isNative) {
                let effectList = Audio._effectList;
                for (let path in effectList) {
                    let effects: Audio[] = effectList[path];
                    let len = effects.length;
                    for (let i = 0; i < len; i++) {
                        let audio = effects[i];
                        audio.volume = audio._volume;
                    }
                }
            }
            else
                cc.audioEngine.setEffectsVolume(value);
        }

        public get effectVolume(): number {
            return Audio._effectVolume;
        }

        /**
         * 是否启用播放音效
         */
        public set effectEnabled(value: boolean) {
            if (value == this._effectEnabled) return;
            this._effectEnabled = value;

            if (!value) this.stopAllEffects();
        }

        public get effectEnabled(): boolean {
            return this._effectEnabled;
        }


        //


        /**
         * path 对应的音频是否正在播放中。
         * html5 环境下，path 对应的音频如果是 effect，返回的结果将会不精准
         * @param path
         */
        public isPlaying(path: string): boolean {
            if (this.currentMusic != null && this.currentMusic.path == path)
                return true;
            return Audio._effectList[path] != null;
        }


        /**
         * 停止播放 path 对应的所有音频
         * @param path 路径，例如："effect/btnTap"，"bgMusic1"
         * @param fadeOut 是否淡出然后停止
         */
        public stop(path: string, fadeOut: boolean = false): void {
            let effects: Audio[] = Audio._effectList[path];
            if (effects != null) {
                delete Audio._effectList[path];
                let len = effects.length;
                for (let i = 0; i < len; i++) effects[i].stop(fadeOut);
            }
        }


        /**
         * 清除 pathList 对应的音频缓存数据，并停止 pathList 对应的所有音频
         * @param pathList
         */
        public uncache(...pathList: string[]): void {
            let len = pathList.length;
            for (let i = 0; i < len; i++) {
                let path = pathList[i];

                if (this.currentMusic != null && this.currentMusic.path == path) {
                    this.currentMusic = null;
                    if (!isNative) {// html5 移除当前背景音乐对应的缓存
                        cc.audioEngine.stopMusic(true);
                        return;
                    }
                }

                let realPath = lolo.getResUrl("audio/" + path + ".mp3");
                isNative
                    ? jsb.AudioEngine.uncache(realPath)
                    : cc.audioEngine.unloadEffect(realPath);
            }
        }


        /**
         * 停止正在播放的 背景音乐 以及 所有音效
         * @param fadeOut 是否淡出然后停止
         */
        public stopAll(fadeOut: boolean = false): void {
            if (isNative && fadeOut) {
                this.stopMusic(true);
                this.stopAllEffects(true);
            }
            else {
                this.currentMusic = null;
                Audio._effectList = {};
                isNative ? jsb.AudioEngine.stopAll() : cc.audioEngine.end();
            }
        }


        /**
         * 暂停正在播放的 背景音乐 以及 所有音效
         */
        public pauseAll(): void {
            if (isNative) {
                jsb.AudioEngine.pauseAll();
            }
            else {
                cc.audioEngine.pauseMusic();
                cc.audioEngine.pauseAllEffects();
            }
        }


        /**
         * 恢复已暂停的 背景音乐 以及 所有音效
         */
        public resumeAll(): void {
            if (isNative) {
                jsb.AudioEngine.resumeAll();
            }
            else {
                cc.audioEngine.resumeMusic();
                cc.audioEngine.resumeAllEffects();
            }
        }


        /**
         * 清除所有的音频缓存数据，并停止所有音频。
         * 在 html5 环境中，只能清除【正在播放的】背景音乐和音效
         */
        public uncacheAll(): void {
            if (isNative) {
                jsb.AudioEngine.stopAll();
                jsb.AudioEngine.uncacheAll();
            }
            else {
                cc.audioEngine.stopMusic(true);
                let effectList = Audio._effectList;
                for (let path in effectList)
                    cc.audioEngine.unloadEffect(lolo.getResUrl("audio/" + path + ".mp3"));
                cc.audioEngine.end();
            }

            this.currentMusic = null;
            Audio._effectList = {};
        }


        //
    }


    //


    /**
     * 音频实例对象
     * 2017/8/16
     * @author LOLO
     */
    export class Audio {

        public static _musicVolume: number = 1;
        public static _effectVolume: number = 1;

        /**正在播放的音效列表。_effectList["path"] = Audio[] */
        public static _effectList: any = {};

        public _volume: number = 1;
        private _id: number;
        private _path: string;
        private _realPath: string;
        private _isMusic: boolean;
        /**已停止，或正在淡出中（native）*/
        private _stopped: boolean = false;

        private _nativePlayHandler: Handler;
        private _completeFnBind: Function;

        /**需要重复播放次数*/
        public repeatCount: number;
        /**当前已重复次数*/
        public currentRepeatCount: number = 0;
        /**音频播放完成（已达到指定播放次数）时的回调（native）*/
        public completeHandler: Handler;


        public constructor(path: string, isMusic: boolean, repeatCount: number) {
            this._path = path;
            this._isMusic = isMusic;
            this.repeatCount = repeatCount;

            if (!isMusic) {
                let effects: Audio[] = Audio._effectList[path];
                if (effects == null) effects = Audio._effectList[path] = [];
                effects.push(this);
            }

            this._realPath = lolo.getResUrl("audio/" + path + ".mp3");
            if (isNative) {
                this._completeFnBind = this.complete.bind(this);
                this.native_play();
            }
            else {
                isMusic
                    ? cc.audioEngine.playMusic(this._realPath, repeatCount != 1)
                    : this._id = cc.audioEngine.playEffect(this._realPath, repeatCount != 1);
            }
        }


        /**
         * native 播放音频
         */
        private native_play(): void {
            this._nativePlayHandler = null;
            if (this._stopped) return;

            this._id = jsb.AudioEngine.play2d(this._realPath);
            jsb.AudioEngine.setFinishCallback(this._id, this._completeFnBind);

            let volume = this._isMusic ? Audio._musicVolume : Audio._effectVolume;
            if (volume != 1) this.volume = this._volume;// 统一设置的默认音量不是1
        }


        /**
         * 播放完成，触发回调
         * html5 不支持
         */
        private complete(): void {
            if (this._stopped) return;

            this.currentRepeatCount++;

            // 无限循环，或还未达到指定重复次数
            if (this.repeatCount < 1 || this.currentRepeatCount < this.repeatCount) {
                // 如果直接调用，会立即收到播放完成的回调
                this._nativePlayHandler = delayedCall(0, this.native_play, this);
            }
            else {
                this._stopped = true;
                if (lolo.audio.currentMusic == this) {
                    lolo.audio.currentMusic = null;
                }
                else {
                    let effects: Audio[] = Audio._effectList[this._path];
                    if (effects != null) {
                        let index = effects.indexOf(this);
                        if (index != -1) effects.splice(index, 1);
                        if (effects.length == 0) delete Audio._effectList[this._path];
                    }
                }

                if (this.completeHandler != null) {
                    let handler = this.completeHandler;
                    this.completeHandler = null;
                    handler.execute();
                }
            }
        }


        /**
         * 停止播放音频
         * @param fadeOut 是否淡出然后停止（html5 不支持）
         */
        public stop(fadeOut: boolean = true): void {
            if (this._stopped) return;

            this._stopped = true;
            if (lolo.audio.currentMusic == this) {
                lolo.audio.currentMusic = null;
            }
            else {
                let effects: Audio[] = Audio._effectList[this._path];
                if (effects != null) {
                    let index = effects.indexOf(this);
                    if (index != -1) effects.splice(index, 1);
                    if (effects.length == 0) delete Audio._effectList[this._path];
                }
            }

            if (isNative) {
                if (this._nativePlayHandler != null) {
                    this._nativePlayHandler.recycle();
                    this._nativePlayHandler = null;
                }
                if (fadeOut)
                    this.doFadeOut(1, this._volume);
                else
                    this.doStop();
            }
            else
                this.doStop();
        }

        private doStop(): void {
            if (isNative) {
                jsb.AudioEngine.stop(this._id);
            }
            else {
                if (this._isMusic)
                    cc.audioEngine.stopMusic();
                else
                    cc.audioEngine.stopEffect(this._id);
            }
        }

        private doFadeOut(curVol: number, startVol: number): void {
            // if (jsb.AudioEngine.getState(this._id) != jsb.AudioEngine.AudioState.PLAYING) return;
            curVol -= 0.1;
            if (curVol <= 0) {
                this.doStop();
            }
            else {
                jsb.AudioEngine.setVolume(this._id,
                    curVol * startVol * (this._isMusic ? Audio._musicVolume : Audio._effectVolume)
                );
                delayedCall(300, this.doFadeOut, this, curVol, startVol);
            }
        }


        /**
         * 暂停播放音频。之后可调用 resume() 恢复播放
         */
        public pause(): void {
            if (this._stopped) return;

            if (isNative) {
                jsb.AudioEngine.pause(this._id);
            }
            else {
                this._isMusic
                    ? cc.audioEngine.pauseMusic()
                    : cc.audioEngine.pauseEffect(this._id);
            }
        }


        /**
         * 恢复，继续播放音频
         */
        public resume(): void {
            if (this._stopped) return;

            if (isNative) {
                jsb.AudioEngine.resume(this._id);
            }
            else {
                this._isMusic
                    ? cc.audioEngine.resumeMusic()
                    : cc.audioEngine.resumeEffect(this._id);
            }
        }


        /**
         * 音量：0~1
         * html5 不支持单独设置音量
         */
        public set volume(value: number) {
            if (this._stopped) return;

            if (isNative) {
                if (value > 1) value = 1;
                else if (value < 0) value = 0;
                this._volume = value;
                jsb.AudioEngine.setVolume(this._id, value * (this._isMusic ? Audio._musicVolume : Audio._effectVolume));
            }
        }

        public get volume(): number {
            return this._volume;
        }


        /**
         * 当前播放位置。单位：秒
         * html5 不支持
         */
        public set position(value: number) {
            if (this._stopped) return;

            if (isNative) {
                jsb.AudioEngine.setCurrentTime(this._id, value);
            }
        }

        public get position(): number {
            return isNative ? jsb.AudioEngine.getCurrentTime(this._id) : -1;
        }


        /**
         * 音频对应的ID
         */
        public get id(): number {
            return this._id;
        }

        /**
         * 音频对应的路径（不包含后缀名）
         * 例如："effect/btnTap"，"bgMusic1"
         */
        public get path(): string {
            return this._path;
        }

        /**
         * 音频的真实路径。
         * 路径，例如："audio/effect/btnTap.mp3"，"audio/bgMusic1.mp3"
         */
        public get realPath(): string {
            return this._realPath;
        }

        /**
         * true:背景音乐，false:音效
         */
        public get isMusic(): boolean {
            return this._isMusic;
        }

        /**
         * 音频是否正在播放中
         * html5 该值始终为 false
         */
        public get playing(): boolean {
            if (this._stopped) return false;// 有可能正在 fadeOut
            if (isNative) return jsb.AudioEngine.getState(this._id) == jsb.AudioEngine.AudioState.PLAYING;
            return false;
        }


        //
    }


}