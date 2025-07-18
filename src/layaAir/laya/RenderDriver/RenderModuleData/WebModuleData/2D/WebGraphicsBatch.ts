import { LayaGL } from "../../../../layagl/LayaGL";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IPool, Pool } from "../../../../utils/Pool";
import { FastSinglelist } from "../../../../utils/SingletonList";
import { IPrimitiveRenderElement2D, IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Web2DGraphic2DIndexDataView, Web2DGraphic2DVertexDataView } from "./Web2DGraphic2DBufferDataView";
import { IBatch2DContext, IBatch2DRender, WebRender2DPass } from "./WebRender2DPass";
import { WebPrimitiveDataHandle } from "./WebRenderDataHandle";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { Web2DGraphicsIndexBuffer } from "./Web2DGraphic2DBuffer";

const TEMP_SINGLE_LIST = new FastSinglelist<number>();

/**
 * 简单的管理indexBuffer
 */
export class BatchBuffer {

    static _STEP_ = 1024;

    indexBuffer: IIndexBuffer;
    wholeBuffer: Web2DGraphicsIndexBuffer;

    indexCount: number = 0;
    maxIndexCount: number = 0;

    bufferStates: Map<IVertexBuffer, IBufferState> = new Map();

    geometryList: IRenderGeometryElement[] = [];

    constructor() {
        this.indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this.indexBuffer.indexType = IndexFormat.UInt16;
        this.wholeBuffer = new Web2DGraphicsIndexBuffer();
        this.wholeBuffer.buffer = this.indexBuffer;
    }

    updateBufLength() {
        if (this.maxIndexCount <= this.indexCount) {
            let nLength = Math.ceil(this.indexCount / BatchBuffer._STEP_) * BatchBuffer._STEP_;
            let byteLength = nLength * 2;
            this.indexBuffer._setIndexDataLength(byteLength);
            this.wholeBuffer.resetData(byteLength);
            this.maxIndexCount = nLength;
        }
    }

    bindBuffer(buffer: IVertexBuffer) {
        let bufferState = this.bufferStates.get(buffer);
        if (!bufferState) {
            bufferState = LayaGL.renderDeviceFactory.createBufferState();
            bufferState.applyState([buffer], this.indexBuffer);
            this.bufferStates.set(buffer, bufferState);
        }
        return bufferState;
    }

    clear() {
        this.indexCount = 0;
        this.wholeBuffer.clearBufferViews();
        this.geometryList.length = 0;
    }

    destroy(): void {
        this.clear();
        this.bufferStates.forEach((bufferState) => {
            bufferState.destroy();
        });
        this.bufferStates.clear();
        this.indexBuffer.destroy();
        this.indexBuffer = null;
        this.wholeBuffer.destroy();
        this.wholeBuffer = null;
    }
}

/**
 * @internal
 * 批次上下文，用于跟踪批次的状态信息
 */
class BatchContext {
    /** 批次使用的贴图ID */
    textureId: number = 0;

    /** 批次的透明度 */
    globalAlpha: number = 1;

    /** 批次的clip信息 */
    clipInfo: any = null;

    /** 批次的shader */
    subShader: any = null;

    /** 批次的bufferState */
    bufferState: any = null;

    shaderData: any = null;

    type: number = 0;

    lowType: number = 0;

    globalRenderData: any = null;

    /**
     * 重置批次上下文
     */
    reset(): void {
        this.textureId = 0;
        this.globalAlpha = 1;
        this.clipInfo = null;
        this.subShader = null;
        this.bufferState = null;
        this.shaderData = null;
        this.type = 0;
        this.lowType = 0;
        this.globalRenderData = null;
    }

    /**
     * 从渲染元素初始化批次上下文
     */
    initFromElement(element: IPrimitiveRenderElement2D): void {
        this.textureId = element.type & (~63);
        this.shaderData = element.primitiveShaderData;
        this.globalAlpha = element.owner.globalAlpha;
        this.clipInfo = (element.owner as WebRenderStruct2D).getClipInfo();
        this.subShader = element.subShader;
        this.bufferState = element.geometry.bufferState;
        this.type = element.type;
        this.lowType = element.type & 63;
        this.globalRenderData = element.owner.globalRenderData;
    }

