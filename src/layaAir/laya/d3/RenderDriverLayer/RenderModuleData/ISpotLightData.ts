import { Color } from "../../../maths/Color";
import { Transform3D } from "../../core/Transform3D";
import { ShadowMode } from "../../core/light/ShadowMode";

export interface ISpotLightData {
    transform: Transform3D;
    shadowResolution: number;
    spotRange: number;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowMode: ShadowMode;
    setColor(value: Color): void;
}