import { BaseRender } from "../../../d3/core/render/BaseRender";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Bounds } from "../../../d3/math/Bounds";
/**
 * 基本渲染单元
 */
export interface IBaseRenderNode {
    /**@internal ID */
    renderId:number;
    /**@internal Shadow Mode */
    receiveShadow:boolean;
    /**@internal shadow mode */
    castShadow:boolean;
    /**@internal 包围盒 */
    bounds:Bounds;
    /**@internal 排序矫正值 */
    sortingFudge:number;
    /**@internal 距离矫正 */
    distanceForSort:number;
    /**@internal transform3D */
    transform:Transform3D;
    /**@internal baseRender */
    owner:BaseRender|null;
    /**@internal TODO Base Bounds/can update Bounds by transform*GeometryBounds*/
    geometryBounds:Bounds|null;
    /**@internal layer 层遮罩*/
    layer:number;
    /**@internal */
    boundsChange:boolean;
    /**@internal 渲染禁用位，比如LOD，静态合并禁用后仍然还在列表的位*/
    renderbitFlag:number;
    /**@internal */
    staticMask:number;
}