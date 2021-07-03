import { BoundSphere } from "../math/BoundSphere";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Plane } from "../math/Plane";
import { Vector3 } from "../math/Vector3";
import { ShaderData } from "../shader/ShaderData";
import { CameraCullInfo } from "../graphics/FrustumCulling";

/**
 * @internal
 * 阴影分割数据。
 */
export class ShadowSliceData {
    cameraShaderValue: ShaderData = new ShaderData();
    position: Vector3 = new Vector3();
    offsetX: number;
    offsetY: number;
    resolution: number;
    viewMatrix: Matrix4x4 = new Matrix4x4();
    projectionMatrix: Matrix4x4 = new Matrix4x4();
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();
    cullPlanes: Array<Plane> = [new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3()), new Plane(new Vector3())];
    cullPlaneCount: number;
    splitBoundSphere: BoundSphere = new BoundSphere(new Vector3(), 0.0);
    sphereCenterZ: number;
}

/**
 * @internal
 * 聚光灯阴影数据。
 */
export class ShadowSpotData{
    cameraShaderValue:ShaderData = new ShaderData();
    position:Vector3 = new Vector3;
    offsetX:number;
    offsetY:number;
    resolution:number;
    viewMatrix:Matrix4x4 = new Matrix4x4();
    projectionMatrix:Matrix4x4 = new Matrix4x4();
    viewProjectMatrix:Matrix4x4 = new Matrix4x4();
    cameraCullInfo:CameraCullInfo = new CameraCullInfo();

}
