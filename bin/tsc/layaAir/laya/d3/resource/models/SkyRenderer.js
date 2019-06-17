import { SkyBox } from "././SkyBox";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { WebGLContext } from "../../../webgl/WebGLContext";
/**
 * <code>SkyRenderer</code> 类用于实现天空渲染器。
 */
export class SkyRenderer {
    /**
     * 创建一个新的 <code>SkyRenderer</code> 实例。
     */
    constructor() {
        /** @private */
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
     * @private
     * 是否可用。
     */
    _isAvailable() {
        return this._material && this._mesh ? true : false;
    }
    /**
     * @private
     */
    _render(state) {
        if (this._material && this._mesh) {
            var gl = LayaGL.instance;
            var scene = state.scene;
            var camera = state.camera;
            WebGLContext.setCullFace(gl, false);
            WebGLContext.setDepthFunc(gl, WebGLContext.LEQUAL);
            WebGLContext.setDepthMask(gl, false);
            var shader = state.shader = this._material._shader.getSubShaderAt(0)._passes[0].withCompile(0, 0, this._material._shaderValues._defineDatas.value); //TODO:调整SubShader代码
            var switchShader = shader.bind(); //纹理需要切换shader时重新绑定 其他uniform不需要
            var switchShaderLoop = (Stat.loopCount !== shader._uploadMark);
            var uploadScene = (shader._uploadScene !== scene) || switchShaderLoop;
            if (uploadScene || switchShader) {
                shader.uploadUniforms(shader._sceneUniformParamsMap, scene._shaderValues, uploadScene);
                shader._uploadScene = scene;
            }
            var uploadCamera = (shader._uploadCamera !== camera) || switchShaderLoop;
            if (uploadCamera || switchShader) {
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
            WebGLContext.setDepthFunc(gl, WebGLContext.LESS);
            WebGLContext.setDepthMask(gl, true);
        }
    }
    /**
     * @private
     */
    destroy() {
        if (this._material) {
            this._material._removeReference();
            this._material = null;
        }
    }
}
