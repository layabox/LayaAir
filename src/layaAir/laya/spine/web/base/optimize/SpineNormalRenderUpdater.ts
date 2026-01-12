import { LayaGL } from "../../../../layagl/LayaGL";
import { IBufferState } from "../../../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Material } from "../../../../resource/Material";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { SpineConst } from "../../../SpineConst";
import { SpineRenderUpdater } from "./SpineRenderUpdater";
import { SpineTexture } from "../../SpineTexture";
import { IRenderBatch, ISpineNormalUpdater } from "../../IWebSpine";
import { FrameRenderCache } from "./AnimationRender";
import { BufferUsage } from "../../../../RenderEngine/RenderEnum/BufferTargetType";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

/**
 * @en Buffer info for a single submesh (vertices + indices).
 * @zh 单个 submesh 的缓冲区信息（顶点 + 索引）。
 */
interface SubMeshBuffer {
    vertexData: Float32Array;
    indexData: Uint16Array;
    vertexLength: number;  // 实际使用的顶点数据长度
    indexLength: number;   // 实际使用的索引数据长度
    bufferState: IBufferState;  // 每个submesh独立的bufferState
    cacheVertex: Float32Array;  // 缓存的原始顶点数据（变换前）
    cacheIndex: Uint16Array;    // 缓存的原始索引数据
    offsetX: number;            // X 轴偏移
    offsetY: number;            // Y 轴偏移
}

/**
 * @en Render batch structure - unified management of geometry, buffer and material.
 * @zh 渲染批次结构 - 统一管理 geometry、buffer 和 material。
 */
export interface SpineRenderBatch extends IRenderBatch{
    buffer: SubMeshBuffer;
    materialIndex: number;
}

export class SpineNormalRenderUpdater implements ISpineNormalUpdater {
    /** @internal */
    static _TEMP_COLOR: spine.Color;
    /** @internal */
    static _TEMP_COLOR2: spine.Color;

    static positions: Float32Array;

    static __init__(): void {
        SpineNormalRenderUpdater.positions = new Float32Array(SpineConst.NORMAL_MAX_VERTEX * 2);
        SpineNormalRenderUpdater._TEMP_COLOR = new spine.Color();
        SpineNormalRenderUpdater._TEMP_COLOR2 = new spine.Color();
    }

    private clipper = new spine.SkeletonClipping();

    /**
     * @en Render batches array - each batch contains geometry, buffer and material.
     * @zh 渲染批次数组 - 每个批次包含 geometry、buffer 和 material。
     */
    batches: SpineRenderBatch[] = [];
   
    /**
     * @en Current batch index being built.
     * @zh 当前正在构建的批次索引。
     */
    private _currentBatchIndex = -1;

    /**
     * @en Maximum vertices per buffer (Uint16 max index value + 1).
     * @zh 每个缓冲区的最大顶点数（Uint16 最大索引值 + 1）。
     */
    private static readonly MAX_VERTICES_PER_BUFFER = 65536;

    _internalMaterials: Material[] = [];

    materials: Material[] = [];

    /** @internal */
    _materialIndex = 0;

    needUpdate = false;

    subMeshes: IRenderGeometryElement[] = [];

    // 自动缓存模式
    autoCacheEnabled: boolean = false;

