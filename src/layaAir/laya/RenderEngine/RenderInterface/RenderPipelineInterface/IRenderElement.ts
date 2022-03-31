import { SingletonList } from "../../../d3/component/SingletonList";
import { Transform3D } from "../../../d3/core/Transform3D";
import { ShaderInstance } from "../../../d3/shader/ShaderInstance";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { IRenderQueue } from "./IRenderQueue";

export interface IRenderElement{
    _geometry:IRenderGeometryElement;
    _shaderInstances: SingletonList<ShaderInstance>;
    _materialShaderData:ShaderData;
    _renderShaderData:ShaderData;
    _transform:Transform3D;
    _isRender:boolean;
    _render(renderqueue:IRenderQueue):void;
    _addShaderInstance(shader:ShaderInstance);
    _clearShaderInstance();
    _destroy():void;
}