/**
 * @private 场景辅助类
 */
export declare class SceneUtils {
    /**@private */
    private static _funMap;
    /**@private */
    private static _parseWatchData;
    /**@private */
    private static _parseKeyWord;
    /**
     * @private 根据字符串，返回函数表达式
     */
    static getBindFun(value: string): Function;
    /**
     * @private
     * 通过视图数据创建视图。
     * @param uiView 视图数据信息。
     */
    static createByData(root: any, uiView: any): any;
    static createInitTool(): InitTool;
    /**
     * 根据UI数据实例化组件。
     * @param uiView UI数据。
     * @param comp 组件本体，如果为空，会新创建一个。
     * @param view 组件所在的视图实例，用来注册var全局变量，如果值为空则不注册。
     * @return 一个 Component 对象。
     */
    static createComp(uiView: any, comp?: any, view?: any, dataMap?: any[], initTool?: InitTool): any;
    /**
     * @private
     * 设置组件的属性值。
     * @param comp 组件实例。
     * @param prop 属性名称。
     * @param value 属性值。
     * @param view 组件所在的视图实例，用来注册var全局变量，如果值为空则不注册。
     */
    private static setCompValue;
    /**
     * @private
     * 通过组建UI数据，获取组件实例。
     * @param json UI数据。
     * @return Component 对象。
     */
    static getCompInstance(json: any): any;
}
import { Scene } from "../display/Scene";
/**
 * @private 场景辅助类
 */
declare class InitTool {
    /**@private */
    private _nodeRefList;
    /**@private */
    private _initList;
    private _loadList;
    reset(): void;
    recover(): void;
    static create(): InitTool;
    addLoadRes(url: string, type?: string): void;
    /**@private */
    addNodeRef(node: any, prop: string, referStr: string): void;
    /**@private */
    setNodeRef(): void;
    /**@private */
    getReferData(referStr: string): any;
    /**@private */
    addInitItem(item: any): void;
    /**@private */
    doInits(): void;
    /**@private */
    finish(): void;
    /**@private */
    beginLoad(scene: Scene): void;
}
export {};
