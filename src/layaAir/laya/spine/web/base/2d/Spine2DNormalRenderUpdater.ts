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
import { Vector2 } from "../../../../maths/Vector2";
import { SpineBufferView } from "./batch/SpineBufferDataView";
import { FrameRenderCache } from "../optimize/AnimationRender";

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

    matrix: Matrix = new Matrix;

    renderUpdate(
        time: number,
        skeleton: spine.Skeleton,
        updater: SpineRenderUpdater,
        slotRangeStart?: number,
        slotRangeEnd?: number,
        offsetX: number = 0,
        offsetY: number = 0
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
        this._currentGeometryVertexCount = 0;

        for (let i = 0, n = this._allocatedViewsThisFrame.length; i < n; i++) {
            let view = this._allocatedViewsThisFrame[i];
            view.reset();
            this._viewPool.push(view);
        }

        this._allocatedViewsThisFrame.length = 0;

        this.batches.length = 0;

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
                    this.addMaterial(updater.owner._getMaterial(texture.realTexture, blendMode));
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
        
        this.subMeshes.length = totalBatchCount;
        this.materials.length = totalBatchCount;
        for (let i = 0; i < totalBatchCount; i++) {
            const batch = this.batches[i];
            if (batch) {
                this.subMeshes[i] = batch.geometry;
                this.materials[i] = batch.material;
            }
        }
        this._materialIndex = totalBatchCount;
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
            if (batch) {
                let vertexData = batch.view.vertexData;
                let vertexStride = SpineConst.VERTEX_TWOCOLOR;
                let vertexBufferLength = batch.view.vertexBufferLength;
                
                // 正向变换矩阵形式：[x']   [  a   c ] [x]   [tx]
                //                  [y'] = [ -b  -d ] [y] + [ty]
                let data = new Float32Array(vertexBufferLength);
                let a = this.matrix.a;
                let b = this.matrix.b;
                let c = this.matrix.c;
                let d = this.matrix.d;
                let tx = this.matrix.tx;
                let ty = this.matrix.ty;

                let det = -a * d + b * c;

                let inv_a = -d / det;
                let inv_c = -c / det;
                let inv_b = b / det;
                let inv_d = a / det;
                let inv_tx = -(inv_a * tx + inv_c * ty);
                let inv_ty = -(inv_b * tx + inv_d * ty);
                
                // 复制所有数据，但反转位置变换
                for (let j = 0; j < vertexBufferLength; j += vertexStride) {
                    data[j] = vertexData[j];         // uv.x
                    data[j + 1] = vertexData[j + 1]; // uv.y
                    data[j + 2] = vertexData[j + 2]; // color.r
                    data[j + 3] = vertexData[j + 3]; // color.g
                    data[j + 4] = vertexData[j + 4]; // color.b
                    data[j + 5] = vertexData[j + 5]; // color.a

                    let transformedX = vertexData[j + 6];
                    let transformedY = vertexData[j + 7];

                    data[j + 6] = inv_a * transformedX + inv_c * transformedY + inv_tx;
                    data[j + 7] = inv_b * transformedX + inv_d * transformedY + inv_ty;

                    data[j + 8] = vertexData[j + 8];   // darkColor.r
                    data[j + 9] = vertexData[j + 9];   // darkColor.g
                    data[j + 10] = vertexData[j + 10]; // darkColor.b
                    data[j + 11] = vertexData[j + 11]; // darkColor.a
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
            // geometry.clearRenderParams();
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
        view.cacheVertex = null;
        view.cacheIndex = null;
        view.matrix = null;
        view.offsetX = 0;
        view.offsetY = 0;

        view.geometry = geometry;
        batch.view = view;
        this._allocatedViewsThisFrame.push(view);

        this._currentGeometryVertexCount = 0;

        return true;
    }

    /**
     * @en Append clipped vertices and indices (cache raw data, apply matrix on upload)
     * @zh 附加裁剪后的顶点和索引（缓存原始数据，上传时应用矩阵）
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
        let indexData = currentView.indexData;
        let vertexOffset = currentView.vertexBufferLength;
        let indexOffset = currentView.indexBufferLength;
        let indexBase = currentView.vertexCount;

        let a = this.matrix.a;
        let b = this.matrix.b;
        let c = this.matrix.c;
        let d = this.matrix.d;
        let tx = this.matrix.tx;
        let ty = this.matrix.ty;

        for (let j = 0, vlen = vertexOffset; j < verticesLength; vlen += stride, j += stride) {
            // uv
            vertexData[vlen] = vertices[j + 6];
            vertexData[vlen + 1] = vertices[j + 7];
            // color
            vertexData[vlen + 2] = vertices[j + 2];
            vertexData[vlen + 3] = vertices[j + 3];
            vertexData[vlen + 4] = vertices[j + 4];
            vertexData[vlen + 5] = vertices[j + 5];
            //pos
            let x = vertices[j] + offsetX;
            let y = vertices[j + 1] + offsetY;
            vertexData[vlen + 6] = a * x + c * y + tx;
            vertexData[vlen + 7] = - b * x - d * y + ty;
            // vertexData[vlen + 6] = x;
            // vertexData[vlen + 7] = y;
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
     * @en Append vertices and indices (cache raw data, apply matrix on upload)
     * @zh 附加顶点和索引（缓存原始数据，上传时应用矩阵）
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
        let indexData = currentView.indexData;
        let vertexOffset = currentView.vertexBufferLength;
        let indexOffset = currentView.indexBufferLength;
        let indexBase = currentView.vertexCount;

        let a = this.matrix.a;
        let b = this.matrix.b;
        let c = this.matrix.c;
        let d = this.matrix.d;
        let tx = this.matrix.tx;
        let ty = this.matrix.ty;

        for (let u = 0, v = 0, n = verticesLength; v < n; v += stride, u += 2) {
            let pos = vertexOffset + v;
            // UV
            vertexData[pos] = uvs[u];
            vertexData[pos + 1] = uvs[u + 1];
            // COLOR
            vertexData[pos + 2] = finalColor.r;
            vertexData[pos + 3] = finalColor.g;
            vertexData[pos + 4] = finalColor.b;
            vertexData[pos + 5] = finalColor.a;
            
            // POS
            let x = positions[v] + offsetX;
            let y = positions[v + 1] + offsetY;
            vertexData[pos + 6] = a * x + c * y + tx;
            vertexData[pos + 7] = - b * x - d * y + ty;
            // vertexData[pos + 6] = x;
            // vertexData[pos + 7] = y;
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
                manager.assignViewToBuffer(batch.view, batch.view.vertexCount);
                batch.geometry.bufferState = manager.outBufferState as any;
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
        this._allocatedViewsThisFrame.forEach(view => {
            view.reset();
        });
        this.batches.forEach(batch => {
            if (batch && batch.geometry) {
                batch.geometry.destroy();
            }
        });
        this.batches.length = 0;
        this.subMeshes.length = 0;
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

        for (let view of this._allocatedViewsThisFrame) {
            view.reset();
            this._viewPool.push(view);
        }
        this._allocatedViewsThisFrame.length = 0;
        this.batches.length = 0;

        this.materials.length = cache.materials.length;
        for (let i = 0; i < cache.materials.length; i++) {
            this.materials[i] = cache.materials[i];
        }

        this._currentBatchIndex = -1;
        
        for (let i = 0; i < cache.renderBlocks.length; i++) {
            const renderBlock = cache.renderBlocks[i];
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

            view.ensureVertexCapacity(renderBlock.vertexBufferLength);
            view.ensureIndexCapacity(renderBlock.indexBufferLength);

            view.cacheVertex = renderBlock.vertexData;
            view.cacheIndex = renderBlock.indexData;
            view.vertexBufferLength = renderBlock.vertexBufferLength;
            view.indexBufferLength = renderBlock.indexBufferLength;
            view.vertexCount = renderBlock.vertexCount;
            view.indexCount = renderBlock.indexCount;
            view.geometry = geometry;

            // 存储矩阵和偏移（在 _upload 时应用）
            if (offsetX !== 0 || offsetY !== 0 || this._hasMatrixTransform()) {
                view.matrix = this.matrix;
                view.offsetX = offsetX;
                view.offsetY = offsetY;
            } else {
                view.matrix = null;
                view.offsetX = 0;
                view.offsetY = 0;
            }

            const materialIndex = i < cache.materials.length ? i : cache.materials.length - 1;
            const material = cache.materials[materialIndex] || null as any;

            const batch: Spine2DRenderBatch = {
                geometry: geometry,
                view: view,
                material: material,
                materialIndex: materialIndex
            };

            this.batches[this._currentBatchIndex] = batch;
            this._allocatedViewsThisFrame.push(view);
        }

        this._bindViewsToBuffers();

        const totalBatchCount = this._currentBatchIndex + 1;
        
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
    }

    private _hasMatrixTransform(): boolean {
        let m = this.matrix;
        return m.a !== 1 || m.b !== 0 || m.c !== 0 || m.d !== 1 || m.tx !== 0 || m.ty !== 0;
    }
}