    /**
     * @en Restore rendering data from cache.
     * @param cache Cached frame data.
     * @param offsetX X axis offset.
     * @param offsetY Y axis offset.
     * @zh 从缓存恢复渲染数据。
     * @param cache 缓存的帧数据。
     * @param offsetX X轴偏移。
     * @param offsetY Y轴偏移。
     */
    restoreFromCache(cache: FrameRenderCache, offsetX: number = 0, offsetY: number = 0): void {
        if (!cache) return;

        const blockCount = cache.renderBlocks.length;

        // 确保 renderBatches 数组长度足够
        if (this.batches.length < blockCount) {
            for (let i = this.batches.length; i < blockCount; i++) {
                // Create bufferState with vertex and index buffers
                const vertexDeclaration = SpineShaderInit.SpineNormalVertexDeclaration;
                const vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(
                    BufferUsage.Dynamic
                );
                vertexBuffer.vertexDeclaration = vertexDeclaration;

                const indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(
                    BufferUsage.Dynamic
                );

                const bufferState = LayaGL.renderDeviceFactory.createBufferState();
                bufferState.applyState([vertexBuffer], indexBuffer);

            const buffer: SubMeshBuffer = {
                vertexData: new Float32Array(SpineConst.VERTEX_INITIAL_CAPACITY * SpineConst.VERTEX_TWOCOLOR),
                indexData: new Uint16Array(SpineConst.VERTEX_INITIAL_CAPACITY * 3),
                vertexLength: 0,
                indexLength: 0,
                bufferState: bufferState,
                cacheVertex: null,
                cacheIndex: null,
                offsetX: 0,
                offsetY: 0
            };

                const geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(
                    MeshTopology.Triangles,
                    DrawType.DrawElement
                );
                geometry.indexFormat = IndexFormat.UInt16;
                // 整合 bufferState 和 geometry
                geometry.bufferState = bufferState;

                // 从缓存中获取材质索引（如果缓存中有materialIndex，否则使用i）
                const materialIndex = i < cache.materials.length ? i : cache.materials.length - 1;
                const material = cache.materials[materialIndex] || null as any;

                this.batches[i] = {
                    geometry: geometry,
                    buffer: buffer,
                    material: material,
                    materialIndex: materialIndex
                };
            }
        }

        // 填充每个批次的数据
        for (let i = 0; i < blockCount; i++) {
            const block = cache.renderBlocks[i];
            const batch = this.batches[i];
            const subMeshBuffer = batch.buffer;

            if (subMeshBuffer.vertexData.length < block.vertexData.length) {
                subMeshBuffer.vertexData = new Float32Array(block.vertexData.length);
            }

            if (block.indexData && subMeshBuffer.indexData.length < block.indexData.length) {
                subMeshBuffer.indexData = new Uint16Array(block.indexData.length);
            }

            // 将缓存数据存储到 cacheVertex 和 cacheIndex（不应用偏移）
            subMeshBuffer.cacheVertex = new Float32Array(block.vertexData.subarray(0, block.vertexLength));
            subMeshBuffer.vertexLength = block.vertexLength;
            subMeshBuffer.offsetX = offsetX;
            subMeshBuffer.offsetY = offsetY;

            if (block.indexData) {
                subMeshBuffer.cacheIndex = new Uint16Array(block.indexData.subarray(0, block.indexLength!));
                subMeshBuffer.indexLength = block.indexLength!;
            }

            this.uploadBuffer(subMeshBuffer);

            if (i < cache.materials.length) {
                batch.material = cache.materials[i];
                batch.materialIndex = i;
            }
        }

        // 从 renderBatches 提取生成提交数组（subMeshes 和 materials）
        this._currentBatchIndex = blockCount - 1;
        this.subMeshes.length = blockCount;
        this.materials.length = blockCount;
        for (let i = 0; i < blockCount; i++) {
            const batch = this.batches[i];
            if (batch) {
                this.subMeshes[i] = batch.geometry;
                this.materials[i] = batch.material;
                // 上传时应用偏移
                if (batch.buffer.vertexLength > 0) {
                    this.uploadBuffer(batch.buffer);
                }
            }
        }
        this._materialIndex = blockCount;

        // 标记需要更新
        this.needUpdate = true;
    }

