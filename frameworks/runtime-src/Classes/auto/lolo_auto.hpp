#include "base/ccConfig.h"
#ifndef __lolo_h__
#define __lolo_h__

#include "jsapi.h"
#include "jsfriendapi.h"

extern JSClass  *jsb_lolo_Updater_class;
extern JSObject *jsb_lolo_Updater_prototype;

bool js_lolo_Updater_constructor(JSContext *cx, uint32_t argc, jsval *vp);
void js_lolo_Updater_finalize(JSContext *cx, JSObject *obj);
void js_register_lolo_Updater(JSContext *cx, JS::HandleObject global);
void register_all_lolo(JSContext* cx, JS::HandleObject obj);
bool js_lolo_Updater_getState(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_getSpeed(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_enableAssetsDir(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_clearUpdateDirectory(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_getByteLoaded(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_start(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_getByteTotal(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_resetApp(JSContext *cx, uint32_t argc, jsval *vp);
bool js_lolo_Updater_Updater(JSContext *cx, uint32_t argc, jsval *vp);

#endif // __lolo_h__
