import { RenderableSprite3D } from "../../../d3/core/RenderableSprite3D";
import { SkinnedMeshSprite3D } from "../../../d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "../../../d3/core/Sprite3D";
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
export class WebGPUSkinRenderElement3D extends WebGPURenderElement3D {
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
            this.renderShaderDatas = [];
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
        if (command) {
            if (WebGPUGlobal.useGlobalContext)
                WebGPUContext.applyCommandGeometryPart(command, this.geometry, sn);
            else command.applyGeometryPart(this.geometry, sn);
        }
        if (bundle) {
            if (WebGPUGlobal.useGlobalContext)
                WebGPUContext.applyBundleGeometryPart(bundle, this.geometry, sn);
            else bundle.applyGeometryPart(this.geometry, sn);
        }
    }

    /**
     * 转换数据格式
     */
    private _changeDataFormat() {
        const bufferState = this.geometry.bufferState;
        for (let i = 0; i < bufferState._vertexBuffers.length; i++) {
            const vb = bufferState._vertexBuffers[i];
            const vs = bufferState.vertexState[i];
            let attrOld = [], attrNew = [];
            const attributes = vs.attributes as [];
            const attrLen = attributes.length;
            for (let j = 0; j < attrLen; j++) {
                const attr = attributes[j] as GPUVertexAttribute;
                attrOld.push({
                    offset: attr.offset,
                    format: attr.format,
                });
            }
            for (let j = 0; j < attrLen; j++) {
                const attr = attributes[j] as GPUVertexAttribute;
                if (attr.format === 'uint8x4') {
                    attr.format = 'float32x4';
                    for (let k = 0; k < attrLen; k++) {
                        const attr2 = attributes[k] as GPUVertexAttribute;
                        if (attr2.offset > attr.offset)
                            attr2.offset += 12;
                        attrNew.push({
                            offset: attr2.offset,
                            format: attr2.format,
                        });
                    }
                    bufferState.updateBufferLayoutFlag++;
                    const strideOld = vs.arrayStride;
                    const vertexCount = vb.buffer.byteLength / vs.arrayStride;
                    vs.arrayStride += 12;
                    const strideNew = vs.arrayStride;
                    const buffer = vb.buffer;
                    vb.buffer = new ArrayBuffer(vs.arrayStride * vertexCount);
                    const src_ui8 = new Uint8Array(buffer);
                    const src_f32 = new Float32Array(buffer);
                    const dst_ui8 = new Uint8Array(vb.buffer);
                    const dst_f32 = new Float32Array(vb.buffer);
                    let src_ui8_off1 = 0;
                    let src_f32_off1 = 0;
                    let dst_ui8_off1 = 0;
                    let dst_f32_off1 = 0;
                    let src_ui8_off2 = 0;
                    let src_f32_off2 = 0;
                    let dst_ui8_off2 = 0;
                    let dst_f32_off2 = 0;
                    //拷贝数据（按照新的数据布局）
                    for (let k = 0; k < vertexCount; k++) {
                        src_ui8_off1 = k * strideOld;
                        src_f32_off1 = k * strideOld / 4;
                        dst_ui8_off1 = k * strideNew;
                        dst_f32_off1 = k * strideNew / 4;
                        for (let l = 0; l < attrLen; l++) {
                            if (attrOld[l].format === 'uint8x4') {
                                if (l === j) {
                                    src_ui8_off2 = src_ui8_off1 + attrOld[l].offset;
                                    dst_f32_off2 = dst_f32_off1 + attrNew[l].offset / 4;
                                    for (let m = 0; m < 4; m++)
                                        dst_f32[dst_f32_off2 + m] = src_ui8[src_ui8_off2 + m];
                                } else {
                                    src_ui8_off2 = src_ui8_off1 + attrOld[l].offset;
                                    dst_ui8_off2 = dst_ui8_off1 + attrNew[l].offset;
                                    for (let m = 0; m < 4; m++)
                                        dst_ui8[dst_ui8_off2 + m] = src_ui8[src_ui8_off2 + m];
                                }
                            } else {
                                src_f32_off2 = src_f32_off1 + attrOld[l].offset / 4;
                                dst_f32_off2 = dst_f32_off1 + attrNew[l].offset / 4;
                                for (let m = 0; m < 4; m++)
                                    dst_f32[dst_f32_off2 + m] = src_f32[src_f32_off2 + m];
                            }
                        }
                    }
                    vb.source = new WebGPUBuffer(vb.source._usage, vs.arrayStride * vertexCount);
                    vb.source.setData(vb.buffer, 0);
                    attrOld = attrNew;
                    attrNew = [];
                }
            }
            vb.buffer = null;
        }
    }

    /**
     * 渲染
     * @param context 
     * @param command 
     * @param bundle 
     */
    _render(context: WebGPURenderContext3D, command: WebGPURenderCommandEncoder, bundle: WebGPURenderBundle) {
        if (!this.geometry.skinIndicesDone) {
            this._changeDataFormat(); //转换数据格式
            this.geometry.skinIndicesDone = true;
        }
        //如果command和bundle都是null，则只上传shaderData数据，不执行bindGroup操作
        if (this.isRender && this.skinnedData) {
            // if (this._cameraData && this.renderShaderData) {
            //     if (this.renderShaderData.getColor(RenderableSprite3D.AMBIENTCOLOR))
            //         this._cameraData.setColor(RenderableSprite3D.AMBIENTCOLOR, this.renderShaderData.getColor(RenderableSprite3D.AMBIENTCOLOR));
            //     if (this.renderShaderData.getNumber(RenderableSprite3D.AMBIENTINTENSITY))
            //         this._cameraData.setNumber(RenderableSprite3D.AMBIENTINTENSITY, this.renderShaderData.getNumber(RenderableSprite3D.AMBIENTINTENSITY));
            //     if (this.renderShaderData.getNumber(RenderableSprite3D.REFLECTIONINTENSITY))
            //         this._cameraData.setNumber(RenderableSprite3D.REFLECTIONINTENSITY, this.renderShaderData.getNumber(RenderableSprite3D.REFLECTIONINTENSITY));
            //     if (this.renderShaderData.getVector(Sprite3D.WORLDINVERTFRONT))
            //         this._cameraData.setVector(Sprite3D.WORLDINVERTFRONT, this.renderShaderData.getVector(Sprite3D.WORLDINVERTFRONT));
            // }
            let stateKey;
            for (let i = 0; i < this._passNum; i++) {
                const index = this._passIndex[i];
                const shaderInstance = this._shaderInstance[i];
                if (shaderInstance && shaderInstance.complete) {
                    if (WebGPUGlobal.useCache) { //启用缓存机制
                        if (this.materialShaderData)
                            stateKey = this._calcStateKey(shaderInstance, context.destRT, context);
                        else stateKey = this._stateKey[index];
                        if (stateKey != this._stateKey[index] || !this._pipelineCache[index]) //缓存未命中
                            this._createPipeline(index, context, shaderInstance, command, bundle, stateKey); //新建渲染管线
                        else { //缓存命中
                            if (command) {
                                if (WebGPUGlobal.useGlobalContext)
                                    WebGPUContext.setCommandPipeline(command, this._pipelineCache[index]);
                                else command.setPipeline(this._pipelineCache[index]);
                            }
                            if (bundle) {
                                if (WebGPUGlobal.useGlobalContext)
                                    WebGPUContext.setBundlePipeline(bundle, this._pipelineCache[index]);
                                else bundle.setPipeline(this._pipelineCache[index]);
                            }
                        }
                    } else this._createPipeline(index, context, shaderInstance, command, bundle); //不启用缓存机制
                    if (!this.skinnedData || this.skinnedData.length == 0) {
                        if (command || bundle)
                            this._bindGroup(shaderInstance, command, bundle); //绑定资源组
                        this._uploadUniform(); //上传uniform数据
                        this._uploadGeometry(command, bundle); //上传几何数据
                    } else {
                        for (let j = 0, len = this.skinnedData.length; j < len; j++) {
                            this.renderShaderDatas[j]?.setBuffer(SkinnedMeshSprite3D.BONES, this.skinnedData[j]);
                            if (command || bundle)
                                this._bindGroupEx(shaderInstance, command, bundle, j); //绑定资源组
                            this._uploadUniformEx(j); //上传uniform数据
                            this._uploadGeometryEx(command, bundle, j); //上传几何数据
                        }
                    }
                }
            }
        }
    }
}