import { FrameAnimation } from "../display/FrameAnimation";
import { Graphics } from "../display/Graphics";
import { Matrix } from "../maths/Matrix";
/**
 * Graphics动画解析器
 * @private
 */
export declare class GraphicAnimation extends FrameAnimation {
    /**@private */
    animationList: any[];
    /**@private */
    animationDic: any;
    /**@private */
    protected _nodeList: any[];
    /**@private */
    protected _nodeDefaultProps: any;
    /**@private */
    protected _gList: any[];
    /**@private */
    protected _nodeIDAniDic: any;
    /**@private */
    protected static _drawTextureCmd: any[];
    /**@private */
    protected static _temParam: any[];
    /**@private */
    private static _I;
    /**@private */
    private static _rootMatrix;
    /**@private */
    private _rootNode;
    /**@private */
    protected _nodeGDic: any;
    /**@private */
    private _parseNodeList;
    /**@private */
    private _calGraphicData;
    /**@private */
    private _createGraphicData;
    /**@private */
    protected _createFrameGraphic(frame: number): any;
    protected _updateNodeGraphic(node: any, frame: number, parentTransfrom: Matrix, g: Graphics, alpha?: number): void;
    protected _updateNoChilds(tNodeG: GraphicNode, g: Graphics): void;
    protected _updateNodeGraphic2(node: any, frame: number, g: Graphics): void;
    /**@private */
    protected _calculateKeyFrames(node: any): void;
    /**@private */
    protected getNodeDataByID(nodeID: number): any;
    /**@private */
    protected _getParams(obj: any, params: any[], frame: number, obj2: any): any[];
    /**@private */
    private _getObjVar;
    protected _getNodeGraphicData(nodeID: number, frame: number, rst: GraphicNode): GraphicNode;
    private static _tempMt;
    /**@private */
    protected _getTextureByUrl(url: string): any;
    /**@private */
    setAniData(uiView: any, aniName?: string): void;
    parseByData(aniData: any): any;
    /**@private */
    setUpAniData(uiView: any): void;
    /**@private */
    protected _clear(): void;
    static parseAnimationByData(animationObject: any): any;
    static parseAnimationData(aniData: any): any;
}
declare class GraphicNode {
    skin: string;
    transform: Matrix;
    resultTransform: Matrix;
    width: number;
    height: number;
    alpha: number;
}
export {};
