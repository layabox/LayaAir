import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { IRenderGeometryElement } from "../RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../RenderDevice/ShaderData";

export interface IRenderElement2D {
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    subShader: SubShader;
    blendState:null;
    destroy(): void;
}