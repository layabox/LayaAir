import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { WebGPURenderContext3D } from "../../3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../../3DRenderPass/WebGPURenderElement3D";
import { WebGPUInternalRT } from "../WebGPUInternalRT";
import { WebGPURenderGeometry } from "../WebGPURenderGeometry";
import { WebGPURenderPassHelper } from "../WebGPURenderPassHelper";

/**
 * 渲染指令缓存
 */
export class WebGPURenderBundle {
    private _encoder: GPURenderBundleEncoder;
    private _elements: Set<number>; //包含的渲染节点id集合
    private _shotNum: number = 0; //命中的渲染节点数量
    renderBundle: GPURenderBundle; //渲染命令缓存对象

    id: number;
    static idCounter: number = 0;

    constructor(device: GPUDevice, dest: WebGPUInternalRT) {
        this.renderBundle = null;
        this._elements = new Set();
        const desc: GPURenderBundleEncoderDescriptor
            = WebGPURenderPassHelper.getBundleDescriptor(dest);
        this.id = WebGPURenderBundle.idCounter++;
        desc.label = `BundleEncoder_${this.id}`;
        this._encoder = device.createRenderBundleEncoder(desc);
    }

    render(context: WebGPURenderContext3D, element: WebGPURenderElement3D) {
        this._elements.add(element.bundleId);
        element._render(context, null, this);
        this._shotNum++;
    }

    finish() {
        this.renderBundle = this._encoder.finish();
        this.renderBundle.label = `RenderBundle_${this.id}`;
    }

    hasElement(elementId: number) {
        const has = this._elements.has(elementId);
        if (has)
            this._shotNum++;
        return has;
    }

    clearShotNum() {
        this._shotNum = 0;
    }

    getShotRate() {
        return this._elements.size > 0 ? this._shotNum / this._elements.size : 0;
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

    setBindGroup(index: GPUIndex32, bindGroup: GPUBindGroup, dynamicOffsets?: Iterable<GPUBufferDynamicOffset>) {
        this._encoder.setBindGroup(index, bindGroup, dynamicOffsets);
    }

    /**
     * 上传几何数据
     * @param geometry 
     * @param setBuffer 
     */
    applyGeometry(geometry: WebGPURenderGeometry, setBuffer: boolean = true): void {
        //解构geometry中的属性，减少代码重复
        const { bufferState, indexFormat, drawType, instanceCount, _drawArrayInfo, _drawElementInfo } = geometry;
        const { _vertexBuffers: vertexBuffers, _bindedIndexBuffer: indexBuffer } = bufferState;

        if (setBuffer) {
            vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
            if (indexBuffer) {
                const format = (indexFormat === IndexFormat.UInt16) ? "uint16" : "uint32";
                this.setIndexBuffer(indexBuffer.source._source, format, indexBuffer.source._size, 0);
            }
        }

        //根据不同的数据类型绘制
        switch (drawType) {
            case DrawType.DrawArray:
                _drawArrayInfo.forEach(({ count, start }) => this._encoder.draw(count, 1, start, 0));
                break;
            case DrawType.DrawElement:
                _drawElementInfo.forEach(({ elementCount, elementStart }) => this._encoder.drawIndexed(elementCount, 1, elementStart, 0));
                break;
            case DrawType.DrawArrayInstance:
                _drawArrayInfo.forEach(({ count, start }) => this._encoder.draw(count, instanceCount, start, 0));
                break;
            case DrawType.DrawElementInstance:
                _drawElementInfo.forEach(({ elementCount, elementStart }) => this._encoder.drawIndexed(elementCount, instanceCount, elementStart, 0));
                break;
        }
    }

    destroy() {
        this._encoder = null;
        this._elements.clear();
        this._elements = null;
        this.renderBundle = null;
    }
}