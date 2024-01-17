import { SingletonList } from "../../../utils/SingletonList";
import { Transform3D } from "../../../d3/core/Transform3D";
import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { ShaderInstance } from "../../RenderShader/ShaderInstance";
import { IBaseRenderNode } from "../../../d3/RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { SubShader } from "../../RenderShader/SubShader";
import { ShaderData } from "../ShaderData";

export interface IRenderElement {
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