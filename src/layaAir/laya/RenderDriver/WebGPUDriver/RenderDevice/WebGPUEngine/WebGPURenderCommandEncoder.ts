
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { LayaGL } from "../../../../layagl/LayaGL";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { WGPURenderPipeline } from "../WebGPUOBJ/WebGPURenderPipelineHelper";
import { WebGPUBuffer } from "./WebGPUBuffer";
import { WebGPUEngine } from "./WebGPUEngine";

export class WebGPURenderCommandEncoder {
    /**
     * command Encoder
     */
    commandEncoder: GPUCommandEncoder;
    /**
     * if Render has RenderEncoder
     */
    renderpassEncoder: GPURenderPassEncoder;
    /**
     * engine
     */
    engine: WebGPUEngine;
    /**
     * pipeline
     */
    curpipeline: WGPURenderPipeline;
    curGeometry: IRenderGeometryElement;

    cachemap: { [key: number]: GPUBindGroup } = {};
    obb: any;

    constructor() {
        this.engine = LayaGL.renderEngine as WebGPUEngine;
        //test
        //this.obb = this.testPrimitive();
    }

    /**
     * crate Render CommandEncoder
     * @param renderpassDes 
     */
    startRender(renderpassDes: GPURenderPassDescriptor): void {
        this.commandEncoder = this.engine._device.createCommandEncoder();
        this.renderpassEncoder = this.commandEncoder.beginRenderPass(renderpassDes);
        this.curpipeline = null;
        this.curGeometry = null;
        this.cachemap = {};
    }

    //RenderCommand
    setPipeline(pipeline: WGPURenderPipeline) {
        if (pipeline != this.curpipeline) {
            this.renderpassEncoder.setPipeline(pipeline.pipeline);
            this.curpipeline = pipeline;
        }
    }

    /**
     * draw
     * @param geometry 
     */
    applyGeometry(geometry: IRenderGeometryElement) {

        if (geometry != this.curGeometry) {
            this.curGeometry = geometry;
            let state = geometry.bufferState;
            let vertexbuffers = geometry.bufferState._vertexBuffers;
            let indexbuffer = geometry.bufferState._bindedIndexBuffer;
            for (let i = 0; i < vertexbuffers.length; i++) {
               // this.renderpassEncoder.setVertexBuffer(state.vertexlayout.VAElements[i][0].shaderLocation,
                    //(vertexbuffers[i]._glBuffer as WebGPUBuffer)._gpuBuffer);
                // this.renderpassEncoder.setVertexBuffer(state.vertexlayout.VAElements[i][0].shaderLocation,
                //     (this.obb as any).vb);
            }
            if (indexbuffer) {
                let format: GPUIndexFormat = (geometry.indexFormat == IndexFormat.UInt16) ? "uint16" : "uint32";
                //this.renderpassEncoder.setIndexBuffer((indexbuffer._glBuffer as WebGPUBuffer)._gpuBuffer, format);
                // let format: GPUIndexFormat = (geometry.indexFormat == IndexFormat.UInt16) ? "uint16" : "uint32";
                // this.renderpassEncoder.setIndexBuffer((this.obb as any).ib, format);
            }
        }
        let element = geometry.drawParams.elements;
        let length = geometry.drawParams.length;
        switch (geometry.drawType) {
            case DrawType.DrawArray:
                for (let i = 0; i < length; i += 2) {
                    this.renderpassEncoder.draw(element[i + 1], 1, element[i], 0);
                }
                break;
            case DrawType.DrawElement:
                for (let i = 0; i < length; i += 2) {
                    this.renderpassEncoder.drawIndexed(element[i + 1], 1, element[i]);
                }
                break;
            case DrawType.DrawArrayInstance:
                for (let i = 0; i < length; i += 2) {
                    //instance offset TODO
                    this.renderpassEncoder.draw(element[i + 1], geometry.instanceCount, element[i]);
                }
                break;
            case DrawType.DrawElementInstance:
                for (let i = 0; i < length; i += 2) {
                    //instance offset TODO
                    this.renderpassEncoder.drawIndexed(element[i + 1], geometry.instanceCount, element[i], 0);
                }
                break;
        }
    }

    /**
     * 设置indexBuffer
     * @param buffer 
     * @param indexformat 
     * @param offset 
     * @param byteSize 
     */
    setIndexBuffer(buffer: WebGPUBuffer, indexformat: GPUIndexFormat, offset: number = 0, byteSize: number) {
        this.renderpassEncoder.setIndexBuffer(buffer._gpuBuffer, indexformat, offset, byteSize);
    }

    setVertexBuffer(slot: GPUIndex32, buffer: GPUBuffer, offset?: GPUSize64, size?: GPUSize64) {
        this.renderpassEncoder.setVertexBuffer(slot, buffer, offset, size);
    }

    drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64) {
        //TODO
    }

    drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64) {
        //TODO
    }

    //bindCommand
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: Iterable<GPUBufferDynamicOffset>) {
        if (this.cachemap[index] != bindGroup) {
            this.cachemap[index] = bindGroup;
            this.renderpassEncoder.setBindGroup(index, bindGroup);
        }
    }

    setBindGroupByDataOffaset(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsetsData: Uint32Array, dynamicOffsetsDataStart: GPUSize64, dynamicOffsetsDataLength: GPUSize32) {
        this.renderpassEncoder.setBindGroup(index, bindGroup, dynamicOffsetsData, dynamicOffsetsDataStart, dynamicOffsetsDataLength);
    }


    //common Command
    end() {
        this.renderpassEncoder.end();
    }

    setViewport(x: number, y: number, width: number, height: number, minDepth: number, maxDepth: number) {
        this.renderpassEncoder.setViewport(x, y, width, height, minDepth, maxDepth);
    }

    setScissorRect(x: GPUIntegerCoordinate, y: GPUIntegerCoordinate, width: GPUIntegerCoordinate, height: GPUIntegerCoordinate) {
        this.renderpassEncoder.setScissorRect(x, y, width, height);
    }

    setBlendConstant(color: GPUColor) {
        this.renderpassEncoder.setBlendConstant(color);
    }

    setStencilReference(reference: GPUStencilValue) {
        this.renderpassEncoder.setStencilReference(reference);
    }

    executeBundles(bundles: Iterable<GPURenderBundle>) {
        this.renderpassEncoder.executeBundles(bundles);//TODO
    }

    finish() {
        return this.commandEncoder.finish();
    }



    // testPrimitive() {
    //     let halfLong = 0.5;
    //     let halfHeight = 0.5;
    //     let halfWidth = 0.5;
    //     var vertices: Float32Array = new Float32Array([

    //         //上
    //         -halfLong, halfHeight, -halfWidth, 0, 1, 0, 0, 0, halfLong, halfHeight, -halfWidth, 0, 1, 0, 1, 0, halfLong, halfHeight, halfWidth, 0, 1, 0, 1, 1, -halfLong, halfHeight, halfWidth, 0, 1, 0, 0, 1,
    //         //下
    //         -halfLong, -halfHeight, -halfWidth, 0, -1, 0, 0, 1, halfLong, -halfHeight, -halfWidth, 0, -1, 0, 1, 1, halfLong, -halfHeight, halfWidth, 0, -1, 0, 1, 0, -halfLong, -halfHeight, halfWidth, 0, -1, 0, 0, 0,
    //         //左
    //         -halfLong, halfHeight, -halfWidth, -1, 0, 0, 0, 0, -halfLong, halfHeight, halfWidth, -1, 0, 0, 1, 0, -halfLong, -halfHeight, halfWidth, -1, 0, 0, 1, 1, -halfLong, -halfHeight, -halfWidth, -1, 0, 0, 0, 1,
    //         //右
    //         halfLong, halfHeight, -halfWidth, 1, 0, 0, 1, 0, halfLong, halfHeight, halfWidth, 1, 0, 0, 0, 0, halfLong, -halfHeight, halfWidth, 1, 0, 0, 0, 1, halfLong, -halfHeight, -halfWidth, 1, 0, 0, 1, 1,
    //         //前
    //         -halfLong, halfHeight, halfWidth, 0, 0, 1, 0, 0, halfLong, halfHeight, halfWidth, 0, 0, 1, 1, 0, halfLong, -halfHeight, halfWidth, 0, 0, 1, 1, 1, -halfLong, -halfHeight, halfWidth, 0, 0, 1, 0, 1,
    //         //后
    //         -halfLong, halfHeight, -halfWidth, 0, 0, -1, 1, 0, halfLong, halfHeight, -halfWidth, 0, 0, -1, 0, 0, halfLong, -halfHeight, -halfWidth, 0, 0, -1, 0, 1, -halfLong, -halfHeight, -halfWidth, 0, 0, -1, 1, 1]);

    //     var indices: Uint16Array = new Uint16Array([
    //         //上
    //         0, 1, 2, 2, 3, 0,
    //         //下
    //         4, 7, 6, 6, 5, 4,
    //         //左
    //         8, 9, 10, 10, 11, 8,
    //         //右
    //         12, 15, 14, 14, 13, 12,
    //         //前
    //         16, 17, 18, 18, 19, 16,
    //         //后
    //         20, 23, 22, 22, 21, 20]);
    //     let verticesBuffer = (LayaGL.renderEngine as WebGPUEngine)._device.createBuffer({
    //         size: vertices.buffer.byteLength,
    //         usage: GPUBufferUsage.VERTEX,
    //         mappedAtCreation: true,
    //     })
    //     new Float32Array(verticesBuffer.getMappedRange()).set(vertices);
    //     verticesBuffer.unmap();

    //     const indexBuffer =  (LayaGL.renderEngine as WebGPUEngine)._device.createBuffer({
    //         size: indices.buffer.byteLength,
    //         usage: GPUBufferUsage.INDEX,
    //         mappedAtCreation: true,
    //       });

    //      const mapping = new Uint16Array(indexBuffer.getMappedRange()).set(indices);
    //     indexBuffer.unmap();

    //     let ob = {vb:verticesBuffer,ib:indexBuffer};
    //     return ob;
    // }

}