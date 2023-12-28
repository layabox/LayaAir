import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Transform3D } from "../../core/Transform3D";
import { ShadowMode } from "../../core/light/ShadowMode";

export interface IDirectLightData {
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowTwoCascadeSplits: number;
    setShadowFourCascadeSplits(value: Vector3): void;
}