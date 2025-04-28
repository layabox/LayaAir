import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderGeometryElement } from "../RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../RenderDevice/ShaderData";

export interface IRenderElement2D {
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    subShader: SubShader;
    renderStateIsBySprite: boolean;//渲染节点的renderState根据哪个ShaderData来
    nodeCommonMap: Array<string>;
    destroy(): void;
}