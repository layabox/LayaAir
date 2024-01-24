import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { SubShader } from "../../RenderShader/SubShader";
import { IBaseRenderNode } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { ShaderData } from "../../../RenderDriver/RenderModuleData/Design/ShaderData";
import { Transform3D } from "../../../d3/core/Transform3D";

export interface IRenderElement3D {
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    materialRenderQueue: number;
    renderShaderData: ShaderData;
    transform: Transform3D;
    isRender: boolean;
    owner: IBaseRenderNode;
    subShader: SubShader;
    destroy(): void;
}