import { Transform3D } from "../../../../d3/core/Transform3D";
import { ShadowCascadesMode } from "../../../../d3/core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { Vector3 } from "../../../../maths/Vector3";
import { IDirectLightData } from "../../Design/3D/I3DRenderModuleData";


export class WebDirectLight implements IDirectLightData {
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

    constructor() {
        this._shadowFourCascadeSplits = new Vector3();
        this._direction = new Vector3();
    }

    setShadowFourCascadeSplits(value: Vector3): void {
        value && value.cloneTo(this._shadowFourCascadeSplits);
    }

    setDirection(value: Vector3): void {
        value && value.cloneTo(this._direction)
    }
}