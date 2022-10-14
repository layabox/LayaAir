import { BaseRender } from "../../d3/core/render/BaseRender";
import { Transform3D } from "../../d3/core/Transform3D";
import { Bounds } from "../../d3/math/Bounds";
import { IBaseRenderNode } from "../RenderInterface/RenderPipelineInterface/IBaseRenderNode";

export class BaseRenderNode implements IBaseRenderNode {
   
    /**@interanl */
    boundsChange: boolean;
    /**@internal ID */
    renderId: number;
    /**@internal Shadow Mode */
    receiveShadow: boolean;
    /**@internal shadow mode */
    castShadow: boolean;
    /**@internal 包围盒 */
    bounds: Bounds;
    /**@internal 排序矫正值 */
    sortingFudge: number;
    /**@internal 距离矫正 */
    distanceForSort: number;
    /**@internal transform3D */
    transform: Transform3D;
    /**@internal baseRender */
    owner: BaseRender | null;
    /**@internal TODO Base Bounds/can update Bounds by transform*GeometryBounds*/
    geometryBounds: Bounds | null;
    /**@internal layer */
    layer:number;
    /**@internal */
    renderbitFlag:number;
    /**@internal */
    staticMask: number;
}