    /**
     * 检查元素是否与批次兼容
     */
    isCompatible(element: IPrimitiveRenderElement2D): boolean {
        // 快速检查：最容易变化的属性先检查
        let elementType = element.type;

        // clip检查：如果元素有clip标记，立即返回false
        if (elementType & 32) {
            return false;
        }

        let elementLowType = elementType & 63;
        let elementTexId = elementType & (~63);
        let elementOwner = element.owner as WebRenderStruct2D;

        // 检查低位类型（最常见的不匹配）
        if (this.lowType !== elementLowType) {
            return false;
        }

        // 检查透明度（数值比较，较快）
        if (this.globalAlpha !== elementOwner.globalAlpha) {
            return false;
        }

        // 检查对象引用（指针比较，较快）
        if (this.subShader !== element.subShader ||
            this.bufferState !== element.geometry.bufferState ||
            this.clipInfo !== elementOwner.getClipInfo() ||
            elementOwner.globalRenderData !== this.globalRenderData) {
            return false;
        }

        // 纹理ID检查（放在最后，因为可能需要更新状态）
        if (this.textureId === 0) {
            // 批次还没有确定贴图，接受任何贴图并更新状态
            if (elementTexId !== 0) {
                this.textureId = elementTexId;
                this.shaderData = element.primitiveShaderData;
            }
            return true;
        }

        // 批次已有确定的贴图ID，检查是否匹配
        return elementTexId === 0 || elementTexId === this.textureId;
    }
}


export class WebGraphicsBatchContext implements IBatch2DContext {
    /** @internal */
    _batchBuffer = new BatchBuffer();

    /** @internal */
    private _list = new FastSinglelist<IPrimitiveRenderElement2D>();

    constructor() {
    }

    reset(): void {
        this._batchBuffer.clear();
        let elements = this._list.elements;
        let length = this._list.length;
        let elementLength = elements.length;
        for (let i = 0; i < elementLength; i++) {
            let element = elements[i];
            element.geometry.clearRenderParams();
            if (i >= length) {
                WebGraphicsBatch._pool.recover(element);
            }
        }
        this._list.clean();
        this._list.length = 0;
    }

    getRenderElement(): IPrimitiveRenderElement2D {
        let elemetLength = this._list.elements.length;
        let length = this._list.length;
        let element: IPrimitiveRenderElement2D = null;
        if (elemetLength > length) {
            element = this._list.elements[length];
            this._list.length++;
            return element;
        } else {
            element = WebGraphicsBatch._pool.take();
            this._list.add(element);
        }
        return element;
    }

    destroy(): void {
        let elements = this._list.elements;
        let elementLength = elements.length;
        for (let i = 0; i < elementLength; i++) {
            let element = elements[i];
            WebGraphicsBatch._pool.recover(element);
        }
        this._list.destroy();
        this._batchBuffer.destroy();
    }
}


export class WebGraphicsBatch implements IBatch2DRender {
    static instance: WebGraphicsBatch = null;
    static batchCtx = new BatchContext();
    static readonly _pool: IPool<IPrimitiveRenderElement2D> = Pool.createPool2<IPrimitiveRenderElement2D>(
        () => { //create
            let element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
            element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            element.geometry.indexFormat = IndexFormat.UInt16;
            element.nodeCommonMap = ["Sprite2D"];
            element.renderStateIsBySprite = false;
            return element;
        },
        null,
        (element: IPrimitiveRenderElement2D) => { //reset
            element.geometry.clearRenderParams();
            element.geometry.bufferState = null;
            element.materialShaderData = null;
            element.value2DShaderData = null;
            element.primitiveShaderData = null;
            element.subShader = null;
            element.owner = null;
            element.renderStateIsBySprite = false;
            element.globalShaderData = null;
        });


    createBatchContext(): IBatch2DContext {
        return new WebGraphicsBatchContext();
    }

    batchRenderElement(list: FastSinglelist<IPrimitiveRenderElement2D>, start: number, length: number, context: WebGraphicsBatchContext): void {
        let elementArray = list.elements;
        let batchStart = -1;
        let count = 0;
        let end = length - 1;
        let batchContext = WebGraphicsBatch.batchCtx; // 批次上下文
        batchContext.reset();

        for (let index = 0; index <= end; index++) {
            let offset = start + index;
            let element = elementArray[offset];

            if (this.canAddToBatch(element, batchContext)) {
                if (batchStart == -1) {
                    // 开始新批次
                    batchStart = index;
                    count = 1;
                    batchContext.initFromElement(element);
                } else {
                    // 添加到当前批次
                    count++;
                }
            } else {
                // 无法加入当前批次，结束当前批次
                if (count > 1) {
                    this.batch(list, batchStart + start, count, context, batchContext);
                } else if (count === 1) {
                    list.add(elementArray[batchStart + start]);
                }

                // 重置批次状态
                batchContext.reset();
                batchStart = -1;
                count = 0;

                // 尝试用当前元素开始新批次
                if (this.canAddToBatch(element, batchContext)) {
                    batchStart = index;
                    count = 1;
                    batchContext.initFromElement(element);
                } else {
                    // 当前元素无法形成批次（可能有clip等），直接添加
                    list.add(element);
                }
            }
        }

        // 处理最后的批次
        if (count > 1) {
            this.batch(list, batchStart + start, count, context, batchContext);
        } else if (count === 1) {
            list.add(elementArray[batchStart + start]);
        }
    }

