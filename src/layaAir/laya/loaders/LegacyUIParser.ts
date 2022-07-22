import { Component } from "../components/Component"
import { FrameAnimation } from "../display/FrameAnimation"
import { Node } from "../display/Node"
import { ILaya } from "../../ILaya";
import { Graphics } from "../display/Graphics";
import { Sprite } from "../display/Sprite";
import { Matrix } from "../maths/Matrix";
import { Loader } from "../net/Loader";
import { ClassUtils } from "../utils/ClassUtils";
import { HitArea } from "../utils/HitArea";
import { Pool } from "../utils/Pool";
import { WeakObject } from "../utils/WeakObject";
import { Handler } from "laya/utils/Handler";

/**
 * 模板，预制件
 */
export class Prefab {
    /**@private */
    json: any;

    /**
     * 通过预制创建实例
     */
    create(): any {
        if (this.json) return LegacyUIParser.createByData(null, this.json);
        return null;
    }
}

/**
 * @private 场景辅助类
 */
export class LegacyUIParser {
    /**@private */
    private static _funMap: WeakObject;
    /**@private */
    private static _parseWatchData: RegExp = /\${(.*?)}/g;
    /**@private */
    private static _parseKeyWord: RegExp = /[a-zA-Z_][a-zA-Z0-9_]*(?:(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+)/g;
    /**@internal */
    static _sheet: any;

    static parse(data: any) {
        return LegacyUIParser.createByData(null, data);
    }

    /**
     * @private 根据字符串，返回函数表达式
     */
    //TODO:coverage
    static getBindFun(value: string): Function {
        let map = LegacyUIParser._funMap;
        if (!map)
            map = LegacyUIParser._funMap = new WeakObject();
        var fun: Function = LegacyUIParser._funMap.get(value);
        if (fun == null) {
            var temp: string = "\"" + value + "\"";
            temp = temp.replace(/^"\${|}"$/g, "").replace(/\${/g, "\"+").replace(/}/g, "+\"");
            var str: string = "(function(data){if(data==null)return;with(data){try{\nreturn " + temp + "\n}catch(e){}}})";
            fun = (window as any).Laya._runScript(str);
            LegacyUIParser._funMap.set(value, fun);
        }
        return fun;
    }

    /**
     * @private
     * 通过视图数据创建视图。
     * @param uiView 视图数据信息。
     */
    //TODO:coverage
    static createByData(root: Sprite, uiView: any): Sprite {
        var tInitTool: InitTool = InitTool.create();

        //递归创建节点
        root = LegacyUIParser.createComp(uiView, root, root, null, tInitTool);
        if ("_idMap" in root) {
            (<any>root)["_idMap"] = tInitTool._idMap;
        }

        //处理动画信息
        if (uiView.animations) {
            var anilist: any[] = [];
            var animations: any[] = uiView.animations;
            var i: number, len: number = animations.length;
            var tAni: FrameAnimation;
            var tAniO: any;
            for (i = 0; i < len; i++) {
                tAni = new FrameAnimation();
                tAniO = animations[i];
                tAni._setUp(tInitTool._idMap, tAniO);
                (<any>root)[tAniO.name] = tAni;
                tAni._setControlNode(root);
                switch (tAniO.action) {
                    case 1:
                        tAni.play(0, false);
                        break;
                    case 2:
                        tAni.play(0, true);
                        break;
                }
                anilist.push(tAni);
            }
            (<any>root)._aniList = anilist;
        }

        //设置页面穿透
        if ((<any>root)._$componentType === "Scene" && root._width > 0 && uiView.props.hitTestPrior == null && !root.mouseThrough)
            root.hitTestPrior = true;

        //设置组件
        tInitTool.finish();
        if (root.parent && root.parent.activeInHierarchy && root.active)
            root._processActive();
        return root;
    }

    static createInitTool(): InitTool {
        return InitTool.create();
    }

    /**
     * 根据UI数据实例化组件。
     * @param uiView UI数据。
     * @param comp 组件本体，如果为空，会新创建一个。
     * @param view 组件所在的视图实例，用来注册var全局变量，如果值为空则不注册。
     * @return 一个 Component 对象。
     */
    static createComp(uiView: any, comp: Sprite = null, view: Sprite = null, dataMap: any[] = null, initTool: InitTool = null): any {
        comp = comp || LegacyUIParser.getCompInstance(uiView);
        if (!comp) {
            if (uiView.props && uiView.props.runtime)
                console.warn("runtime not found:" + uiView.props.runtime);
            else
                console.warn("can not create:" + uiView.type);
            return null;
        }

        var child: any[] = uiView.child;
        if (child) {
            var isList: boolean = (<any>comp)["_$componentType"] == "List";
            for (var i: number = 0, n: number = child.length; i < n; i++) {
                var node: any = child[i];
                if ('itemRender' in comp && (node.props.name == "render" || node.props.renderType === "render")) {
                    //如果list的itemRender
                    (<any>comp)["itemRender"] = node;
                    // } else if (node.type == "Graphic") {
                    //     //绘制矢量图
                    //     ILaya.ClassUtils._addGraphicsToSprite(node, comp);
                    // } else if (ILaya.ClassUtils._isDrawType(node.type)) {
                    //     ILaya.ClassUtils._addGraphicToSprite(node, comp, true);
                } else {
                    if (isList) {
                        //收集数据绑定信息
                        var arr: any[] = [];
                        var tChild: any = LegacyUIParser.createComp(node, null, view, arr, initTool);
                        if (arr.length)
                            tChild["_$bindData"] = arr;
                    } else {
                        tChild = LegacyUIParser.createComp(node, null, view, dataMap, initTool);
                    }

                    //处理脚本
                    if (node.type == "Script") {
                        if (tChild instanceof Component) {
                            comp._addComponentInstance(tChild);
                        } else {
                            //兼容老版本
                            if ("owner" in tChild) {
                                tChild["owner"] = comp;
                            } else if ("target" in tChild) {
                                tChild["target"] = comp;
                            }
                        }
                    } else if (node.props.renderType == "mask" || node.props.name == "mask") {
                        comp.mask = tChild;
                    } else {
                        tChild instanceof Node && comp.addChild(tChild);
                    }
                }
            }
        }

        var props: any = uiView.props;
        for (var prop in props) {
            var value: any = props[prop];
            if (typeof (value) == 'string' && (value.indexOf("@node:") >= 0 || value.indexOf("@Prefab:") >= 0)) {
                if (initTool) {
                    initTool.addNodeRef(comp, prop, <string>value);
                }
            } else
                LegacyUIParser.setCompValue(comp, prop, value, view, dataMap);
        }

        if ((<any>comp)._afterInited) {
            //if (initTool) {
            //initTool.addInitItem(comp);
            //} else {
            (<any>comp)._afterInited();
            //}
        }

        if (uiView.compId && initTool && initTool._idMap) {
            initTool._idMap[uiView.compId] = comp;
        }

        return comp;
    }

    /**
     * @private
     * 设置组件的属性值。
     * @param comp 组件实例。
     * @param prop 属性名称。
     * @param value 属性值。
     * @param view 组件所在的视图实例，用来注册var全局变量，如果值为空则不注册。
     */
    private static setCompValue(comp: any, prop: string, value: any, view: any = null, dataMap: any[] = null): void {
        //处理数据绑定
        if (typeof (value) == 'string' && value.indexOf("${") > -1) {
            LegacyUIParser._sheet || (LegacyUIParser._sheet = ClassUtils.getClass("laya.data.Table"));
            if (!LegacyUIParser._sheet) {
                console.warn("Can not find class Sheet");
                return;
            }
            //list的item处理
            if (dataMap) {
                dataMap.push(comp, prop, value);
            } else if (view) {
                if (value.indexOf("].") == -1) {
                    //TODO
                    value = value.replace(".", "[0].");
                }
                var watcher: DataWatcher = new DataWatcher(comp, prop, value);

                //执行第一次数据赋值
                watcher.exe(view);
                var one: any[], temp: any[];
                var str: string = value.replace(/\[.*?\]\./g, ".");
                while ((one = LegacyUIParser._parseWatchData.exec(str)) != null) {
                    var key1: string = one[1];
                    while ((temp = LegacyUIParser._parseKeyWord.exec(key1)) != null) {
                        var key2: string = temp[0];
                        var arr: any[] = (view._watchMap[key2] || (view._watchMap[key2] = []));
                        arr.push(watcher);
                        //监听数据变化
                        LegacyUIParser._sheet.I.notifer.on(key2, view, view.changeData, [key2]);
                    }
                    //TODO
                    arr = (view._watchMap[key1] || (view._watchMap[key1] = []));
                    arr.push(watcher);
                    LegacyUIParser._sheet.I.notifer.on(key1, view, view.changeData, [key1]);
                }
                //trace(view._watchMap);
            }
            return;
        }

        if (prop === "var" && view) {
            view[value] = comp;
        } else {
            comp[prop] = (value === "true" ? true : (value === "false" ? false : value));
        }
    }

    /**
     * @private
     * 通过组建UI数据，获取组件实例。
     * @param json UI数据。
     * @return Component 对象。
     */
    static getCompInstance(json: any): any {
        if (json.type == "UIView") {
            if (json.props && json.props.pageData) {
                return LegacyUIParser.createByData(null, json.props.pageData);
            }
        }
        var runtime: string = (json.props && json.props.runtime) || json.type;
        var compClass = ClassUtils.getClass(runtime);
        if (!compClass) compClass = ClassUtils.getClass("Laya." + runtime);
        if (!compClass) throw "Can not find class " + runtime;
        if (json.type === "Script" && compClass.prototype._doAwake) {
            var comp: any = Pool.createByClass(compClass);
            comp._destroyed = false;
            return comp;
        }
        if (json.props && "renderType" in json.props && json.props["renderType"] == "instance") {
            if (!(compClass as any)["instance"]) (compClass as any)["instance"] = new compClass();
            return (compClass as any)["instance"];
        }

        return new compClass();
    }

    public static collectResourceLinks(uiView: any) {
        let test = new Set();
        let innerUrls: string[] = [];

        function addInnerUrl(url: string) {
            if (!test.has(url)) {
                test.add(url);
                innerUrls.push(url);
            }
        }

        function check(uiView: any) {
            var props: any = uiView.props;
            for (var prop in props) {
                var value: any = props[prop];
                if (typeof (value) == 'string' && value.indexOf("@Prefab:") >= 0) {
                    let url = value.replace("@Prefab:", "");
                    addInnerUrl(url);
                }
            }

            var child: any[] = uiView.child;
            if (child) {
                for (let i: number = 0, n: number = child.length; i < n; i++) {
                    let node: any = child[i];
                    check(node);
                }
            }
        }

        check(uiView);
        return innerUrls;
    }

    /**
     * 根据指定的 json 数据创建节点对象。
     * 比如:
     * {
     * 	"type":"Sprite",
     * 	"props":{
     * 		"x":100,
     * 		"y":50,
     * 		"name":"item1",
     * 		"scale":[2,2]
     * 	},
     * 	"customProps":{
     * 		"x":100,
     * 		"y":50,
     * 		"name":"item1",
     * 		"scale":[2,2]
     * 	},
     * 	"child":[
     * 		{
     * 			"type":"Text",
     * 			"props":{
     * 				"text":"this is a test",
     * 				"var":"label",
     * 				"rumtime":""
     * 			}
     * 		}
     * 	]
     * }
     * @param	json json字符串或者Object对象。
     * @param	node node节点，如果为空，则新创建一个。
     * @param	root 根节点，用来设置var定义。
     * @return	生成的节点。
     */
     static createByJson(json: any, node: any = null, root: Node = null, customHandler: Handler = null, instanceHandler: Handler = null): any {
        if (typeof (json) == 'string') json = JSON.parse((<string>json));
        var props: any = json.props;

        if (!node) {
            node = instanceHandler ? instanceHandler.runWith(json) : ClassUtils.getInstance(props.runtime || json.type);
            if (!node) return null;
        }

        var child: any[] = json.child;
        if (child) {
            for (var i: number = 0, n: number = child.length; i < n; i++) {
                var data: any = child[i];
                if ((data.props.name === "render" || data.props.renderType === "render") && node["_$set_itemRender"])
                    node.itemRender = data;
                else {
                    if (data.type == "Graphic") {
                        this._addGraphicsToSprite(data, node);
                    } else if (this._isDrawType(data.type)) {
                        this._addGraphicToSprite(data, node, true);
                    } else {
                        var tChild: any = this.createByJson(data, null, root, customHandler, instanceHandler)
                        if (data.type === "Script") {
                            if ("owner" in tChild) {
                                tChild["owner"] = node;
                            } else if ("target" in tChild) {
                                tChild["target"] = node;
                            }
                        } else if (data.props.renderType == "mask") {
                            node.mask = tChild;
                        } else {
                            node.addChild(tChild);
                        }
                    }
                }
            }
        }

        if (props) {
            for (var prop in props) {
                var value: any = props[prop];
                if (prop === "var" && root) {
                    (root as any)[value] = node;
                } else if (value instanceof Array && node[prop] instanceof Function) {
                    node[prop].apply(node, value);
                } else {
                    node[prop] = value;
                }
            }
        }

        if (customHandler && json.customProps) {
            customHandler.runWith([node, json]);
        }

        if (node["created"]) node.created();

        return node;
    }

    /**
     * @internal
     * 将graphic对象添加到Sprite上
     * @param graphicO graphic对象描述
     */
    static _addGraphicsToSprite(graphicO: any, sprite: Sprite): void {
        var graphics: any[] = graphicO.child;
        if (!graphics || graphics.length < 1) return;
        var g: Graphics = this._getGraphicsFromSprite(graphicO, sprite);
        var ox: number = 0;
        var oy: number = 0;
        if (graphicO.props) {
            ox = this._getObjVar(graphicO.props, "x", 0);
            oy = this._getObjVar(graphicO.props, "y", 0);
        }
        if (ox != 0 && oy != 0) {
            g.translate(ox, oy);
        }
        var i: number, len: number;
        len = graphics.length;
        for (i = 0; i < len; i++) {
            this._addGraphicToGraphics(graphics[i], g);
        }
        if (ox != 0 && oy != 0) {
            g.translate(-ox, -oy);
        }
    }

    /**
     * @internal
     * 将graphic绘图指令添加到sprite上
     * @param graphicO 绘图指令描述
     */
    static _addGraphicToSprite(graphicO: any, sprite: Sprite, isChild: boolean = false): void {
        var g: Graphics = isChild ? this._getGraphicsFromSprite(graphicO, sprite) : sprite.graphics;
        this._addGraphicToGraphics(graphicO, g);
    }

    /**
     * @private
     */
    private static _getGraphicsFromSprite(dataO: any, sprite: Sprite): Graphics {
        if (!dataO || !dataO.props) return sprite.graphics;
        var propsName: string = dataO.props.renderType;
        if (propsName === "hit" || propsName === "unHit") {
            var hitArea: HitArea = sprite._style.hitArea || (sprite.hitArea = new HitArea());
            if (!hitArea[propsName]) {
                hitArea[propsName] = new Graphics();
            }
            var g: Graphics = hitArea[propsName];
        }
        if (!g) g = sprite.graphics;
        return g;
    }

    /**
     * @private
     */
    private static _getTransformData(propsO: any): Matrix {
        var m: Matrix;

        if ("pivotX" in propsO || "pivotY" in propsO) {
            m = m || new Matrix();
            m.translate(-this._getObjVar(propsO, "pivotX", 0), -this._getObjVar(propsO, "pivotY", 0));
        }

        var sx: number = this._getObjVar(propsO, "scaleX", 1), sy: number = this._getObjVar(propsO, "scaleY", 1);
        var rotate: number = this._getObjVar(propsO, "rotation", 0);
        var skewX: number = this._getObjVar(propsO, "skewX", 0);
        var skewY: number = this._getObjVar(propsO, "skewY", 0);

        if (sx != 1 || sy != 1 || rotate != 0) {
            m = m || new Matrix();
            m.scale(sx, sy);
            m.rotate(rotate * 0.0174532922222222);
        }

        return m;
    }

    /**
     * @private
     */
    private static _addGraphicToGraphics(graphicO: any, graphic: Graphics): void {
        var propsO: any;
        propsO = graphicO.props;
        if (!propsO) return;
        var drawConfig: any;
        drawConfig = this.DrawTypeDic[graphicO.type];
        if (!drawConfig) return;

        var g: Graphics = graphic;
        var params: any = this._getParams(propsO, drawConfig[1], drawConfig[2], drawConfig[3]);
        var m: Matrix = this._tM;
        if (m || this._alpha != 1) {
            g.save();
            if (m) g.transform(m);
            if (this._alpha != 1) g.alpha(this._alpha);
        }
        (g as any)[drawConfig[0]].apply(g, params);
        if (m || this._alpha != 1) {
            g.restore();
        }
    }

    /**
     * @private
     */
    private static _adptLineData(params: any[]): any[] {
        params[2] = parseFloat(params[0]) + parseFloat(params[2]);
        params[3] = parseFloat(params[1]) + parseFloat(params[3]);
        return params;
    }

    /**
     * @private
     */
    private static _adptTextureData(params: any[]): any[] {
        params[0] = ILaya.Loader.getRes(params[0]);
        return params;
    }

    /**
     * @private
     */
    private static _adptLinesData(params: any[]): any[] {
        params[2] = this._getPointListByStr(params[2]);
        return params;
    }

    /**
     * @internal
     */
    static _isDrawType(type: string): boolean {
        if (type === "Image") return false;
        return type in this.DrawTypeDic;
    }

    /**
     * @private
     */
    private static _getParams(obj: any, params: any[], xPos: number = 0, adptFun: string = null): any[] {
        var rst: any = this._temParam;
        rst.length = params.length;
        var i: number, len: number;
        len = params.length;
        for (i = 0; i < len; i++) {
            rst[i] = this._getObjVar(obj, params[i][0], params[i][1]);
        }
        this._alpha = this._getObjVar(obj, "alpha", 1);
        var m: Matrix;
        m = this._getTransformData(obj);
        if (m) {
            if (!xPos) xPos = 0;

            m.translate(rst[xPos], rst[xPos + 1]);
            rst[xPos] = rst[xPos + 1] = 0;
            this._tM = m;
        } else {
            this._tM = null;
        }
        if (adptFun && (ClassUtils as any)[adptFun]) {
            rst = (ClassUtils as any)[adptFun](rst);
        }
        return rst;
    }
    /**@private */
    private static DrawTypeDic: any = { "Rect": ["drawRect", [["x", 0], ["y", 0], ["width", 0], ["height", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Circle": ["drawCircle", [["x", 0], ["y", 0], ["radius", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Pie": ["drawPie", [["x", 0], ["y", 0], ["radius", 0], ["startAngle", 0], ["endAngle", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Image": ["drawTexture", [["x", 0], ["y", 0], ["width", 0], ["height", 0]]], "Texture": ["drawTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0]], 1, "_adptTextureData"], "FillTexture": ["fillTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0], ["repeat", null]], 1, "_adptTextureData"], "FillText": ["fillText", [["text", ""], ["x", 0], ["y", 0], ["font", null], ["color", null], ["textAlign", null]], 1], "Line": ["drawLine", [["x", 0], ["y", 0], ["toX", 0], ["toY", 0], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLineData"], "Lines": ["drawLines", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Curves": ["drawCurves", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Poly": ["drawPoly", [["x", 0], ["y", 0], ["points", ""], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]], 0, "_adptLinesData"] };
    /**@private */
    private static _temParam: any[] = [];
    /**@private */
    private static _tM: Matrix;
    /**@private */
    private static _alpha: number;

    /**
     * @internal
     */
    static _getPointListByStr(str: string): any[] {
        var pointArr: any[] = str.split(",");
        var i: number, len: number;
        len = pointArr.length;
        for (i = 0; i < len; i++) {
            pointArr[i] = parseFloat(pointArr[i]);
        }
        return pointArr;
    }

    /**
     * @private
     */
    private static _getObjVar(obj: any, key: string, noValue: any): any {
        if (key in obj) {
            return obj[key];
        }
        return noValue;
    }
}

/**
 * @private 场景辅助类
 */
class DataWatcher {
    comp: any;
    prop: string;
    value: string;

    //TODO:coverage
    constructor(comp: any, prop: string, value: string) {
        this.comp = comp;
        this.prop = prop;
        this.value = value;
    }

    exe(view: any): void {
        var fun: Function = LegacyUIParser.getBindFun(this.value);
        this.comp[this.prop] = fun.call(this, view);
    }
}


/**
 * @private 场景辅助类
 */
class InitTool {
    /**@private */
    private _nodeRefList: any[];
    /**@private */
    private _initList: any[];
    private _loadList: any[];
    /**@internal */
    _idMap: { [key: string]: Sprite };

    //TODO:coverage
    reset(): void {
        this._nodeRefList = null;
        this._initList = null;
        this._idMap = null;
        this._loadList = null;
    }

    //TODO:coverage
    recover(): void {
        this.reset();
        Pool.recover("InitTool", this);
    }

    static create(): InitTool {
        var tool: InitTool = Pool.getItemByClass("InitTool", InitTool);
        tool._idMap = {};
        return tool;
    }

    //TODO:coverage
    addLoadRes(url: string, type: string = null): void {
        if (!this._loadList) this._loadList = [];
        if (ILaya.loader.getRes(url)) {
            return;
        }
        if (!type) {
            this._loadList.push(url);
        } else {
            this._loadList.push({ url: url, type: type });
        }
    }

    /**@private */
    //TODO:coverage
    addNodeRef(node: any, prop: string, referStr: string): void {
        if (!this._nodeRefList) this._nodeRefList = [];
        this._nodeRefList.push([node, prop, referStr]);
        if (referStr.indexOf("@Prefab:") >= 0) {
            this.addLoadRes(referStr.replace("@Prefab:", ""), Loader.JSON);
        }
    }

    /**@private */
    //TODO:coverage
    setNodeRef(): void {
        if (!this._nodeRefList) return;
        if (!this._idMap) {
            this._nodeRefList = null;
            return;
        }
        var i: number, len: number;
        len = this._nodeRefList.length;
        var tRefInfo: any[];
        for (i = 0; i < len; i++) {
            tRefInfo = this._nodeRefList[i];
            tRefInfo[0][tRefInfo[1]] = this.getReferData(tRefInfo[2]);
        }
        this._nodeRefList = null;
    }

    /**@private */
    //TODO:coverage
    getReferData(referStr: string): any {
        if (referStr.indexOf("@Prefab:") >= 0) {
            var prefab = new Prefab();
            prefab.json = Loader.getRes(referStr.replace("@Prefab:", ""));
            return prefab;
        } else if (referStr.indexOf("@arr:") >= 0) {
            referStr = referStr.replace("@arr:", "");
            var list: string[];
            list = referStr.split(",");
            var i: number, len: number;
            var tStr: string;
            len = list.length;
            var list2: Sprite[] = [];
            for (i = 0; i < len; i++) {
                tStr = list[i];
                if (tStr) {
                    list2.push(this._idMap[tStr.replace("@node:", "")]);
                } else {
                    list2.push(null);
                }
            }
            return list2;
        } else {
            return this._idMap[referStr.replace("@node:", "")];
        }
    }

    /**@private */
    //TODO:coverage
    addInitItem(item: any): void {
        if (!this._initList) this._initList = [];
        this._initList.push(item);
    }

    /**@private */
    //TODO:coverage
    doInits(): void {
        if (!this._initList) return;
        this._initList = null;
    }

    /**@private */
    //TODO:coverage
    finish(): void {
        this.setNodeRef();
        this.doInits();
        this.recover();
    }
}