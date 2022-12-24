import { SingletonList } from "../../../utils/SingletonList";
import { Transform3D } from "../../../d3/core/Transform3D";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IBaseRenderNode } from "./IBaseRenderNode";
import { IRenderContext3D } from "./IRenderContext3D";
import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { ShaderInstance } from "../../RenderShader/ShaderInstance";

export interface IRenderElement {
    _geometry: IRenderGeometryElement;
    _shaderInstances: SingletonList<ShaderInstance>;
    _materialShaderData: ShaderData;
    _renderShaderData: ShaderData;
    _transform: Transform3D;
    _isRender: boolean;
    _owner: IBaseRenderNode;
    _invertFront: boolean;
    _render(context: IRenderContext3D): void;
    _addShaderInstance(shader: ShaderInstance): void;
    _clearShaderInstance(): void;
    _destroy(): void;
}