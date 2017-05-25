#include "lolo_auto.hpp"
#include "scripting/js-bindings/manual/cocos2d_specifics.hpp"
#include "../lolo/Updater.h"

template<class T>
static bool dummy_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS_ReportError(cx, "Constructor for the requested class is not available, please refer to the API reference.");
    return false;
}

static bool empty_constructor(JSContext *cx, uint32_t argc, jsval *vp) {
    return false;
}

static bool js_is_native_obj(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    args.rval().setBoolean(true);
    return true;
}
JSClass  *jsb_lolo_Updater_class;
JSObject *jsb_lolo_Updater_prototype;

bool js_lolo_Updater_getState(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        int ret = (int)lolo::Updater::getState();
        jsval jsret = JSVAL_NULL;
        jsret = int32_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_getState : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_getSpeed(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        long ret = lolo::Updater::getSpeed();
        jsval jsret = JSVAL_NULL;
        jsret = long_to_jsval(cx, ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_getSpeed : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_enableAssetsDir(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        lolo::Updater::enableAssetsDir();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_enableAssetsDir : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_clearUpdateDirectory(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        lolo::Updater::clearUpdateDirectory();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_clearUpdateDirectory : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_getByteLoaded(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        double ret = lolo::Updater::getByteLoaded();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_getByteLoaded : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_start(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    if (argc == 3) {
        std::string arg0;
        std::string arg1;
        std::string arg2;
        ok &= jsval_to_std_string(cx, args.get(0), &arg0);
        ok &= jsval_to_std_string(cx, args.get(1), &arg1);
        ok &= jsval_to_std_string(cx, args.get(2), &arg2);
        JSB_PRECONDITION2(ok, cx, false, "js_lolo_Updater_start : Error processing arguments");
        lolo::Updater::start(arg0, arg1, arg2);
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_start : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_getByteTotal(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {

        double ret = lolo::Updater::getByteTotal();
        jsval jsret = JSVAL_NULL;
        jsret = DOUBLE_TO_JSVAL(ret);
        args.rval().set(jsret);
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_getByteTotal : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_resetApp(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    if (argc == 0) {
        lolo::Updater::resetApp();
        args.rval().setUndefined();
        return true;
    }
    JS_ReportError(cx, "js_lolo_Updater_resetApp : wrong number of arguments");
    return false;
}

bool js_lolo_Updater_constructor(JSContext *cx, uint32_t argc, jsval *vp)
{
    JS::CallArgs args = JS::CallArgsFromVp(argc, vp);
    bool ok = true;
    lolo::Updater* cobj = new (std::nothrow) lolo::Updater();

    js_type_class_t *typeClass = js_get_type_from_native<lolo::Updater>(cobj);

    // link the native object with the javascript object
    JS::RootedObject jsobj(cx, jsb_create_weak_jsobject(cx, cobj, typeClass, "lolo::Updater"));
    args.rval().set(OBJECT_TO_JSVAL(jsobj));
    if (JS_HasProperty(cx, jsobj, "_ctor", &ok) && ok)
        ScriptingCore::getInstance()->executeFunctionWithOwner(OBJECT_TO_JSVAL(jsobj), "_ctor", args);
    return true;
}


void js_lolo_Updater_finalize(JSFreeOp *fop, JSObject *obj) {
    CCLOGINFO("jsbindings: finalizing JS object %p (Updater)", obj);
    js_proxy_t* nproxy;
    js_proxy_t* jsproxy;
    JSContext *cx = ScriptingCore::getInstance()->getGlobalContext();
    JS::RootedObject jsobj(cx, obj);
    jsproxy = jsb_get_js_proxy(jsobj);
    if (jsproxy) {
        lolo::Updater *nobj = static_cast<lolo::Updater *>(jsproxy->ptr);
        nproxy = jsb_get_native_proxy(jsproxy->ptr);

        if (nobj) {
            jsb_remove_proxy(nproxy, jsproxy);
            JS::RootedValue flagValue(cx);
            JS_GetProperty(cx, jsobj, "__cppCreated", &flagValue);
            if (flagValue.isNullOrUndefined()){
                delete nobj;
            }
        }
        else
            jsb_remove_proxy(nullptr, jsproxy);
    }
}
void js_register_lolo_Updater(JSContext *cx, JS::HandleObject global) {
    jsb_lolo_Updater_class = (JSClass *)calloc(1, sizeof(JSClass));
    jsb_lolo_Updater_class->name = "Updater";
    jsb_lolo_Updater_class->addProperty = JS_PropertyStub;
    jsb_lolo_Updater_class->delProperty = JS_DeletePropertyStub;
    jsb_lolo_Updater_class->getProperty = JS_PropertyStub;
    jsb_lolo_Updater_class->setProperty = JS_StrictPropertyStub;
    jsb_lolo_Updater_class->enumerate = JS_EnumerateStub;
    jsb_lolo_Updater_class->resolve = JS_ResolveStub;
    jsb_lolo_Updater_class->convert = JS_ConvertStub;
    jsb_lolo_Updater_class->finalize = js_lolo_Updater_finalize;
    jsb_lolo_Updater_class->flags = JSCLASS_HAS_RESERVED_SLOTS(2);

    static JSPropertySpec properties[] = {
        JS_PS_END
    };

    static JSFunctionSpec funcs[] = {
        JS_FS_END
    };

    static JSFunctionSpec st_funcs[] = {
        JS_FN("getState", js_lolo_Updater_getState, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getSpeed", js_lolo_Updater_getSpeed, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("enableAssetsDir", js_lolo_Updater_enableAssetsDir, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("clearUpdateDirectory", js_lolo_Updater_clearUpdateDirectory, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getByteLoaded", js_lolo_Updater_getByteLoaded, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("start", js_lolo_Updater_start, 3, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("getByteTotal", js_lolo_Updater_getByteTotal, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FN("resetApp", js_lolo_Updater_resetApp, 0, JSPROP_PERMANENT | JSPROP_ENUMERATE),
        JS_FS_END
    };

    jsb_lolo_Updater_prototype = JS_InitClass(
        cx, global,
        JS::NullPtr(),
        jsb_lolo_Updater_class,
        js_lolo_Updater_constructor, 0, // constructor
        properties,
        funcs,
        NULL, // no static properties
        st_funcs);

    JS::RootedObject proto(cx, jsb_lolo_Updater_prototype);
    JS::RootedValue className(cx, std_string_to_jsval(cx, "Updater"));
    JS_SetProperty(cx, proto, "_className", className);
    JS_SetProperty(cx, proto, "__nativeObj", JS::TrueHandleValue);
    JS_SetProperty(cx, proto, "__is_ref", JS::FalseHandleValue);
    // add the proto and JSClass to the type->js info hash table
    jsb_register_class<lolo::Updater>(cx, jsb_lolo_Updater_class, proto, JS::NullPtr());
}

void register_all_lolo(JSContext* cx, JS::HandleObject obj) {
    // Get the ns
    JS::RootedObject ns(cx);
    get_or_create_js_obj(cx, obj, "lolo", &ns);

    js_register_lolo_Updater(cx, ns);
}

