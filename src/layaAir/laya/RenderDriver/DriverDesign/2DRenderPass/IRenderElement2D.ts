import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderStruct2D } from "../../RenderModuleData/Design/2D/IRenderStruct2D";
import { IRenderGeometryElement } from "../RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../RenderDevice/ShaderData";

/**
 * @blueprintIgnore @blueprintIgnoreSubclasses
 */
export interface IRenderElement2D {
    type:number;
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    subShader: SubShader;
    renderStateIsBySprite: boolean;//渲染节点的renderState根据哪个ShaderData来
    nodeCommonMap: Array<string>;
    owner: IRenderStruct2D;
    destroy(): void;
}