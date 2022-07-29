import { Matrix4x4 } from "../math/Matrix4x4";
import { Plane } from "../math/Plane";
import { Vector3 } from "../math/Vector3";
import { ShaderData } from "../../RenderEngine/RenderShader/ShaderData";
import { LayaGL } from "../../layagl/LayaGL";
import { ICameraCullInfo } from "../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { RenderBoundingSphere } from "../core/RenderBoundingSphere";
import { RenderPlane } from "../core/RenderPlane";

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
    cullPlanes: Array<RenderPlane> = [LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0), LayaGL.renderOBJCreate.createPlane(new Vector3(), 0)];
    cullPlaneCount: number;
    splitBoundSphere: RenderBoundingSphere = LayaGL.renderOBJCreate.createBoundsSphere(new Vector3(), 0.0);
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
