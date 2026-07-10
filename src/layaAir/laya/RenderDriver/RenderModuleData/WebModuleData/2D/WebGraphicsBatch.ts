import { LayaGL } from "../../../../layagl/LayaGL";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { GraphicsDefines } from "../../../../webgl/shader/d2/GraphicsDefines";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IPool, Pool } from "../../../../utils/Pool";
import { FastSinglelist } from "../../../../utils/SingletonList";
import { IPrimitiveRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IBufferState } from "../../../DriverDesign/RenderDevice/IBufferState";
import { IIndexBuffer } from "../../../DriverDesign/RenderDevice/IIndexBuffer";
import { IRenderGeometryElement } from "../../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { IVertexBuffer } from "../../../DriverDesign/RenderDevice/IVertexBuffer";
import { WebRenderStruct2D } from "./WebRenderStruct2D";
import { Web2DGraphicsIndexBatchBuffer } from "./Web2DGraphic2DBuffer";
import { BatchManager, IBatch2DProvider } from "./BatchManager";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Vector4 } from "../../../../maths/Vector4";
import { WebRender2DPass } from "./WebRender2DPass";
import type { WebGraphicsBatchEntry } from "./WebGraphicsOp2DRuntimeBuffers";
import { WebPrimitiveDataHandle } from "./WebRenderDataHandle";

const _STEP_ = 1024;

type RenderEngineWebGLProbe = {
    gl?: unknown;
};

/**
 * @internal
 */
class BatchBuffer {
    indexBuffer: IIndexBuffer;
    wholeBuffer: Web2DGraphicsIndexBatchBuffer;
    indexCount: number = 0;
    maxIndexCount: number = 0;
    bufferStates: Map<IVertexBuffer, IBufferState> = new Map();

    constructor() {
        this.indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        this.indexBuffer.indexType = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
        this.wholeBuffer = new Web2DGraphicsIndexBatchBuffer();
        this.wholeBuffer.buffer = this.indexBuffer;
    }

    add(element: IPrimitiveRenderElement2D): IRenderGeometryElement {
        let geometry: IRenderGeometryElement = null;
        if (element._index != null) {
            let entry = element._graphicsBatchEntry as WebGraphicsBatchEntry;
            if (!entry) {
                let handle = element.owner.renderDataHandler as WebPrimitiveDataHandle;
                entry = handle.getGraphicsBatchEntry(element._index);
            }

            if (entry) {
                let cloneView = entry.cloneIndexView;
                let bufferState = this.bindBuffer(entry.vertexBuffer);
                this.indexCount += cloneView.length;
                this.wholeBuffer._modifyOneView(cloneView);

                if (cloneView._geometry.bufferState !== bufferState)
                    cloneView._geometry.bufferState = bufferState;

                WebRender2DPass.setBuffer(this.wholeBuffer);
                this.updateBufLength();
                geometry = cloneView._geometry;
            }
        }
        return geometry;
    }

    updateBufLength(): void {
        if (this.maxIndexCount <= this.indexCount) {
            let nLength = Math.ceil(this.indexCount / _STEP_) * _STEP_;
            let byteLength = nLength * GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE;
            this.indexBuffer._setIndexDataLength(byteLength);
            this.wholeBuffer._resetData(byteLength);
            this.maxIndexCount = nLength;
        }
    }

    bindBuffer(buffer: IVertexBuffer): IBufferState {
        let bufferState = this.bufferStates.get(buffer);
        if (!bufferState) {
            bufferState = LayaGL.renderDeviceFactory.createBufferState();
            bufferState.applyState([buffer], this.indexBuffer);
            this.bufferStates.set(buffer, bufferState);
        }
        return bufferState;
    }

    clear(): void {
        this.indexCount = 0;
        this.wholeBuffer.clearBufferViews();
    }

    destroy(): void {
        this.clear();
        this.bufferStates.forEach(bufferState => bufferState.destroy());
        this.bufferStates.clear();
        this.indexBuffer.destroy();
        this.indexBuffer = null;
        this.wholeBuffer.destroy();
        this.wholeBuffer = null;
    }
}

/**
 * WebGL批次上下文基类，用于跟踪批次的状态信息
 */
abstract class BaseBatchContext {
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
    typeKey: number = 0;
    textureKey: number = 0;
    globalRenderData: any = null;

    fillTexture: boolean = false;
    texRange: Vector4;

    /**
     * 从渲染元素初始化批次上下文
     */
    abstract setHead(element: IPrimitiveRenderElement2D): void;

    /**
     * 检查元素是否与批次兼容
     */
    abstract isCompatible(element: IPrimitiveRenderElement2D): boolean;
}

/**
 * WebGL批次上下文，用于跟踪批次的状态信息
 */
class WebGLBatchContext extends BaseBatchContext {

