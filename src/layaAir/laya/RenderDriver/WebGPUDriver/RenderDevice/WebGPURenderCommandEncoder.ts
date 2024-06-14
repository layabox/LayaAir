import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";

export class WebGPURenderCommandEncoder {
    _commandEncoder: GPUCommandEncoder;
    _encoder: GPURenderPassEncoder;
    _engine: WebGPURenderEngine;
    _device: GPUDevice;

    globalId: number;
    objectName: string = 'WebGPURenderCommandEncoder';

    constructor() {
        this._engine = WebGPURenderEngine._instance;
        this._device = this._engine.getDevice();

        this.globalId = WebGPUGlobal.getId(this);
    }

    startRender(renderPassDesc: GPURenderPassDescriptor): void {
        this._commandEncoder = this._device.createCommandEncoder();
        this._encoder = this._commandEncoder.beginRenderPass(renderPassDesc);
    }

    setPipeline(pipeline: GPURenderPipeline): void {
        this._encoder.setPipeline(pipeline);
    }

    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, byteSize: number, offset: number = 0): void {
        this._encoder.setIndexBuffer(buffer, indexFormat, offset, byteSize);
    }

    setVertexBuffer(slot: number, buffer: GPUBuffer, offset: number = 0, size: number = 0): void {
        this._encoder.setVertexBuffer(slot, buffer, offset, size);
    }

    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64) {
        //TODO
    }

    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64) {
        //TODO
    }

    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: Iterable<GPUBufferDynamicOffset>) {
        this._encoder.setBindGroup(index, bindGroup, dynamicOffsets);
    }

    setBindGroupByDataOffaset(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {
        this._encoder.setBindGroup(index, bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);
    }

    setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number) {
        this._encoder.setViewport(x, y, width, height, minDepth, maxDepth);
    }

    setScissorRect(x: GPUIntegerCoordinate, y: GPUIntegerCoordinate, width: GPUIntegerCoordinate, height: GPUIntegerCoordinate) {
        this._encoder.setScissorRect(x, y, width, height);
    }

    setStencilReference(ref: number) {
        this._encoder.setStencilReference(ref);
    }

    end() {
        this._encoder.end();
    }

    finish() {
        return this._commandEncoder.finish();
    }

    playBundle(bundles: GPURenderBundle[]) {
        this._encoder.executeBundles(bundles);
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

        let format: GPUIndexFormat = 'uint16';
        let indexByte = 2; //index的字节数

        if (setBuffer) {
            vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
            if (indexBuffer) {
                format = (indexFormat === IndexFormat.UInt16) ? 'uint16' : 'uint32';
                indexByte = (indexFormat === IndexFormat.UInt16) ? 2 : 4;
                this.setIndexBuffer(indexBuffer.source._source, format, indexBuffer.source._size, 0);
            }
        }

        //绘制的三角形数量
        let triangles = 0;

        //根据不同的数据类型绘制
        switch (drawType) {
            case DrawType.DrawArray:
                _drawArrayInfo.forEach(({ count, start }) => {
                    triangles += count - 2;
                    this._encoder.draw(count, 1, start, 0);
                });
                break;
            case DrawType.DrawElement:
                _drawElementInfo.forEach(({ elementCount, elementStart }) => {
                    triangles += elementCount / 3;
                    this._encoder.drawIndexed(elementCount, 1, elementStart / indexByte, 0);
                });
                break;
            case DrawType.DrawArrayInstance:
                _drawArrayInfo.forEach(({ count, start }) => {
                    triangles += (count - 2) * instanceCount;
                    this._encoder.draw(count, instanceCount, start, 0);
                    this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                });
                break;
            case DrawType.DrawElementInstance:
                _drawElementInfo.forEach(({ elementCount, elementStart }) => {
                    triangles += elementCount / 3 * instanceCount;
                    this._encoder.drawIndexed(elementCount, instanceCount, elementStart / indexByte, 0);
                    this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                });
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

        let format: GPUIndexFormat = 'uint16';
        let indexByte = 2; //index的字节数
        if (setBuffer) {
            vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
            if (indexBuffer) {
                format = (indexFormat === IndexFormat.UInt16) ? 'uint16' : 'uint32';
                indexByte = (indexFormat === IndexFormat.UInt16) ? 2 : 4;
                this.setIndexBuffer(indexBuffer.source._source, format, indexBuffer.source._size, 0);
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
                this._encoder.draw(count, 1, start, 0);
                break;
            case DrawType.DrawElement:
                count = _drawElementInfo[part].elementCount;
                start = _drawElementInfo[part].elementStart;
                triangles = count / 3;
                this._encoder.drawIndexed(count, 1, start / indexByte, 0);
                break;
            case DrawType.DrawArrayInstance:
                count = _drawArrayInfo[part].count;
                start = _drawArrayInfo[part].start;
                triangles = (count - 2) * instanceCount;
                this._encoder.draw(count, instanceCount, start, 0);
                this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                break;
            case DrawType.DrawElementInstance:
                count = _drawElementInfo[part].elementCount;
                start = _drawElementInfo[part].elementStart;
                triangles = count / 3 * instanceCount;
                this._encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
                this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                break;
        }
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_TriangleCount, triangles);
        return triangles;
    }

    destroy() {
        WebGPUGlobal.releaseId(this);
    }
}