    /**
     * @en Get or create current render batch.
     * @zh 获取或创建当前渲染批次。
     */
    private getCurrentBatch(): SpineRenderBatch {
        if (this._currentBatchIndex < 0 || !this.batches[this._currentBatchIndex]) {
            this._currentBatchIndex++;
            
            const vertexDeclaration = SpineShaderInit.SpineNormalVertexDeclaration;
            const vertexBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(
                BufferUsage.Dynamic
            );
            vertexBuffer.vertexDeclaration = vertexDeclaration;

            const indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(
                BufferUsage.Dynamic
            );

            const bufferState = LayaGL.renderDeviceFactory.createBufferState();
            bufferState.applyState([vertexBuffer], indexBuffer);

            const buffer: SubMeshBuffer = {
                vertexData: new Float32Array(SpineConst.NORMAL_VERTEX_LENGTH * SpineConst.VERTEX_TWOCOLOR),
                indexData: new Uint16Array(SpineConst.NORMAL_VERTEX_LENGTH * 3),
                vertexLength: 0,
                indexLength: 0,
                bufferState: bufferState,
                cacheVertex: null,
                cacheIndex: null,
                offsetX: 0,
                offsetY: 0
            };

            const geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(
                MeshTopology.Triangles,
                DrawType.DrawElement
            );
            geometry.indexFormat = IndexFormat.UInt16;
            // 整合 bufferState 和 geometry
            geometry.bufferState = bufferState;

            // 默认使用当前材质索引，材质继承由 startNewBatch 处理
            const materialIndex = this._materialIndex - 1;
            const material = materialIndex >= 0 ? this.materials[materialIndex] : null as any;

            this.batches[this._currentBatchIndex] = {
                geometry: geometry,
                buffer: buffer,
                material: material,
                materialIndex: materialIndex
            };
        }

        return this.batches[this._currentBatchIndex];
    }

    /**
     * @en Get current submesh buffer (for compatibility).
     * @zh 获取当前 submesh 缓冲区（用于兼容性）。
     */
    private getCurrentSubMeshBuffer(): SubMeshBuffer {
        return this.getCurrentBatch().buffer;
    }

    private ensureVerticesCapacity(buffer: SubMeshBuffer, requiredLength: number) {
        if (requiredLength > buffer.vertexData.length) {
            const newLength = Math.max(requiredLength, buffer.vertexData.length * 2);
            const newVertices = new Float32Array(newLength);
            newVertices.set(buffer.vertexData);
            buffer.vertexData = newVertices;
        }
    }

    private ensureIndicesCapacity(buffer: SubMeshBuffer, requiredLength: number) {
        if (requiredLength > buffer.indexData.length) {
            const newLength = Math.max(requiredLength, buffer.indexData.length * 2);
            const newIndices = new Uint16Array(newLength);
            newIndices.set(buffer.indexData);
            buffer.indexData = newIndices;
        }
    }

