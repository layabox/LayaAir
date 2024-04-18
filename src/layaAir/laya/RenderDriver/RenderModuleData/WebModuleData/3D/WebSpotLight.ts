import { Transform3D } from "../../../../d3/core/Transform3D";
import { ShadowMode } from "../../../../d3/core/light/ShadowMode";
import { Matrix4x4 } from "../../../../maths/Matrix4x4";
import { Vector3 } from "../../../../maths/Vector3";
import { ISpotLightData } from "../../Design/3D/I3DRenderModuleData";

export class WebSpotLight implements ISpotLightData {
    transform: Transform3D;
    shadowResolution: number;
    shadowDistance: number;
    shadowMode: ShadowMode;
    shadowStrength: number;
    shadowDepthBias: number;
    shadowNormalBias: number;
    shadowNearPlane: number;
    spotRange: number;
    spotAngle: number;
    _direction: Vector3;
    setDirection(value: Vector3): void {
        value.cloneTo(this._direction);
    }

    getWorldMatrix(out: Matrix4x4) {
        var position = this.transform.position;
        var quaterian = this.transform.rotation;
        Matrix4x4.createAffineTransformation(position, quaterian, Vector3.ONE, out);
        return out;
    }

}