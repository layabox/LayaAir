import { Transform3D } from "../../core/Transform3D";
import { ShadowMode } from "../../core/light/ShadowMode";

export interface ISpotLightData {
    transform: Transform3D;//OK
    shadowResolution: number;//OK
    shadowDistance:number;//OK
    shadowMode: ShadowMode;//OK
    shadowStrength: number;//OK
    shadowDepthBias: number;//OK
    shadowNormalBias: number;//OK
    spotRange: number;
}