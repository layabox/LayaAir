import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { WebGPUBindGroup } from "./WebGPUBindGroupCache";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export interface IGPURenderEncoder extends GPUObjectBase,
    GPUCommandsMixin,
    GPUDebugCommandsMixin,
    GPUBindingCommandsMixin,
    GPURenderCommandsMixin {

}

class BindGroupBindingInfo {
    private _bindGroup: WebGPUBindGroup;
    public get bindGroup(): WebGPUBindGroup {
        if (this.active) {
            return this._bindGroup;
        }
        else {
            return null;
        }
    }

    private _dynamicOffsetsData: Uint32Array;

    public get dynamicOffsetsData(): Uint32Array {
        return this._dynamicOffsetsData;
    }

    private _active: boolean = true;
    public get active(): boolean {
        return this._active;
    }

    private hasDynamicOffsets: boolean = false;

    constructor(bindGroup: WebGPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {
        this.update(bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);
    }

    update(bindGroup: WebGPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {
        this._active = true;

        this._bindGroup = bindGroup;

        if (dynamicOffsetsData) {
            this.hasDynamicOffsets = true;

            if (dynamicOffsetsDataStart === undefined) dynamicOffsetsDataStart = 0;
            if (dynamicOffsetsDataLength === undefined) dynamicOffsetsDataLength = dynamicOffsetsData.length - dynamicOffsetsDataStart;

            if (this._dynamicOffsetsData) {
                if (this._dynamicOffsetsData.byteLength >= dynamicOffsetsDataLength * Uint32Array.BYTES_PER_ELEMENT) {
                    this._dynamicOffsetsData = new Uint32Array(this._dynamicOffsetsData.buffer, 0, dynamicOffsetsDataLength);
                }
                else {
                    this._dynamicOffsetsData = new Uint32Array(dynamicOffsetsDataLength);
                }
            }
            else {
                this._dynamicOffsetsData = new Uint32Array(dynamicOffsetsDataLength);
            }

            for (let i = 0; i < dynamicOffsetsDataLength; i++) {
                this._dynamicOffsetsData[i] = dynamicOffsetsData[i + dynamicOffsetsDataStart];
            }

        }
        else {
            this.hasDynamicOffsets = false;
        }

    }

    equal(bindGroup: WebGPUBindGroup, dynamicOffsetsData?: Uint32Array, dynamicOffsetsDataStart?: number, dynamicOffsetsDataLength?: number): boolean {
        if (this.bindGroup !== bindGroup) return false;
        if (dynamicOffsetsData && this.dynamicOffsetsData && this.hasDynamicOffsets) {
            if (dynamicOffsetsDataStart === undefined) dynamicOffsetsDataStart = 0;
            if (dynamicOffsetsDataLength === undefined) dynamicOffsetsDataLength = dynamicOffsetsData.length;
            for (let i = 0; i < dynamicOffsetsDataLength; i++) {
                if (this.dynamicOffsetsData[i + dynamicOffsetsDataStart] !== dynamicOffsetsData[i]) return false;
            }
        } else if (dynamicOffsetsData || this.hasDynamicOffsets) {
            return false;
        }

        return true;
    }

    clear() {
        this._active = false;
        this._bindGroup = null;
        this.hasDynamicOffsets = false;
    }

    destroy() {
        this.clear();
        this._dynamicOffsetsData = null;
    }
};

export abstract class WebGPURenderEncoder {

    readonly isBundle: boolean = false;

    encoder: IGPURenderEncoder;

    protected currentBindGroups: Map<number, BindGroupBindingInfo> = new Map();

    protected currentPipeline: GPURenderPipeline = null;

    constructor(isBundle: boolean = false) {
        this.isBundle = isBundle;
    }

    /**
    * 设置渲染管线
    * @param pipeline 
    */
    setPipeline(pipeline: GPURenderPipeline) {
        if (this.currentPipeline && this.currentPipeline === pipeline) {
            return; //如果管线相同，则不需要重新设置
        }

        this.encoder.setPipeline(pipeline);
        this.currentPipeline = pipeline;
    }

    /**
    * 设置绑定组
    * @param index 
    * @param bindGroup
    */
    setBindGroup(index: GPUIndex32, bindGroup: WebGPUBindGroup) {

        if (this.currentBindGroups.has(index)) {
            const bindGroupInfo = this.currentBindGroups.get(index);
            if (bindGroupInfo.equal(bindGroup)) {
                return; //如果绑定组相同，则不需要重新设置
            }
        }

        this.encoder.setBindGroup(index, bindGroup.gpuRS);

        if (this.currentBindGroups.has(index)) {
            let info = this.currentBindGroups.get(index);
            info.update(bindGroup, null, null, null);
        }
        else {
            let info = new BindGroupBindingInfo(bindGroup, null, null, null);
            this.currentBindGroups.set(index, info);
        }

    }

    setBindGroupByDataOffaset(index: GPUIndex32, bindGroup: WebGPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {

        if (this.currentBindGroups.has(index)) {
            const bindGroupInfo = this.currentBindGroups.get(index);
            if (bindGroupInfo.equal(bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength)) {
                return; //如果绑定组和动态偏移数据相同，则不需要重新设置
            }
        }

        this.encoder.setBindGroup(index, bindGroup.gpuRS, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);


        if (this.currentBindGroups.has(index)) {
            let info = this.currentBindGroups.get(index);
            info.update(bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);

        }
        else {
            this.currentBindGroups.set(index, new BindGroupBindingInfo(bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength));
        }


    }

    applyGeometry(geometry: WebGPURenderGeometry) {
        let triangles1 = geometry.applyToEncoder(this.encoder)
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount, triangles1);
        return triangles1;

        //解构geometry中的属性，减少代码重复
        //const { bufferState, drawType, instanceCount, _drawArrayInfo, _drawElementInfo, _drawIndirectInfo } = geometry;
        //const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;
        const bufferState = geometry.bufferState;
        const drawType = geometry.drawType;

        const indexBuffer = bufferState._bindedIndexBuffer;

        let indexByte = 2; //index的字节数

        let vb0 = bufferState.vb0;
        let enc = this.encoder;
        if (vb0) {
            let vb = vb0.source;
            enc.setVertexBuffer(0, vb._source, 0, vb._size)
        } else {
            const vertexBuffers = bufferState._vertexBuffers;
            let vbCnt = vertexBuffers.length;
            for (let i = 0; i < vbCnt; i++) {
                let vb = vertexBuffers[i].source;
                enc.setVertexBuffer(i, vb._source, 0, vb._size)
            }
        }
        if (indexBuffer) {
            indexByte = geometry.gpuIndexByte;
            enc.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, 0, indexBuffer.source._size);
        }

        //绘制的三角形数量
        let triangles = 0;

        //根据不同的数据类型绘制
        let count = 0, start = 0;
        switch (drawType) {
            case DrawType.DrawArray:
                {
                    let _drawArrayInfo = geometry._drawArrayInfo;
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        count = _drawArrayInfo[i].count;
                        start = _drawArrayInfo[i].start;
                        triangles += count - 2;
                        enc.draw(count, 1, start, 0);
                    }
                }
                break;
            case DrawType.DrawElement:
                {
                    let info0 = geometry._drawElementInfo0;
                    if (info0) {
                        count = info0.elementCount;
                        enc.drawIndexed(count, 1, info0.elementStart / indexByte, 0);
                        triangles += count / 3;
                    } else {
                        let _drawElementInfo = geometry._drawElementInfo;
                        for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                            let info = _drawElementInfo[i];
                            count = info.elementCount;
                            enc.drawIndexed(count, 1, info.elementStart / indexByte, 0);
                            triangles += count / 3;
                        }
                    }
                }
                break;
            case DrawType.DrawArrayInstance:
                {
                    let _drawArrayInfo = geometry._drawArrayInfo;
                    const instanceCount = geometry.instanceCount;
                    for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                        let info = _drawArrayInfo[i];
                        count = info.count;
                        start = info.start;
                        triangles += (count - 2) * instanceCount;
                        enc.draw(count, instanceCount, start, 0);
                        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                }
                break;
            case DrawType.DrawElementInstance:
                {
                    let _drawElementInfo = geometry._drawElementInfo;
                    const instanceCount = geometry.instanceCount;
                    for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                        count = _drawElementInfo[i].elementCount;
                        start = _drawElementInfo[i].elementStart;
                        triangles += count / 3 * instanceCount;
                        enc.drawIndexed(count, instanceCount, start / indexByte, 0);
                        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    }
                }
                break;
            case DrawType.DrawArrayIndirect:
                {
                    let _drawIndirectInfo = geometry._drawIndirectInfo;
                    for (let i = _drawIndirectInfo.length - 1; i > -1; i--) {
                        enc.drawIndirect(_drawIndirectInfo[i].buffer.getNativeBuffer()._source, _drawIndirectInfo[i].offset);
                    }
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, _drawIndirectInfo.length);
                }
                break;
            case DrawType.DrawElementIndirect:
                {
                    let _drawIndirectInfo = geometry._drawIndirectInfo;
                    for (let i = _drawIndirectInfo.length - 1; i > -1; i--) {
                        enc.drawIndexedIndirect(_drawIndirectInfo[i].buffer.getNativeBuffer()._source, _drawIndirectInfo[i].offset);
                    }
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, _drawIndirectInfo.length);
                }
                break;
        }
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount, triangles);
        return triangles;
    }

    applyGeometryIndex(geometry: WebGPURenderGeometry, index: number) {

        //解构geometry中的属性，减少代码重复
        const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo, _drawIndirectInfo } = geometry;
        const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;

        let indexByte = 2; //index的字节数

        vertexBuffers.forEach((vb, i) => this.encoder.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
        if (indexBuffer) {
            indexByte = geometry.gpuIndexByte;
            this.encoder.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, 0, indexBuffer.source._size);
        }

        //绘制的三角形数量
        let triangles = 0;

        //根据不同的数据类型绘制
        let count = 0, start = 0;
        switch (drawType) {
            case DrawType.DrawArray:
                {
                    let info = _drawArrayInfo[index];
                    count = info.count;
                    start = info.start;
                    triangles += count - 2;
                    this.encoder.draw(count, 1, start, 0);
                    break;
                }
            case DrawType.DrawElement:
                {
                    let info = _drawElementInfo[index];
                    count = info.elementCount;
                    start = info.elementStart;
                    triangles += count / 3;
                    this.encoder.drawIndexed(count, 1, start / indexByte, 0);
                    break;
                }
            case DrawType.DrawArrayInstance:
                {
                    let info = _drawArrayInfo[index];
                    count = info.count;
                    start = info.start;
                    triangles += (count - 2) * instanceCount;
                    this.encoder.draw(count, instanceCount, start, 0);
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
                }
            case DrawType.DrawElementInstance:
                {
                    let info = _drawElementInfo[index];
                    count = info.elementCount;
                    start = info.elementStart;
                    triangles += count / 3 * instanceCount;
                    this.encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
                }
            case DrawType.DrawArrayIndirect:
                {
                    let info = _drawIndirectInfo[index];
                    this.encoder.drawIndirect(info.buffer.getNativeBuffer()._source, info.offset);
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
                }
            case DrawType.DrawElementIndirect:
                {
                    let info = _drawIndirectInfo[index];
                    this.encoder.drawIndexedIndirect(info.buffer.getNativeBuffer()._source, info.offset);
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                    break;
                }
        }
        WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount, triangles);
        return triangles;
    }

    protected onFinish() {
        for (let bindGroupInfo of this.currentBindGroups.values()) {
            bindGroupInfo.clear();
        }
        this.currentPipeline = null;
    }

    abstract finish(lable: string): any;
}

