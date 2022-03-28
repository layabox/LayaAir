import { Transform3D } from "../../../d3/core/Transform3D";
import { SubShader } from "../../../d3/shader/SubShader";
import { ShaderData } from "../../RenderShader/ShaderData";
import { IRenderGeometry } from "./IRenderGeometry";

export interface IRenderElement{
    _Geometry:IRenderGeometry;
    _subShader:SubShader;
    _materialShaderData:ShaderData;
    _renderShaderData:ShaderData;
    _pipelineMode:string;
    _transform:Transform3D;
    _update():void;
    _render():void;
}