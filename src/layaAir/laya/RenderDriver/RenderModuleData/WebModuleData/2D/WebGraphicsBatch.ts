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
import { Vector4 } from "../../../../maths/Vector4";


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

    add(element: IPrimitiveRenderElement2D): IRenderGeometryElement {
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

    fillTexture: boolean = false;
    texRange: Vector4;

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
        this.fillTexture = this.primitiveShaderData.hasDefine(ShaderDefines2D.FILLTEXTURE);
        this.texRange = this.primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE) as Vector4;
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
        this.fillTexture = this.primitiveShaderData.hasDefine(ShaderDefines2D.FILLTEXTURE);
        this.texRange = this.primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE) as Vector4;
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
        // 纹理检查放最前，因为这是文字的图片的差别
        if (elementTexId !== 0 && elementTexId !== this.textureId && this.textureId !== 0)
            return false;

        // 检查低位类型（最常见的不匹配）
        if (this.lowType !== elementLowType) {
            return false;
        }

        let elementOwner = element.owner as WebRenderStruct2D;

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

        // 检查材质 自定义材质直接比对 shaderdata
        if ((this.lowType & 16) !== 0 && element.materialShaderData !== this.materialShaderData) {
            return false;
        }

        let fillTexture = element.primitiveShaderData.hasDefine(ShaderDefines2D.FILLTEXTURE);
        if (fillTexture) {
            if (!this.fillTexture)
                return false;

            // 如果元素存在texRange，则不能批次化
            if (!element.primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE).equal(this.texRange))
                return false;
        }
        else if (this.fillTexture)
            return false;

        if (this.textureId === 0 && elementTexId !== 0) {
            this.textureId = elementTexId;
            this.primitiveShaderData = element.primitiveShaderData;
        }

        return true;
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
        // 纹理检查放最前，因为这是文字的图片的差别
        if (elementTexId !== 0 && elementTexId !== this.textureId && this.textureId !== 0)
            return false;

        // 检查低位类型（最常见的不匹配）
        if (this.lowType !== elementLowType) {
            return false;
        }

        let elementOwner = element.owner as WebRenderStruct2D;

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

        // 检查材质 自定义材质直接比对 shaderdata
        if (this.lowType & 16 && (element as any)._materialShaderData !== this.materialShaderData) {
            return false;
        }

        let primitiveShaderData = (element as any)._primitiveShaderData;
        let fillTexture = primitiveShaderData.hasDefine(ShaderDefines2D.FILLTEXTURE);
        if (fillTexture) {
            if (!this.fillTexture)
                return false;

            // 如果元素存在texRange，则不能批次化
            if (!primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE).equal(this.texRange))
                return false;
        }
        else if (this.fillTexture)
            return false;

        if (this.textureId === 0 && elementTexId !== 0) {
            this.textureId = elementTexId;
            this.primitiveShaderData = primitiveShaderData;
        }

        return true;
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
        let cnt = end - start + 1;
        if (cnt > 1000) //大于1000个元素无法自动优化排序
            allowReorder = false;

        if (allowReorder) {
            if (elementFlags == null)
                initCache(1000);

            let headGroup = 0;
            let indiceLen = 1;
            elementIndice[0] = start;
            elementFlags[0] = 0;

            for (let i = 1; i < cnt; i++) {
                let element = elementArray[start + i];
                elementFlags[i] = -1; //undetermined
                let rect = element.owner.rect;
                rectLeftCache[i] = rect.x;
                rectTopCache[i] = rect.y;
                rectRightCache[i] = rect.x + rect.width;
                rectBottomCache[i] = rect.y + rect.height;
            }

            for (let i = 1; i < cnt; i++) {
                let element = elementArray[start + i];
                let group = elementFlags[i];
                if (group === -2) { //already merged
                    continue;
                }

                if (group !== -1) {
                    if (group === headGroup) {
                        elementIndice[indiceLen++] = start + i;
                        continue;
                    }
                }
                else {
                    if (ctx.isCompatible(element)) {
                        elementIndice[indiceLen++] = start + i;
                        continue;
                    }

                    elementFlags[i] = group = headGroup + 1;
                }

                for (let j = i + 1; j < cnt; j++) {
                    let element2 = elementArray[start + j];
                    if (elementFlags[j] !== -1) {
                        if (elementFlags[j] !== headGroup)
                            continue;
                    }
                    else {
                        if (!ctx.isCompatible(element2))
                            continue;
                    }

                    //尝试向前移动
                    for (let k = j - 1; k >= i; k--) {
                        if (elementFlags[k] !== -2
                            && rectLeftCache[j] < rectRightCache[k] && rectRightCache[j] > rectLeftCache[k]
                            && rectTopCache[j] < rectBottomCache[k] && rectBottomCache[j] > rectTopCache[k]) {
                            element2 = null;
                            break;
                        }
                    }

                    if (element2 != null) {
                        elementIndice[indiceLen++] = start + j;
                        elementFlags[j] = -2;
                    }
                    else
                        elementFlags[j] = headGroup;
                }

                list.add(this.merge(elementArray, 0, indiceLen - 1, ctx, elementIndice));
                indiceLen = 1;
                elementIndice[0] = start + i;
                headGroup = group;
                ctx.setHead(element);
            }
            list.add(this.merge(elementArray, 0, indiceLen - 1, ctx, elementIndice));
        }
        else {
            let batchStart = start;
            for (let i = start + 1; i <= end; i++) {
                let element = elementArray[i];
                if (!ctx.isCompatible(element)) {
                    list.add(this.merge(elementArray, batchStart, i - 1, ctx));
                    batchStart = i;
                    ctx.setHead(element);
                }
            }
            list.add(this.merge(elementArray, batchStart, end, ctx));
        }
    }

    private merge(elementArray: Array<IPrimitiveRenderElement2D>, start: number, end: number, batchContext: BatchContext, indice?: Int16Array): IPrimitiveRenderElement2D {
        if (start === end) {
            let element = elementArray[indice !== undefined ? indice[start] : start];
            this._buffer.add(element);
            return element;
        }

        let staticBatchRenderElement = WebGraphicsBatch._pool.take();
        this._merged.push(staticBatchRenderElement);
        let batchedGeometry = staticBatchRenderElement.geometry;
        let currentOffset = 0;
        let currentCount = 0;
        let isFirst = true;

        for (let i = start; i <= end; i++) {
            let element = elementArray[indice !== undefined ? indice[i] : i];
            let geometry = this._buffer.add(element) || element.geometry;
            if (i === start) {
                batchedGeometry.bufferState = geometry.bufferState;
                staticBatchRenderElement.materialShaderData = element.materialShaderData;
                staticBatchRenderElement.value2DShaderData = element.value2DShaderData;
                staticBatchRenderElement.subShader = element.subShader;
                staticBatchRenderElement.renderStateIsBySprite = element.renderStateIsBySprite;
                staticBatchRenderElement.primitiveShaderData = batchContext.primitiveShaderData;
                staticBatchRenderElement.owner = element.owner;
            }

            let drawParam = geometry.drawParams.elements;
            let drawLength = geometry.drawParams.length;
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
                    batchedGeometry.setDrawElemenParams(currentCount, currentOffset);
                    currentOffset = offset;
                    currentCount = count;
                }
            }
        }

        // 一次性合并完整了
        if (!isFirst) {
            batchedGeometry.setDrawElemenParams(currentCount, currentOffset);
        }

        return staticBatchRenderElement;
    }
}

const _STEP_ = 1024;
var elementFlags: Int16Array;
var elementIndice: Int16Array;
var rectLeftCache: Float32Array;
var rectTopCache: Float32Array;
var rectRightCache: Float32Array;
var rectBottomCache: Float32Array;
function initCache(maxElements: number) {
    elementFlags = new Int16Array(new ArrayBuffer(maxElements * 2));
    elementIndice = new Int16Array(new ArrayBuffer(maxElements * 2));
    maxElements *= 4;
    rectLeftCache = new Float32Array(new ArrayBuffer(maxElements));
    rectTopCache = new Float32Array(new ArrayBuffer(maxElements));
    rectRightCache = new Float32Array(new ArrayBuffer(maxElements));
    rectBottomCache = new Float32Array(new ArrayBuffer(maxElements));
}