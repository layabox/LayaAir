import { Handler } from "./Handler";
import { Sprite } from "../display/Sprite";
import { Node } from "../display/Node";
/**
 * <code>ClassUtils</code> 是一个类工具类。
 */
export declare class ClassUtils {
    /**@private */
    private static DrawTypeDic;
    /**@private */
    private static _temParam;
    /**@private */
    private static _classMap;
    /**@private */
    private static _tM;
    /**@private */
    private static _alpha;
    /**
     * 注册 Class 映射，方便在class反射时获取。
     * @param	className 映射的名字或者别名。
     * @param	classDef 类的全名或者类的引用，全名比如:"laya.display.Sprite"。
     */
    static regClass(className: string, classDef: any): void;
    /**
     * 根据类名短名字注册类，比如传入[Sprite]，功能同regClass("Sprite",Sprite);
     * @param	classes 类数组
     */
    static regShortClassName(classes: any[]): void;
    /**
     * 返回注册的 Class 映射。
     * @param	className 映射的名字。
     */
    static getRegClass(className: string): any;
    /**
     * 根据名字返回类对象。
     * @param	className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
     * @return 类对象
     */
    static getClass(className: string): any;
    /**
     * 根据名称创建 Class 实例。
     * @param	className 类名(比如laya.display.Sprite)或者注册的别名(比如Sprite)。
     * @return	返回类的实例。
     */
    static getInstance(className: string): any;
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
    static createByJson(json: any, node?: any, root?: Node, customHandler?: Handler, instanceHandler?: Handler): any;
    /**
     * @private
     * 将graphic对象添加到Sprite上
     * @param graphicO graphic对象描述
     */
    static _addGraphicsToSprite(graphicO: any, sprite: Sprite): void;
    /**
     * @private
     */
    private static _getGraphicsFromSprite;
    /**
     * @private
     */
    private static _getTransformData;
    /**
     * @private
     */
    private static _addGraphicToGraphics;
    /**
     * @private
     */
    private static _adptLineData;
    /**
     * @private
     */
    private static _adptTextureData;
    /**
     * @private
     */
    private static _adptLinesData;
    /**
     * @private
     */
    private static _getParams;
    /**
     * @private
     */
    private static _getObjVar;
}
