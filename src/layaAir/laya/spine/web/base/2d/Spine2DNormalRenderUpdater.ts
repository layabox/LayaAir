import { LayaGL } from "../../../../layagl/LayaGL";
import { IRenderGeometryElement } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { DrawType } from "../../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Material } from "../../../../resource/Material";
import { Mesh2D } from "../../../../resource/Mesh2D";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { SpineConst } from "../../../SpineConst";
import { SpineRenderUpdater } from "../optimize/SpineRenderUpdater";
import { SpineTexture } from "../../SpineTexture";
import { SpineGlobalMeshManager } from "./SpineGlobalMeshManager";
import { Matrix } from "../../../../maths/Matrix";
import { SpineNormalRenderUpdater } from "../optimize/SpineNormalRenderUpdater";
import { IRenderBatch, ISpineNormalUpdater } from "../../IWebSpine";
import { SpineBufferView } from "./batch/SpineBufferDataView";
import { FrameRenderCache } from "../optimize/AnimationRender";
import { Stat } from "../../../../utils/Stat";
import { Texture2D } from "../../../../resource/Texture2D";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

/**
 * @en Render batch structure - unified management of geometry, view and material.
 * @zh 渲染批次结构 - 统一管理 geometry、view 和 material。
 */
export interface Spine2DRenderBatch extends IRenderBatch{
    view: SpineBufferView;
}

/**
 * @en Spine normal render updater - refactored version using unified buffer view
 * @zh Spine normal 渲染更新器 - 使用统一缓冲区视图的重构版本
 */
export class Spine2DNormalRenderUpdater implements ISpineNormalUpdater{
    private clipper = new spine.SkeletonClipping();

    private _internalMaterials: Material[] = [];
    /** Material lookup signature for each normal batch position. */
    private _materialTextures: Texture2D[] = [];
    private _materialBlendModes: number[] = [];
    private _materialCacheVersion: number = -1;
    materials: Material[] = [];

    /** @internal */
    _materialIndex = 0;

    needUpdate = false;

    /**
     * @en Output array for subMeshes - only used for rendering output, populated from batches
     * @zh 子网格输出数组 - 仅用于渲染输出，从 batches 中填充
     */
    subMeshes: IRenderGeometryElement[] = [];

    autoCacheEnabled: boolean = false;

    /**
     * @en Render batches array - internal management structure containing geometry, view and material.
     * @zh 渲染批次数组 - 内部管理结构，包含 geometry、view 和 material。
     */
    batches: Spine2DRenderBatch[] = [];

    /**
     * @en Current batch index being built.
     * @zh 当前正在构建的批次索引。
     */
    private _currentBatchIndex = -1;

    /**
     * @en Track current geometry's vertex count for uint16 limit checking
     * @zh 跟踪当前 geometry 的顶点数，用于 uint16 限制检查
     */
    private _currentGeometryVertexCount: number = 0;

    /**
     * @en Pool of reusable SpineBufferView objects to avoid GC
     * @zh 可复用的 SpineBufferView 对象池，避免 GC
     */
    private _viewPool: SpineBufferView[] = [];

    /**
     * @en Views allocated in current frame (for cleanup)
     * @zh 当前帧分配的 views（用于清理）
     */
    private _allocatedViewsThisFrame: SpineBufferView[] = [];
    /** Number of live entries. The backing array is retained across frames. */
    private _allocatedViewCount: number = 0;

    matrix: Matrix = new Matrix;

