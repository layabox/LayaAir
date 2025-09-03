import { LayaGL } from "../../../../layagl/LayaGL";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IPool, Pool } from "../../../../utils/Pool";
import { FastSinglelist } from "../../../../utils/SingletonList";
import { IPrimitiveRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { Web2DGraphic2DIndexCloneDataView, Web2DGraphic2DIndexDataView } from "./Web2DGraphic2DBufferDataView";
import { WebPrimitiveDataHandle } from "./WebRenderDataHandle";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";;
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { Web2DGraphicsIndexBatchBuffer } from "./Web2DGraphic2DBuffer";
import { BatchManager, IBatch2DProvider } from "./BatchManager";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { WebRender2DPass } from "./WebRender2DPass";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";


/**
 * 简单的管理indexBuffer
 */
class BatchBuffer {
    indexBuffer: IIndexBuffer;
    wholeBuffer: Web2DGraphicsIndexBatchBuffer;

    indexCount: number = 0;
    maxIndexCount: number = 0;

    bufferStates: Map<IVertexBuffer, IBufferState> = new Map();

    constructor() {
        this.indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this.indexBuffer.indexType = IndexFormat.UInt16;
        this.wholeBuffer = new Web2DGraphicsIndexBatchBuffer();
        this.wholeBuffer.buffer = this.indexBuffer;
        if (!!(LayaGL.renderEngine as any).gl) {
            this.add = this._addWebgl;
        } else {
            this.add = this._addWebgpu;
        }
    }

    _addWebgl(element: IPrimitiveRenderElement2D) {
        let handle = element.owner.renderDataHandler as WebPrimitiveDataHandle;
        let blocks = handle._getBlocks();
        if (!blocks)
            return null;

        let cview = handle.getCloneViews()[element._index];
        let block = blocks[element._index];
        let vertexBuffer = block.vertexBuffer;
        let bufferState = this.bindBuffer(vertexBuffer);
        this.indexCount += cview.length;
        this.wholeBuffer._modifyOneView(cview);

        if (cview._geometry.bufferState !== bufferState) {
            cview._geometry.bufferState = bufferState;
        }

        WebRender2DPass.setBuffer(this.wholeBuffer);
        this.updateBufLength();

        return cview._geometry;
        //@ts-ignore
        // return block.indexView._geometry;
    }   

    _addWebgpu(element: IPrimitiveRenderElement2D) {

        let handle = element.owner.renderDataHandler as WebPrimitiveDataHandle;
        let blocks = handle._getBlocks();
        if (!blocks)
            return null;

        let cview = handle.getCloneViews()[element._index];
        let block = blocks[element._index];
        let vertexBuffer = block.vertexBuffer;
        let bufferState = this.bindBuffer(vertexBuffer);
        this.indexCount += cview.length;
        this.wholeBuffer._modifyOneView(cview);

        //@ts-ignore
        if (cview._geometry._bufferState !== bufferState) {
            cview._geometry.bufferState = bufferState;
        }

        WebRender2DPass.setBuffer(this.wholeBuffer);
        this.updateBufLength();

        return cview._geometry;
        //@ts-ignore
        // return block.indexView._geometry;
    }

    add(element: IPrimitiveRenderElement2D) : IRenderGeometryElement {
        // let handle = element.owner.renderDataHandler as WebPrimitiveDataHandle;
        // let blocks = handle._getBlocks();
        // if (!blocks)
        //     return null;

        // let cview = handle.getCloneViews()[element._index] as Web2DGraphic2DIndexDataView;
        // let block = blocks[element._index];
        // let vertexBuffer = block.vertexBuffer;
        // let bufferState = this.bindBuffer(vertexBuffer);
        // this.indexCount += cview.length;
        // this.wholeBuffer._modifyOneView(cview);

        // if (cview._geometry.bufferState !== bufferState) {
        //     cview._geometry.bufferState = bufferState;
        // }

        // WebRender2DPass.setBuffer(this.wholeBuffer);
        // this.updateBufLength();

        return null;
    }

    updateBufLength() {
        if (this.maxIndexCount <= this.indexCount) {
            let nLength = Math.ceil(this.indexCount / _STEP_) * _STEP_;
            let byteLength = nLength * 2;
            this.indexBuffer._setIndexDataLength(byteLength);
            this.wholeBuffer._resetData(byteLength);
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
    primitiveShaderData: any = null;
    materialShaderData: any = null;
    type: number = 0;
    lowType: number = 0;
    globalRenderData: any = null;


    constructor() {
        let isWebgl = !!(LayaGL.renderEngine as any).gl;
        if (isWebgl) {
            this.setHead = this._setHeadWebgl;
            this.isCompatible = this._isCompatibleWebgl;
        } else {
            this.setHead = this._setHeadWebgpu;
            this.isCompatible = this._isCompatibleWebgpu;
        }
    }

    _setHeadWebgl(element: IPrimitiveRenderElement2D): void {
        this.primitiveShaderData = element.primitiveShaderData;
        this.materialShaderData = element.materialShaderData;
        this.subShader = element.subShader;
        this.bufferState = element.geometry.bufferState;

        this.textureId = element.type & (~63);
        this.globalAlpha = element.owner.globalAlpha;
        this.clipInfo = (element.owner as WebRenderStruct2D).getClipInfo();
        this.type = element.type;
        this.lowType = element.type & 63;
        this.globalRenderData = element.owner.globalRenderData;
    }
    
    _setHeadWebgpu(element: IPrimitiveRenderElement2D): void {
        //@ts-ignore
        this.primitiveShaderData = element._primitiveShaderData;
        //@ts-ignore
        this.materialShaderData = element._materialShaderData;
        //@ts-ignore
        this.subShader = element._subShader;
        //@ts-ignore
        this.bufferState = element.geometry._bufferState;

        this.textureId = element.type & (~63);
        this.globalAlpha = element.owner.globalAlpha;
        this.clipInfo = (element.owner as WebRenderStruct2D).getClipInfo();
        this.type = element.type;
        this.lowType = element.type & 63;
        this.globalRenderData = element.owner.globalRenderData;
    }
    /**
     * 从渲染元素初始化批次上下文
     */
    setHead(element: IPrimitiveRenderElement2D): void { }

    /**
     * @internal WebGL 检查元素是否与批次兼容
     */
    _isCompatibleWebgl(element: IPrimitiveRenderElement2D): boolean {
        if (this.type & 32)
            return false;

        // 快速检查：最容易变化的属性先检查
        let elementType = element.type;

        // clip检查：如果元素有clip标记，立即返回false
        if (elementType & 32) {
            return false;
        }

        let elementLowType = elementType & 63;
        let elementTexId = elementType & (~63);
        let elementOwner = element.owner as WebRenderStruct2D;

        //@ts-ignore
        let primitiveShaderData = element.primitiveShaderData;
        // 如果元素存在texRange，则不能批次化
        if (primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE)) {
            return false;
        }

        // 检查低位类型（最常见的不匹配）
        if (this.lowType !== elementLowType) {
            return false;
        }

        // 检查材质 自定义材质直接比对 shaderdata
        if (this.lowType & 16 && element.materialShaderData !== this.materialShaderData) {
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
                this.primitiveShaderData = primitiveShaderData;
            }
            return true;
        }

        // 批次已有确定的贴图ID，检查是否匹配
        return elementTexId === 0 || elementTexId === this.textureId;
    }

    /**
     * @internal WebGPU 检查元素是否与批次兼容
     */
    _isCompatibleWebgpu(element: IPrimitiveRenderElement2D): boolean {
        if (this.type & 32)
            return false;

        // 快速检查：最容易变化的属性先检查
        let elementType = element.type;

        // clip检查：如果元素有clip标记，立即返回false
        if (elementType & 32) {
            return false;
        }

        let elementLowType = elementType & 63;
        let elementTexId = elementType & (~63);
        let elementOwner = element.owner as WebRenderStruct2D;

        //@ts-ignore
        let primitiveShaderData = element._primitiveShaderData;
        // 如果元素存在texRange，则不能批次化
        if (primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE)) {
            return false;
        }

        // 检查低位类型（最常见的不匹配）
        if (this.lowType !== elementLowType) {
            return false;
        }

        // 检查材质 自定义材质直接比对 shaderdata
        //@ts-ignore
        if (this.lowType & 16 && element._materialShaderData !== this.materialShaderData) {
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
                this.primitiveShaderData = primitiveShaderData;
            }
            return true;
        }

        // 批次已有确定的贴图ID，检查是否匹配
        return elementTexId === 0 || elementTexId === this.textureId;
    }

    /**
     * 检查元素是否与批次兼容
     */
    isCompatible(element: IPrimitiveRenderElement2D): boolean {
        // 批次已有确定的贴图ID，检查是否匹配
        return true
    }
}

