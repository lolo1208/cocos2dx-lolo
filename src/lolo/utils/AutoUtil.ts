namespace lolo {


    /**
     * 自动化工具
     * @author LOLO
     */
    export class AutoUtil {
        /**空数组*/
        public static EMPTY_CHILDREN: any[] = [];


        /**
         * 自动化生成用户界面
         * @param target 需要自动化生成用户界面的目标
         * @param chains Object(JSON)访问链。如果 config 传入 null，将根据访问链第一位的值去 lolo.loader 中获取Object(JSON)。否则根据 chains 在 config 中取子集
         * @param config
         * @return
         */
        public static autoUI(target: cc.Node, chains: string, config: any = null): void {
            if (chains == null && config == null) {
                throwError("[AutoUtil.autoUI] chains 和 config 不能都为 null");
            }

            if (chains != null) {
                let chainList: string[] = chains.split(".");
                if (config == null) config = lolo.loader.getResByConfigName(chainList.shift());
                AutoUtil.autoUI(target, null, ObjectUtil.getConfigChild(config, chainList));
                return;
            }

            // 容器的相关设定
            AutoUtil.initObject(target, config.properties);
            AutoUtil.initObject(target, config.props);
            AutoUtil.initObject(target, config.vars);

            let children: any[] = config.children;
            if (children == null) children = this.EMPTY_CHILDREN;
            for (let i = 0; i < children.length; i++) {
                let item: any = children[i];

                let obj: cc.Node;// 创建的显示对象实例
                let id: string = item.id;// 指定的obj的实例名称
                let type: string = item.type;// 类型
                let targetID: string = item.target;// 指定目标，在某些组件中有特殊意义
                let groupID: string = item.group;// 是ItemRenderer时，指定的所属的组
                let parentID: string = item.parent;// 指定的父级容器
                let itemName: string = item.name;// 在配置中，这条item的名称

                // 尝试直接从目标中拿该对象的引用
                if (id != null) obj = target[id];

                switch (itemName) {
                    case "container":
                        if (obj == null) {
                            // obj = (type == "comboBox") ? new ComboBox() : new Container();
                            obj = new Container();
                        }
                        (<Container>obj).initUI(null, item);// 继续初始化容器的UI
                        break;

                    case "bitmapSprite":
                    case "bitmap":
                        if (obj == null) obj = new Bitmap();
                        break;

                    case "animation":
                    case "ani":
                        if (obj == null) obj = new Animation();
                        break;


                    case "sprite":
                        if (obj == null) obj = new DisplayObjectContainer();
                        break;

                    case "imageLoader":
                    case "image":
                        if (obj == null) obj = new Image();
                        break;

                    case "artText":
                        if (obj == null) obj = new ArtText();
                        break;


                    case "label":
                        if (obj == null) obj = new Label();
                        break;

                    case "inputText":
                        if (obj == null) obj = new InputText();
                        break;

                    case "numberText":
                        if (obj == null) obj = new NumberText();
                        break;


                    case "baseButton":
                        if (obj == null) obj = new BaseButton();
                        break;

                    case "imageButton":
                        if (obj == null) obj = new ImageButton();
                        break;

                    case "button":
                        if (obj == null) obj = new Button();
                        break;

                    case "checkBox":
                        if (obj == null) obj = new CheckBox();
                        break;

                    case "radioButton":
                        if (obj == null) obj = new RadioButton();
                        break;


                    case "page":
                        if (obj == null) obj = new Page();
                        break;

                    case "touchScrollBar":
                        if (obj == null) obj = new TouchScrollBar();
                        if (targetID != null) {
                            (<TouchScrollBar>obj).content = target[targetID];
                            if (target[targetID] instanceof ScrollList) target[targetID].scrollBar = obj;
                        }
                        break;


                    case "itemGroup":
                        if (obj == null) obj = new ItemGroup();
                        break;

                    case "list":
                        if (obj == null) obj = new List();
                        break;

                    case "pageList":
                        if (obj == null) obj = new PageList();
                        if (targetID != null) (<PageList>obj).page = target[targetID];
                        break;

                    case "scrollList":
                        if (obj == null) obj = new ScrollList();
                        break;


                    case "modalBackground":
                    case "modalBG":
                        if (obj == null) obj = new ModalBackground(target);
                        break;

                    default :
                        obj = null;
                }

                if (obj != null) {
                    // 对象不是容器
                    if (itemName != "container") {
                        AutoUtil.initObject(obj, item.properties);
                        AutoUtil.initObject(obj, item.props);
                        AutoUtil.initObject(obj, item.vars);

                        if (item.style != null) {
                            obj["style"] = item.style;

                            // 按钮会重置宽高
                            if (obj instanceof BaseButton) {
                                let props: any = item.properties;
                                if (props != null) {
                                    if (props.width != null) obj.width = props.width;
                                    if (props.height != null) obj.height = props.height;
                                }
                            }
                        }

                        if (item.stageLayout != null) {
                            lolo.layout.addStageLayout(obj, item.stageLayout);
                        }
                    }

                    // 有指定实例名称，将引用赋值给target
                    if (id != null) target[id] = obj;

                    // 是ItemRenderer，并且有指定的组
                    if (obj instanceof ItemRenderer && groupID != null) {
                        obj.group = target[groupID];
                        if (obj.selected) obj.group.selectedItem = obj;// 默认选中
                    }

                    let parent: cc.Node;
                    // 有指定父级容器
                    if (parentID != null && parentID != "null") {
                        parent = target[parentID];
                        if (parent == null) throwError("指定的容器 parentID=" + parentID + " 为 null！（请注意界面生成顺序）");
                    }
                    // 不是模态背景
                    else if (!(obj instanceof ModalBackground)) {
                        parent = target;
                    }

                    if (itemName == "container") obj["_target_parent"] = parent;
                    else if (parent != null) parent.addChild(obj);

                    obj = null;
                }
            }

            // 舞台布局属性
            let sl: any = config.stageLayout;
            if (sl == null && target instanceof Window) sl = {};// 窗口默认需要使用stageLayout
            if (sl != null) lolo.layout.addStageLayout(target, sl);
        }


        /**
         * 初始化实例，先初始化属性对象，再初始化JSON字符串属性对象
         * @param target 目标实例
         * @param parent 目标实例如果是显示对象，可以指定容器
         * @param obj 初始化属性对象
         * @param jsonStr JSON字符串属性对象
         * @return 初始化完毕的实例对象（即参数target）
         */
        public static init(target: any, parent: cc.Node = null, obj: any = null, jsonStr: string = null): any {
            if (target == null) return null;
            if (obj != null) AutoUtil.initObject(target, obj);
            if (jsonStr != null) AutoUtil.initJsonString(target, jsonStr);
            if (parent != null && target instanceof cc.Node) parent.addChild(target);
            return target;
        }


        /**
         * 初始化属性对象
         * @param target 目标对象的引用
         * @param obj 属性对象
         */
        public static initObject(target: any, obj: any): void {
            if (obj == null) return;
            obj = ObjectUtil.clone(obj);//拷贝出一个副本，用于操作

            //优先处理的属性
            if (obj.skinName != null) {
                target.skinName = obj.skinName;
                delete obj.skin;
            }

            if (obj.style != null) {
                target.style = obj.style;
                delete obj.style;
            }
            if (obj.styleName != null) {
                target.styleName = obj.styleName;
                delete obj.styleName;
            }

            if (obj.sourceName != null) {
                target.sourceName = obj.sourceName;
                delete obj.sourceName;
            }

            if (obj.autoSize != null) {
                target.autoSize = obj.autoSize;
                delete obj.autoSize;
            }
            if (obj.autoTooltip != null) {
                target.autoTooltip = obj.autoTooltip;
                delete obj.autoTooltip;
            }

            if (obj.directory != null) {
                target.directory = obj.directory;
                delete obj.directory;
            }
            if (obj.extension != null) {
                target.extension = obj.extension;
                delete obj.extension;
            }


            for (let prop in obj) {
                target[prop] = obj[prop];
            }
        }

        /**
         * 初始化JSON字符串
         * @param target 目标对象的引用
         * @param jsonStr JSON字符串属性对象
         */
        public static initJsonString(target: any, jsonStr: string): void {
            if (jsonStr != null) AutoUtil.initObject(target, JSON.parse(jsonStr));
        }

        //
    }
}