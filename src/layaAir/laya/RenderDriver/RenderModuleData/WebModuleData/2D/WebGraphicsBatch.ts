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
import { WebGraphicsRetainedIndexBuffer } from "./WebGraphicsRetainedIndexBuffer";
import { BatchManager, IBatch2DProvider } from "./BatchManager";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { GraphicsOpRenderStateHelper } from "../../../../display/Scene2DSpecial/GraphicsRenderPipeline/GraphicsPipelineHelpers";
import { Vector4 } from "../../../../maths/Vector4";
import { WebRender2DPass } from "./WebRender2DPass";
import { WebGraphicsRenderUnit, type WebGraphicsBatchEntry } from "./WebGraphicsOp2DRuntimeBuffers";
import { WebGraphicsCommandStreamDataHandle } from "./WebRenderDataHandle";
import type { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";

const _STEP_ = 1024;
const TEXTURE_VARIANT_TYPE_MASK = ShaderDefines2D.DEFINE_BIT_GAMMATEXTURE
    | ShaderDefines2D.DEFINE_BIT_USE_TEX_ARRAY;

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
                let handle = element.owner.renderDataHandler as WebGraphicsCommandStreamDataHandle;
                entry = handle.getGraphicsBatchEntry(element._index);
            }

            if (entry) {
                let sourceIndexView = entry.sourceIndexView;
                geometry = entry.batchGeometry;
                let bufferState = this.bindBuffer(entry.vertexBuffer);
                this.indexCount += sourceIndexView.length;
                this.updateBufLength();
                this.wholeBuffer.appendIndexData(sourceIndexView._getData(), geometry);

                if (geometry.bufferState !== bufferState)
                    geometry.bufferState = bufferState;

                WebRender2DPass.setBuffer(this.wholeBuffer);
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
    primitiveSource: IPrimitiveRenderElement2D = null;
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

    protected _isTypeKeyCompatible(element: IPrimitiveRenderElement2D): boolean {
        if (this.typeKey === element.typeKey)
            return true;

        // Vertices without a texture use the same texture shader with useTex=0.
        // They can adopt the gamma/texture-array variant of a textured neighbor.
        if (this.textureId !== 0 && element.textureKey !== 0)
            return false;

        return ((this.typeKey ^ element.typeKey) & ~TEXTURE_VARIANT_TYPE_MASK) === 0;
    }

    _adoptTextureState(element: IPrimitiveRenderElement2D): void {
        this.textureId = element.textureKey;
        this.textureKey = element.textureKey;
        this.typeKey = element.typeKey;
        this.primitiveShaderData = element.primitiveShaderData;
        this.primitiveSource = element;
    }

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
        if (!this._isTypeKeyCompatible(element)) {
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
            this._adoptTextureState(element);
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
        this.primitiveSource = element;
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
        if (!this._isTypeKeyCompatible(element)) {
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
            this._adoptTextureState(element);
        }

        return true;
    }
}

interface RetainedBatchGeometry {
    start: number;
    capacity: number;
    indexCount: number;
    vertexBuffer: IVertexBuffer;
    revisions: number[];
}

type GraphicsBindingSource = ShaderData & {
    _id: number;
    getGraphicsPrimitiveBindingRevision?(): number;
};

/** @internal */
export interface RetainedBatchElements {
    owner: WebRenderStruct2D;
    provider: WebGraphicsBatch;
    nextForOwner: RetainedBatchElements;
    elements: IPrimitiveRenderElement2D[];
    primitiveData: ShaderData[];
    // Three numeric fields per element: source ID, source revision, and retained data revision.
    bindingVersions: number[];
    geometry: RetainedBatchGeometry[];
    generation: number;
    used: number;
}

function sameVector(a: Vector4, b: Vector4): boolean {
    return a === b || (a == null && b == null)
        || (!!a && !!b && a.x === b.x && a.y === b.y && a.z === b.z && a.w === b.w);
}

