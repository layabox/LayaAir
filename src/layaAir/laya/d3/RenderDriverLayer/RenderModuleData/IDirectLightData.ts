import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Transform3D } from "../../core/Transform3D";
import { ShadowCascadesMode } from "../../core/light/ShadowCascadesMode";
import { ShadowMode } from "../../core/light/ShadowMode";

export interface IDirectLightData {
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowNearPlane:number;
    shadowCascadesMode: ShadowCascadesMode;
    shadowTwoCascadeSplits: number;
    setShadowFourCascadeSplits(value: Vector3): void;
    setDirection(value: Vector3): void;
}