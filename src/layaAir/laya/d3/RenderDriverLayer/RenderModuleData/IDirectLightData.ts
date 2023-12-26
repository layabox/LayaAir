import { Color } from "../../../maths/Color";
import { Vector3 } from "../../../maths/Vector3";
import { Transform3D } from "../../core/Transform3D";
import { ShadowMode } from "../../core/light/ShadowMode";

export interface IDirectLightData {
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowTwoCascadeSplits: number;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowMode: ShadowMode;
    setColor(value: Color): void;
    setShadowFourCascadeSplits(value: Vector3): void;
}