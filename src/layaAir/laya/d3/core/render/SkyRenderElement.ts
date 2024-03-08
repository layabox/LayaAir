import { ISkyRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector3 } from "../../../maths/Vector3";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { RenderElement } from "./RenderElement";

export class SkyRenderElement extends RenderElement {

    declare _renderElementOBJ: ISkyRenderElement3D;

    viewMatrix: Matrix4x4;
    projectionMatrix: Matrix4x4;

    constructor() {
        super();
    }

    protected _createRenderElementOBJ(): void {
        this._renderElementOBJ = Laya3DRender.Render3DPassFactory.createSkyRenderElement();
        if (this._renderElementOBJ) {
            this._renderElementOBJ.skyViewMatrix = this.viewMatrix = new Matrix4x4();
            this._renderElementOBJ.skyProjectionMatrix = this.projectionMatrix = new Matrix4x4();
        }
    }

    calculateViewMatrix(cameraViewMat: Matrix4x4) {
        cameraViewMat.cloneTo(this.viewMatrix);
        this.viewMatrix.setTranslationVector(Vector3.ZERO);
    }

    caluclateProjectionMatrix(cameraProjMat: Matrix4x4, aspectRatio: number, nearPlane: number, farPlane: number, fov: number, orthographic: boolean) {
        if (orthographic) {
            let halfWidth = 0.2;
            let halfHeight = halfWidth;
            Matrix4x4.createOrthoOffCenter(-halfWidth, halfWidth, -halfHeight, halfHeight, nearPlane, farPlane, this.projectionMatrix);
        }
        else {
            cameraProjMat.cloneTo(this.projectionMatrix);
            let epsilon = 1e-6;
            let yScale = 1.0 / Math.tan(Math.PI * fov / 180 * 0.5);

            this.projectionMatrix.elements[0] = yScale / aspectRatio;
            this.projectionMatrix.elements[5] = yScale;
            this.projectionMatrix.elements[10] = epsilon - 1.0;
            this.projectionMatrix.elements[11] = -1.0;
            this.projectionMatrix.elements[14] = -0;
        }
    }

}