    /** @internal Rebuild final world-space XY for existing views after a matrix-only change. */
    applyRenderMatrixToViews(): void {
        let matrix = this.matrix;
        let a = matrix.a;
        let b = matrix.b;
        let c = matrix.c;
        let d = matrix.d;
        let tx = matrix.tx;
        let ty = matrix.ty;

        for (let i = 0; i <= this._currentBatchIndex; i++) {
            let view = this.batches[i]?.view;
            if (view) {
                let vertexData = view.vertexData;
                let localPositions = view.localPositions;
                for (let vertexIndex = 0, pos = 0, localPos = 0; vertexIndex < view.vertexCount; vertexIndex++, pos += SpineConst.VERTEX_TWOCOLOR, localPos += 2) {
                    let x = localPositions[localPos];
                    let y = localPositions[localPos + 1];
                    vertexData[pos + 6] = a * x - c * y + tx;
                    vertexData[pos + 7] = b * x - d * y + ty;
                }
                view.markModified();
            }
        }
    }

    renderUpdate(
        time: number,
        skeleton: spine.Skeleton,
        updater: SpineRenderUpdater,
        slotRangeStart?: number,
        slotRangeEnd?: number,
        offsetX: number = 0,
        offsetY: number = 0
    ): void {
        if (this._materialCacheVersion !== updater.materialCacheVersion) {
            this._materialCacheVersion = updater.materialCacheVersion;
            this._internalMaterials.length = 0;
            this._materialTextures.length = 0;
            this._materialBlendModes.length = 0;
            this.needUpdate = true;
        }

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
        this._currentGeometryVertexCount = 0;

        for (let i = 0, n = this._allocatedViewCount; i < n; i++) {
            let view = this._allocatedViewsThisFrame[i];
            view.reset();
            this._viewPool.push(view);
        }

        this._allocatedViewCount = 0;

        blendMode = null;
        spineTex = null;

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
                    let materialIndex = this._materialIndex;
                    let realTexture = texture.realTexture;
                    let material = this._internalMaterials[materialIndex];
                    if (this._materialTextures[materialIndex] !== realTexture
                        || this._materialBlendModes[materialIndex] !== blendMode
                        || !material) {
                        material = updater.owner._getMaterial(realTexture, blendMode);
                        this._materialTextures[materialIndex] = realTexture;
                        this._materialBlendModes[materialIndex] = blendMode;
                    }
                    this.addMaterial(material);
                    this.createBatch();  
                }

                if (clipper.isClipping()) {
                    clipper.clipTriangles(positions, verticesLength, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);
                    this.appendVerticesClip(clipper.clippedVertices, clipper.clippedTriangles, vertexStride, offsetX, offsetY);
                } else {
                    if (finalColor.a != 0) {
                        this.appendVertices(positions, uvs, finalColor, darkColor, verticesLength, triangles, triangles.length, vertexStride, offsetX, offsetY);
                    }
                }
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();

        this._bindViewsToBuffers();

        const totalBatchCount = this._currentBatchIndex + 1;
        
        let renderBatchCount = 0;
        for (let i = 0; i < totalBatchCount; i++) {
            const batch = this.batches[i];
            if (batch && batch.view && batch.view.vertexCount > 0 && batch.view.indexCount > 0) {
                this.subMeshes[renderBatchCount] = batch.geometry;
                this.materials[renderBatchCount] = batch.material;
                renderBatchCount++;
            } else if (batch && batch.geometry) {
                // A material change may create a batch that receives no data
                // (for example a transparent attachment or an empty clip).
                // Geometry objects are reused, so their previous draw range
                // must not survive into this frame.
                batch.geometry.clearRenderParams();
            }
        }
        this.subMeshes.length = renderBatchCount;
        this.materials.length = renderBatchCount;
        this._materialIndex = renderBatchCount;
        this.needUpdate = true;

