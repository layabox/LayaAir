import { SingletonList } from "../../../utils/SingletonList";
import { Transform3D } from "../../../d3/core/Transform3D";
import { ShaderInstance } from "../../../d3/shader/ShaderInstance";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IBaseRenderNode } from "./IBaseRenderNode";
import { IRenderContext3D } from "./IRenderContext3D";
import { IRenderGeometryElement } from "./IRenderGeometryElement";

export interface IRenderElement{
    _geometry:IRenderGeometryElement;
    _shaderInstances: SingletonList<ShaderInstance>;
    _materialShaderData:ShaderData;
    _renderShaderData:ShaderData;
    _transform:Transform3D;
    _isRender:boolean;
    _owner:IBaseRenderNode;
    _render(context: IRenderContext3D):void;
    _addShaderInstance(shader:ShaderInstance):void;
    _clearShaderInstance():void;
    _destroy():void;
}