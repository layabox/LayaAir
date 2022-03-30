import { Transform3D } from "../../../d3/core/Transform3D";
import { SubShader } from "../../../d3/shader/SubShader";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IRenderGeometryElement } from "./IRenderGeometryElement";
import { IRenderQueue } from "./IRenderQueue";

export interface IRenderElement{
    _geometry:IRenderGeometryElement;
    _subShader:SubShader;
    _materialShaderData:ShaderData;
    _renderShaderData:ShaderData;
    _transform:Transform3D;
    _isRender:boolean;
    _render(renderqueue:IRenderQueue):void;
    _destroy():void;
}