    /**
     * @en Check if an element can be added to the current batch.
     * @param element The render element to check.
     * @param batchContext The batch context for current batch.
     * @returns True if the element can be added to the batch, false otherwise.
     * @zh 检测元素是否可以加入当前批次。
     * @param element 要检测的渲染元素。
     * @param batchContext 当前批次的上下文。
     * @returns 如果元素可以加入批次则返回 true，否则返回 false。
     */
    canAddToBatch(element: IPrimitiveRenderElement2D, batchContext: BatchContext): boolean {
        if (batchContext.subShader === null) {
            let elementType = element.type;
            // 有clip标记的元素不能批次化
            if (elementType & 32) return false;
            return true;
        }
        return batchContext.isCompatible(element);
    }

    batch(list: FastSinglelist<IPrimitiveRenderElement2D>, start: number, length: number, context: WebGraphicsBatchContext, batchContext: BatchContext): void {
        let elementArray = list.elements;
        let staticBatchRenderElement = context.getRenderElement();
        let drawArray: number[][] = [];
        let i = 0;
        let drawLengths: number[] = [];
        let buffer = context._batchBuffer;

        for (i = 0; i < length; i++) {
            let offset = start + i;
            let element = elementArray[offset];
            let geometry = buffer.geometryList[offset] || element.geometry;
            if (!i) {
                staticBatchRenderElement.geometry.bufferState = geometry.bufferState;
                staticBatchRenderElement.materialShaderData = element.materialShaderData;
                staticBatchRenderElement.value2DShaderData = element.value2DShaderData;
                staticBatchRenderElement.subShader = element.subShader;
                staticBatchRenderElement.renderStateIsBySprite = element.renderStateIsBySprite;
                staticBatchRenderElement.primitiveShaderData = batchContext.shaderData;
                staticBatchRenderElement.owner = element.owner;
            }

            geometry.getDrawDataParams(TEMP_SINGLE_LIST);
            drawArray.push(TEMP_SINGLE_LIST.elements.slice());
            drawLengths.push(TEMP_SINGLE_LIST.length);
        }

        let geometry = staticBatchRenderElement.geometry;
        let len = drawArray.length;
        let currentOffset = 0;
        let currentCount = 0;
        let isFirst = true;

        for (i = 0; i < len; i++) {
            let drawParam = drawArray[i];
            let drawLength = drawLengths[i];
            for (let j = 0; j < drawLength; j += 2) {
                let offset = drawParam[j];
                let count = drawParam[j + 1];

                if (isFirst) {
                    currentOffset = offset;
                    currentCount = count;
                    isFirst = false;
                    continue;
                }

                // 检查是否可以合并
                if (currentOffset + currentCount * 2 === offset) {
                    currentCount += count;
                } else {
                    geometry.setDrawElemenParams(currentCount, currentOffset);
                    currentOffset = offset;
                    currentCount = count;
                }
            }
        }

        // 一次性合并完整了
        if (!isFirst) {
            geometry.setDrawElemenParams(currentCount, currentOffset);
        }

        list.add(staticBatchRenderElement);
    }

    prepare(strcut: WebRenderStruct2D, context: WebGraphicsBatchContext, offset: number): void {
        let handle = strcut.renderDataHandler as WebPrimitiveDataHandle;
        let blocks = handle._getBlocks();
        if (!blocks) return

        let buffer = context._batchBuffer;
        let cviews = handle.getCloneViews();
        for (let i = 0, n = blocks.length; i < n; i++) {
            let cview = cviews[i] as Web2DGraphic2DIndexDataView;
            let block = blocks[i];
            let vertexBuffer = block.vertexBuffer;
            let bufferState = buffer.bindBuffer(vertexBuffer);
            buffer.indexCount += cview.length;
            buffer.wholeBuffer.modifyOneView(cview);

            if (cview._geometry.bufferState !== bufferState) {
                cview._geometry.bufferState = bufferState;
            }

            buffer.geometryList[offset + i] = cview._geometry;
        }

        WebRender2DPass.setBuffer(buffer.wholeBuffer);
        buffer.updateBufLength();
    }

    /**
     * 
     */
    recover(list: FastSinglelist<IPrimitiveRenderElement2D>): void {
        let length = list.length;
        let recoverArray = list.elements;
        for (let i = 0; i < length; i++) {
            let info = recoverArray[i];
            WebGraphicsBatch._pool.recover(info);
        }
        list.length = 0;
    }

}

