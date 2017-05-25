///////////////////////////////////////////////////////
//
//      项目更新相关
//
///////////////////////////////////////////////////////
lolo.Updater = lolo.Updater || {};
lolo.Updater.State = {
    NOT_STARTED: 0, /* 未开始 */
    COMPLETE: 1, /* 更新完成 */
    DOWNLOAD: 2, /* 正在下载zip包 */
    UNZIP: 3, /* 正在解压zip包 */
    FAIL_DOWNLOAD: 4, /* 更新失败 - 下载失败 */
    FAIL_MD5: 5, /* 更新失败 - MD5不一致 */
    FAIL_UNZIP: 6 /* 更新失败 - 解压缩出错 */
};

//


// 项目模块列表，新加模块时，记得修改该列表
lolo.Updater.moduleList = [
    "module/lolo.js",
    "module/app.module.core.js",
    "module/app.module.testScene.js"
];


//


/**
 * native 会在动更完成后调用该方法
 * 如果返回 true，将会执行 lolo.Launcher.loadModule()
 * 如果返回 false，请在逻辑完成后执行 lolo.Launcher.loadModule() 方法，或执行相关逻辑
 * @return {boolean}
 */
lolo.Updater.updateComplete = function () {
    return true;
};


//


// 项目当前版本号，会在打包的时候自动生成
lolo.version = "debug";

