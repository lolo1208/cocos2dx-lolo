///////////////////////////////////////////////////////
//
//      项目入口文件
//
///////////////////////////////////////////////////////
var lolo = lolo || {};


/**
 * 根据传入的url，解析出真实的url地址
 * @param url
 * @return {*}
 */
lolo.getResUrl = function (url) {

    // md5映射
    if (lolo.resList != null) {
        var index = url.lastIndexOf(".");
        url = url.substr(0, index) + "." + lolo.resList[url] + url.substr(index);
    }

    // 代码模块映射
    if (url.substr(0, 6) == "module") {
        url = url.replace("module", (lolo.isDebug && !lolo.isNative) ? "bin-debug" : "bin-release");
    }
    else {
        // 资源文件加上路径
        url = "res/" + lolo.locale + "/" + url;
    }

    return url;
};


///////////////////////////////////////////////////////
cc.game.onStart = function () {

    cc.view.enableRetina(cc.sys.os === cc.sys.OS_IOS);
    cc.view.adjustViewPort(true);
    cc.view.setDesignResolutionSize(960, 640, cc.ResolutionPolicy.FIXED_WIDTH);
    cc.view.resizeWithBrowserSize(true);


    ///////////////////////////////////////////////////
    lolo.isNative = cc.sys.isNative;
    lolo.isMobile = cc.sys.isMobile;
    lolo.isMobileWeb = lolo.isMobile && !lolo.isNative;
    lolo.isPCWeb = !lolo.isNative && !lolo.isMobile;
    lolo.isWindowsNative = lolo.isNative && cc.sys.os === cc.sys.OS_WINDOWS;
    lolo.isDebug = cc.game.config.debugMode !== 0;
    lolo.coreVersion = cc.game.config.coreVersion;


    // 检测版本信息。重新安装APP时，writablePath/assets 是旧资源，需要删除
    if (lolo.isNative) {
        var fu = jsb.fileUtils;
        var writablePath = fu.getWritablePath();
        var dir = writablePath + "assets/version/";
        var fullPath = dir + "init.js";

        // 文件存在，加载 lolo.initVersion
        if (fu.isFileExist(fullPath)) {
            cc.loader.loadJs(fullPath, function () {
                // 不是APP的版本号，旧资源都要删除
                if (lolo.initVersion != lolo.version) {
                    lolo.Updater.clearUpdateDirectory();
                    lolo.enterLauncher(dir, fullPath);
                }
                else {
                    // 载入 assets/Updater.jsc 使用补丁包的版本信息
                    fullPath = writablePath + "assets/Updater.jsc";
                    if (fu.isFileExist(fullPath)) {
                        cc.loader.loadJs(fullPath, lolo.enterLauncher);
                    }
                    else {
                        lolo.enterLauncher();
                    }
                }
            });
        }
        else {
            lolo.enterLauncher(dir, fullPath);
        }
    }
    else {
        lolo.enterLauncher();
    }
};


/**
 * 进入到启动场景
 */
lolo.enterLauncher = function (dir, fullPath) {

    // 第一次运行游戏时，将当前版本号记录在 writablePath/assets/version/init.js（lolo.initVerion）
    if (dir != null && fullPath != null) {
        var fu = jsb.fileUtils;
        fu.createDirectory(dir);
        fu.writeStringToFile("lolo.initVersion='" + lolo.version + "';", fullPath);
    }

    // 将 writablePath/assets 目录设置为优先搜索路径
    if (lolo.isNative) lolo.Updater.enableAssetsDir();

    cc.loader.loadJs("Launcher.js", function () {
        var launcherScene = new lolo.LauncherScene();
        cc.director.runScene.call(cc.director, launcherScene);
        lolo.Launcher.start(launcherScene);
    });
};


///////////////////////////////////////////////////////


cc.game.run();