    setHead(element: IPrimitiveRenderElement2D): void {
        this.primitiveShaderData = element.primitiveShaderData;
        this.materialShaderData = element.materialShaderData;
        this.subShader = element.subShader;
        this.bufferState = element.geometry.bufferState;

        this.typeKey = element.typeKey;
        this.textureKey = element.textureKey;
        this.textureId = element.textureKey;
        this.globalAlpha = element.owner.globalAlpha;
        this.clipInfo = (element.owner as WebRenderStruct2D).getClipInfo();
        this.globalRenderData = element.owner.globalRenderData;
        this.fillTexture = !!(element.typeKey & ShaderDefines2D.DEFINE_BIT_FILLTEXTURE);
        this.texRange = this.primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE) as Vector4;
    }

    isCompatible(element: IPrimitiveRenderElement2D): boolean {
        // typeKey comparison (blend+flags)
        if (this.typeKey !== element.typeKey) {
            return false;
        }

        let elementTexId = element.textureKey;
        if (elementTexId !== 0 && elementTexId !== this.textureId && this.textureId !== 0)
            return false;

        // clipInfo 比较（允许不同 owner 但相同 clip 状态的元素合批）
        if (this.subShader !== element.subShader ||
            this.bufferState !== element.geometry.bufferState ||
            this.clipInfo !== (element.owner as WebRenderStruct2D).getClipInfo() ||
            element.owner.globalRenderData !== this.globalRenderData) {
            return false;
        }

        // 检查材质 自定义材质直接比对 shaderdata
        if ((this.typeKey & ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL) !== 0 && element.materialShaderData !== this.materialShaderData) {
            return false;
        }

        // fillTexture 已通过 typeKey bit 6 检查，相同才到这里
        // 但仍需检查 texRange 是否一致
        if (this.fillTexture) {
            if (!element.primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE).equal(this.texRange))
                return false;
        }

        if (this.textureId === 0 && elementTexId !== 0) {
            this.textureId = elementTexId;
            this.primitiveShaderData = element.primitiveShaderData;
            this.textureKey = element.textureKey;
        }

        return true;
    }
}

/**
 * WebGPU批次上下文，用于跟踪批次的状态信息
 */
class WebGPUBatchContext extends BaseBatchContext {

    setHead(element: IPrimitiveRenderElement2D): void {
        this.primitiveShaderData = element.primitiveShaderData;
        this.materialShaderData = element.materialShaderData;
        this.subShader = element.subShader;
        this.bufferState = element.geometry.bufferState;

        this.typeKey = element.typeKey;
        this.textureKey = element.textureKey;
        this.textureId = element.textureKey;
        this.globalAlpha = element.owner.globalAlpha;
        this.clipInfo = (element.owner as WebRenderStruct2D).getClipInfo();
        this.globalRenderData = element.owner.globalRenderData;
        this.fillTexture = !!(element.typeKey & ShaderDefines2D.DEFINE_BIT_FILLTEXTURE);
        this.texRange = this.primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE) as Vector4;
    }

    isCompatible(element: IPrimitiveRenderElement2D): boolean {
        // typeKey comparison (blend+flags)
        if (this.typeKey !== element.typeKey) {
            return false;
        }

        let elementTexId = element.textureKey;
        if (elementTexId !== 0 && elementTexId !== this.textureId && this.textureId !== 0)
            return false;

        // clipInfo 比较（允许不同 owner 但相同 clip 状态的元素合批）
        if (this.subShader !== element.subShader ||
            this.bufferState !== element.geometry.bufferState ||
            this.clipInfo !== (element.owner as WebRenderStruct2D).getClipInfo() ||
            element.owner.globalRenderData !== this.globalRenderData) {
            return false;
        }

        // 检查材质 自定义材质直接比对 shaderdata
        if ((this.typeKey & ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL) !== 0 && element.materialShaderData !== this.materialShaderData) {
            return false;
        }

        // fillTexture 已通过 typeKey bit 6 检查，相同才到这里
        // 但仍需检查 texRange 是否一致
        if (this.fillTexture) {
            let primitiveShaderData = element.primitiveShaderData;
            if (!primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE).equal(this.texRange))
                return false;
        }

        if (this.textureId === 0 && elementTexId !== 0) {
            this.textureId = elementTexId;
            this.primitiveShaderData = element.primitiveShaderData;
            this.textureKey = element.textureKey;
        }

        return true;
    }
}

/**
 * @ignore
 */
export class WebGraphicsBatch implements IBatch2DProvider {
    _buffer: BatchBuffer;
    _merged: Array<IPrimitiveRenderElement2D>;
    _context: BaseBatchContext;

    static readonly _pool: IPool<IPrimitiveRenderElement2D> = Pool.createPool2<IPrimitiveRenderElement2D>(
        () => { //create
            let element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
            element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            element.geometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
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
            element.typeKey = 0;
            element.textureKey = 0;
        });

    constructor() {
        this._buffer = new BatchBuffer();
        this._merged = [];

        let isWebgl = !!(LayaGL.renderEngine as unknown as RenderEngineWebGLProbe).gl;
        if (isWebgl) {
            this._context = new WebGLBatchContext();
        } else {
            this._context = new WebGPUBatchContext();
        }
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
            let maxGroup = 1;
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

                    elementFlags[i] = group = maxGroup++;
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
                    else if (ctx.textureId !== 0)
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

    private merge(elementArray: Array<IPrimitiveRenderElement2D>, start: number, end: number, batchContext: BaseBatchContext, indice?: Int16Array): IPrimitiveRenderElement2D {
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
                staticBatchRenderElement.typeKey = batchContext.typeKey;
                staticBatchRenderElement.textureKey = batchContext.textureKey;
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
                if (currentOffset + currentCount * GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE === offset) {
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

var elementFlags: Int16Array;
var elementIndice: Int16Array;
var rectLeftCache: Float32Array;
var rectTopCache: Float32Array;
var rectRightCache: Float32Array;
var rectBottomCache: Float32Array;
function initCache(maxElements: number) {
    elementFlags = new Int16Array(maxElements);
    elementIndice = new Int16Array(maxElements);
    rectLeftCache = new Float32Array(maxElements);
    rectTopCache = new Float32Array(maxElements);
    rectRightCache = new Float32Array(maxElements);
    rectBottomCache = new Float32Array(maxElements);
}
