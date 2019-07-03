import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { WebGLContext } from "../../../webgl/WebGLContext";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { SkyBox } from "./SkyBox";
/**
 * <code>SkyRenderer</code> 类用于实现天空渲染器。
 */
export class SkyRenderer {
    /**
     * 创建一个新的 <code>SkyRenderer</code> 实例。
     */
    constructor() {
        /** @internal */
        this._mesh = SkyBox.instance;
    }
    /**
     * 获取材质。
     * @return 材质。
     */
    get material() {
        return this._material;
    }
    /**
     * 设置材质。
     * @param 材质。
     */
    set material(value) {
        if (this._material !== value) {
            (this._material) && (this._material._removeReference());
            (value) && (value._addReference());
            this._material = value;
        }
    }
    /**
     * 获取网格。
     * @return 网格。
     */
    get mesh() {
        return this._mesh;
    }
    /**
     * 设置网格。
     * @param 网格。
     */
    set mesh(value) {
        if (this._mesh !== value) {
            //(_mesh) && (_mesh._removeReference());//TODO:SkyMesh换成Mesh
            //value._addReference();
            this._mesh = value;
        }
    }
    /**
     * @internal
     * 是否可用。
     */
    _isAvailable() {
        return this._material && this._mesh ? true : false;
    }
    /**
     * @internal
     */
    _render(state) {
        if (this._material && this._mesh) {
            var gl = LayaGL.instance;
            var scene = state.scene;
            var camera = state.camera;
            WebGLContext.setCullFace(gl, false);
            WebGLContext.setDepthFunc(gl, WebGL2RenderingContext.LEQUAL);
            WebGLContext.setDepthMask(gl, false);
            var shader = state.shader = this._material._shader.getSubShaderAt(0)._passes[0].withCompile(0, 0, this._material._shaderValues._defineDatas.value); //TODO:调整SubShader代码
            var switchShader = shader.bind(); //纹理需要切换shader时重新绑定 其他uniform不需要
            var switchShaderLoop = (Stat.loopCount !== shader._uploadMark);
            var uploadScene = (shader._uploadScene !== scene) || switchShaderLoop;
            if (uploadScene || switchShader) {
                shader.uploadUniforms(shader._sceneUniformParamsMap, scene._shaderValues, uploadScene);
                shader._uploadScene = scene;
            }
            var renderTar = camera._renderTexture || camera._offScreenRenderTexture;
            var uploadCamera = (shader._uploadCamera !== camera) || switchShaderLoop;
            if (uploadCamera || switchShader) {
                var viewMatrix = SkyRenderer._tempMatrix0;
                var projectionMatrix = camera.projectionMatrix;
                camera.transform.worldMatrix.cloneTo(viewMatrix); //视图矩阵逆矩阵的转置矩阵，移除平移和缩放
                viewMatrix.transpose();
                if (camera.orthographic) {
                    projectionMatrix = SkyRenderer._tempMatrix1;
                    Matrix4x4.createPerspective(camera.fieldOfView, camera.aspectRatio, camera.nearPlane, camera.farPlane, projectionMatrix);
                }
                //无穷投影矩阵算法
                // var epsilon: number = 1e-6;
                // var nearPlane: number = camera.nearPlane * 0.01;
                // projectionMatrix.elements[10] = -1.0 + epsilon;
                // projectionMatrix.elements[11] = -1.0;
                // projectionMatrix.elements[14] = (-1.0 + epsilon) * nearPlane;//Direct模式投影矩阵盒OpenGL不同
                camera._applyViewProject(state, viewMatrix, projectionMatrix, renderTar ? true : false); //TODO:优化不应设置给Camera直接提交
                shader.uploadUniforms(shader._cameraUniformParamsMap, camera._shaderValues, uploadCamera);
                shader._uploadCamera = camera;
            }
            var uploadMaterial = (shader._uploadMaterial !== this._material) || switchShaderLoop;
            if (uploadMaterial || switchShader) {
                shader.uploadUniforms(shader._materialUniformParamsMap, this._material._shaderValues, uploadMaterial);
                shader._uploadMaterial = this._material;
            }
            this._mesh._bufferState.bind();
            this._mesh._render(state);
            WebGLContext.setDepthFunc(gl, WebGL2RenderingContext.LESS);
            WebGLContext.setDepthMask(gl, true);
            if (camera.orthographic) {
                camera._applyViewProject(state, camera.viewMatrix, camera.projectionMatrix, renderTar ? true : false);
            }
        }
    }
    /**
     * @internal
     */
    destroy() {
        if (this._material) {
            this._material._removeReference();
            this._material = null;
        }
    }
}
SkyRenderer._tempMatrix0 = new Matrix4x4();
SkyRenderer._tempMatrix1 = new Matrix4x4();
