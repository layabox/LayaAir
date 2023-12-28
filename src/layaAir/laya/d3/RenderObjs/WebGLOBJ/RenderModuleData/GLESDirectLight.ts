import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { IDirectLightData } from "../../../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { Transform3D } from "../../../core/Transform3D";
import { ShadowMode } from "../../../core/light/ShadowMode";

export class GLESDirectLight implements IDirectLightData {
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;

    shadowTwoCascadeSplits: number;
    setShadowFourCascadeSplits(value: Vector3): void {
        throw new Error("Method not implemented.");
    }

}