function sameGraphicsBindings(a: ShaderData, b: ShaderData): boolean {
    const dataA = a.getData();
    const dataB = b.getData();
    const tex2D = ShaderDefines2D.UNIFORM_SPRITETEXTURE;
    const texArray = ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY;
    if ((dataA[tex2D] ?? null) !== (dataB[tex2D] ?? null)
        || (dataA[texArray] ?? null) !== (dataB[texArray] ?? null)
        || (a.getTexture(tex2D) ?? null) !== (b.getTexture(tex2D) ?? null)
        || (a.getTexture(texArray) ?? null) !== (b.getTexture(texArray) ?? null)
        || !sameVector(a.getVector(ShaderDefines2D.UNIFORM_TEXRANGE), b.getVector(ShaderDefines2D.UNIFORM_TEXRANGE))
        || !sameVector(a.getVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE), b.getVector(ShaderDefines2D.UNIFORM_VERTEX_SIZE)))
        return false;

    const definesA = a.getDefineData();
    const definesB = b.getDefineData();
    if (definesA._length !== definesB._length)
        return false;
    for (let i = 0; i < definesA._length; i++) {
        if (definesA._mask[i] !== definesB._mask[i])
            return false;
    }
    return true;
}

/**
 * @ignore
 */
export class WebGraphicsBatch implements IBatch2DProvider {
    _buffer: BatchBuffer;
    _merged: Array<IPrimitiveRenderElement2D>;
    _context: BaseBatchContext;

    private readonly _retained: RetainedBatchElements[];
    private readonly _bucketPool: RetainedBatchElements[];
    private readonly _spares: IPrimitiveRenderElement2D[];
    private _batchGeneration: number = 0;
    private _retainedIndexBuffer: WebGraphicsRetainedIndexBuffer;

    private static _createElement(): IPrimitiveRenderElement2D {
        const element = LayaGL.render2DRenderPassFactory.createPrimitiveRenderElement2D();
        element.geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        element.geometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
        element.nodeCommonMap = ["Sprite2D"];
        element.renderStateIsBySprite = false;
        return element;
    }

    private static _resetElement(element: IPrimitiveRenderElement2D): void {
        element.geometry.clearRenderParams();
        element.geometry.bufferState = null;
        element.materialShaderData = null;
        element.value2DShaderData = null;
        element.primitiveShaderData = null;
        element.subShader = null;
        element.owner = null;
        element.renderStateIsBySprite = false;
        element.globalShaderData = null;
        element.stencilClipState = null;
        element.noBatch = false;
        element.typeKey = 0;
        element.textureKey = 0;
    }

    static readonly _pool: IPool<IPrimitiveRenderElement2D> = Pool.createPool2(
        WebGraphicsBatch._createElement, null, WebGraphicsBatch._resetElement
    );

    constructor() {
        this._buffer = new BatchBuffer();
        this._merged = [];

        let isWebgl = !!(LayaGL.renderEngine as unknown as RenderEngineWebGLProbe).gl;
        if (isWebgl) {
            this._context = new WebGLBatchContext();
        } else {
            this._context = new WebGPUBatchContext();
            this._retained = [];
            this._bucketPool = [];
            this._spares = [];
        }
    }

    reset() {
        this._buffer.clear();
        if (this._retained)
            this._batchGeneration++;
        else
            WebGraphicsBatch._pool.recover(this._merged);
    }

    finishBatch(): void {
        const retained = this._retained;
        if (!retained)
            return;
        let write = 0;
        for (let i = 0; i < retained.length; i++) {
            const bucket = retained[i];
            const used = bucket.generation === this._batchGeneration ? bucket.used : 0;
            this._releaseUnusedElements(bucket, used);
            if (used > 0)
                retained[write++] = bucket;
            else
                this._detachBucket(bucket);
        }
        retained.length = write;
        this._retainedIndexBuffer?.flush();
    }