/**
 * GPU渲染指令编码器
 */
export class WebGPURenderCommandEncoder extends WebGPURenderEncoder {
    private _engine: WebGPURenderEngine;
    private _device: GPUDevice;
    encoder: GPURenderPassEncoder;//渲染通道编码器
    private _commandEncoder: GPUCommandEncoder;

    renderPassDesc: GPURenderPassDescriptor;

    constructor() {
        super();
        this._engine = WebGPURenderEngine._instance;
        this._device = this._engine.getDevice();
    }

    startRender(renderPassDesc: GPURenderPassDescriptor) {
        this._commandEncoder = this._device.createCommandEncoder();
        this.encoder = this._commandEncoder.beginRenderPass(renderPassDesc);
        this.renderPassDesc = renderPassDesc;
    }

    setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number) {
        this.encoder.setViewport(x, y, width, height, minDepth, maxDepth);
    }

    setScissorRect(x: GPUIntegerCoordinate, y: GPUIntegerCoordinate, width: GPUIntegerCoordinate, height: GPUIntegerCoordinate) {
        this.encoder.setScissorRect(x, y, width, height);
    }

    setStencilReference(ref: number) {
        this.encoder.setStencilReference(ref);
    }

    end() {
        this.encoder.end();
    }

    finish() {
        this.onFinish();
        this.renderPassDesc = null;
        return this._commandEncoder.finish();
    }

    /**
     * 执行缓存绘图指令
     * @param bundles 
     */
    excuteBundle(bundles: GPURenderBundle[]) {
        this.currentBindGroups.forEach((info, index) => {
            info.clear();
        });
        this.currentPipeline = null;
        this.encoder.executeBundles(bundles);
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}