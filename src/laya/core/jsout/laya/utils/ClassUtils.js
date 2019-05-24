import { Matrix } from "../maths/Matrix";
import { Sprite } from "../display/Sprite";
import { Scene } from "../display/Scene";
import { Graphics } from "../display/Graphics";
import { ILaya } from "../../ILaya";
import { HitArea } from "../utils/HitArea";
/**
 * <code>ClassUtils</code> 是一个类工具类。
 */
export class ClassUtils {
    /**
     * 注册 Class 映射，方便在class反射时获取。
     * @param	className 映射的名字或者别名。
     * @param	classDef 类的全名或者类的引用，全名比如:"laya.display.Sprite"。
     */
    static regClass(className, classDef) {
        ClassUtils._classMap[className] = classDef;
    }
    /**
     * 根据类名短名字注册类，比如传入[Sprite]，功能同regClass("Sprite",Sprite);
     * @param	classes 类数组
     */
    static regShortClassName(classes) {
        for (var i = 0; i < classes.length; i++) {
            var classDef = classes[i];
            var className = classDef.name;
            ClassUtils._classMap[className] = classDef;
        }
    }
    /**
     * 返回注册的 Class 映射。
     * @param	className 映射的名字。
     */
    static getRegClass(className) {
        return ClassUtils._classMap[className];
    }
    /**
     * 根据名字返回类对象。
     * @param	className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
     * @return 类对象
     */
    static getClass(className) {
        var classObject = ClassUtils._classMap[className] || className;
        var glaya = ILaya.Laya;
        if (typeof (classObject) == 'string')
            return (glaya["__classmap"][classObject] || glaya[className]);
        return classObject;
    }
    /**
     * 根据名称创建 Class 实例。
     * @param	className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
     * @return	返回类的实例。
     */
    static getInstance(className) {
        var compClass = ClassUtils.getClass(className);
        if (compClass)
            return new compClass();
        else
            console.warn("[error] Undefined class:", className);
        return null;
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
    static createByJson(json, node = null, root = null, customHandler = null, instanceHandler = null) {
        if (typeof (json) == 'string')
            json = JSON.parse(json);
        var props = json.props;
        if (!node) {
            node = instanceHandler ? instanceHandler.runWith(json) : ClassUtils.getInstance(props.runtime || json.type);
            if (!node)
                return null;
        }
        var child = json.child;
        if (child) {
            for (var i = 0, n = child.length; i < n; i++) {
                var data = child[i];
                if ((data.props.name === "render" || data.props.renderType === "render") && node["_$set_itemRender"])
                    node.itemRender = data;
                else {
                    if (data.type == "Graphic") {
                        ClassUtils._addGraphicsToSprite(data, node);
                    }
                    else if (ClassUtils._isDrawType(data.type)) {
                        ClassUtils._addGraphicToSprite(data, node, true);
                    }
                    else {
                        var tChild = ClassUtils.createByJson(data, null, root, customHandler, instanceHandler);
                        if (data.type === "Script") {
                            if (tChild.hasOwnProperty("owner")) {
                                tChild["owner"] = node;
                            }
                            else if (tChild.hasOwnProperty("target")) {
                                tChild["target"] = node;
                            }
                        }
                        else if (data.props.renderType == "mask") {
                            node.mask = tChild;
                        }
                        else {
                            node.addChild(tChild);
                        }
                    }
                }
            }
        }
        if (props) {
            for (var prop in props) {
                var value = props[prop];
                if (prop === "var" && root) {
                    root[value] = node;
                }
                else if (value instanceof Array && node[prop] instanceof Function) {
                    node[prop].apply(node, value);
                }
                else {
                    node[prop] = value;
                }
            }
        }
        if (customHandler && json.customProps) {
            customHandler.runWith([node, json]);
        }
        if (node["created"])
            node.created();
        return node;
    }
    /**
     * @private
     * 将graphic对象添加到Sprite上
     * @param graphicO graphic对象描述
     */
    static _addGraphicsToSprite(graphicO, sprite) {
        var graphics = graphicO.child;
        if (!graphics || graphics.length < 1)
            return;
        var g = ClassUtils._getGraphicsFromSprite(graphicO, sprite);
        var ox = 0;
        var oy = 0;
        if (graphicO.props) {
            ox = ClassUtils._getObjVar(graphicO.props, "x", 0);
            oy = ClassUtils._getObjVar(graphicO.props, "y", 0);
        }
        if (ox != 0 && oy != 0) {
            g.translate(ox, oy);
        }
        var i, len;
        len = graphics.length;
        for (i = 0; i < len; i++) {
            ClassUtils._addGraphicToGraphics(graphics[i], g);
        }
        if (ox != 0 && oy != 0) {
            g.translate(-ox, -oy);
        }
    }
    /**
     * @private
     * 将graphic绘图指令添加到sprite上
     * @param graphicO 绘图指令描述
     */
    static _addGraphicToSprite(graphicO, sprite, isChild = false) {
        var g = isChild ? ClassUtils._getGraphicsFromSprite(graphicO, sprite) : sprite.graphics;
        ClassUtils._addGraphicToGraphics(graphicO, g);
    }
    /**
     * @private
     */
    static _getGraphicsFromSprite(dataO, sprite) {
        if (!dataO || !dataO.props)
            return sprite.graphics;
        var propsName = dataO.props.renderType;
        if (propsName === "hit" || propsName === "unHit") {
            var hitArea = sprite._style.hitArea || (sprite.hitArea = new HitArea());
            if (!hitArea[propsName]) {
                hitArea[propsName] = new Graphics();
            }
            var g = hitArea[propsName];
        }
        if (!g)
            g = sprite.graphics;
        return g;
    }
    /**
     * @private
     */
    static _getTransformData(propsO) {
        var m;
        if (propsO.hasOwnProperty("pivotX") || propsO.hasOwnProperty("pivotY")) {
            m = m || new Matrix();
            m.translate(-ClassUtils._getObjVar(propsO, "pivotX", 0), -ClassUtils._getObjVar(propsO, "pivotY", 0));
        }
        var sx = ClassUtils._getObjVar(propsO, "scaleX", 1), sy = ClassUtils._getObjVar(propsO, "scaleY", 1);
        var rotate = ClassUtils._getObjVar(propsO, "rotation", 0);
        var skewX = ClassUtils._getObjVar(propsO, "skewX", 0);
        var skewY = ClassUtils._getObjVar(propsO, "skewY", 0);
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
    static _addGraphicToGraphics(graphicO, graphic) {
        var propsO;
        propsO = graphicO.props;
        if (!propsO)
            return;
        var drawConfig;
        drawConfig = ClassUtils.DrawTypeDic[graphicO.type];
        if (!drawConfig)
            return;
        var g = graphic;
        var params = ClassUtils._getParams(propsO, drawConfig[1], drawConfig[2], drawConfig[3]);
        var m = ClassUtils._tM;
        if (m || ClassUtils._alpha != 1) {
            g.save();
            if (m)
                g.transform(m);
            if (ClassUtils._alpha != 1)
                g.alpha(ClassUtils._alpha);
        }
        g[drawConfig[0]].apply(g, params);
        if (m || ClassUtils._alpha != 1) {
            g.restore();
        }
    }
    /**
     * @private
     */
    static _adptLineData(params) {
        params[2] = parseFloat(params[0]) + parseFloat(params[2]);
        params[3] = parseFloat(params[1]) + parseFloat(params[3]);
        return params;
    }
    /**
     * @private
     */
    static _adptTextureData(params) {
        params[0] = ILaya.Loader.getRes(params[0]);
        return params;
    }
    /**
     * @private
     */
    static _adptLinesData(params) {
        params[2] = ClassUtils._getPointListByStr(params[2]);
        return params;
    }
    /**
     * @private
     */
    static _isDrawType(type) {
        if (type === "Image")
            return false;
        return ClassUtils.DrawTypeDic.hasOwnProperty(type);
    }
    /**
     * @private
     */
    static _getParams(obj, params, xPos = 0, adptFun = null) {
        var rst = ClassUtils._temParam;
        rst.length = params.length;
        var i, len;
        len = params.length;
        for (i = 0; i < len; i++) {
            rst[i] = ClassUtils._getObjVar(obj, params[i][0], params[i][1]);
        }
        ClassUtils._alpha = ClassUtils._getObjVar(obj, "alpha", 1);
        var m;
        m = ClassUtils._getTransformData(obj);
        if (m) {
            if (!xPos)
                xPos = 0;
            m.translate(rst[xPos], rst[xPos + 1]);
            rst[xPos] = rst[xPos + 1] = 0;
            ClassUtils._tM = m;
        }
        else {
            ClassUtils._tM = null;
        }
        if (adptFun && ClassUtils[adptFun]) {
            rst = ClassUtils[adptFun](rst);
        }
        return rst;
    }
    /**
     * @private
     */
    static _getPointListByStr(str) {
        var pointArr = str.split(",");
        var i, len;
        len = pointArr.length;
        for (i = 0; i < len; i++) {
            pointArr[i] = parseFloat(pointArr[i]);
        }
        return pointArr;
    }
    /**
     * @private
     */
    static _getObjVar(obj, key, noValue) {
        if (obj.hasOwnProperty(key)) {
            return obj[key];
        }
        return noValue;
    }
}
/**@private */
ClassUtils.DrawTypeDic = { "Rect": ["drawRect", [["x", 0], ["y", 0], ["width", 0], ["height", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Circle": ["drawCircle", [["x", 0], ["y", 0], ["radius", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Pie": ["drawPie", [["x", 0], ["y", 0], ["radius", 0], ["startAngle", 0], ["endAngle", 0], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]]], "Image": ["drawTexture", [["x", 0], ["y", 0], ["width", 0], ["height", 0]]], "Texture": ["drawTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0]], 1, "_adptTextureData"], "FillTexture": ["fillTexture", [["skin", null], ["x", 0], ["y", 0], ["width", 0], ["height", 0], ["repeat", null]], 1, "_adptTextureData"], "FillText": ["fillText", [["text", ""], ["x", 0], ["y", 0], ["font", null], ["color", null], ["textAlign", null]], 1], "Line": ["drawLine", [["x", 0], ["y", 0], ["toX", 0], ["toY", 0], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLineData"], "Lines": ["drawLines", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Curves": ["drawCurves", [["x", 0], ["y", 0], ["points", ""], ["lineColor", null], ["lineWidth", 0]], 0, "_adptLinesData"], "Poly": ["drawPoly", [["x", 0], ["y", 0], ["points", ""], ["fillColor", null], ["lineColor", null], ["lineWidth", 1]], 0, "_adptLinesData"] };
/**@private */
ClassUtils._temParam = [];
/**@private */
ClassUtils._classMap = { 'Sprite': Sprite, 'Scene': Scene, 'Text': Text, 'Animation': 'laya.display.Animation', 'Skeleton': 'laya.ani.bone.Skeleton', 'Particle2D': 'laya.particle.Particle2D', 'div': 'laya.html.dom.HTMLDivParser', 'p': 'laya.html.dom.HTMLElement', 'img': 'laya.html.dom.HTMLImageElement', 'span': 'laya.html.dom.HTMLElement', 'br': 'laya.html.dom.HTMLBrElement', 'style': 'laya.html.dom.HTMLStyleElement', 'font': 'laya.html.dom.HTMLElement', 'a': 'laya.html.dom.HTMLElement', '#text': 'laya.html.dom.HTMLElement', 'link': 'laya.html.dom.HTMLLinkElement' };
