import { SkinnedMeshSprite3D } from "../../../d3/core/SkinnedMeshSprite3D";
import { ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebGPUBuffer } from "../RenderDevice/WebGPUBuffer";
import { WebGPURenderBundle } from "../RenderDevice/WebGPUBundle/WebGPURenderBundle";
import { WebGPURenderCommandEncoder } from "../RenderDevice/WebGPURenderCommandEncoder";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPUShaderInstance } from "../RenderDevice/WebGPUShaderInstance";
import { WebGPUGlobal } from "../RenderDevice/WebGPUStatis/WebGPUGlobal";
import { WebGPUContext } from "./WebGPUContext";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";

/**
 * 带骨骼的基本渲染单元
 */
export class WebGPUSkinRenderElement3D extends WebGPURenderElement3D implements ISkinRenderElement3D {
    skinnedData: Float32Array[];
    renderShaderDatas: WebGPUShaderData[];

    globalId: number;
    objectName: string = 'WebGPUSkinRenderElement3D';

    constructor() {
        super();
        this.globalId = WebGPUGlobal.getId(this);
        this.bundleId = WebGPUSkinRenderElement3D.bundleIdCounter++;
    }

    /**
     * 编译着色器
     * @param context 
     */
    protected _compileShader(context: WebGPURenderContext3D) {
        super._compileShader(context);
        const n = this.skinnedData ? this.skinnedData.length : 0;
        if (n > 0) { //创建蒙皮分组材质数据
            if (!this.renderShaderDatas)
                this.renderShaderDatas = [];
            else this._destroyRenderShaderDatas();
            for (let i = 0; i < n; i++) {
                this.renderShaderDatas[i] = new WebGPUShaderData();
                this.renderShaderDatas[i].createUniformBuffer(this._shaderInstance[0].uniformInfo[2]);
                this.renderShaderData.cloneTo(this.renderShaderDatas[i]);
            }
            if (!this.renderShaderData.coShaderData)
                this.renderShaderData.coShaderData = [];
            this.renderShaderData.coShaderData.push(...this.renderShaderDatas); //共享材质数据
        }
    }

    /**
     * 销毁renderShaderDatas数据
     */
    private _destroyRenderShaderDatas() {
        for (let i = this.renderShaderDatas.length - 1; i > -1; i--)
            this.renderShaderDatas[i].destroy();
        this.renderShaderDatas.length = 0;
    }

    /**
     * 绑定资源组
     * @param shaderInstance 
     * @param command 
     * @param bundle 
     * @param sn 
     */
    protected _bindGroupEx(shaderInstance: WebGPUShaderInstance, command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle, sn: number) {
        const uniformSetMap = shaderInstance.uniformSetMap;
        this._sceneData?.bindGroup(0, 'scene3D', uniformSetMap[0], command, bundle);
        this._cameraData?.bindGroup(1, 'camera', uniformSetMap[1], command, bundle);
        this.renderShaderDatas[sn]?.bindGroup(2, 'sprite3D', uniformSetMap[2], command, bundle);
        this.materialShaderData?.bindGroup(3, 'material', uniformSetMap[3], command, bundle);
    }

    /**
     * 上传uniform数据
     * @param sn 
     */
    protected _uploadUniformEx(sn: number) {
        this._sceneData?.uploadUniform();
        this._cameraData?.uploadUniform();
        this.renderShaderDatas[sn]?.uploadUniform();
        this.materialShaderData?.uploadUniform();
    }

    /**
     * 上传几何数据
     * @param command 
     * @param bundle 
     * @param sn 
     */
    protected _uploadGeometryEx(command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle, sn: number) {
        let triangles = 0;
        if (command) {
            if (WebGPUGlobal.useGlobalContext)
                triangles += WebGPUContext.applyCommandGeometryPart(command, this.geometry, sn);
            else triangles += command.applyGeometryPart(this.geometry, sn);
        }
        if (bundle) {
            if (WebGPUGlobal.useGlobalContext)
                triangles += WebGPUContext.applyBundleGeometryPart(bundle, this.geometry, sn);
            else triangles += bundle.applyGeometryPart(this.geometry, sn);
        }
        return triangles;
    }

    /**
     * 渲染
     * @param context 
     * @param command 
     * @param bundle 
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle) {
        let triangles = 0;
        if (!this.geometry.checkDataFormat) {
            this._changeDataFormat(); //转换数据格式
            this.geometry.checkDataFormat = true;
        }
        //如果command和bundle都是null，则只上传shaderData数据，不执行bindGroup操作
        if (this.isRender && this.skinnedData) {
            let stateKey;
            for (let i = 0; i < this._passNum; i++) {
                const index = this._passIndex[i];
                const shaderInstance = this._shaderInstance[i];
                if (shaderInstance && shaderInstance.complete) {
                    if (WebGPUGlobal.useCache) { //启用缓存机制
                        let pipeline: GPURenderPipeline;
                        stateKey = this._calcStateKey(shaderInstance, context.destRT, context);
                        if (this._stateKey !== stateKey) {
                            this._stateKey = stateKey;
                            pipeline = this._pipeline = WebGPURenderElement3D._pipelineCacheMap.get(stateKey);
                        } else pipeline = this._pipeline;
                        if (!pipeline) {
                            this._createPipeline(index, context, shaderInstance, command, bundle, stateKey); //新建渲染管线
                            pipeline = this._pipeline;
                        }
                        else { //缓存命中
                            if (command) {
                                if (WebGPUGlobal.useGlobalContext)
                                    WebGPUContext.setCommandPipeline(command, pipeline);
                                else command.setPipeline(pipeline);
                            }
                            if (bundle) {
                                if (WebGPUGlobal.useGlobalContext)
                                    WebGPUContext.setBundlePipeline(bundle, pipeline);
                                else bundle.setPipeline(pipeline);
                            }
                        }
                    } else this._createPipeline(index, context, shaderInstance, command, bundle); //不启用缓存机制
                    if (!this.skinnedData || this.skinnedData.length == 0) {
                        if (command || bundle)
                            this._bindGroup(shaderInstance, command, bundle); //绑定资源组
                        this._uploadUniform(); //上传uniform数据
                        triangles += this._uploadGeometry(command, bundle); //上传几何数据
                    } else {
                        for (let j = 0, len = this.skinnedData.length; j < len; j++) {
                            this.renderShaderDatas[j]?.setBuffer(SkinnedMeshSprite3D.BONES, this.skinnedData[j]);
                            if (command || bundle)
                                this._bindGroupEx(shaderInstance, command, bundle, j); //绑定资源组
                            this._uploadUniformEx(j); //上传uniform数据
                            triangles += this._uploadGeometryEx(command, bundle, j); //上传几何数据
                        }
                    }
                }
            }
        }
        return triangles;
    }
}