/**
 * @ignore
 */
export class WebGraphicsBatch implements IBatch2DProvider {
    _buffer: BatchBuffer;
    _merged: Array<IPrimitiveRenderElement2D>;
    _context: BatchContext;

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
        element => { //reset
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

    constructor() {
        this._buffer = new BatchBuffer();
        this._merged = [];
        this._context = new BatchContext();
    }

    reset() {
        this._buffer.clear();
        WebGraphicsBatch._pool.recover(this._merged);
    }

    destroy(): void {
        this._buffer.destroy();
        WebGraphicsBatch._pool.recover(this._merged);
    }

    batch(list: FastSinglelist<IPrimitiveRenderElement2D>, start: number, end: number, allowReorder?: boolean): void {
        let elementArray = list.elements;
        let ctx = this._context;
        ctx.setHead(elementArray[start]);
        let batchStart = start;

        for (let i = start + 1; i <= end; i++) {
            let element = elementArray[i];
            if (ctx.isCompatible(element))
                continue;

            if (allowReorder) {
                for (let j = i + 1; j <= end; j++) {
                    let element2 = elementArray[j];
                    if (ctx.isCompatible(element2)) {
                        for (let k = j - 1; k >= i; k--) {
                            if (element2.owner.rect.intersects(elementArray[k].owner.rect)) {
                                element2 = null;
                                break;
                            }
                        }
                        if (element2 != null) {
                            elementArray.splice(j, 1);
                            elementArray.splice(i, 0, element2);
                            element = elementArray[++i];
                        }
                    }
                }
            }

            if (i - batchStart > 1)
                this.merge(list, batchStart, i - 1, ctx);
            else
                this.addSingle(list, elementArray[batchStart]);

            batchStart = i;
            ctx.setHead(element);
        }

        if (end - batchStart > 0)
            this.merge(list, batchStart, end, ctx);
        else
            this.addSingle(list, elementArray[batchStart]);
    }

    private addSingle(list: FastSinglelist<IPrimitiveRenderElement2D>, element: IPrimitiveRenderElement2D) {
        this._buffer.add(element);
        list.add(element);
    }

    private merge(list: FastSinglelist<IPrimitiveRenderElement2D>, start: number, end: number, batchContext: BatchContext): void {
        let elementArray = list.elements;
        let staticBatchRenderElement = WebGraphicsBatch._pool.take();
        this._merged.push(staticBatchRenderElement);
        let drawArray: number[][] = [];
        let drawLengths: number[] = [];

        for (let i = start; i <= end; i++) {
            let element = elementArray[i];
            let geometry = this._buffer.add(element) || element.geometry;
            if (i === start) {
                staticBatchRenderElement.geometry.bufferState = geometry.bufferState;
                staticBatchRenderElement.materialShaderData = element.materialShaderData;
                staticBatchRenderElement.value2DShaderData = element.value2DShaderData;
                staticBatchRenderElement.subShader = element.subShader;
                staticBatchRenderElement.renderStateIsBySprite = element.renderStateIsBySprite;
                staticBatchRenderElement.primitiveShaderData = batchContext.primitiveShaderData;
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

        for (let i = 0; i < len; i++) {
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
}

const TEMP_SINGLE_LIST = new FastSinglelist<number>();
const _STEP_ = 1024;

