import { Plane } from "../math/Plane";
import { ShaderData } from "../../RenderEngine/RenderShader/ShaderData";
import { LayaGL } from "../../layagl/LayaGL";
import { ICameraCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { BoundSphere } from "../math/BoundSphere";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";

/**
 * @internal
 * 阴影分割数据。
 */
export class ShadowSliceData {
    cameraShaderValue: ShaderData = LayaGL.renderOBJCreate.createShaderData(null);
    position: Vector3 = new Vector3();
    offsetX: number;
    offsetY: number;
    resolution: number;
    viewMatrix: Matrix4x4 = new Matrix4x4();
    projectionMatrix: Matrix4x4 = new Matrix4x4();
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();
    cullPlanes: Array<Plane> = [new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0), new Plane(new Vector3(), 0)];
    cullPlaneCount: number;
    splitBoundSphere: BoundSphere = new BoundSphere(new Vector3(), 0.0);
    sphereCenterZ: number;
}

/**
 * @internal
 * 聚光灯阴影数据。
 */
export class ShadowSpotData {
    cameraShaderValue: ShaderData = LayaGL.renderOBJCreate.createShaderData(null);
    position: Vector3 = new Vector3;
    offsetX: number;
    offsetY: number;
    resolution: number;
    viewMatrix: Matrix4x4 = new Matrix4x4();
    projectionMatrix: Matrix4x4 = new Matrix4x4();
    viewProjectMatrix: Matrix4x4 = new Matrix4x4();
    cameraCullInfo: ICameraCullInfo = LayaGL.renderOBJCreate.createCameraCullInfo();

}
