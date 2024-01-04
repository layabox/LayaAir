import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Vector3 } from "../../../maths/Vector3";
import { Texture2D } from "../../../resource/Texture2D";
import { Bounds } from "../../math/Bounds";

export interface IVolumetricGIData {
    irradiance: Texture2D;
    distance: Texture2D;
    normalBias: number;
    viewBias: number;
    bound: Bounds;
    intensity: number;
    updateMark: number;
    setProbeCounts(value: Vector3): void;
    setProbeStep(value: Vector3): void;
    applyRenderData(data: ShaderData): void;

}