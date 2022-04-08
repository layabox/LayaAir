import { Bounds } from "../../../d3/core/Bounds";
import { BaseRender } from "../../../d3/core/render/BaseRender";
import { RenderElement } from "../../../d3/core/render/RenderElement";
import { Transform3D } from "../../../d3/core/Transform3D";
import { ShaderData } from "../../RenderShader/ShaderData";
/**
 * 基本渲染单元
 */
export interface IBaseRenderNode {
    /**ID */
    _renderID:number;
    /**Shadow Mode */
    _receiveShadow:number;
    /**shadow mode */
    _castShadow:number;
    /**是否静态 */
    _staticRender:number;
    /**包围盒 */
    _bounds:Bounds;
    /**渲染元素 */
    _RenderElement:RenderElement[];
    /**排序矫正值 */
    _sortingFudge:number;
    /**距离矫正 */
    _DistanceForSort:number;
    /**shader define && shader Data*/
    _shaderValues:ShaderData;
    /**custom Data */
    _customShaderData:ShaderData;
    /**transform3D */
    _transform:Transform3D;
    /**baseRender */
    _owner:BaseRender;
}