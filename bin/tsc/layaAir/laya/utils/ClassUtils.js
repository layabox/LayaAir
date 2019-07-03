import { Matrix } from "../maths/Matrix";
import { Sprite } from "../display/Sprite";
import { Node } from "../display/Node";
import { Scene } from "../display/Scene";
import { Graphics } from "../display/Graphics";
import { ILaya } from "../../ILaya";
import { HitArea } from "../utils/HitArea";
import { Text } from "../display/Text";
import { Animation } from "./../display/Animation";
import { AnimationBase } from "./../display/AnimationBase";
import { BitmapFont } from "./../display/BitmapFont";
import { EffectAnimation } from "./../display/EffectAnimation";
import { FrameAnimation } from "./../display/FrameAnimation";
import { GraphicsBounds } from "./../display/GraphicsBounds";
import { Input } from "./../display/Input";
import { SpriteConst } from "./../display/SpriteConst";
import { Stage } from "./../display/Stage";
import { AdvImage } from "../ui/AdvImage";
import { AutoBitmap } from "../ui/AutoBitmap";
import { Box } from "../ui/Box";
import { Button } from "../ui/Button";
import { CheckBox } from "../ui/CheckBox";
import { Clip } from "../ui/Clip";
import { ColorPicker } from "../ui/ColorPicker";
import { ComboBox } from "../ui/ComboBox";
import { Dialog } from "../ui/Dialog";
import { DialogManager } from "../ui/DialogManager";
import { FontClip } from "../ui/FontClip";
import { HBox } from "../ui/HBox";
import { HScrollBar } from "../ui/HScrollBar";
import { HSlider } from "../ui/HSlider";
import { Image } from "../ui/Image";
import { IUI } from "../ui/IUI";
import { Label } from "../ui/Label";
import { LayoutBox } from "../ui/LayoutBox";
import { List } from "../ui/List";
import { Panel } from "../ui/Panel";
import { ProgressBar } from "../ui/ProgressBar";
import { Radio } from "../ui/Radio";
import { RadioGroup } from "../ui/RadioGroup";
import { ScaleBox } from "../ui/ScaleBox";
import { ScrollBar } from "../ui/ScrollBar";
import { Slider } from "../ui/Slider";
import { Styles } from "../ui/Styles";
import { Tab } from "../ui/Tab";
import { TextArea } from "../ui/TextArea";
import { TextInput } from "../ui/TextInput";
import { TipManager } from "../ui/TipManager";
import { Tree } from "../ui/Tree";
import { UIComponent } from "../ui/UIComponent";
import { UIEvent } from "../ui/UIEvent";
import { UIGroup } from "../ui/UIGroup";
import { UILib } from "../ui/UILib";
import { UIUtils } from "../ui/UIUtils";
import { VBox } from "../ui/VBox";
import { View } from "../ui/View";
import { ViewStack } from "../ui/ViewStack";
import { VScrollBar } from "../ui/VScrollBar";
import { VSlider } from "../ui/VSlider";
import { Widget } from "../ui/Widget";
import { Physics } from "../physics/Physics";
import { BoxCollider } from "../physics/BoxCollider";
import { ChainCollider } from "../physics/ChainCollider";
import { CircleCollider } from "../physics/CircleCollider";
import { ColliderBase } from "../physics/ColliderBase";
import { PhysicsDebugDraw } from "../physics/PhysicsDebugDraw";
import { PolygonCollider } from "../physics/PolygonCollider";
import { RigidBody } from "../physics/RigidBody";
import { DistanceJoint } from "../physics/joint/DistanceJoint";
import { GearJoint } from "../physics/joint/GearJoint";
import { JointBase } from "../physics/joint/JointBase";
import { MotorJoint } from "../physics/joint/MotorJoint";
import { MouseJoint } from "../physics/joint/MouseJoint";
import { PrismaticJoint } from "../physics/joint/PrismaticJoint";
import { PulleyJoint } from "../physics/joint/PulleyJoint";
import { RevoluteJoint } from "../physics/joint/RevoluteJoint";
import { RopeJoint } from "../physics/joint/RopeJoint";
import { WeldJoint } from "../physics/joint/WeldJoint";
import { WheelJoint } from "../physics/joint/WheelJoint";
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
            return (ILaya.__classMap[classObject] || glaya[className]);
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
                            if ("owner" in tChild) {
                                tChild["owner"] = node;
                            }
                            else if ("target" in tChild) {
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
     * @internal
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
        if ("pivotX" in propsO || "pivotY" in propsO) {
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
     * @internal
     */
    static _isDrawType(type) {
        if (type === "Image")
            return false;
        return type in ClassUtils.DrawTypeDic;
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
     * @internal
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
        if (key in obj) {
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
ClassUtils._classMap = {
    'Sprite': Sprite,
    'Scene': Scene,
    'Text': Text,
    'Animation': 'Animation',
    'Skeleton': 'Skeleton',
    'Particle2D': 'Particle2D',
    'div': 'HTMLDivParser',
    'p': 'HTMLElement',
    'img': 'HTMLImageElement',
    'span': 'HTMLElement',
    'br': 'HTMLBrElement',
    'style': 'HTMLStyleElement',
    'font': 'HTMLElement',
    'a': 'HTMLElement',
    '#text': 'HTMLElement',
    'link': 'HTMLLinkElement',
    'laya.display.Animation': Animation,
    'laya.display.AnimationBase': AnimationBase,
    'laya.display.BitmapFont': BitmapFont,
    'laya.display.EffectAnimation': EffectAnimation,
    'laya.display.FrameAnimation': FrameAnimation,
    'laya.display.Graphics': Graphics,
    'laya.display.GraphicsBounds': GraphicsBounds,
    'laya.display.Input': Input,
    'laya.display.Node': Node,
    'laya.display.Scene': Scene,
    'laya.display.Sprite': Sprite,
    'laya.display.SpriteConst': SpriteConst,
    'laya.display.Stage': Stage,
    'laya.display.Text': Text,
    'laya.ui.View': View,
    'laya.ui.AdvImage': AdvImage,
    'laya.ui.AutoBitmap': AutoBitmap,
    'laya.ui.Box': Box,
    'laya.ui.Button': Button,
    'laya.ui.CheckBox': CheckBox,
    'laya.ui.Clip': Clip,
    'laya.ui.ColorPicker': ColorPicker,
    'laya.ui.ComboBox': ComboBox,
    'laya.ui.Dialog': Dialog,
    'laya.ui.DialogManager': DialogManager,
    'laya.ui.FontClip': FontClip,
    'laya.ui.HBox': HBox,
    'laya.ui.HScrollBar': HScrollBar,
    'laya.ui.HSlider': HSlider,
    'laya.ui.Image': Image,
    'laya.ui.IUI': IUI,
    'laya.ui.Label': Label,
    'laya.ui.LayoutBox': LayoutBox,
    'laya.ui.List': List,
    'laya.ui.Panel': Panel,
    'laya.ui.ProgressBar': ProgressBar,
    'laya.ui.Radio': Radio,
    'laya.ui.RadioGroup': RadioGroup,
    'laya.ui.ScaleBox': ScaleBox,
    'laya.ui.ScrollBar': ScrollBar,
    'laya.ui.Slider': Slider,
    'laya.ui.Styles': Styles,
    'laya.ui.Tab': Tab,
    'laya.ui.TextArea': TextArea,
    'laya.ui.TextInput': TextInput,
    'laya.ui.TipManager': TipManager,
    'laya.ui.Tree': Tree,
    'laya.ui.UIComponent': UIComponent,
    'laya.ui.UIEvent': UIEvent,
    'laya.ui.UIGroup': UIGroup,
    'laya.ui.UILib': UILib,
    'laya.ui.UIUtils': UIUtils,
    'laya.ui.VBox': VBox,
    'laya.ui.ViewStack': ViewStack,
    'laya.ui.VScrollBar': VScrollBar,
    'laya.ui.VSlider': VSlider,
    'laya.ui.Widget': Widget,
    'laya.physics.BoxCollider': BoxCollider,
    'laya.physics.ChainCollider': ChainCollider,
    'laya.physics.CircleCollider': CircleCollider,
    'laya.physics.ColliderBase': ColliderBase,
    'laya.physics.Physics': Physics,
    'laya.physics.PhysicsDebugDraw': PhysicsDebugDraw,
    'laya.physics.PolygonCollider': PolygonCollider,
    'laya.physics.RigidBody': RigidBody,
    'laya.physics.joint.DistanceJoint': DistanceJoint,
    'laya.physics.joint.GearJoint': GearJoint,
    'laya.physics.joint.JointBase': JointBase,
    'laya.physics.joint.MotorJoint': MotorJoint,
    'laya.physics.joint.MouseJoint': MouseJoint,
    'laya.physics.joint.PrismaticJoint': PrismaticJoint,
    'laya.physics.joint.PulleyJoint': PulleyJoint,
    'laya.physics.joint.RevoluteJoint': RevoluteJoint,
    'laya.physics.joint.RopeJoint': RopeJoint,
    'laya.physics.joint.WeldJoint': WeldJoint,
    'laya.physics.joint.WheelJoint': WheelJoint
};
