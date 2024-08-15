import { IRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

const InvertYScaleMat = new Matrix4x4(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
/**
 * @en The `SkyRenderElement` class is a render element that represents the sky.
 * @zh `SkyRenderElement` 类表示天空渲染元素。
 */
export class SkyRenderElement extends RenderElement {

    /**
     * @en The render element object that is declared for rendering.
     * @zh 声明用于渲染的渲染元素对象。
     */
    declare _renderElementOBJ: IRenderElement3D;

    private _viewMatrix: Matrix4x4;
    private _projectionMatrix: Matrix4x4;
    private _projectViewMatrix: Matrix4x4;

    constructor() {
        super();
        this._viewMatrix = new Matrix4x4();
        this._projectionMatrix = new Matrix4x4();
        this._projectViewMatrix = new Matrix4x4();
    }

    /**
     * @en Calculates the view matrix based on the camera's view matrix.
     * @param cameraViewMat The camera's view matrix.
     * @zh 根据摄像机的视图矩阵计算视图矩阵。
     * @param cameraViewMat 摄像机的视图矩阵。
     */
    calculateViewMatrix(cameraViewMat: Matrix4x4) {
        cameraViewMat.cloneTo(this._viewMatrix);
        this._viewMatrix.setTranslationVector(Vector3.ZERO);
    }

    /**
     * @en Calculates the projection matrix based on the camera's projection matrix and other parameters.
     * @param cameraProjMat The camera's projection matrix.
     * @param aspectRatio The aspect ratio of the projection.
     * @param nearPlane The near plane distance of the projection.
     * @param farPlane The far plane distance of the projection.
     * @param fov The field of view for the perspective projection.
     * @param orthographic Whether to use an orthographic projection.
     * @zh 根据摄像机的投影矩阵和其他参数计算投影矩阵。
     * @param cameraProjMat 摄像机的投影矩阵。
     * @param aspectRatio 投影的纵横比。
     * @param nearPlane 投影的近平面距离。
     * @param farPlane 投影的远平面距离。
     * @param fov 透视投影的视场角。
     * @param orthographic 是否使用正交投影。
     */
    caluclateProjectionMatrix(cameraProjMat: Matrix4x4, aspectRatio: number, nearPlane: number, farPlane: number, fov: number, orthographic: boolean) {
        if (orthographic) {
            let halfWidth = 0.2;
            let halfHeight = halfWidth;
            Matrix4x4.createOrthoOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, nearPlane, farPlane, this._projectionMatrix);
        }
        else {
            cameraProjMat.cloneTo(this._projectionMatrix);
            let epsilon = 1e-6;
            let yScale = 1.0 / Math.tan(Math.PI * fov / 180 * 0.5);

            this._projectionMatrix.elements[0] = yScale / aspectRatio;
            this._projectionMatrix.elements[5] = yScale;
            this._projectionMatrix.elements[10] = epsilon - 1.0;
            this._projectionMatrix.elements[11] = -1.0;
            this._projectionMatrix.elements[14] = -0;
        }
    }

    /**
     * @en Prepares for rendering by setting up matrices and lighting information for sky rendering.
     * @param context The rendering context.
     * @zh 渲染前的准备工作，设置天空渲染所需的矩阵和光照信息。
     * @param context 渲染上下文。
     */
    renderpre(context: RenderContext3D) {
        if (context.invertY) {
            let tempprojectMat = Matrix4x4.TEMPMatrix0;
            let tempProjectView = Matrix4x4.TEMPMatrix1;
            Matrix4x4.multiply(InvertYScaleMat, this._projectionMatrix, tempprojectMat);
            Matrix4x4.multiply(tempprojectMat, this._viewMatrix, tempProjectView);
            this._renderElementOBJ.renderShaderData.setMatrix4x4(SkyRenderer.SKYPROJECTIONMATRIX, tempprojectMat);
            this._renderElementOBJ.renderShaderData.setMatrix4x4(SkyRenderer.SKYPROJECTIONVIEWMATRIX, tempProjectView);
        }
        else {
            Matrix4x4.multiply(this._projectionMatrix, this._viewMatrix, this._projectViewMatrix);
            this._renderElementOBJ.renderShaderData.setMatrix4x4(SkyRenderer.SKYPROJECTIONMATRIX, this._projectionMatrix);
            this._renderElementOBJ.renderShaderData.setMatrix4x4(SkyRenderer.SKYPROJECTIONVIEWMATRIX, this._projectViewMatrix);
        }

        this._renderElementOBJ.renderShaderData.setMatrix4x4(SkyRenderer.SKYVIEWMATRIX, this._viewMatrix);

        this._renderElementOBJ.renderShaderData.setColor(SkyRenderer.SUNLIGHTDIRCOLOR, context.scene._sunColor);
        this._renderElementOBJ.renderShaderData.setVector3(SkyRenderer.SUNLIGHTDIRECTION, context.scene._sundir);
    }

}