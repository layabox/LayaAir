import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { WebGPURenderEngine } from "./WebGPURenderEngine";
import { WebGPURenderGeometry } from "./WebGPURenderGeometry";

export class WebGPURenderCommandEncoder {
    /**
     * command Encoder
     */
    _commandEncoder: GPUCommandEncoder;
    _encoder: GPURenderPassEncoder;
    _engine: WebGPURenderEngine;
    _cacheBindGroupMap: { [key: number]: GPUBindGroup } = {}; //Cache方案TODO
    _device: GPUDevice;
    /**
     * pipeline
     */
    curPipeline: GPURenderPipeline;
    curGeometry: WebGPURenderGeometry;
    //bindGroup cache TODO
    constructor() {
        this._engine = WebGPURenderEngine._instance;
        this._device = this._engine.getDevice();
    }

    startRender(renderpassDes: GPURenderPassDescriptor): void {
        this._commandEncoder = this._device.createCommandEncoder();
        this._encoder = this._commandEncoder.beginRenderPass(renderpassDes);
    }

    setPipeline(pipeline: GPURenderPipeline): void {
        if (pipeline != this.curPipeline) {
            this._encoder.setPipeline(pipeline);
            this.curPipeline = pipeline;
        }
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

    //bindCommand
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: Iterable<GPUBufferDynamicOffset>) {
        // if (this._cacheBindGroupMap[index] != bindGroup) {
        //     this._cacheBindGroupMap[index] = bindGroup;
        this._encoder.setBindGroup(index, bindGroup, dynamicOffsets);
        //}
    }

    //大buffer偏移方案
    setBindGroupByDataOffaset(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {
        this._encoder.setBindGroup(index, bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);
    }

    setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number) {
        this._encoder.setViewport(x, y, width, height, minDepth, maxDepth);
    }

    setScissorRect(x: GPUIntegerCoordinate, y: GPUIntegerCoordinate, width: GPUIntegerCoordinate, height: GPUIntegerCoordinate) {
        this._encoder.setScissorRect(x, y, width, height);
    }

    end() {
        this._encoder.end();
    }

    finish() {
        return this._commandEncoder.finish();
    }

    /**
    * draw
    * @param geometry 
    */
    applyGeometry(geometry: WebGPURenderGeometry) {
        if (geometry != this.curGeometry) {
            this.curGeometry = geometry;
            const vertexbuffers = geometry.bufferState._vertexBuffers;
            const indexbuffer = geometry.bufferState._bindedIndexBuffer;
            for (let i = 0; i < vertexbuffers.length; i++) {
                this.setVertexBuffer(i, vertexbuffers[i]._source._source, 0, vertexbuffers[i]._source._size);
            }
            if (indexbuffer) {
                const format: GPUIndexFormat = (geometry.indexFormat == IndexFormat.UInt16) ? "uint16" : "uint32";
                this.setIndexBuffer(indexbuffer._source._source, format, indexbuffer._source._size, 0);
            }
        }

        switch (geometry.drawType) {
            case DrawType.DrawArray:
                for (let i = 0, n = geometry._drawArrayInfo.length; i < n; i++) {
                    this._encoder.draw(geometry._drawArrayInfo[0].count, 1, geometry._drawArrayInfo[0].start, 0);
                }
                break;
            case DrawType.DrawElement:
                for (let i = 0, n = geometry._drawElementInfo.length; i < n; i++) {
                    this._encoder.drawIndexed(geometry._drawElementInfo[i].elementCount, 1, geometry._drawElementInfo[i].elementStart, 0);
                }
                break;
            case DrawType.DrawArrayInstance:
                for (let i = 0, n = geometry._drawArrayInfo.length; i < n; i++) {
                    //instance offset TODO
                    this._encoder.draw(geometry._drawArrayInfo[0].count, geometry.instanceCount, geometry._drawArrayInfo[0].start, 0);
                }
                break;
            case DrawType.DrawElementInstance:
                for (let i = 0; i < length; i += 2) {
                    //instance offset TODO
                    this._encoder.drawIndexed(geometry._drawElementInfo[i].elementCount, geometry.instanceCount, geometry._drawElementInfo[i].elementStart, 0);
                }
                break;
        }
    }
}