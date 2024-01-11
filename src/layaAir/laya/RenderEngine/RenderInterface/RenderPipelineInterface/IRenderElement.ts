import { SingletonList } from "../../../utils/SingletonList";
import { Transform3D } from "../../../d3/core/Transform3D";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { ShaderInstance } from "../../RenderShader/ShaderInstance";
import { IBaseRenderNode } from "../../../d3/RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { IRenderContext3D } from "../../../d3/RenderDriverLayer/IRenderContext3D";
import { SubShader } from "../../RenderShader/SubShader";

export interface IRenderElement {
    _geometry: IRenderGeometryElement;
    _shaderInstances: SingletonList<ShaderInstance>;
    _materialShaderData: ShaderData;
    _materialRenderQueue: number;
    _renderShaderData: ShaderData;
    _transform: Transform3D;
    _isRender: boolean;
    _owner: IBaseRenderNode;
    _subShader: SubShader;
    _invertFront: boolean;
    _render(context: IRenderContext3D): void;
    _addShaderInstance(shader: ShaderInstance): void;
    _clearShaderInstance(): void;
    _destroy(): void;
}