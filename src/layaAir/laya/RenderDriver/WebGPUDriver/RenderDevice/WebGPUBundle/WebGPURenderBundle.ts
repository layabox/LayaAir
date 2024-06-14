import { Laya } from "../../../../../Laya";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { GPUEngineStatisticsInfo } from "../../../../RenderEngine/RenderEnum/RenderStatInfo";
import { WebGPURenderContext3D } from "../../3DRenderPass/WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../../3DRenderPass/WebGPURenderElement3D";
import { WebGPUInternalRT } from "../WebGPUInternalRT";
import { WebGPURenderEngine } from "../WebGPURenderEngine";
import { WebGPURenderGeometry } from "../WebGPURenderGeometry";
import { WebGPURenderPassHelper } from "../WebGPURenderPassHelper";

/**
 * 渲染指令缓存
 * 用于缓存渲染指令，提高渲染效率
 * 一个渲染指令缓存对象缓存了若干个渲染节点的渲染指令
 * 如果下一帧渲染流程中，缓存的渲染节点命中率高于一定的程度，则可以直接使用缓存的渲染指令
 * 对于动态节点，要求命中率为100%，对于静态节点，要求命中率可低于100%（比如70%）
 */
export class WebGPURenderBundle {
    private _engine: WebGPURenderEngine;
    private _encoder: GPURenderBundleEncoder; //渲染命令编码器
    private _elements: Set<number>; //包含渲染节点id集合
    private _shotNum: number = 0; //命中渲染节点数量
    private _shotCount: number = 0; //检查命中率的次数
    private _shotRateSet: number = 0.7; //命中率设置
    private _shotEstimate: number = 0; //命中率评估次数
    renderBundle: GPURenderBundle; //渲染命令缓存对象
    renderTimeStamp: number = 0; //渲染时间戳
    renderTriangles: number = 0; //渲染三角形数量

    id: number; //缓存对象id
    static idCounter: number = 0; //缓存对象id计数器

    constructor(device: GPUDevice, dest: WebGPUInternalRT, shotRateSet: number) {
        this.renderBundle = null;
        this._elements = new Set();
        const desc: GPURenderBundleEncoderDescriptor
            = WebGPURenderPassHelper.getBundleDescriptor(dest);
        this.id = WebGPURenderBundle.idCounter++;
        desc.label = `BundleEncoder_${this.id}`;
        this._engine = WebGPURenderEngine._instance;
        this._encoder = device.createRenderBundleEncoder(desc);
        this._shotRateSet = shotRateSet;
    }

    /**
     * 添加渲染节点，将节点的渲染指令添加到命令缓存中
     * @param context 
     * @param element 
     */
    render(context: WebGPURenderContext3D, element: WebGPURenderElement3D) {
        this._elements.add(element.bundleId);
        this.renderTriangles += element._render(context, null, this);
        this._shotNum++;
        this.renderTimeStamp = Laya.timer.currTimer;
    }

    /**
     * 结束渲染指令的编码，生成渲染命令缓存对象
     */
    finish() {
        this.renderBundle = this._encoder.finish();
        this.renderBundle.label = `RenderBundle_${this.id}`;
    }

    /**
     * 判断是否包含某个渲染节点
     * @param elementId 
     */
    hasElement(elementId: number) {
        const has = this._elements.has(elementId);
        if (has)
            this._shotNum++;
        return has;
    }

    /**
     * 增加命中的渲染节点数量
     */
    addShot() {
        this._shotNum++;
    }

    /**
     * 把本缓存对象的所有渲染节点从总体渲染节点集合中移除
     * @param elements 总体渲染节点集合
     */
    removeMyIds(elements: Map<number, WebGPURenderBundle>) {
        this._elements.forEach(id => elements.delete(id));
    }

    /**
     * 清除命中的渲染节点数量
     */
    clearShotNum() {
        this._shotNum = 0;
    }

    /**
     * 判断是否是低命中率
     */
    isLowShotRate() {
        const shotRate = this._elements.size > 0 ? this._shotNum / this._elements.size : 1;
        if (shotRate === 1) { //100%命中
            this._shotEstimate = 0;
            this._shotCount = 0;
            return false;
        }
        if (this._shotRateSet === 1) { //对于动态节点，立即判断为true
            this._shotEstimate = 0;
            this._shotCount = 0;
            return true;
        }
        if (shotRate < this._shotRateSet) {
            if (this._shotEstimate++ > 10) { //对于静态节点，评估次数大于10，判断为true
                this._shotEstimate = 0;
                this._shotCount = 0;
                return true;
            }
        }
        if (this._shotCount++ > 500) { //每500帧强制清除一次缓存
            this._shotEstimate = 0;
            this._shotCount = 0;
            return true;
        }
        return false;
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

        if (setBuffer) {
            vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
            if (indexBuffer) {
                const format = (indexFormat === IndexFormat.UInt16) ? "uint16" : "uint32";
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
                    this._encoder.drawIndexed(elementCount, 1, elementStart, 0);
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
                    this._encoder.drawIndexed(elementCount, instanceCount, elementStart, 0);
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

        let format: GPUIndexFormat = "uint16";
        let indexByte = 2; //index的字节数

        if (setBuffer) {
            vertexBuffers.forEach((vb, i) => this.setVertexBuffer(i, vb.source._source, 0, vb.source._size));
            if (indexBuffer) {
                format = (indexFormat === IndexFormat.UInt16) ? "uint16" : "uint32";
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
        this._elements.clear();
        this._elements = null;
        this.renderBundle = null;
    }
}