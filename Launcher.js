///////////////////////////////////////////////////////
//
//      项目启动逻辑封装
//
///////////////////////////////////////////////////////
lolo.Launcher = {

    // 更新服务器列表
    urlList: [
        "http://127.0.0.1:8010/update"
        // "http://192.168.1.128:8010/update"
    ],

    url: "",
    index: 0,
    delay: 0,
    xhr: null,
    scene: null
};


/**
 * 入口函数
 */
lolo.Launcher.start = function (scene) {
    var launcher = lolo.Launcher;
    launcher.scene = scene;
    scene.showVersion.call(scene);

    if (lolo.isNative) {
        launcher.index = parseInt(launcher.urlList.length * Math.random());
        launcher.checkUpdate();
    }
    else
        launcher.loadModule();
};


//


/**
 * 加载所有代码模块
 */
lolo.Launcher.loadModule = function () {
    var launcher = lolo.Launcher;
    var moduleList = lolo.Updater.moduleList;
    for (var i = 0; i < moduleList.length; i++) {
        moduleList[i] = lolo.getResUrl(moduleList[i]);
    }
    cc.loader.loadJs(moduleList, launcher.enter);
};


/**
 * 进入游戏
 */
lolo.Launcher.enter = function () {

    // 初始化，要注意代码顺序
    lolo.cc_support();
    var stage = new app.core.AppUIManager();
    lolo.initialize(stage, "zh_CN");

    // 注册舞台尺寸改变时的回调
    cc.view.setResizeCallback(function () {
        stage.stage_resizeHandler.call(stage);
    });

    // 进入cc场景
    stage.onEnter = function () {
        cc.Scene.prototype.onEnter.call(stage);
        app.core.enter.call(app.core);// 进入游戏
    };
    cc.director.runScene(stage);
};


//


/**
 * 向服务器查询最新版本
 */
lolo.Launcher.checkUpdate = function () {
    var launcher = lolo.Launcher;

    launcher.url = launcher.urlList[launcher.index];
    launcher.index++;
    if (launcher.index == launcher.urlList.length) launcher.index = 0;

    var xhr = launcher.xhr = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = launcher.xhrReadyStateChangeHandler;
    xhr.onerror = launcher.xhrErrorHandler;
    xhr.ontimeout = launcher.xhrErrorHandler;
    xhr.onabort = launcher.xhrErrorHandler;

    xhr.timeout = 10000;
    xhr.open("POST", launcher.url);
    xhr.send("action=getVersion&version=" + lolo.version + "&coreVersion=" + lolo.coreVersion);// 将当前版本号传过去
};

lolo.Launcher.xhrErrorHandler = function () {
    var launcher = lolo.Launcher;
    setTimeout(launcher.checkUpdate, launcher.delay);
    if (launcher.delay < 3000) launcher.delay += 500;// 间隔一段时间再次请求
};

lolo.Launcher.xhrReadyStateChangeHandler = function () {
    var launcher = lolo.Launcher;
    var xhr = launcher.xhr;
    if (xhr.readyState == 4) {// 4 = "loaded"
        if (xhr.status > 199 && xhr.status < 300) {// 200 - 299
            var verInfo = JSON.parse(xhr.response);
            // 服务器返回的版本信息有问题（获取版本信息失败）
            if (verInfo.version == null || verInfo.coreVersion == null || verInfo.md5 == null) {
                launcher.xhrErrorHandler();
            }
            // 核心框架版本号有变化，需要下载整包
            else if (lolo.coreVersion != verInfo.coreVersion) {
                launcher.scene.coreVersionChanged.call(launcher.scene);
            }
            // 项目版本号有变化，动更
            else if (lolo.version != verInfo.version) {
                launcher.scene.versionChanged.call(launcher.scene);
                lolo.Updater.start(launcher.url, lolo.version, verInfo.md5);
            }
            // 版本号没变化，可以进入游戏了
            else {
                launcher.loadResList();
            }
        }
    }
};