    renderUpdate(   
        time: number,
        skeleton: spine.Skeleton, updater: SpineRenderUpdater,
        slotRangeStart?: number, slotRangeEnd?: number,
        offsetX: number = 0, offsetY: number = 0
    ): void {
        let clipper = this.clipper;
        let twoColorTint = true;
        let blendMode: spine.BlendMode | null = null;

        let uvs: spine.NumberArrayLike;
        let triangles: spine.NumberArrayLike;
        let drawOrder = skeleton.drawOrder;
        let attachmentColor: spine.Color;
        let skeletonColor = skeleton.color;

        let vertexStride: number = SpineConst.VERTEX_TWOCOLOR;

        let inRange = false;
        if (slotRangeStart == -1) inRange = true;
        let spineTex;
        let positions = SpineNormalRenderUpdater.positions;

        let _TEMP_COLOR = SpineNormalRenderUpdater._TEMP_COLOR;
        let _TEMP_COLOR2 = SpineNormalRenderUpdater._TEMP_COLOR2;

        this._materialIndex = 0;
        this._currentBatchIndex = -1;

        let currentBufferState: IBufferState;

        const startNewBatch = () => {
            // 如果当前批次有数据，先上传并完成当前批次
            if (this._currentBatchIndex >= 0) {
                const currentBatch = this.batches[this._currentBatchIndex];
                if (currentBatch && currentBatch.buffer.vertexLength > 0) {
                    this.uploadBuffer(currentBatch.buffer);
                }
            }

            const batch = this.getCurrentBatch();
            currentBufferState = batch.buffer.bufferState;

            batch.buffer.vertexLength = 0;
            batch.buffer.indexLength = 0;
            // 清理缓存数据
            batch.buffer.cacheVertex = null;
            batch.buffer.cacheIndex = null;
            batch.buffer.offsetX = offsetX;
            batch.buffer.offsetY = offsetY;

            if ( this._currentBatchIndex > 0) {
                batch.material = this.batches[this._currentBatchIndex - 1].material;
                batch.materialIndex = this.batches[this._currentBatchIndex - 1].materialIndex;
            }
        };

        startNewBatch();

        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let clippedVertexStride = clipper.isClipping() ? 2 : vertexStride;
            let slot = drawOrder[i];
            let boneOrSlot = SpineConst.NEED_SLOT ? slot : slot.bone;

            if (!slot.bone.active) {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (slotRangeStart >= 0 && slotRangeStart == slot.data.index) {
                inRange = true;
            }

            if (!inRange) {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (slotRangeEnd >= 0 && slotRangeEnd == slot.data.index) {
                inRange = false;
            }

            let attachment = slot.getAttachment();
            let texture: SpineTexture;
            let verticesLength = 0;

            if (attachment instanceof window.spine.RegionAttachment) {
                let region = <spine.RegionAttachment>attachment;
                verticesLength = clippedVertexStride << 2;

                if (attachment.sequence != null)
                    attachment.sequence.apply(slot, attachment);

                region.computeWorldVertices(boneOrSlot as any, positions, 0, clippedVertexStride);
                triangles = QUAD_TRIANGLES;
                uvs = region.uvs;
                texture = <SpineTexture>(region.region as any).page.texture;
                attachmentColor = region.color;

            } else if (attachment instanceof window.spine.MeshAttachment) {
                let mesh = <spine.MeshAttachment>attachment;
                verticesLength = (mesh.worldVerticesLength >> 1) * clippedVertexStride;
                if (verticesLength > positions.length) {
                    positions = new Float32Array(verticesLength);
                    SpineNormalRenderUpdater.positions = positions;
                }

                mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, positions, 0, clippedVertexStride);
                triangles = mesh.triangles;
                texture = <SpineTexture>(mesh.region as any).page.texture;
                uvs = mesh.uvs;
                attachmentColor = mesh.color;
            } else if (attachment instanceof window.spine.ClippingAttachment) {
                this.clipper.clipStart(slot, attachment);
                continue;
            } else {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (texture) {
                let slotColor = slot.color;
                let finalColor = _TEMP_COLOR;
                finalColor.r = skeletonColor.r * slotColor.r * attachmentColor.r;
                finalColor.g = skeletonColor.g * slotColor.g * attachmentColor.g;
                finalColor.b = skeletonColor.b * slotColor.b * attachmentColor.b;
                finalColor.a = skeletonColor.a * slotColor.a * attachmentColor.a;

                let darkColor = _TEMP_COLOR2;
                if (!slot.darkColor)
                    darkColor.set(0, 0, 0, 1.0);
                else {
                    darkColor.setFromColor(slot.darkColor);
                }

                let slotBlendMode = slot.data.blendMode;
                let needNewMat = false;
                if (slotBlendMode != blendMode) {
                    blendMode = slotBlendMode;
                    needNewMat = true;
                }
                if (spineTex != texture) {
                    spineTex = texture;
                    needNewMat = true;
                }

                if (needNewMat) {
                    // 如果有当前批次且有数据，先完成当前批次
                    if (this._currentBatchIndex >= 0) {
                        const currentBatch = this.batches[this._currentBatchIndex];
                        if (currentBatch && currentBatch.buffer.vertexLength > 0) {
                            startNewBatch();
                        }
                    }

                    this.addMaterial(updater.owner._getMaterial(texture.realTexture, blendMode));
                    const currentBatch = this.getCurrentBatch();
                    currentBatch.material = this.materials[this._materialIndex - 1];
                    currentBatch.materialIndex = this._materialIndex - 1;
                }

                if (clipper.isClipping()) {
                    clipper.clipTriangles(positions, verticesLength, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);

                    if (!this.canAppend(clipper.clippedVertices.length)) {
                        startNewBatch();  // 使用上一个材质
                    }

                    this.appendVerticesClip(clipper.clippedVertices, clipper.clippedTriangles, vertexStride, offsetX, offsetY);
                } else {
                    if (!this.canAppend(verticesLength)) {
                        startNewBatch();  // 使用上一个材质
                    }

                    if (finalColor.a != 0) {
                        this.appendVertices(positions, uvs, finalColor, darkColor, verticesLength, triangles, triangles.length, vertexStride, offsetX, offsetY);
                    }
                }
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();

        if (this._currentBatchIndex >= 0) {
            const currentBatch = this.batches[this._currentBatchIndex];
            this.uploadBuffer(currentBatch.buffer);
        }

        const totalBatchCount = this._currentBatchIndex + 1;
        
        if (totalBatchCount < this.batches.length) {
            for (let i = totalBatchCount; i < this.batches.length; i++) {
                this.destroyBatch(this.batches[i]);
            }
        }
        this.batches.length = totalBatchCount;
        
        this.subMeshes.length = totalBatchCount;
        this.materials.length = totalBatchCount;
        for (let i = 0; i < totalBatchCount; i++) {
            const batch = this.batches[i];
            if (batch) {
                this.subMeshes[i] = batch.geometry;
                this.materials[i] = batch.material;
            }
        }

        this.needUpdate = true;

        if (this.autoCacheEnabled && updater) {
            let frameIndex = Math.floor(time / SpineConst.SPINE_STEP);
            let cacheTarget = updater.currentData;
            if (frameIndex >= 0 && !cacheTarget.renderCache[frameIndex]) {
                let renderBlocks = [];
                for (let i = 0; i < totalBatchCount; i++) {
                    const batch = this.batches[i];
                    if (batch) {
                        renderBlocks.push({
                            vertexData: new Float32Array(batch.buffer.vertexData.subarray(0, batch.buffer.vertexLength)),
                            vertexLength: batch.buffer.vertexLength,
                            indexData: new Uint16Array(batch.buffer.indexData.subarray(0, batch.buffer.indexLength)),
                            indexLength: batch.buffer.indexLength
                        });
                    }
                }

                let frameCache: FrameRenderCache = {
                    renderBlocks: renderBlocks,
                    materials: this.materials.slice()
                };
                cacheTarget.renderCache[frameIndex] = frameCache;
            }
        }
    }

    private destroyBatch(batch: SpineRenderBatch): void {
        let _vertexBuffers = batch.buffer.bufferState._vertexBuffers;
        for (let i = 0; i < _vertexBuffers.length; i++) {
            _vertexBuffers[i].destroy();
        }

        batch.buffer.bufferState._bindedIndexBuffer.destroy();
        batch.buffer.bufferState.destroy();
        batch.geometry.destroy();
    }

    private addMaterial(material: Material): void {
        if (this._internalMaterials[this._materialIndex] === material) {
            this._materialIndex++;
            return;
        }
        this._internalMaterials[this._materialIndex] = material;
        this._materialIndex++;
        this.needUpdate = true;
    }

    /**
     * @en Check if the current submesh can append more vertices.
     * @param verticesLength Number of vertices to be appended.
     * @returns True if can append, false otherwise.
     * @zh 检查当前 submesh 是否能够添加更多的顶点。
     * @param verticesLength 要添加的顶点数量。
     * @returns 如果可以添加则返回 true，否则返回 false。
     */
    canAppend(verticesLength: number) {
        if (this._currentBatchIndex < 0) return true;
        const currentBatch = this.batches[this._currentBatchIndex];
        if (!currentBatch) return true;
        const currentBuffer = currentBatch.buffer;
        const currentVertexCount = currentBuffer.vertexLength / SpineConst.VERTEX_TWOCOLOR;
        const newVertexCount = verticesLength / SpineConst.VERTEX_TWOCOLOR;
        return (currentVertexCount + newVertexCount) < SpineNormalRenderUpdater.MAX_VERTICES_PER_BUFFER;
    }

    private uploadBuffer(subMeshBuffer: SubMeshBuffer): void {
        if (!subMeshBuffer || !subMeshBuffer.bufferState) return;

        const vbByteLength = subMeshBuffer.vertexLength * 4;
        const ibByteLength = subMeshBuffer.indexLength * 2;

        // 如果有缓存数据，从缓存应用偏移；否则使用 vertexData
        if (subMeshBuffer.cacheVertex && (subMeshBuffer.offsetX !== 0 || subMeshBuffer.offsetY !== 0)) {
            const vertexStride = 12; // VERTEX_TWOCOLOR
            const offsetX = subMeshBuffer.offsetX;
            const offsetY = subMeshBuffer.offsetY;
            
            // 确保 vertexData 容量足够
            if (subMeshBuffer.vertexData.length < subMeshBuffer.vertexLength) {
                subMeshBuffer.vertexData = new Float32Array(subMeshBuffer.vertexLength);
            }
            if (subMeshBuffer.indexData.length < subMeshBuffer.indexLength) {
                subMeshBuffer.indexData = new Uint16Array(subMeshBuffer.indexLength);
            }

            // 从缓存应用偏移
            for (let i = 0; i < subMeshBuffer.vertexLength; i += vertexStride) {
                subMeshBuffer.vertexData[i] = subMeshBuffer.cacheVertex[i];         // uv.x
                subMeshBuffer.vertexData[i + 1] = subMeshBuffer.cacheVertex[i + 1]; // uv.y
                subMeshBuffer.vertexData[i + 2] = subMeshBuffer.cacheVertex[i + 2]; // color.r
                subMeshBuffer.vertexData[i + 3] = subMeshBuffer.cacheVertex[i + 3]; // color.g
                subMeshBuffer.vertexData[i + 4] = subMeshBuffer.cacheVertex[i + 4]; // color.b
                subMeshBuffer.vertexData[i + 5] = subMeshBuffer.cacheVertex[i + 5]; // color.a
                subMeshBuffer.vertexData[i + 6] = subMeshBuffer.cacheVertex[i + 6] + offsetX; // pos.x + offset
                subMeshBuffer.vertexData[i + 7] = subMeshBuffer.cacheVertex[i + 7] + offsetY; // pos.y + offset
                subMeshBuffer.vertexData[i + 8] = subMeshBuffer.cacheVertex[i + 8];   // darkColor.r
                subMeshBuffer.vertexData[i + 9] = subMeshBuffer.cacheVertex[i + 9];   // darkColor.g
                subMeshBuffer.vertexData[i + 10] = subMeshBuffer.cacheVertex[i + 10]; // darkColor.b
                subMeshBuffer.vertexData[i + 11] = subMeshBuffer.cacheVertex[i + 11]; // darkColor.a
            }

            // 复制索引数据
            subMeshBuffer.indexData.set(subMeshBuffer.cacheIndex.subarray(0, subMeshBuffer.indexLength));
        }

        let vertexBuffer = subMeshBuffer.bufferState._vertexBuffers[0];
        vertexBuffer.setDataLength(vbByteLength);
        vertexBuffer.setData(subMeshBuffer.vertexData.buffer as ArrayBuffer, 0, 0, vbByteLength);

        let indexBuffer = subMeshBuffer.bufferState._bindedIndexBuffer;
        indexBuffer._setIndexDataLength(ibByteLength);
        indexBuffer.setData(subMeshBuffer.indexData.buffer as ArrayBuffer, 0, 0, ibByteLength);
    }

    /**
     * @en Append clipped vertices and indices (cache raw data, apply offset on upload)
     * @param vertices Array of vertex data.
     * @param indices Array of index data.
     * @param stride Vertex stride.
     * @param offsetX Offset X.
     * @param offsetY Offset Y.
     * @zh 裁剪后的顶点和索引（缓存原始数据，上传时应用偏移）。
     * @param vertices 顶点数据数组。
     * @param indices 索引数据数组。
     * @param stride 顶点步长。
     * @param offsetX 偏移X。
     * @param offsetY 偏移Y。
     */
    appendVerticesClip(vertices: ArrayLike<number>, indices: ArrayLike<number>, stride: number, offsetX: number, offsetY: number) {
        let verticesLength = vertices.length;
        if (verticesLength == 0)
            return;
        let indicesLength = indices.length;

        const currentBuffer = this.getCurrentSubMeshBuffer();

        // 确保缓存数组容量
        if (!currentBuffer.cacheVertex) {
            currentBuffer.cacheVertex = new Float32Array(verticesLength);
            currentBuffer.cacheIndex = new Uint16Array(indicesLength);
            currentBuffer.offsetX = offsetX;
            currentBuffer.offsetY = offsetY;
        } else {
            // 扩展缓存数组
            let oldCacheLength = currentBuffer.cacheVertex.length;
            let newCacheLength = currentBuffer.vertexLength + verticesLength;
            if (newCacheLength > oldCacheLength) {
                let newCache = new Float32Array(newCacheLength);
                newCache.set(currentBuffer.cacheVertex);
                currentBuffer.cacheVertex = newCache;
            }
            let oldIndexLength = currentBuffer.cacheIndex.length;
            let newIndexLength = currentBuffer.indexLength + indicesLength;
            if (newIndexLength > oldIndexLength) {
                let newIndex = new Uint16Array(newIndexLength);
                newIndex.set(currentBuffer.cacheIndex);
                currentBuffer.cacheIndex = newIndex;
            }
        }

        this.ensureVerticesCapacity(currentBuffer, currentBuffer.vertexLength + verticesLength);
        this.ensureIndicesCapacity(currentBuffer, currentBuffer.indexLength + indicesLength);

        let cacheVertex = currentBuffer.cacheVertex;
        let cacheIndex = currentBuffer.cacheIndex;
        let before = currentBuffer.vertexLength;
        let indexStart = before / stride;

        let vlen = before;
        for (let j = 0; j < verticesLength; vlen += stride, j += stride) {
            // 缓存原始数据（不应用 offset）
            cacheVertex[vlen] = vertices[j + 6];
            cacheVertex[vlen + 1] = vertices[j + 7];
            cacheVertex[vlen + 2] = vertices[j + 2];
            cacheVertex[vlen + 3] = vertices[j + 3];
            cacheVertex[vlen + 4] = vertices[j + 4];
            cacheVertex[vlen + 5] = vertices[j + 5];
            cacheVertex[vlen + 6] = vertices[j];  // 原始位置
            cacheVertex[vlen + 7] = vertices[j + 1];  // 原始位置
            cacheVertex[vlen + 8] = vertices[j + 8];
            cacheVertex[vlen + 9] = vertices[j + 9];
            cacheVertex[vlen + 10] = vertices[j + 10];
            cacheVertex[vlen + 11] = vertices[j + 11];
        }

        currentBuffer.vertexLength = before + verticesLength;

        for (let i = currentBuffer.indexLength, j = 0; j < indicesLength; i++, j++)
            cacheIndex[i] = indices[j] + indexStart;

        currentBuffer.indexLength += indicesLength;
    }

    appendVertices(
        positions: spine.NumberArrayLike, uvs: spine.NumberArrayLike, finalColor: spine.Color, darkColor: spine.Color,
        verticesLength: number,
        indices: spine.NumberArrayLike, indicesLength: number,
        stride: number, offsetX: number, offsetY: number
    ): void {
        if (verticesLength == 0)
            return;

        const currentBuffer = this.getCurrentSubMeshBuffer();

        // 确保缓存数组容量
        if (!currentBuffer.cacheVertex) {
            currentBuffer.cacheVertex = new Float32Array(verticesLength);
            currentBuffer.cacheIndex = new Uint16Array(indicesLength);
            currentBuffer.offsetX = offsetX;
            currentBuffer.offsetY = offsetY;
        } else {
            // 扩展缓存数组
            let oldCacheLength = currentBuffer.cacheVertex.length;
            let newCacheLength = currentBuffer.vertexLength + verticesLength;
            if (newCacheLength > oldCacheLength) {
                let newCache = new Float32Array(newCacheLength);
                newCache.set(currentBuffer.cacheVertex);
                currentBuffer.cacheVertex = newCache;
            }
            let oldIndexLength = currentBuffer.cacheIndex.length;
            let newIndexLength = currentBuffer.indexLength + indicesLength;
            if (newIndexLength > oldIndexLength) {
                let newIndex = new Uint16Array(newIndexLength);
                newIndex.set(currentBuffer.cacheIndex);
                currentBuffer.cacheIndex = newIndex;
            }
        }

        this.ensureVerticesCapacity(currentBuffer, currentBuffer.vertexLength + verticesLength);
        this.ensureIndicesCapacity(currentBuffer, currentBuffer.indexLength + indicesLength);

        let cacheVertex = currentBuffer.cacheVertex;
        let cacheIndex = currentBuffer.cacheIndex;
        let before = currentBuffer.vertexLength;
        let indexStart = before / stride;

        for (let u = 0, v = 0, n = verticesLength; v < n; v += stride, u += 2) {
            let size = before + v;
            // 缓存原始数据（不应用 offset）
            cacheVertex[size] = uvs[u];
            cacheVertex[size + 1] = uvs[u + 1];
            cacheVertex[size + 2] = finalColor.r;
            cacheVertex[size + 3] = finalColor.g;
            cacheVertex[size + 4] = finalColor.b;
            cacheVertex[size + 5] = finalColor.a;
            cacheVertex[size + 6] = positions[v];  // 原始位置
            cacheVertex[size + 7] = positions[v + 1];  // 原始位置

            cacheVertex[size + 8] = darkColor.r;
            cacheVertex[size + 9] = darkColor.g;
            cacheVertex[size + 10] = darkColor.b;
            cacheVertex[size + 11] = darkColor.a;
        }

        for (let i = currentBuffer.indexLength, j = 0; j < indicesLength; i++, j++)
            cacheIndex[i] = indices[j] + indexStart;

        currentBuffer.vertexLength = before + verticesLength;
        currentBuffer.indexLength += indicesLength;
    }

    /**
     * @en Export current render data to cache format.
     * @returns Frame cache data.
     * @zh 导出当前渲染数据为缓存格式。
     * @returns 帧缓存数据。
     */
    exportToCache(): FrameRenderCache {
        let renderBlocks = [];
        for (let i = 0; i <= this._currentBatchIndex; i++) {
            const batch = this.batches[i];
            if (batch) {
                renderBlocks.push({
                    vertexData: new Float32Array(batch.buffer.vertexData.subarray(0, batch.buffer.vertexLength)),
                    vertexLength: batch.buffer.vertexLength,
                    indexData: new Uint16Array(batch.buffer.indexData.subarray(0, batch.buffer.indexLength)),
                    indexLength: batch.buffer.indexLength
                });
            }
        }

        return {
            renderBlocks: renderBlocks,
            materials: this.materials.slice(0, this._materialIndex)
        };
    }

    destroy() {
        this.batches.forEach((batch) => {
            this.destroyBatch(batch);
        });

        this.subMeshes.forEach(mesh => {
            mesh.destroy();
        });
        this.subMeshes.length = 0;
        this.batches.length = 0;
    }
}
