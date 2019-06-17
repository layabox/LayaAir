import { Camera } from "../Camera";
/**
 * @private
 * <code>RenderElement</code> 类用于实现渲染元素。
 */
export class RenderElement {
    /**
     * 创建一个 <code>RenderElement</code> 实例。
     */
    constructor() {
        /** @private */
        this.renderType = RenderElement.RENDERTYPE_NORMAL;
    }
    /**
     * @private
     */
    getInvertFront() {
        return this._transform._isFrontFaceInvert;
    }
    /**
     * @private
     */
    setTransform(transform) {
        this._transform = transform;
    }
    /**
     * @private
     */
    setGeometry(geometry) {
        this._geometry = geometry;
    }
    /**
     * @private
     */
    addToOpaqueRenderQueue(context, queue) {
        queue.elements.push(this);
    }
    /**
     * @private
     */
    addToTransparentRenderQueue(context, queue) {
        queue.elements.push(this);
        queue.lastTransparentBatched = false;
        queue.lastTransparentRenderElement = this;
    }
    /**
     * @private
     */
    _render(context, isTarget, customShader = null, replacementTag = null) {
        var lastStateMaterial, lastStateShaderInstance, lastStateRender;
        var updateMark = Camera._updateMark;
        var scene = context.scene;
        var camera = context.camera;
        var transform = this._transform;
        var geometry = this._geometry;
        context.renderElement = this;
        var updateRender = updateMark !== this.render._updateMark || this.renderType !== this.render._updateRenderType;
        if (updateRender) { //此处处理更新为裁剪和合并后的，可避免浪费
            this.render._renderUpdate(context, transform);
            this.render._renderUpdateWithCamera(context, transform);
            this.render._updateMark = updateMark;
            this.render._updateRenderType = this.renderType;
        }
        if (geometry._prepareRender(context)) {
            var subShader = this.material._shader.getSubShaderAt(0); //TODO:
            var passes;
            if (customShader) {
                if (replacementTag) {
                    var oriTag = subShader.getFlag(replacementTag);
                    if (oriTag) {
                        var customSubShaders = customShader._subShaders;
                        for (var k = 0, p = customSubShaders.length; k < p; k++) {
                            var customSubShader = customSubShaders[k];
                            if (oriTag === customSubShader.getFlag(replacementTag)) {
                                passes = customSubShader._passes;
                                break;
                            }
                        }
                        if (!passes)
                            return;
                    }
                    else {
                        return;
                    }
                }
                else {
                    passes = customShader.getSubShaderAt(0)._passes; //TODO:
                }
            }
            else {
                passes = subShader._passes;
            }
            for (var j = 0, m = passes.length; j < m; j++) {
                var shaderPass = context.shader = passes[j].withCompile((scene._shaderValues._defineDatas.value) & (~this.material._disablePublicDefineDatas.value), this.render._shaderValues._defineDatas.value, this.material._shaderValues._defineDatas.value);
                var switchShader = shaderPass.bind(); //纹理需要切换shader时重新绑定 其他uniform不需要
                var switchUpdateMark = (updateMark !== shaderPass._uploadMark);
                var uploadScene = (shaderPass._uploadScene !== scene) || switchUpdateMark;
                if (uploadScene || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._sceneUniformParamsMap, scene._shaderValues, uploadScene);
                    shaderPass._uploadScene = scene;
                }
                var uploadSprite3D = (shaderPass._uploadRender !== this.render || shaderPass._uploadRenderType !== this.renderType) || switchUpdateMark;
                if (uploadSprite3D || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._spriteUniformParamsMap, this.render._shaderValues, uploadSprite3D);
                    shaderPass._uploadRender = this.render;
                    shaderPass._uploadRenderType = this.renderType;
                }
                var uploadCamera = shaderPass._uploadCamera !== camera || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._cameraUniformParamsMap, camera._shaderValues, uploadCamera);
                    shaderPass._uploadCamera = camera;
                }
                var uploadMaterial = (shaderPass._uploadMaterial !== this.material) || switchUpdateMark;
                if (uploadMaterial || switchShader) {
                    shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, this.material._shaderValues, uploadMaterial);
                    shaderPass._uploadMaterial = this.material;
                }
                var matValues = this.material._shaderValues;
                if (lastStateMaterial !== this.material || lastStateShaderInstance !== shaderPass) { //lastStateMaterial,lastStateShaderInstance存到全局，多摄像机还可优化
                    shaderPass.uploadRenderStateBlendDepth(matValues);
                    shaderPass.uploadRenderStateFrontFace(matValues, isTarget, this.getInvertFront());
                    lastStateMaterial = this.material;
                    lastStateShaderInstance = shaderPass;
                    lastStateRender = this.render;
                }
                else {
                    if (lastStateRender !== this.render) { //TODO:是否可以用transfrom
                        shaderPass.uploadRenderStateFrontFace(matValues, isTarget, this.getInvertFront());
                        lastStateRender = this.render;
                    }
                }
                geometry._render(context);
                shaderPass._uploadMark = updateMark;
            }
        }
        if (updateRender && this.renderType !== RenderElement.RENDERTYPE_NORMAL)
            this.render._revertBatchRenderUpdate(context); //还原因合并导致的数据变化
        Camera._updateMark++;
    }
    /**
     * @private
     */
    destroy() {
        this._transform = null;
        this._geometry = null;
        this.material = null;
        this.render = null;
    }
}
/** @private */
RenderElement.RENDERTYPE_NORMAL = 0;
/** @private */
RenderElement.RENDERTYPE_STATICBATCH = 1;
/** @private */
RenderElement.RENDERTYPE_INSTANCEBATCH = 2;
/** @private */
RenderElement.RENDERTYPE_VERTEXBATCH = 3;