    clearRenderElementCache(): boolean {
        const retained = this._retained;
        if (!retained)
            return false;
        const changed = retained.length !== 0 || this._spares.length !== 0 || !!this._retainedIndexBuffer;
        for (let i = 0; i < retained.length; i++) {
            const bucket = retained[i];
            this._releaseUnusedElements(bucket, 0);
            this._detachBucket(bucket);
        }
        retained.length = 0;
        this._bucketPool.length = 0;
        for (let i = 0; i < this._spares.length; i++) {
            const element = this._spares[i];
            element.geometry.destroy();
            element.destroy();
        }
        this._spares.length = 0;
        this._retainedIndexBuffer?.destroy();
        this._retainedIndexBuffer = null;
        return changed;
    }

    private _releaseUnusedElements(bucket: RetainedBatchElements, used: number): void {
        const elements = bucket.elements;
        const primitiveData = bucket.primitiveData;
        for (let i = used; i < elements.length; i++) {
            const element = elements[i];
            WebGraphicsBatch._resetElement(element);
            primitiveData[i]?.destroy();
            const geometry = bucket.geometry[i];
            if (geometry)
                this._retainedIndexBuffer.release(geometry.start, geometry.capacity);
            this._spares.push(element);
        }
        elements.length = used;
        primitiveData.length = used;
        bucket.bindingVersions.length = used * 3;
        bucket.geometry.length = used;
    }

    private _detachBucket(bucket: RetainedBatchElements): void {
        const owner = bucket.owner;
        let current = owner._graphicsBatchRetention;
        if (current === bucket) {
            owner._graphicsBatchRetention = bucket.nextForOwner;
        } else {
            while (current.nextForOwner !== bucket)
                current = current.nextForOwner;
            current.nextForOwner = bucket.nextForOwner;
        }
        bucket.owner = null;
        bucket.provider = null;
        bucket.nextForOwner = null;
        this._bucketPool.push(bucket);
    }

    private _getBucket(owner: WebRenderStruct2D): RetainedBatchElements {
        let bucket = owner._graphicsBatchRetention;
        // Most nodes enter one pass. Keep other passes on the same node without a hash lookup.
        while (bucket && bucket.provider !== this)
            bucket = bucket.nextForOwner;
        if (!bucket) {
            bucket = this._bucketPool.pop() ?? {
                owner: null, provider: null, nextForOwner: null, elements: [], primitiveData: [],
                bindingVersions: [], geometry: [], generation: -1, used: 0
            };
            bucket.owner = owner;
            bucket.provider = this;
            bucket.nextForOwner = owner._graphicsBatchRetention;
            bucket.generation = -1;
            owner._graphicsBatchRetention = bucket;
            this._retained.push(bucket);
        }
        if (bucket.generation !== this._batchGeneration) {
            bucket.generation = this._batchGeneration;
            bucket.used = 0;
        }
        return bucket;
    }

