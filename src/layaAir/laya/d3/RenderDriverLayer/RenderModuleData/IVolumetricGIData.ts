import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Vector3 } from "../../../maths/Vector3";
import { Bounds } from "../../math/Bounds";

export interface IVolumetricGIData{
    irradiance:number;
    distance:number;
    normalBias:number;
    viewBais:number;
    bound:Bounds;
    intensity:number;
    setProbeCounts(value:Vector3):void;
    setProbeStep(value:Vector3):void;
    applyRenderData(data:ShaderData):number;

}