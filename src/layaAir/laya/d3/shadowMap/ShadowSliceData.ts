import { Matrix4x4 } from "../math/Matrix4x4";
import { Vector3 } from "../math/Vector3";
import { ShaderData } from "../shader/ShaderData";
import { BoundFrustum } from "../math/BoundFrustum";

/**
 * @internal
 * 阴影分割数据。
 */
export class ShadowSliceData {
    cameraShaderValue: ShaderData = new ShaderData();
    position: Vector3 = new Vector3();
    boundFrustum: BoundFrustum = new BoundFrustum(new Matrix4x4());
    viewMatrix: Matrix4x4 = new Matrix4x4();
    projectionMatrix: Matrix4x4 = new Matrix4x4();
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();
}