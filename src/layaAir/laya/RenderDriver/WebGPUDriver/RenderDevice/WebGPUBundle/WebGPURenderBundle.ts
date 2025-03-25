import { Laya } from "../../../../../Laya";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { GPUEngineStatisticsInfo } from "../../../../RenderEngine/RenderEnum/RenderStatInfo";
import { WebGPURenderContext3D } from "../../3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../../3DRenderPass/WebGPURenderElement3D";
import { WebGPUInternalRT } from "../WebGPUInternalRT";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPURenderGeometry } from "../WebGPURenderGeometry";
import { WebGPURenderPassHelper } from "../WebGPURenderPassHelper";

/**
 * TODO 重构
 * 渲染指令缓存
 * 用于缓存渲染指令，提高渲染效率
 * 一个渲染指令缓存对象缓存了若干个渲染节点的渲染指令
 * 如果下一帧渲染流程中，缓存的渲染节点命中率高于一定的程度，则可以直接使用缓存的渲染指令
 * 对于动态节点，要求命中率为100%，对于静态节点，要求命中率可低于100%（比如70%）
 */
export class WebGPURenderBundle {
    private _engine: WebGPURenderEngine;
    private _encoder: GPURenderBundleEncoder; //渲染命令编码器
    constructor(device: GPUDevice, dest: WebGPUInternalRT, shotRateSet: number) {
    }

    /**
     * 添加渲染节点，将节点的渲染指令添加到命令缓存中
     * @param context 
     * @param element 
     */
    render(context: WebGPURenderContext3D, element: WebGPURenderElement3D) {
    }

    /**
     * 结束渲染指令的编码，生成渲染命令缓存对象
     */
    finish() {
    }



    /**
     * 设置渲染管线
     * @param pipeline 
     */
    setPipeline(pipeline: GPURenderPipeline) {
        this._encoder.setPipeline(pipeline);
    }

    /**
     * 设置索引缓冲区
     * @param buffer 
     * @param indexFormat 
     * @param byteSize 
     * @param offset 
     */
    setIndexBuffer(buffer: GPUBuffer, indexFormat: GPUIndexFormat, byteSize: number, offset: number = 0) {
        this._encoder.setIndexBuffer(buffer, indexFormat, offset, byteSize);
    }

    /**
     * 设置顶点缓冲区
     * @param slot 
     * @param buffer 
     * @param offset 
     * @param size 
     */
    setVertexBuffer(slot: number, buffer: GPUBuffer, offset: number = 0, size: number = 0) {
        this._encoder.setVertexBuffer(slot, buffer, offset, size);
    }

    /**
     * 设置绑定组
     * @param index 
     * @param bindGroup 
     * @param dynamicOffsets 
     */
    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: Iterable<GPUBufferDynamicOffset>) {
        this._encoder.setBindGroup(index, bindGroup, dynamicOffsets);
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
                    this._encoder.draw(count, 1, start, 0);
                }
                break;
            case DrawType.DrawElement:
                for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                    count = _drawElementInfo[i].elementCount;
                    start = _drawElementInfo[i].elementStart;
                    triangles += count / 3;
                    this._encoder.drawIndexed(count, 1, start / indexByte, 0);
                }
                break;
            case DrawType.DrawArrayInstance:
                for (let i = _drawArrayInfo.length - 1; i > -1; i--) {
                    count = _drawArrayInfo[i].count;
                    start = _drawArrayInfo[i].start;
                    triangles += (count - 2) * instanceCount;
                    this._encoder.draw(count, instanceCount, start, 0);
                    this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.C_Instancing_DrawCallCount, 1);
                }
                break;
            case DrawType.DrawElementInstance:
                for (let i = _drawElementInfo.length - 1; i > -1; i--) {
                    count = _drawElementInfo[i].elementCount;
                    start = _drawElementInfo[i].elementStart;
                    triangles += count / 3 * instanceCount;
                    this._encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
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
                triangles += count / 3 * instanceCount;
                this._encoder.drawIndexed(count, instanceCount, start / indexByte, 0);
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
        this._encoder = null;
    }
}