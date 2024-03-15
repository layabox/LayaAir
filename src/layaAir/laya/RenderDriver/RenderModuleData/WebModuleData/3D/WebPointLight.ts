import { Transform3D } from "../../../../d3/core/Transform3D";
import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { IPointLightData } from "../../Design/3D/I3DRenderModuleData";

export class WebPointLight implements IPointLightData {
    transform: Transform3D;
    range: number;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowNearPlane: number;

}