//


/**
 * 重新加载 Updater.jsc
 * C++ 中已调用 ScriptingCore::cleanScript() 清除了 Updater.jsc 的缓存
 */
lolo.Launcher.reloadUpdater = function () {
    var path = jsb.fileUtils.getWritablePath() + "assets/Updater.jsc";
    cc.loader.loadJs(path, lolo.Launcher.loadResList);
};


/**
 * 加载资源映射列表
 */
lolo.Launcher.loadResList = function () {
    var launcher = lolo.Launcher;
    cc.loader.loadJs("version/" + lolo.version + ".jsc", launcher.loadResListComplete);
};

lolo.Launcher.loadResListComplete = function () {
    if (lolo.Updater.updateComplete())
        lolo.Launcher.loadModule();
};


//


///////////////////////////////////////////////////////
//
//      启动场景
//
///////////////////////////////////////////////////////
lolo.LauncherScene = cc.Scene.extend({
    _className: "lolo.LauncherScene",

    _versionText: null,
    _progressText: null,

    _updateing: false,// 是否正在动更中
    _lastState: 0,


    ctor: function () {
        this._super();

        var x = cc.winSize.width >> 1;
        var y = cc.winSize.height >> 1;

        this._versionText = new cc.LabelTTF();
        this._versionText.setAnchorPoint(0, 1);
        this._versionText.setPosition(10, 10);
        this.addChild(this._versionText);

        this._progressText = new cc.LabelTTF();
        this._progressText.setPosition(x, y);
        this.addChild(this._progressText);

        this.scheduleUpdate();
    },


    /**
     * 更新中...
     */
    update: function (dt) {
        if (!this._updateing) return;
        var updater = lolo.Updater;
        var launcher = lolo.Launcher;

        var state = updater.getState();
        var STATE = updater.State;
        if (state != STATE.DOWNLOAD && state == this._lastState) return;
        this._lastState = state;

        switch (state) {

            case STATE.DOWNLOAD:
                var loaded = Math.round(updater.getByteLoaded() / 1024 / 1024 * 100) / 100;
                var total = Math.round(updater.getByteTotal() / 1024 / 1024 * 100) / 100;
                var speed = Math.round(updater.getSpeed() / 1024 * 100) / 100;
                this._progressText.setString(loaded + "mb / " + total + "mb       " + speed + "kb/s");
                break;

            case STATE.COMPLETE:
                this._progressText.setString("动更完成！正在载入游戏...");
                launcher.reloadUpdater();
                break;

            case STATE.UNZIP:
                this._progressText.setString("正在解压补丁包...");
                break;

            case STATE.FAIL_DOWNLOAD:
                this._progressText.setString("下载失败！");
                this._updateing = false;
                launcher.xhrErrorHandler();
                break;

            case STATE.FAIL_MD5:
                this._progressText.setString("MD5不一致！");
                this._updateing = false;
                launcher.xhrErrorHandler();
                break;

            case STATE.FAIL_UNZIP:
                this._progressText.setString("解压补丁包失败！");
                this._updateing = false;
                launcher.xhrErrorHandler();
                break;
        }
    },


    /**
     * 显示当前版本号
     */
    showVersion: function () {
        this._versionText.setString("app version:" + lolo.version + "  /  core version:" + lolo.coreVersion);
        this._versionText.setPosition(0, cc.winSize.height);
        this._progressText.setString("正在获取更新信息...");
    },


    /**
     * 核心框架版本号有变化，需要下载整包
     */
    coreVersionChanged: function () {
        this._progressText.setString("需要重新下载APP");
    },


    /**
     * 项目版本号有变化，进入动更状态
     */
    versionChanged: function () {
        this._progressText.setString("开始更新...");
        this._updateing = true;
    },


    //


    onExit: function () {
        cc.Node.prototype.onExit.call(this);
        console.log("exit -> LauncherScene");
    }


    //
});



