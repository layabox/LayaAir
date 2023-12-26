import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Vector3 } from "../../../maths/Vector3";
import { Bounds } from "../../math/Bounds";

export interface IVolumetricGIData{
    irradiance:number;
    distance:number;
    normalBias:number;
    viewBais:number;
    probeCounts:Vector3;
    probeStep:Vector3;
    bound:Bounds;
    intensity:number;
    applyRenderData(data:ShaderData):number;

}