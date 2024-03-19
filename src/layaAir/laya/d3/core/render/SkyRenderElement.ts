import { IRenderElement3D, ISkyRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

const InvertYScaleMat = new Matrix4x4(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
export class SkyRenderElement extends RenderElement {

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

    calculateViewMatrix(cameraViewMat: Matrix4x4) {
        cameraViewMat.cloneTo(this._viewMatrix);
        this._viewMatrix.setTranslationVector(Vector3.ZERO);
    }

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

    }

}