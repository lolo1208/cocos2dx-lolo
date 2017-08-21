namespace lolo {


    /**
     * 基于帧频的定时器
     * 解决丢帧和加速的情况
     * @author LOLO
     */
    export class Timer {

        /**可移除标记的最大次数*/
        private static MAX_REMOVE_MARK: number = 5;
        /**定时器列表（以delay为key， _list[delay] = { list:已启动的定时器列表, removeMark:被标记了可以移除的次数 } ）*/
        private static _list: Object = {};
        /**不重复的key*/
        private static _onlyKey: number = 0;

        /**需要被添加到运行列表的定时器列表*/
        private static _startingList: Timer[] = [];
        /**需要从运行列表中移除的定时器列表*/
        private static _stoppingList: Timer[] = [];


        /**在列表中的key（ _list[delay].list[_key] = this ）*/
        private _key: number;
        /**定时器间隔*/
        private _delay: number = 0;

        /**定时器是否正在运行中*/
        public running: boolean = false;

        /**定时器当前已运行次数*/
        public currentCount: number = 0;
        /**定时器的总运行次数，默认值0，表示无限运行*/
        public repeatCount: number;

        /**定时器上次触发的时间*/
        public lastUpdateTime: number;
        /**每次达到间隔时的回调*/
        public timerHander: Handler;
        /**定时器达到总运行次数时的回调*/
        public timerCompleteHandler: Handler;


        /**
         * 帧刷新
         * @param event
         */
        private static enterFrameHandler(event: Event): void {

            let timer: Timer, i: number, delay: any, key: any, timerList: Object;
            let timerRunning: boolean, ignorable: boolean;
            let delayChangedList: number[];//在回调中，delay有改变的定时器列表

            //添加应该启动的定时器，以及移除该停止的定时器。
            //	上一帧将这些操作延迟到现在来处理的目的，是为了防止循环和回调时造成的问题
            while (Timer._startingList.length > 0) {
                timer = Timer._startingList.pop();
                if (Timer._list[timer.delay] == null) Timer._list[timer.delay] = {list: {}, removeMark: 0};
                Timer._list[timer.delay].markCount = 0;
                Timer._list[timer.delay].list[timer.key] = timer;
            }

            while (Timer._stoppingList.length > 0) {
                timer = Timer._stoppingList.pop();
                if (Timer._list[timer.delay] != null) delete Timer._list[timer.delay].list[timer.key];
            }

            //处理回调
            let time: number = TimeUtil.nowTime;
            let removedList: number[] = [];//需要被移除的定时器列表
            for (delay in Timer._list) {
                delayChangedList = [];
                timerList = Timer._list[delay].list;
                timerRunning = false;
                for (key in timerList) {
                    timer = timerList[key];
                    if (!timer.running) continue;//这个定时器已经被停止了（可能是被之前处理的定时器回调停止的）

                    //在FP失去焦点后，帧频会降低。使用加速工具，帧频会加快。计算次数可以解决丢帧以及加速问题
                    let count: number = Math.floor((time - timer.lastUpdateTime) / timer.delay);

                    //次数过多，忽略掉（可能是系统休眠后恢复）
                    if (count > 1000) {
                        ignorable = true;
                        count = 1;
                    }
                    else ignorable = false;

                    for (i = 0; i < count; i++) {
                        //定时器在回调中被停止了
                        if (!timer.running) break;

                        //定时器在回调中更改了delay
                        if (timer.delay != delay) {
                            delayChangedList.push(key);
                            break;
                        }

                        timer.currentCount++;
                        if (timer.timerHander != null) timer.timerHander.execute();

                        //定时器已到达允许运行的最大次数
                        if (timer.repeatCount != 0 && timer.currentCount >= timer.repeatCount) {
                            timer.stop();
                            if (timer.timerCompleteHandler != null) timer.timerCompleteHandler.execute();
                            break;
                        }
                    }

                    //根据回调次数，更新 上次触发的时间（在回调中没有更改delay）
                    if (count > 0 && timer.delay == delay) {
                        timer.lastUpdateTime = ignorable ? time : (timer.lastUpdateTime + timer.delay * count);
                    }

                    if (timer.running) timerRunning = true;
                }

                while (delayChangedList.length > 0) {
                    delete timerList[delayChangedList.pop()];
                }

                //当前 delay，已经没有定时器在运行状态了
                if (!timerRunning) {
                    if (Timer._list[delay].removeMark > Timer.MAX_REMOVE_MARK) {
                        removedList.push(delay);
                    }
                    else {
                        Timer._list[delay].removeMark++;
                    }
                }
                else {
                    Timer._list[delay].removeMark = 0;
                }
            }

            while (removedList.length > 0) {
                delay = removedList.pop();
                if (Timer._list[delay].removeMark > Timer.MAX_REMOVE_MARK) delete Timer._list[delay];
            }

            if (Timer._startingList.length == 0) {
                for (delay in Timer._list) return;
                lolo.stage.event_removeListener(Event.ENTER_FRAME, Timer.enterFrameHandler, Timer);
            }
        }


        /**
         * 从 添加 或 移除 列表中移除指定的定时器
         * @param list
         * @param timer
         */
        private static removeTimer(list: Timer[], timer: Timer): void {
            for (let i = 0; i < list.length; i++) {
                if (list[i] == timer) {
                    list.splice(i, 1);
                    return;
                }
            }
        }


        /**
         * 创建一个Timer实例
         * @param delay 定时器间隔
         * @param timerHander 每次达到间隔时的回调
         * @param repeatCount 定时器的总运行次数，默认值0，表示无限运行
         * @param timerCompleteHandler 定时器达到总运行次数时的回调
         * @return
         */
        public constructor(delay: number = 1000,
                           timerHander: Handler = null,
                           repeatCount: number = 0,
                           timerCompleteHandler: Handler = null) {
            this._key = ++Timer._onlyKey;
            this.delay = delay;

            this.repeatCount = repeatCount;
            this.timerHander = timerHander;
            this.timerCompleteHandler = timerCompleteHandler;
        }


        /**
         * 定时器间隔
         */
        public set delay(value: number) {
            value = Math.floor(value);
            if (value == 0) {
                this.stop();
                throwError("定时器的间隔不能为 0");
            }
            if (this._delay == value) return;

            let running: boolean = this.running;
            if (this._delay != 0) this.reset();//之前被设置或启动过，重置定时器

            //创建当前间隔的定时器
            this._delay = value;

            if (running) this.start();
        }

        public get delay(): number {
            return this._delay;
        }


        /**
         * 开始定时器
         */
        public start(): void {
            if (this.running) return;

            //没达到设置的运行最大次数
            if (this.repeatCount == 0 || this.currentCount < this.repeatCount) {
                this.running = true;
                this.lastUpdateTime = TimeUtil.nowTime;

                Timer.removeTimer(Timer._stoppingList, this);
                Timer.removeTimer(Timer._startingList, this);
                Timer._startingList.push(this);

                lolo.stage.event_addListener(Event.ENTER_FRAME, Timer.enterFrameHandler, Timer, 9);
            }
        }


        /**
         * 如果定时器正在运行，则停止定时器
         */
        public stop(): void {
            if (!this.running) return;
            this.running = false;

            Timer.removeTimer(Timer._startingList, this);
            Timer.removeTimer(Timer._stoppingList, this);
            Timer._stoppingList.push(this);
        }


        /**
         * 如果定时器正在运行，则停止定时器，并将currentCount设为0
         */
        public reset(): void {
            this.currentCount = 0;
            this.stop();
        }


        /**
         * 在列表中的key（_list[delay].list[key]=this）
         */
        public get key(): number {
            return this._key;
        }


        /**
         * 释放对象（只是停止定时器，还能继续使用）
         * 注意：在丢弃该对象时，并不强制您调用该方法，您只需停止定时器（调用stop()方法）即可
         */
        public destroy(): void {
            this.stop();
        }

        //
    }
}