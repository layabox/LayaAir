import { BaseRender } from "../../../d3/core/render/BaseRender";
import { RenderBounds } from "../../../d3/core/RenderBounds";
import { Transform3D } from "../../../d3/core/Transform3D";
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
    bounds:RenderBounds;
    /**@internal 排序矫正值 */
    sortingFudge:number;
    /**@internal 距离矫正 */
    distanceForSort:number;
    /**@internal transform3D */
    transform:Transform3D;
    /**@internal baseRender */
    owner:BaseRender|null;
    /**@internal TODO Base Bounds/can update Bounds by transform*GeometryBounds*/
    geometryBounds:RenderBounds|null;
}