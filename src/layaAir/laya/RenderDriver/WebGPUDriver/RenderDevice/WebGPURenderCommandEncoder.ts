import { Laya } from "../../../../Laya";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

/**
 * GPU渲染指令编码器
 */
export class WebGPURenderCommandEncoder {
    private _commandEncoder: GPUCommandEncoder;
    private _engine: WebGPURenderEngine;
    private _device: GPUDevice;

    encoder: GPURenderPassEncoder;

    globalId: number;
    objectName: string = 'WebGPURenderCommandEncoder';

    constructor() {
        this._engine = WebGPURenderEngine._instance;
        this._device = this._engine.getDevice();

        this.globalId = WebGPUGlobal.getId(this);
    }

    startRender(renderPassDesc: GPURenderPassDescriptor) {
        this._commandEncoder = this._device.createCommandEncoder();
        this.encoder = WebGPUGlobal.useTimeQuery ?
            this._engine.timingManager.getTimingHelper(Laya.timer.currFrame).beginRenderPass(this._commandEncoder, renderPassDesc) :
            this._commandEncoder.beginRenderPass(renderPassDesc);
    }

    setPipeline(pipeline: GPURenderPipeline) {
        this.encoder.setPipeline(pipeline);
    }

    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, byteSize: number, offset: number = 0) {
        this.encoder.setIndexBuffer(buffer, indexFormat, offset, byteSize);
    }

    setVertexBuffer(slot: number, buffer: GPUBuffer, offset: number = 0, size: number = 0) {
        this.encoder.setVertexBuffer(slot, buffer, offset, size);
    }

    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64) {
        //TODO
    }

    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64) {
        //TODO
    }

    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: Iterable<GPUBufferDynamicOffset>) {
        this.encoder.setBindGroup(index, bindGroup, dynamicOffsets);
    }

    setBindGroupByDataOffaset(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {
        this.encoder.setBindGroup(index, bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);
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
        return this._commandEncoder.finish();
    }

    /**
     * 执行缓存绘图指令
     * @param bundles 
     */
    playBundle(bundles: GPURenderBundle[]) {
        this.encoder.executeBundles(bundles);
    }

    /**
     * 上传几何数据
     * @param geometry 
     * @param setBuffer 
     */
    applyGeometry(geometry: WebGPURenderGeometry, setBuffer: boolean = true) {
        //解构geometry中的属性，减少代码重复
        const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo } = geometry;
        const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;

        let indexByte = 2; //index的字节数
        if (setBuffer) {
            vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
            if (indexBuffer) {
                indexByte = geometry.gpuIndexByte;
                this.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, indexBuffer.source._size, 0);
            }
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
                    this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                }
                break;
            case DrawType.DrawElementInstance:
                for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                    count = _drawElementInfo[i].elementCount;
                    start = _drawElementInfo[i].elementStart;
                    triangles += count / 3 * instanceCount;
                    this.encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                    this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                }
                break;
        }
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount, triangles);
        return triangles;
    }

    /**
     * 上传几何数据
     * @param geometry 
     * @param part 
     * @param setBuffer 
     */
    applyGeometryPart(geometry: WebGPURenderGeometry, part: number, setBuffer: boolean = true) {
        //解构geometry中的属性，减少代码重复
        const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo } = geometry;
        const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;

        let indexByte = 2; //index的字节数
        if (setBuffer) {
            vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
            if (indexBuffer) {
                indexByte = geometry.gpuIndexByte;
                this.setIndexBuffer(indexBuffer.source._source, geometry.gpuIndexFormat, indexBuffer.source._size, 0);
            }
        }

        //绘制的三角形数量
        let triangles = 0;

        //根据不同的数据类型绘制
        let count = 0, start = 0;
        switch (drawType) {
            case DrawType.DrawArray:
                count = _drawArrayInfo[part].count;
                start = _drawArrayInfo[part].start;
                triangles = count - 2;
                this.encoder.draw(count, 1, start, 0);
                break;
            case DrawType.DrawElement:
                count = _drawElementInfo[part].elementCount;
                start = _drawElementInfo[part].elementStart;
                triangles = count / 3;
                this.encoder.drawIndexed(count, 1, start / indexByte, 0);
                break;
            case DrawType.DrawArrayInstance:
                count = _drawArrayInfo[part].count;
                start = _drawArrayInfo[part].start;
                triangles = (count - 2) * instanceCount;
                this.encoder.draw(count, instanceCount, start, 0);
                this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                break;
            case DrawType.DrawElementInstance:
                count = _drawElementInfo[part].elementCount;
                start = _drawElementInfo[part].elementStart;
                triangles = count / 3 * instanceCount;
                this.encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                break;
        }
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount, triangles);
        return triangles;
    }

    /**
     * 销毁
     */
    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}