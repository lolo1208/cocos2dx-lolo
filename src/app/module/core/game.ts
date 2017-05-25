namespace app.core {

    /**Loading界面*/
    let _loading: Loading;


    /**
     * 入口函数，定义加载流程
     * 由 main.js 调用
     */
    export function enter(): void {
        lolo.TimeUtil.nowTime = new Date().getTime();

        _loading = new Loading();
        lolo.stage.addChild(_loading);

        let lii: lolo.LoadItemInfo = new lolo.LoadItemInfo();
        lii.parseUrl("json/core/ResConfig.json");
        lii.configName = "resConfig";
        lii.type = lolo.Constants.RES_TYPE_JSON;
        lolo.loader.event_addListener(lolo.LoadEvent.ITEM_COMPLETE, this.loader_completeHandler, this);
        lolo.loader.add(lii);

        // 加载字体
        if (lolo.isNative) {
            lolo.loader.start();
        }
        else {
            cc.loader.load({
                type: "font",
                name: "FZZhunYuan-M02S",
                srcs: [lolo.getResUrl("font/FZZhunYuan-M02S.ttf")]
            }, function () {
                lolo.loader.start();
            });
        }
    }


    /**
     * 加载单个文件完成
     * @param event
     */
    export function loader_completeHandler(event: lolo.LoadEvent): void {
        switch (event.lii.configName) {

            case "resConfig":
                lolo.config.initResConfig(event.lii.url);
                lolo.loader.add(new lolo.LoadItemInfo("language"));
                break;

            case "language":
                lolo.language.initialize();
                _loading.start();

                lolo.loader.add(new lolo.LoadItemInfo("style"));
                lolo.loader.add(new lolo.LoadItemInfo("skin"));
                lolo.loader.add(new lolo.LoadItemInfo("uiConfig"));
                lolo.loader.add(new lolo.LoadItemInfo("animationConfig"));
                lolo.loader.add(new lolo.LoadItemInfo("bitmapConfig"));
                lolo.loader.add(new lolo.LoadItemInfo("mainUIConfig"));

                lolo.loader.start(null, lolo.Handler.once(this.allComplete_callback, this));
                break;

            case "skin":
                lolo.config.initSkinConfig(event.lii.url);
                break;

            case "style":
                lolo.config.initStyleConfig(event.lii.url);
                break;

            case "uiConfig":
                lolo.config.initUIConfig(event.lii.url);
                break;
        }
        lolo.loader.start();
    }


    /**
     * 加载所有文件完成
     */
    export function allComplete_callback(): void {
        lolo.loader.event_removeListener(lolo.LoadEvent.ITEM_COMPLETE, this.loader_completeHandler, this);
        _loading.dispose();
        _loading = null;
        initialize();
    }


    /**
     * 初始化，正式进入游戏
     */
    export function initialize(): void {

        lolo.TimeUtil.day = lolo.getLanguage("030101");
        lolo.TimeUtil.days = lolo.getLanguage("030102");
        lolo.TimeUtil.hour = lolo.getLanguage("030103");
        lolo.TimeUtil.minute = lolo.getLanguage("030104");
        lolo.TimeUtil.second = lolo.getLanguage("030105");

        lolo.TimeUtil.dFormat = lolo.getLanguage("030201");
        lolo.TimeUtil.hFormat = lolo.getLanguage("030202");
        lolo.TimeUtil.mFormat = lolo.getLanguage("030203");
        lolo.TimeUtil.sFormat = lolo.getLanguage("030204");

        lolo.Alert.OK = lolo.getLanguage("030301");
        lolo.Alert.CANCEL = lolo.getLanguage("030302");
        lolo.Alert.YES = lolo.getLanguage("030303");
        lolo.Alert.NO = lolo.getLanguage("030304");
        lolo.Alert.CLOSE = lolo.getLanguage("030305");
        lolo.Alert.BACK = lolo.getLanguage("030306");

        // lolo.rpg.Constants.FPS_APPEAR	= 9;
        // lolo.rpg.Constants.FPS_STAND	= 3;
        // lolo.rpg.Constants.FPS_RUN		= 21;
        // lolo.rpg.Constants.FPS_ATTACK	= 12;
        // lolo.rpg.Constants.FPS_CONJURE	= 12;
        // lolo.rpg.Constants.FPS_DEAD		= 9;
        // lolo.rpg.Avatar.defaultAvatarLoadingClass = lolo.rpg.AvatarLoading;

        // Console.getInstance().container = lolo.stage;
        // Stats.getInstance().container = lolo.stage;

        // lolo.sound = SoundManager.getInstance();
        // lolo.mouse = MouseManager.getInstance();
        // lolo.mouse.defaultStyle = GameConstants.MOUSE_STYLE_NORMAL;
        // lolo.mouse.contextMenu.customItems.push(new ContextMenuItem(lolo.version, false, false));

        lolo.Animation.initialize();
        lolo.Bitmap.initialize();
        lolo.Image.initialize();
        lolo.Particle.initialize();
        // ExternalUtil.initialize();

        // LogSampler.enabled = true;

        // lolo.service = app.net.WebSocketService.getInstance();

        lolo.Logger.event_addListener(lolo.LogEvent.SAMPLE_LOG, logHandler, null);
        lolo.Logger.event_addListener(lolo.LogEvent.ERROR_LOG, logHandler, null);
        lolo.Logger.event_addListener(lolo.LogEvent.ADDED_LOG, logHandler, null);
        // lolo.delayedCall(10, lolo.LogSampler.addSystemInfoSampleLog);

        lolo.ui.initialize();
    }


    /**
     * 有新的日志
     * @param event
     */
    export function logHandler(event: lolo.LogEvent): void {
        console.log(event.info.message);
    }

    //
}