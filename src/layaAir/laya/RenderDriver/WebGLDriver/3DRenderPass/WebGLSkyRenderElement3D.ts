import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { ISkyRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";
import { WebGLRenderElement3D } from "./WebGLRenderElement3D";

const InvertYScaleMat = new Matrix4x4(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

export class WebGLSkyRenderElement3D extends WebGLRenderElement3D implements ISkyRenderElement3D {

    static skyboxMap = new CommandEncoder();

    skyViewMatrix: Matrix4x4;
    skyProjectionMatrix: Matrix4x4;

    viewMatrixIndex: number;
    projectionMatrixIndex: number;
    projectViewMatrixIndex: number;

    private projectionMatrix: Matrix4x4;
    private projectViewMatrix: Matrix4x4;

    private cameraViewMat: Matrix4x4;
    private cameraProjMat: Matrix4x4;
    private cameraProjViewMat: Matrix4x4;

    constructor() {
        super();
        this.projectionMatrix = new Matrix4x4();
        this.projectViewMatrix = new Matrix4x4();
    }

    _preUpdatePre(context: WebGLRenderContext3D): void {
        super._preUpdatePre(context);
        if (context.invertY) {
            Matrix4x4.multiply(InvertYScaleMat, this.skyProjectionMatrix, this.projectionMatrix);
            Matrix4x4.multiply(this.projectionMatrix, this.skyViewMatrix, this.projectViewMatrix);
        }
        else {
            this.skyProjectionMatrix.cloneTo(this.projectionMatrix);
            Matrix4x4.multiply(this.projectionMatrix, this.skyViewMatrix, this.projectViewMatrix);
        }

        let cameraData = context.cameraData;
        this.cameraViewMat = cameraData.getMatrix4x4(this.viewMatrixIndex);
        this.cameraProjMat = cameraData.getMatrix4x4(this.projectionMatrixIndex);
        this.cameraProjViewMat = cameraData.getMatrix4x4(this.projectViewMatrixIndex);
    }

    _render(context: WebGLRenderContext3D): void {

        if (!this.isRender)
            return;

        let updateMark = context.cameraUpdateMask;
        let invertFrontFace = this._invertFront;

        let sceneData = context.sceneData;

        let cameraData = context.cameraData;

        let renderData = this.renderShaderData;
        let materialData = this.materialShaderData;

        let passes = this._shaderInstances.elements;
        let passCount = passes.length;
        for (let i = 0; i < passCount; i++) {
            let shaderIns = passes[i];
            if (!shaderIns.complete)
                continue;

            let switchShader = shaderIns.bind();
            let updateShaderData = shaderIns._uploadMark != updateMark;

            // scene
            let uploadScene = switchShader || updateShaderData || (shaderIns._uploadScene != sceneData);
            if (uploadScene) {
                sceneData && shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, sceneData, switchShader);
                shaderIns._uploadScene = sceneData;
            }

            // camera
            let uploadCamera = switchShader || updateShaderData || (shaderIns._uploadCameraShaderValue != cameraData);
            // 替换 camrea 数据， 保证更新
            if (cameraData) {
                cameraData.setMatrix4x4(this.viewMatrixIndex, this.skyViewMatrix);
                cameraData.setMatrix4x4(this.projectionMatrixIndex, this.projectionMatrix);
                cameraData.setMatrix4x4(this.projectViewMatrixIndex, this.projectViewMatrix);
                shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraData, uploadCamera);
                shaderIns._uploadCameraShaderValue = null;

                // 还原
                cameraData.setMatrix4x4(this.viewMatrixIndex, this.cameraViewMat);
                cameraData.setMatrix4x4(this.projectionMatrixIndex, this.cameraProjMat);
                cameraData.setMatrix4x4(this.projectViewMatrixIndex, this.cameraProjViewMat);
            }

            // render
            let uploadRender = switchShader || updateShaderData || (shaderIns._uploadRender != renderData);
            if (uploadRender) {
                renderData && shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, renderData, switchShader);
            }

            // material
            let uploadMaterial = switchShader || updateShaderData || (shaderIns._uploadMaterial != materialData);
            if (uploadMaterial) {
                shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, materialData, switchShader);
                context.globalShaderData && shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, context.globalShaderData, switchShader);
            }

            shaderIns.uploadRenderStateBlendDepth(materialData);
            shaderIns.uploadRenderStateFrontFace(materialData, context.invertY, invertFrontFace);

            this.drawGeometry(shaderIns);
        }

    }
}