import { Laya } from "../../../../Laya";
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
    bindGroup: WebGPUBindGroup;
    dynamicOffsetsData: Uint32Array;

    constructor(bindGroup: WebGPUBindGroup, dynamicOffsetsData: Uint32Array) {
        this.bindGroup = bindGroup;
        this.dynamicOffsetsData = dynamicOffsetsData;
    }

    equal(bindGroup: WebGPUBindGroup, dynamicOffsetsData?: Uint32Array, dynamicOffsetsDataStart?: number, dynamicOffsetsDataLength?: number): boolean {
        if (this.bindGroup !== bindGroup) return false;
        if (dynamicOffsetsData && this.dynamicOffsetsData) {
            if (dynamicOffsetsDataStart === undefined) dynamicOffsetsDataStart = 0;
            if (dynamicOffsetsDataLength === undefined) dynamicOffsetsDataLength = dynamicOffsetsData.length;
            for (let i = 0; i < dynamicOffsetsDataLength; i++) {
                if (this.dynamicOffsetsData[i + dynamicOffsetsDataStart] !== dynamicOffsetsData[i]) return false;
            }
        } else if (dynamicOffsetsData || this.dynamicOffsetsData) {
            return false;
        }

        return true;
    }

    destroy() {
        this.bindGroup = null;
        this.dynamicOffsetsData = null;
    }
};

export abstract class WebGPURenderEncoder {

    readonly isBundle: boolean = false;

    encoder: IGPURenderEncoder;

    protected currentBindGroups: Map<number, BindGroupBindingInfo> = new Map();

    constructor(isBundle: boolean = false) {
        this.isBundle = isBundle;
    }

    /**
    * 设置渲染管线
    * @param pipeline 
    */
    setPipeline(pipeline: GPURenderPipeline) {
        this.encoder.setPipeline(pipeline);
    }

    /**
    * 设置绑定组
    * @param index 
    * @param bindGroup 
    * @param dynamicOffsets 
    */
    setBindGroup(index: GPUIndex32, bindGroup: WebGPUBindGroup) {

        if (this.currentBindGroups.has(index)) {
            const bindGroupInfo = this.currentBindGroups.get(index);
            if (bindGroupInfo.equal(bindGroup)) {
                return; //如果绑定组相同，则不需要重新设置
            }
        }

        this.encoder.setBindGroup(index, bindGroup.gpuRS);

        this.currentBindGroups.set(index, new BindGroupBindingInfo(bindGroup, null));
    }

    setBindGroupByDataOffaset(index: GPUIndex32, bindGroup: WebGPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {

        if (this.currentBindGroups.has(index)) {
            const bindGroupInfo = this.currentBindGroups.get(index);
            if (bindGroupInfo.equal(bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength)) {
                return; //如果绑定组和动态偏移数据相同，则不需要重新设置
            }
        }

        this.encoder.setBindGroup(index, bindGroup.gpuRS, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);

        {
            const dynamicOffsets = new Uint32Array(dynamicOffsetsDataLength);
            for (let i = 0; i < dynamicOffsetsDataLength; i++) {
                dynamicOffsets[i] = dynamicOffsetsData[i + dynamicOffsetsDataStart];
            }
            this.currentBindGroups.set(index, new BindGroupBindingInfo(bindGroup, dynamicOffsets));
        }

    }

    applyGeometry(geometry: WebGPURenderGeometry) {
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
                for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                    count = _drawArrayInfo[i].count;
                    start = _drawArrayInfo[i].start;
                    triangles += count - 2;
                    this.encoder.draw(count, 1, start, 0);
                }
                break;
            case DrawType.DrawElement:
                for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                    count = _drawElementInfo[i].elementCount;
                    start = _drawElementInfo[i].elementStart;
                    triangles += count / 3;
                    this.encoder.drawIndexed(count, 1, start / indexByte, 0);
                }
                break;
            case DrawType.DrawArrayInstance:
                for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                    count = _drawArrayInfo[i].count;
                    start = _drawArrayInfo[i].start;
                    triangles += (count - 2) * instanceCount;
                    this.encoder.draw(count, instanceCount, start, 0);
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                }
                break;
            case DrawType.DrawElementInstance:
                for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                    count = _drawElementInfo[i].elementCount;
                    start = _drawElementInfo[i].elementStart;
                    triangles += count / 3 * instanceCount;
                    this.encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                    WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                }
                break;
            case DrawType.DrawArrayIndirect:
                for (let i = _drawIndirectInfo.length - 1; i > -1; i--) {
                    this.encoder.drawIndirect(_drawIndirectInfo[i].buffer.getNativeBuffer()._source, _drawIndirectInfo[i].offset);
                }
                WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, _drawIndirectInfo.length);
                break;
            case DrawType.DrawElementIndirect:
                for (let i = _drawIndirectInfo.length - 1; i > -1; i--) {
                    this.encoder.drawIndexedIndirect(_drawIndirectInfo[i].buffer.getNativeBuffer()._source, _drawIndirectInfo[i].offset);
                }
                WebGPURenderEngine._instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, _drawIndirectInfo.length);
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
            bindGroupInfo.destroy();
        }
        this.currentBindGroups.clear();
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
        this.currentBindGroups.clear();
        this.encoder.executeBundles(bundles);
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}