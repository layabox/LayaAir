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
import {  IBatch2DProvider } from "./BatchManager";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { Vector4 } from "../../../../maths/Vector4";
import type { BaseTexture } from "../../../../resource/BaseTexture";
import { Shader2D } from "../../../../webgl/shader/d2/Shader2D";
import type { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import type { InternalTexture } from "../../../DriverDesign/RenderDevice/InternalTexture";
import type { IClipInfo } from "../../Design/2D/IRenderStruct2D";
import { WebRender2DPass } from "./WebRender2DPass";
import { WebGraphicsRenderUnit, type WebGraphicsBatchEntry } from "./WebGraphicsOp2DRuntimeBuffers";
import { WebGraphicsCommandStreamDataHandle } from "./WebRenderDataHandle";

const _STEP_ = 1024;
const DESTROYED_TEXTURE_CHECK_INTERVAL_MS = 5000;
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
    primitiveSource: IPrimitiveRenderElement2D;
    get primitiveShaderData(): ShaderData {
        return this.primitiveSource.primitiveShaderData;
    }
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

/** Bindings of a built-in Graphics batch, independent of the unit that supplied the texture. */
interface GraphicsBatchBindings {
    texture: BaseTexture;
    internalTexture: InternalTexture;
    fillRange: Vector4;
    bufferState: IBufferState;
    clipInfo: IClipInfo;
    globalRenderData: WebRenderStruct2D["globalRenderData"];
}

interface RetainedGraphicsElement extends IPrimitiveRenderElement2D {
    _graphicsBindings?: GraphicsBatchBindings;
}

/** @internal Batches with the same head node, within one render pass. */
export interface RetainedGraphicsBatches {
    owner: WebRenderStruct2D;
    provider: WebGraphicsBatch;
    next: RetainedGraphicsBatches;
    elements: RetainedGraphicsElement[];
    nodeData: ShaderData;
    used: number;
    generation: number;
}

/**
 * @ignore
 */
export class WebGraphicsBatch implements IBatch2DProvider {
    _buffer: BatchBuffer;
    _merged: Array<IPrimitiveRenderElement2D>;
    _context: BaseBatchContext;
    private readonly _retainElements: boolean;
    private readonly _retainedBatches = new Set<RetainedGraphicsBatches>();
    private readonly _destroyedOwnerBatches: RetainedGraphicsBatches[] = [];
    private _generation = 0;
    private _lastTextureCheck = 0;

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
            element.stencilClipState = null;
            element.noBatch = false;
            element.typeKey = 0;
            element.textureKey = 0;
        });

    constructor() {
        this._buffer = new BatchBuffer();
        this._merged = [];

        let isWebgl = !!(LayaGL.renderEngine as unknown as RenderEngineWebGLProbe).gl;
        this._retainElements = !isWebgl;
        if (isWebgl) {
            this._context = new WebGLBatchContext();
        } else {
            this._context = new WebGPUBatchContext();
        }
    }

    reset() {
        this._buffer.clear();
        WebGraphicsBatch._pool.recover(this._merged);
        this._generation++;
        // The pass has dropped its previous draw list; destroyed owners' outputs are now safe to release.
        for (const batch of this._destroyedOwnerBatches)
            this._releaseBatch(batch);
        this._destroyedOwnerBatches.length = 0;

        if (this._retainedBatches.size) {
            const now = performance.now();
            if (now - this._lastTextureCheck >= DESTROYED_TEXTURE_CHECK_INTERVAL_MS) {
                this._lastTextureCheck = now;
                this._releaseDestroyedTextures();
            }
        }
    }

    /** @internal */
    _onBatchOwnerDestroyed(batch: RetainedGraphicsBatches): void {
        this._destroyedOwnerBatches.push(batch);
    }

    clearRenderElementCache(): boolean {
        const hadElements = this._retainedBatches.size > 0;
        this._destroyedOwnerBatches.length = 0;
        for (const batch of this._retainedBatches)
            this._releaseBatch(batch);
        return hadElements;
    }

    private _releaseDestroyedTextures(): void {
        for (const batch of this._retainedBatches) {
            const elements = batch.elements;
            for (let i = elements.length - 1; i >= 0; i--) {
                const element = elements[i];
                if (element._graphicsBindings?.texture.destroyed) {
                    this._destroyBatchElement(element);
                    elements[i] = elements[elements.length - 1];
                    elements.pop();
                }
            }
            if (!elements.length)
                this._releaseBatch(batch);
        }
    }

    private _destroyBatchElement(element: RetainedGraphicsElement): void {
        const ownedData = element._graphicsBindings ? element.primitiveShaderData : null;
        element.value2DShaderData = null;
        element.materialShaderData = null;
        element.primitiveShaderData = null;
        ownedData?.destroy();
        element._graphicsBindings = null;
        element.geometry.destroy();
        element.destroy();
    }

    private _releaseBatch(batch: RetainedGraphicsBatches): void {
        this._retainedBatches.delete(batch);
        for (const element of batch.elements)
            this._destroyBatchElement(element);
        batch.elements.length = 0;

        const owner = batch.owner;
        if (owner._retainedGraphicsBatches === batch) {
            owner._retainedGraphicsBatches = batch.next;
        } else {
            let previous = owner._retainedGraphicsBatches;
            while (previous.next !== batch)
                previous = previous.next;
            previous.next = batch.next;
        }
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
        ctx.primitiveSource = null;
    }

    private _getRetainedTexture(head: IPrimitiveRenderElement2D, context: BaseBatchContext): BaseTexture {
        if (!(head._graphicsBatchEntry instanceof WebGraphicsRenderUnit)
            || !(context.primitiveSource._graphicsBatchEntry instanceof WebGraphicsRenderUnit)
            || (context.typeKey & (ShaderDefines2D.TYPEKEY_CUSTOM_MATERIAL | ShaderDefines2D.DEFINE_BIT_VERTEX_SIZE))
            || head.materialShaderData || head.subShader !== Shader2D.graphicsShader?.getSubShaderAt(0))
            return null;

        const slot = (context.typeKey & ShaderDefines2D.DEFINE_BIT_USE_TEX_ARRAY)
            ? ShaderDefines2D.UNIFORM_SPRITETEXTURE_ARRAY : ShaderDefines2D.UNIFORM_SPRITETEXTURE;
        const data = context.primitiveShaderData;
        const texture = data.getTexture(slot);
        // A live wrapper must still match the source binding before cloning. A destroyed wrapper takes the transient path.
        return texture && (texture._texture === data.getData()[slot] || texture.destroyed) ? texture : null;
    }

    private _takeBatchElement(head: IPrimitiveRenderElement2D, context: BaseBatchContext): IPrimitiveRenderElement2D {
        const texture = this._retainElements ? this._getRetainedTexture(head, context) : null;
        if (!this._retainElements || texture?.destroyed) {
            const element = this._createBatchElement(head, context, null);
            this._merged.push(element);
            return element;
        }

        const owner = head.owner as WebRenderStruct2D;
        let batch = owner._retainedGraphicsBatches;
        while (batch && batch.provider !== this)
            batch = batch.next;
        if (!batch) {
            batch = {
                owner, provider: this, next: owner._retainedGraphicsBatches,
                elements: [], nodeData: owner.spriteShaderData, used: 0, generation: this._generation
            };
            owner._retainedGraphicsBatches = batch;
            this._retainedBatches.add(batch);
        } else if (batch.generation !== this._generation) {
            batch.generation = this._generation;
            batch.used = 0;
            if (batch.nodeData !== owner.spriteShaderData) {
                batch.nodeData = owner.spriteShaderData;
                for (const element of batch.elements) {
                    if (element._graphicsBindings)
                        element.value2DShaderData = batch.nodeData;
                }
            }
        }

        // Only search unused elements belonging to this node and pass.
        const elements = batch.elements;
        const slot = batch.used;
        let index = slot;
        for (; index < elements.length; index++) {
            const element = elements[index];
            if (element.typeKey !== context.typeKey || element.textureKey !== context.textureKey
                || element.subShader !== head.subShader || element.stencilClipState !== head.stencilClipState
                || element.renderStateIsBySprite !== head.renderStateIsBySprite)
                continue;

            const bindings = element._graphicsBindings;
            if (texture) {
                if (bindings && bindings.texture === texture && bindings.internalTexture === texture._texture
                    && bindings.bufferState === context.bufferState && bindings.clipInfo === context.clipInfo
                    && bindings.globalRenderData === context.globalRenderData
                    && (!context.fillTexture || bindings.fillRange.equal(context.texRange)))
                    break;
            } else if (!bindings && element.value2DShaderData === head.value2DShaderData
                && element.materialShaderData === head.materialShaderData
                && element.primitiveShaderData === context.primitiveShaderData) {
                break;
            }
        }

        const element = elements[index] ?? this._createBatchElement(head, context, texture);
        if (index !== slot)
            elements[index] = elements[slot];
        elements[slot] = element;
        batch.used++;
        return element;
    }

    private _createBatchElement(head: IPrimitiveRenderElement2D, context: BaseBatchContext, texture: BaseTexture): RetainedGraphicsElement {
        const element: RetainedGraphicsElement = WebGraphicsBatch._pool.take();
        element.materialShaderData = head.materialShaderData;
        element.value2DShaderData = head.value2DShaderData;
        element.subShader = head.subShader;
        element.renderStateIsBySprite = head.renderStateIsBySprite;
        if (texture) {
            // Source units can change texture or return to their pool while this batch stays live.
            element.primitiveShaderData = context.primitiveShaderData.clone();
            element._graphicsBindings = {
                texture, internalTexture: texture._texture,
                fillRange: context.fillTexture ? element.primitiveShaderData.getVector(ShaderDefines2D.UNIFORM_TEXRANGE) : null,
                bufferState: context.bufferState, clipInfo: context.clipInfo, globalRenderData: context.globalRenderData
            };
        } else {
            element.primitiveShaderData = context.primitiveShaderData;
        }
        element.owner = head.owner;
        element.stencilClipState = head.stencilClipState;
        element.typeKey = context.typeKey;
        element.textureKey = context.textureKey;
        return element;
    }

    private merge(elementArray: Array<IPrimitiveRenderElement2D>, start: number, end: number, batchContext: BaseBatchContext, indice?: Int16Array): IPrimitiveRenderElement2D {
        if (start === end) {
            let element = elementArray[indice !== undefined ? indice[start] : start];
            return element;
        }

        const head = elementArray[indice !== undefined ? indice[start] : start];
        const staticBatchRenderElement = this._takeBatchElement(head, batchContext);
        let batchedGeometry = staticBatchRenderElement.geometry;
        if (this._retainElements)
            batchedGeometry.clearRenderParams();
        let currentOffset = 0;
        let currentCount = 0;
        let isFirst = true;

        for (let i = start; i <= end; i++) {
            let element = elementArray[indice !== undefined ? indice[i] : i];
            let geometry = this._buffer.add(element) || element.geometry;
            if (i === start && batchedGeometry.bufferState !== geometry.bufferState)
                batchedGeometry.bufferState = geometry.bufferState;

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
