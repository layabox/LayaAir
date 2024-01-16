import { InternalTexture } from "../../../RenderEngine/RenderInterface/InternalTexture";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { Bounds } from "../../math/Bounds";

export interface IVolumetricGIData {
    irradiance: InternalTexture;
    distance: InternalTexture;

    bound: Bounds;
    intensity: number;
    updateMark: number;
    setProbeCounts(value: Vector3): void;
    setProbeStep(value: Vector3): void;
    setParams(value: Vector4): void;
}