        if (this.autoCacheEnabled) {
            let frameIndex = updater.cacheFrameIndex;
            let cacheTarget = updater.currentData;
            if (frameIndex >= 0 && !cacheTarget.renderCache[frameIndex]) {
                let frameCache = this._generateCacheData(totalBatchCount);
                cacheTarget.renderCache[frameIndex] = frameCache;
            }
        }
    }

    private _generateCacheData(totalBatchCount: number): FrameRenderCache {
        let renderBlocks = [];
        for (let i = 0; i < totalBatchCount; i++) {
            const batch = this.batches[i];
            if (batch && batch.view && batch.view.vertexCount > 0 && batch.view.indexCount > 0) {
                let vertexData = batch.view.vertexData;
                let vertexBufferLength = batch.view.vertexBufferLength;
                
                let data = new Float32Array(vertexBufferLength);
                data.set(vertexData.subarray(0, vertexBufferLength));
                let localPositions = batch.view.localPositions;
                for (let vertexIndex = 0, pos = 0, localPos = 0; vertexIndex < batch.view.vertexCount; vertexIndex++, pos += SpineConst.VERTEX_TWOCOLOR, localPos += 2) {
                    data[pos + 6] = localPositions[localPos];
                    data[pos + 7] = localPositions[localPos + 1];
                }

                renderBlocks.push({
                    vertexData: data,
                    vertexLength: vertexBufferLength,
                    indexData: new Uint16Array(batch.view.indexData.slice(0, batch.view.indexBufferLength)),
                    indexLength: batch.view.indexBufferLength,
                    vertexCount: batch.view.vertexCount,
                    indexCount: batch.view.indexCount,
                    vertexBufferLength: vertexBufferLength,
                    indexBufferLength: batch.view.indexBufferLength
                });
            }
        }

        return {
            renderBlocks: renderBlocks,
            materials: this.materials.slice()
        };
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

    private createBatch(): boolean {
        this._currentBatchIndex++;
        
        let batch = this.batches[this._currentBatchIndex];
        let geometry: IRenderGeometryElement;
        let materialIndex = this._materialIndex - 1;
        let material = materialIndex >= 0 ? this._internalMaterials[materialIndex] : null as any;
        
        if (!batch) {
            geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            geometry.indexFormat = IndexFormat.UInt16;
            this.needUpdate = true;

            batch = {
                geometry: geometry,
                view: null,
                material: material,
                materialIndex: materialIndex
            };

            this.batches[this._currentBatchIndex] = batch;
        } else {
            geometry = batch.geometry;
            if (batch.material !== material || batch.materialIndex !== materialIndex) {
                batch.material = material;
                batch.materialIndex = materialIndex;
                this.needUpdate = true;
            }
        }

        let view: SpineBufferView;
        if (this._viewPool.length > 0) {
            view = this._viewPool.pop()!;
            view.reset();
        } else {
            let initialVertexCapacity = SpineConst.VERTEX_INITIAL_CAPACITY * SpineConst.VERTEX_TWOCOLOR;
            let initialIndexCapacity = SpineConst.VERTEX_INITIAL_CAPACITY * 3;
            view = new SpineBufferView(initialVertexCapacity, initialIndexCapacity);
        }

        // 清理缓存数据
        view.cacheIndex = null;

        view.geometry = geometry;
        batch.view = view;
        this._allocatedViewsThisFrame[this._allocatedViewCount++] = view;

        this._currentGeometryVertexCount = 0;

        return true;
    }

    /**
     * @en Append clipped vertices, retaining local XY while writing final world-space positions.
     * @zh 附加裁剪后的顶点，保留局部 XY 并同时写入最终世界坐标。
     */
    appendVerticesClip(
        vertices: ArrayLike<number>,
        indices: ArrayLike<number>,
        stride: number,
        offsetX: number,
        offsetY: number
    ) {
        let verticesLength = vertices.length;
        if (verticesLength == 0)
            return;
        let indicesLength = indices.length;

        let newVertexCount = verticesLength / stride;

        if (this._currentBatchIndex < 0 || this._currentGeometryVertexCount + newVertexCount > 65535) {
            this.createBatch();  // 使用上一个材质
        }

        let currentBatch = this.batches[this._currentBatchIndex];
        if (!currentBatch) return;
        let currentView = currentBatch.view;
        currentView.ensureVertexCapacity(currentView.vertexBufferLength + verticesLength);
        currentView.ensureIndexCapacity(currentView.indexBufferLength + indicesLength);

        let vertexData = currentView.vertexData;
        let localPositions = currentView.localPositions;
        let indexData = currentView.indexData;
        let vertexOffset = currentView.vertexBufferLength;
        let localPositionOffset = currentView.vertexCount * 2;
        let indexOffset = currentView.indexBufferLength;
        let indexBase = currentView.vertexCount;

        let matrix = this.matrix;
        let a = matrix.a;
        let b = matrix.b;
        let c = matrix.c;
        let d = matrix.d;
        let tx = matrix.tx;
        let ty = matrix.ty;

        for (let j = 0, vlen = vertexOffset, localPos = localPositionOffset; j < verticesLength; vlen += stride, j += stride, localPos += 2) {
            // uv
            vertexData[vlen] = vertices[j + 6];
            vertexData[vlen + 1] = vertices[j + 7];
            // color
            vertexData[vlen + 2] = vertices[j + 2];
            vertexData[vlen + 3] = vertices[j + 3];
            vertexData[vlen + 4] = vertices[j + 4];
            vertexData[vlen + 5] = vertices[j + 5];
            // Local position sidecar and final world-space position.
            let x = vertices[j] + offsetX;
            let y = vertices[j + 1] + offsetY;
            localPositions[localPos] = x;
            localPositions[localPos + 1] = y;
            vertexData[vlen + 6] = a * x - c * y + tx;
            vertexData[vlen + 7] = b * x - d * y + ty;
            //two color
            vertexData[vlen + 8] = vertices[j + 8];
            vertexData[vlen + 9] = vertices[j + 9];
            vertexData[vlen + 10] = vertices[j + 10];
            vertexData[vlen + 11] = vertices[j + 11];
        }

        for (let i = 0; i < indicesLength; i++) {
            indexData[indexOffset + i] = indices[i] + indexBase;
        }

        currentView.vertexBufferLength += verticesLength;
        currentView.indexBufferLength += indicesLength;
        currentView.vertexCount += newVertexCount;
        currentView.indexCount += indicesLength;

        this._currentGeometryVertexCount += newVertexCount;
    }

    /**
     * @en Append vertices, retaining local XY while writing final world-space positions.
     * @zh 附加顶点，保留局部 XY 并同时写入最终世界坐标。
     */
    appendVertices(
        positions: spine.NumberArrayLike,
        uvs: spine.NumberArrayLike,
        finalColor: spine.Color,
        darkColor: spine.Color,
        verticesLength: number,
        indices: spine.NumberArrayLike,
        indicesLength: number,
        stride: number,
        offsetX: number,
        offsetY: number
    ): void {
        if (verticesLength == 0)
            return;

        let newVertexCount = verticesLength / stride;

        if (this._currentBatchIndex < 0 || this._currentGeometryVertexCount + newVertexCount > 65535) {
            this.createBatch();  // 使用上一个材质
        }

        const currentBatch = this.batches[this._currentBatchIndex];
        if (!currentBatch) return;

        let currentView = currentBatch.view;
        currentView.ensureVertexCapacity(currentView.vertexBufferLength + verticesLength);
        currentView.ensureIndexCapacity(currentView.indexBufferLength + indicesLength);

        let vertexData = currentView.vertexData;
        let localPositions = currentView.localPositions;
        let indexData = currentView.indexData;
        let vertexOffset = currentView.vertexBufferLength;
        let localPositionOffset = currentView.vertexCount * 2;
        let indexOffset = currentView.indexBufferLength;
        let indexBase = currentView.vertexCount;

        let matrix = this.matrix;
        let a = matrix.a;
        let b = matrix.b;
        let c = matrix.c;
        let d = matrix.d;
        let tx = matrix.tx;
        let ty = matrix.ty;

        for (let u = 0, v = 0, n = verticesLength, localPos = localPositionOffset; v < n; v += stride, u += 2, localPos += 2) {
            let pos = vertexOffset + v;
            // UV
            vertexData[pos] = uvs[u];
            vertexData[pos + 1] = uvs[u + 1];
            // COLOR
            vertexData[pos + 2] = finalColor.r;
            vertexData[pos + 3] = finalColor.g;
            vertexData[pos + 4] = finalColor.b;
            vertexData[pos + 5] = finalColor.a;
            
            // Local position sidecar and final world-space position.
            let x = positions[v] + offsetX;
            let y = positions[v + 1] + offsetY;
            localPositions[localPos] = x;
            localPositions[localPos + 1] = y;
            vertexData[pos + 6] = a * x - c * y + tx;
            vertexData[pos + 7] = b * x - d * y + ty;
            // TWO COLOR
            vertexData[pos + 8] = darkColor.r;
            vertexData[pos + 9] = darkColor.g;
            vertexData[pos + 10] = darkColor.b;
            vertexData[pos + 11] = darkColor.a;
        }

        for (let i = 0; i < indicesLength; i++) {
            indexData[indexOffset + i] = indices[i] + indexBase;
        }

        currentView.vertexBufferLength += verticesLength;
        currentView.indexBufferLength += indicesLength;
        currentView.vertexCount += newVertexCount;
        currentView.indexCount += indicesLength;

        this._currentGeometryVertexCount += newVertexCount;
    }

    /**
     * @internal
     * @en Bind all views to buffers (Phase 2: Post-processing)
     * @zh 将所有 views 绑定到 buffers（阶段 2：后处理）
     */
    private _bindViewsToBuffers(): void {
        let manager = SpineGlobalMeshManager.instance;

        for (let i = 0; i <= this._currentBatchIndex; i++) {
            const batch = this.batches[i];
            if (batch && batch.view) {
                if (batch.view.vertexCount > 0 && batch.view.indexCount > 0) {
                    manager.assignViewToBuffer(batch.view, batch.view.vertexCount);
                    batch.geometry.bufferState = manager.outBufferState as any;
                } else {
                    batch.geometry.clearRenderParams();
                }
            }
        }
    }

    /**
     * @en Get the view associated with a geometry (for batching)
     * @zh 获取与 geometry 关联的 view（用于合批）
     */
    getViewForGeometry(geometry: IRenderGeometryElement): SpineBufferView | undefined {
        for (let i = 0; i <= this._currentBatchIndex; i++) {
            const batch = this.batches[i];
            if (batch && batch.geometry === geometry) {
                return batch.view;
            }
        }
        return undefined;
    }

    destroy() {
        for (let i = 0; i < this._allocatedViewCount; i++) {
            this._allocatedViewsThisFrame[i].reset();
        }
        this.batches.forEach(batch => {
            if (batch && batch.geometry) {
                batch.geometry.destroy();
            }
        });
        this.batches.length = 0;
        this.subMeshes.length = 0;
        this._internalMaterials.length = 0;
        this._materialTextures.length = 0;
        this._materialBlendModes.length = 0;
        this._allocatedViewsThisFrame.length = 0;
        this._allocatedViewCount = 0;
        this._allocatedViewsThisFrame = null;
        this._viewPool = null;
    }

    /**
     * @en Restore rendering data from cache (Spine2D version).
     * @param cache Cached frame data.
     * @param offsetX X axis offset.
     * @param offsetY Y axis offset.
     * @zh 从缓存恢复渲染数据（Spine2D 版本）。
     * @param cache 缓存的帧数据。
     * @param offsetX X轴偏移。
     * @param offsetY Y轴偏移。
     */
    restoreFromCache(cache: FrameRenderCache, offsetX: number = 0, offsetY: number = 0): void {
        if (!cache) return;

        for (let i = 0; i < this._allocatedViewCount; i++) {
            let view = this._allocatedViewsThisFrame[i];
            view.reset();
            this._viewPool.push(view);
        }
        this._allocatedViewCount = 0;
        this.materials.length = cache.materials.length;
        for (let i = 0; i < cache.materials.length; i++) {
            this.materials[i] = cache.materials[i];
        }

        this._currentBatchIndex = -1;
        
        for (let i = 0; i < cache.renderBlocks.length; i++) {
            const renderBlock = cache.renderBlocks[i];
            const vertexBufferLength =  renderBlock.vertexBufferLength;
            const indexBufferLength =  renderBlock.indexBufferLength;
            this._currentBatchIndex++;
            
            let existingBatch = this.batches[this._currentBatchIndex];
            let geometry: IRenderGeometryElement;
            if (existingBatch && existingBatch.geometry) {
                geometry = existingBatch.geometry;
                // geometry.clearRenderParams();
            } else {
                geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(
                    MeshTopology.Triangles,
                    DrawType.DrawElement
                );
                geometry.indexFormat = IndexFormat.UInt16;
                this.needUpdate = true;
            }

            // 从池中获取 view
            let view: SpineBufferView;
            if (this._viewPool.length > 0) {
                view = this._viewPool.pop()!;
                view.reset();
            } else {
                view = new SpineBufferView(
                    renderBlock.vertexData.length,
                    renderBlock.indexData.length
                );
            }

            view.ensureVertexCapacity(vertexBufferLength);
            view.ensureIndexCapacity(indexBufferLength);

            view.vertexData.set(renderBlock.vertexData.subarray(0, vertexBufferLength), 0);
            view.cacheIndex = renderBlock.indexData;
            view.vertexBufferLength = vertexBufferLength;
            view.indexBufferLength = indexBufferLength;
            view.vertexCount = renderBlock.vertexCount;
            view.indexCount = renderBlock.indexCount;
            view.geometry = geometry;

            // Frame caches stay local and shareable. Restore the local XY sidecar,
            // then make vertexData instance-ready with the current world matrix.
            let matrix = this.matrix;
            let a = matrix.a;
            let b = matrix.b;
            let c = matrix.c;
            let d = matrix.d;
            let tx = matrix.tx;
            let ty = matrix.ty;
            let vertexData = view.vertexData;
            let localPositions = view.localPositions;
            for (let vertexIndex = 0, pos = 0, localPos = 0; vertexIndex < view.vertexCount; vertexIndex++, pos += SpineConst.VERTEX_TWOCOLOR, localPos += 2) {
                let x = vertexData[pos + 6];
                let y = vertexData[pos + 7];
                localPositions[localPos] = x;
                localPositions[localPos + 1] = y;
                vertexData[pos + 6] = a * x - c * y + tx;
                vertexData[pos + 7] = b * x - d * y + ty;
            }

            const materialIndex = i < cache.materials.length ? i : cache.materials.length - 1;
            const material = cache.materials[materialIndex] || null as any;

            let batch = existingBatch;
            if (batch) {
                batch.geometry = geometry;
                batch.view = view;
                batch.material = material;
                batch.materialIndex = materialIndex;
            } else {
                batch = {
                    geometry: geometry,
                    view: view,
                    material: material,
                    materialIndex: materialIndex
                };
                this.batches[this._currentBatchIndex] = batch;
            }
            this._allocatedViewsThisFrame[this._allocatedViewCount++] = view;
        }

        this._bindViewsToBuffers();

        const totalBatchCount = this._currentBatchIndex + 1;
        
        let renderBatchCount = 0;
        for (let i = 0; i < totalBatchCount; i++) {
            const batch = this.batches[i];
            if (batch && batch.view && batch.view.vertexCount > 0 && batch.view.indexCount > 0) {
                this.subMeshes[renderBatchCount] = batch.geometry;
                this.materials[renderBatchCount] = batch.material;
                renderBatchCount++;
            } else if (batch && batch.geometry) {
                batch.geometry.clearRenderParams();
            }
        }
        this.subMeshes.length = renderBatchCount;
        this.materials.length = renderBatchCount;
        this.needUpdate = true;
    }

}