    destroy(): void {
        this.clearRenderElementCache();
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

                const cachedGroup = group !== -1;
                if (cachedGroup) {
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
                // A cached textureless head must inherit the group's texture before
                // testing new members. Keep both cached-group fast paths unchanged.
                if (ctx.textureId === 0 && cachedGroup) {
                    for (let j = i + 1; j < cnt; j++) {
                        if (elementFlags[j] !== headGroup)
                            continue;
                        const textureHead = elementArray[start + j];
                        if (textureHead.textureKey !== 0) {
                            ctx._adoptTextureState(textureHead);
                            break;
                        }
                    }
                }
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

    private _takeElement(head: IPrimitiveRenderElement2D, context: BaseBatchContext,
        bucket: RetainedBatchElements): IPrimitiveRenderElement2D {
        if (!bucket) {
            const element = WebGraphicsBatch._pool.take();
            this._merged.push(element);
            return element;
        }

        // Built-in Graphics state is fully described by its type, macros and graphics uniforms.
        // Give the draw-list element its own ShaderData so a different source quad cannot evict its bindings.
        const ownsPrimitive = head.materialShaderData == null
            && head.subShader === GraphicsOpRenderStateHelper.getDefaultSubShader()
            && head._graphicsBatchEntry instanceof WebGraphicsRenderUnit
            && context.primitiveSource?._graphicsBatchEntry instanceof WebGraphicsRenderUnit;
        const sourceData: GraphicsBindingSource = context.primitiveShaderData;
        const sourceRevision = ownsPrimitive ? sourceData.getGraphicsPrimitiveBindingRevision?.() ?? 0 : 0;
        const elements = bucket.elements;
        const primitiveData = bucket.primitiveData;
        const versions = bucket.bindingVersions;
        const next = bucket.used++;
        const nextVersion = next * 3;
        let index = next;
        let ownedRevision = 0;
        for (; index < elements.length; index++) {
            const previous = elements[index];
            if (previous.subShader !== head.subShader
                || previous.value2DShaderData !== head.value2DShaderData
                || previous.materialShaderData !== head.materialShaderData
                || previous.renderStateIsBySprite !== head.renderStateIsBySprite
                || previous.stencilClipState !== head.stencilClipState
                || previous.typeKey !== context.typeKey
                || previous.textureKey !== context.textureKey)
                continue;
            if (!ownsPrimitive) {
                if (previous.primitiveShaderData === sourceData)
                    break;
                continue;
            }

            const owned = primitiveData[index] as GraphicsBindingSource;
            if (!owned)
                continue;
            const versionSlot = index * 3;
            ownedRevision = sourceRevision ? owned.getGraphicsPrimitiveBindingRevision?.() ?? 0 : 0;
            if (sourceRevision && ownedRevision
                && versions[versionSlot] === sourceData._id
                && versions[versionSlot + 1] === sourceRevision
                && versions[versionSlot + 2] === ownedRevision)
                break;
            if (sameGraphicsBindings(owned, sourceData))
                break;
        }

        let element = elements[index];
        let owned = primitiveData[index] as GraphicsBindingSource;
        const geometry = bucket.geometry[index];
        if (!element) {
            element = this._spares.pop() || WebGraphicsBatch._createElement();
            owned = ownsPrimitive ? sourceData.clone() as GraphicsBindingSource : null;
            this._setBatchBindings(element, head, context, owned ?? sourceData);
            // Cloning may re-resolve a texture host. Only cache a stamp after verifying the result.
            ownedRevision = sourceRevision && owned && sameGraphicsBindings(owned, sourceData)
                ? owned.getGraphicsPrimitiveBindingRevision?.() ?? 0 : 0;
        }

        // Move the selected slot into the emitted prefix without changing the other slots' state.
        if (index !== next) {
            elements[index] = elements[next];
            primitiveData[index] = primitiveData[next];
            bucket.geometry[index] = bucket.geometry[next];
            const versionSlot = index * 3;
            versions[versionSlot] = versions[nextVersion];
            versions[versionSlot + 1] = versions[nextVersion + 1];
            versions[versionSlot + 2] = versions[nextVersion + 2];
        }
        elements[next] = element;
        primitiveData[next] = owned;
        bucket.geometry[next] = geometry;
        versions[nextVersion] = sourceRevision && ownedRevision ? sourceData._id : -1;
        versions[nextVersion + 1] = sourceRevision;
        versions[nextVersion + 2] = ownedRevision;
        return element;
    }

    private _setBatchBindings(output: IPrimitiveRenderElement2D, head: IPrimitiveRenderElement2D,
        context: BaseBatchContext, primitiveData: ShaderData): void {
        output.materialShaderData = head.materialShaderData;
        output.value2DShaderData = head.value2DShaderData;
        output.subShader = head.subShader;
        output.renderStateIsBySprite = head.renderStateIsBySprite;
        output.primitiveShaderData = primitiveData;
        output.owner = head.owner;
        output.stencilClipState = head.stencilClipState;
        output.typeKey = context.typeKey;
        output.textureKey = context.textureKey;
    }

    private _useRetainedGeometry(output: IPrimitiveRenderElement2D, bucket: RetainedBatchElements,
        elementArray: IPrimitiveRenderElement2D[], start: number, end: number, indice?: Int16Array): boolean {
        const slot = bucket.used - 1;
        let range = bucket.geometry[slot];
        const head = elementArray[indice ? indice[start] : start];
        const firstUnit = head._graphicsBatchEntry;
        const vertexBuffer = firstUnit instanceof WebGraphicsRenderUnit ? firstUnit.vertexBuffer : null;
        let indexCount = 0;
        let firstChanged = -1;
        let changedOffset = 0;
        for (let i = start; i <= end; i++) {
            const element = elementArray[indice ? indice[i] : i];
            const unit = element._graphicsBatchEntry;
            if (!vertexBuffer || element._index == null || !(unit instanceof WebGraphicsRenderUnit)
                || unit.vertexBuffer !== vertexBuffer || !unit.sourceIndexView?.indexRevision
                || unit.sourceIndexView.length <= 0) {
                if (range) {
                    this._retainedIndexBuffer.release(range.start, range.capacity);
                    bucket.geometry[slot] = null;
                }
                return false;
            }
            const view = unit.sourceIndexView;
            if (firstChanged === -1 && view.indexRevision !== range?.revisions[i - start]) {
                firstChanged = i;
                changedOffset = indexCount;
            }
            indexCount += view.length;
        }
        if (range && firstChanged === -1 && range.indexCount === indexCount
            && range.revisions.length === end - start + 1 && range.vertexBuffer === vertexBuffer)
            return true;

        const buffer = this._retainedIndexBuffer ?? (this._retainedIndexBuffer = new WebGraphicsRetainedIndexBuffer());
        if (!range)
            range = bucket.geometry[slot] = { start: 0, capacity: 0, indexCount: 0, vertexBuffer: null, revisions: [] };
        const geometry = output.geometry;
        if (range.vertexBuffer !== vertexBuffer) {
            geometry.bufferState = buffer.bindBuffer(vertexBuffer);
            range.vertexBuffer = vertexBuffer;
        }
        const needsRange = indexCount > range.capacity;
        if (needsRange) {
            buffer.release(range.start, range.capacity);
            range.start = buffer.allocate(indexCount);
            range.capacity = indexCount;
            firstChanged = start;
            changedOffset = 0;
        }
        if (firstChanged >= 0) {
            let offset = range.start + changedOffset;
            for (let i = firstChanged; i <= end; i++) {
                const element = elementArray[indice ? indice[i] : i];
                const source = (element._graphicsBatchEntry as WebGraphicsRenderUnit).sourceIndexView;
                buffer.write(offset, source._getData());
                offset += source.length;
                range.revisions[i - start] = source.indexRevision;
            }
        }
        range.revisions.length = end - start + 1;
        if (needsRange || range.indexCount !== indexCount) {
            geometry.clearRenderParams();
            geometry.setDrawElemenParams(indexCount, range.start * GraphicsDefines.GRAPHICS_INDEX_BYTE_SIZE);
            range.indexCount = indexCount;
        }
        return true;
    }

    private merge(elementArray: Array<IPrimitiveRenderElement2D>, start: number, end: number, batchContext: BaseBatchContext, indice?: Int16Array): IPrimitiveRenderElement2D {
        if (start === end) {
            let element = elementArray[indice !== undefined ? indice[start] : start];
            return element;
        }

        const head = elementArray[indice !== undefined ? indice[start] : start];
        const bucket = this._retained ? this._getBucket(head.owner as WebRenderStruct2D) : null;
        const staticBatchRenderElement = this._takeElement(head, batchContext, bucket);
        if (bucket?.primitiveData[bucket.used - 1]
            && this._useRetainedGeometry(staticBatchRenderElement, bucket, elementArray, start, end, indice))
            return staticBatchRenderElement;

        let batchedGeometry = staticBatchRenderElement.geometry;
        if (this._retained)
            batchedGeometry.clearRenderParams();
        let currentOffset = 0;
        let currentCount = 0;
        let isFirst = true;

        for (let i = start; i <= end; i++) {
            let element = elementArray[indice !== undefined ? indice[i] : i];
            let geometry = this._buffer.add(element) || element.geometry;
            if (i === start) {
                if (batchedGeometry.bufferState !== geometry.bufferState)
                    batchedGeometry.bufferState = geometry.bufferState;
                if (!this._retained)
                    this._setBatchBindings(staticBatchRenderElement, element, batchContext, batchContext.primitiveShaderData);
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
