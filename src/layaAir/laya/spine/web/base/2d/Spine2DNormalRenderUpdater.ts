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
import { ISpineNormalUpdater } from "../../IWebSpine";
import { Vector2 } from "../../../../maths/Vector2";
import { SpineBufferView } from "./batch/SpineBufferDataView";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

/**
 * @en Spine normal render updater - refactored version using unified buffer view
 * @zh Spine normal 渲染更新器 - 使用统一缓冲区视图的重构版本
 */
export class Spine2DNormalRenderUpdater implements ISpineNormalUpdater{
    private clipper = new spine.SkeletonClipping();

    materials: Material[] = [];

    /** @internal */
    _subMeshIndex = 0;
    /** @internal */
    _materialIndex = 0;

    needUpdate = false;

    subMeshes: IRenderGeometryElement[] = [];

    /**
     * @en Map from geometry to its associated view (strict 1:1 relationship)
     * @zh 从 geometry 到其关联 view 的映射（严格 1:1 关系）
     */
    private _geometryToView: Map<IRenderGeometryElement, SpineBufferView> = new Map();

    /**
     * @en Track current geometry's vertex count for uint16 limit checking
     * @zh 跟踪当前 geometry 的顶点数，用于 uint16 限制检查
     */
    private _currentGeometryVertexCount: number = 0;

    /**
     * @en Current active view (the view associated with current geometry being built)
     * @zh 当前活跃的 view（与当前正在构建的 geometry 关联的 view）
     */
    private _currentView: SpineBufferView | null = null;

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
        this._subMeshIndex = 0;
        this._currentGeometryVertexCount = 0;
        this._currentView = null;

        // Return all views from last frame to pool
        for (let i = 0, n = this._allocatedViewsThisFrame.length; i < n; i++) {
            let view = this._allocatedViewsThisFrame[i];
            view.reset();
            this._viewPool.push(view);
        }
        this._allocatedViewsThisFrame.length = 0;

        this._geometryToView.clear();

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
                    this.createSubMesh();
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

        if (this._subMeshIndex < this.subMeshes.length) {
            for (let i = this._subMeshIndex; i < this.subMeshes.length; i++) {
                this.subMeshes[i].destroy();
            }
            this.subMeshes.length = this._subMeshIndex;
            this.needUpdate = true;
        }
    }

    private addMaterial(material: Material): void {
        if (this.materials[this._materialIndex] === material) {
            this._materialIndex++;
            return;
        }
        this.materials[this._materialIndex] = material;
        this._materialIndex++;
        this.needUpdate = true;
    }

    private createSubMesh(): boolean {
        let geometry = this.subMeshes[this._subMeshIndex];
        if (!geometry) {
            geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            this.subMeshes[this._subMeshIndex] = geometry;
            geometry.indexFormat = IndexFormat.UInt16;
            this.needUpdate = true;
        } else {
            geometry.clearRenderParams();
        }

        let view: SpineBufferView;
        if (this._viewPool.length > 0) {
            view = this._viewPool.pop()!;
            view.reset();
        } else {
            let initialVertexCapacity = 1024 * SpineConst.VERTEX_TWOCOLOR;
            let initialIndexCapacity = 1024 * 3;
            view = new SpineBufferView(initialVertexCapacity, initialIndexCapacity);
        }

        this._currentView = view;
        this._currentView.geometry = geometry;

        this._allocatedViewsThisFrame.push(view);

        this._geometryToView.set(geometry, this._currentView);

        this._currentGeometryVertexCount = 0;

        this._subMeshIndex++;

        return true;
    }

    /**
     * @en Append clipped vertices and indices with matrix transformation
     * @zh 附加裁剪后的顶点和索引，应用矩阵变换
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

        // Calculate vertex count to be added
        let newVertexCount = verticesLength / stride;

        // Check uint16 limit BEFORE appending
        if (this._currentGeometryVertexCount + newVertexCount > 65535) {
            // Force start new geometry to avoid overflow
            this.createSubMesh();
        }

        // Ensure we have a current view
        if (!this._currentView) {
            this.createSubMesh();
        }

        let currentView = this._currentView!;

        // Ensure capacity (view handles its own expansion)
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

        let vlen = vertexOffset;
        for (let j = 0; j < verticesLength; vlen += stride, j += stride) {
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

        currentView.markModified();
    }

    /**
     * @en Append vertices and indices with matrix transformation
     * @zh 附加顶点和索引，应用矩阵变换
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

        if (this._currentGeometryVertexCount + newVertexCount > 65535) {
            this.createSubMesh();
        }

        if (!this._currentView) {
            this.createSubMesh();
        }

        let currentView = this._currentView!;

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

            // Color
            vertexData[pos + 2] = finalColor.r;
            vertexData[pos + 3] = finalColor.g;
            vertexData[pos + 4] = finalColor.b;
            vertexData[pos + 5] = finalColor.a;

            // Position with matrix transformation
            let x = positions[v] + offsetX;
            let y = positions[v + 1] + offsetY;
            vertexData[pos + 6] = a * x + c * y + tx;
            vertexData[pos + 7] = - b * x - d * y + ty;

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

        currentView.markModified();
    }

    /**
     * @internal
     * @en Bind all views to buffers (Phase 2: Post-processing)
     * @zh 将所有 views 绑定到 buffers（阶段 2：后处理）
     */
    private _bindViewsToBuffers(): void {
        let manager = SpineGlobalMeshManager.instance;

        this._geometryToView.forEach((view, geometry) => {
            manager.assignViewToBuffer(view, view.vertexCount);

            // Use bufferState directly (no Mesh2D wrapper)
            geometry.bufferState = manager.outBufferState as any;
        });
    }

    /**
     * @en Get the view associated with a geometry (for batching)
     * @zh 获取与 geometry 关联的 view（用于合批）
     */
    getViewForGeometry(geometry: IRenderGeometryElement): SpineBufferView | undefined {
        return this._geometryToView.get(geometry);
    }

}
