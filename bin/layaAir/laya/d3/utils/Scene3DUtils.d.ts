import { Node } from "laya/display/Node";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Scene3D } from "../core/scene/Scene3D";
import { Sprite3D } from "../core/Sprite3D";
/**
 * <code>Utils3D</code> 类用于创建3D工具。
 */
export declare class Scene3DUtils {
    /**
* @private
*/
    private static _createSprite3DInstance;
    /**
     * @private
     */
    private static _createComponentInstance;
    /**
     * @private
     */
    static _createNodeByJson02(nodeData: any, outBatchSprites: RenderableSprite3D[]): Node;
    /**
     *@private
     */
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): Sprite3D;
    /**
     *@private
     */
    static _parseScene(data: any, propertyParams?: any, constructParams?: any[]): Scene3D;
    /**
     * @private
     */
    static _createNodeByJson(nodeData: any, outBatchSprites: RenderableSprite3D[]): Node;
}
