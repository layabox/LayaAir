import { Vector3 } from "../../../../maths/Vector3";
import { IDirectLightData } from "../../../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { Transform3D } from "../../../core/Transform3D";
import { ShadowCascadesMode } from "../../../core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../core/light/ShadowMode";

export class GLESDirectLight implements IDirectLightData {
    shadowNearPlane: number;
    shadowCascadesMode: ShadowCascadesMode;
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowTwoCascadeSplits: number;

    _shadowFourCascadeSplits: Vector3;
    _direction: Vector3;

    setShadowFourCascadeSplits(value: Vector3): void {
        throw new Error("Method not implemented.");
    }

    setDirection(value: Vector3): void {
        throw new Error("Method not implemented.");
    }

}