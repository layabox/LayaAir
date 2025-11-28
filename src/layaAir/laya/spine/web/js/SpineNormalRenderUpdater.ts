import { LayaGL } from "../../../layagl/LayaGL";
import { IBufferState } from "../../../RenderDriver/DriverDesign/RenderDevice/IBufferState";
import { IRenderGeometryElement } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { Material } from "../../../resource/Material";
import { Mesh2D } from "../../../resource/Mesh2D";
import { SpineShaderInit } from "../../shader/SpineShaderInit";
import { SpineConst } from "../../SpineConst";
import { SpineRenderUpdater } from "../base/optimize/SpineRenderUpdater";
import { INormalRenderUpdater } from "../interface/IWebSpine";
import { SpineTexture } from "../SpineTexture";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

interface BufferInfo {
    data: Float32Array | Uint16Array;
    vertexLength: number;
}

interface SubMeshBufferInfo {
    bufferIndex: number;
    vertexStart: number;
    vertexLength: number;
    indexStart: number;
    indexLength: number;
    material: Material;
}

export class SpineNormalRenderUpdater implements INormalRenderUpdater {
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
     * @en Vertex buffer arrays for normal rendering. Each array can hold up to 65535 vertices.
     * @zh 普通渲染的顶点缓冲区数组。每个数组最多可容纳 65535 个顶点。
     */
    vertices: BufferInfo[] = [];

    /**
     * @en Index buffer for normal rendering.
     * @zh 普通渲染的索引缓冲区。
     */
    indices: Uint16Array = new Uint16Array(SpineConst.NORMAL_VERTEX_LENGTH * 3);

    /**
     * @en SubMesh buffer information array, recording vertex and index ranges for each submesh.
     * @zh SubMesh 缓冲区信息数组，记录每个 submesh 的顶点和索引范围。
     */
    subMeshBufferInfos: SubMeshBufferInfo[] = [];

    /**
     * @en Current buffer index.
     * @zh 当前缓冲区索引。
     */
    private currentBufferIndex = 0;

    /**
     * @en Maximum vertices per buffer (Uint16 max index value + 1).
     * @zh 每个缓冲区的最大顶点数（Uint16 最大索引值 + 1）。
     */
    private static readonly MAX_VERTICES_PER_BUFFER = 65536;

    materials: Material[] = [];
    verticesLength = 0;
    indicesLength = 0;

    _meshIndexStart = 0;
    /** @internal */
    _subMeshIndexStart = 0;
    /** @internal */
    _subMeshVertexStart = 0;

    /** @internal */
    _subMeshIndex = 0;
    /** @internal */
    _materialIndex = 0;

    needUpdate = false;

    subMeshes:IRenderGeometryElement[] = [];

    /**
     * @en Get current vertices buffer info.
     * @zh 获取当前顶点缓冲区信息。
     */
    private getCurrentVerticesInfo(): BufferInfo {
        if (!this.vertices[this.currentBufferIndex]) {
            this.vertices[this.currentBufferIndex] = {
                data: new Float32Array(SpineConst.NORMAL_VERTEX_LENGTH * SpineConst.VERTEX_TWOCOLOR),
                vertexLength: 0
            };
        }
        return this.vertices[this.currentBufferIndex];
    }

    private ensureVerticesCapacity(requiredLength: number): BufferInfo {
        const bufferInfo = this.getCurrentVerticesInfo();
        const currentVertices = bufferInfo.data as Float32Array;
        if (requiredLength > currentVertices.length) {
            const newLength = Math.max(requiredLength, currentVertices.length);
            const newVertices = new Float32Array(newLength);
            newVertices.set(currentVertices);
            bufferInfo.data = newVertices;
        }

        return bufferInfo;
    }

    private ensureIndicesCapacity(requiredLength: number) {
        const currentIndices = this.indices;
        if (requiredLength > currentIndices.length) {
            const newLength = Math.max(requiredLength, currentIndices.length);
            const newIndices = new Uint16Array(newLength);
            newIndices.set(currentIndices);
            this.indices = newIndices;
        }
    }

    renderUpdate(
        skeleton: spine.Skeleton, updater: SpineRenderUpdater
        , slotRangeStart?: number, slotRangeEnd?: number
        , offsetX: number = 0, offsetY: number = 0
    ): void {
        let clipper = this.clipper;
        // let premultipliedAlpha = this.templet.premultipliedAlpha;
        let twoColorTint = true;//renderNode.twoColorTint;
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

        this.currentBufferIndex = -1;
        this.subMeshBufferInfos.length = 0;
        
        this.indicesLength = 0;
        this._subMeshIndexStart = 0;

        let verticesLength = 0;

        let vertexDeclaration = SpineShaderInit.SpineNormalVertexDeclaration;;
        let meshIndex = -1;
        let currentMesh: Mesh2D , bufferState: IBufferState , subMeshes: IRenderGeometryElement[];

        const changeMesh = () => {
            meshIndex++;

            this.uploadBuffer(currentMesh);
            currentMesh = updater.getDynamicMesh(vertexDeclaration, meshIndex);
            bufferState = currentMesh._bufferState;
            subMeshes = currentMesh._subMeshes = currentMesh._subMeshes || [];
            subMeshes.length = 0;

            this.currentBufferIndex++;
            this.verticesLength = 0;
            
            this._meshIndexStart = this.indicesLength;
            this._subMeshVertexStart = 0;
        }

        changeMesh();

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
            if (attachment instanceof window.spine.RegionAttachment) {
                // continue;
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
                // if (premultipliedAlpha) {
                //     finalColor.r *= finalColor.a;
                //     finalColor.g *= finalColor.a;
                //     finalColor.b *= finalColor.a;
                // }
                let darkColor = _TEMP_COLOR2;
                if (!slot.darkColor)
                    darkColor.set(0, 0, 0, 1.0);
                else {
                    // if (premultipliedAlpha) {
                    //     darkColor.r = slot.darkColor.r * finalColor.a;
                    //     darkColor.g = slot.darkColor.g * finalColor.a;
                    //     darkColor.b = slot.darkColor.b * finalColor.a;
                    // } else {
                    darkColor.setFromColor(slot.darkColor);
                    // }
                    // darkColor.a = premultipliedAlpha ? 1.0 : 0.0;
                    // finalColor.rgb = ((texColor.a - 1.0) * v_dark.a + 1.0 - texColor.rgb) * v_dark.rgb + texColor.rgb * v_light.rgb;
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
                    this.createSubMesh(bufferState, subMeshes);
                }

                if (clipper.isClipping()) {

                    clipper.clipTriangles(positions, verticesLength, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);
                    
                    if (!this.canAppend(clipper.clippedVertices.length)) {
                        changeMesh();
                    }

                    this.appendVerticesClip(clipper.clippedVertices, clipper.clippedTriangles, vertexStride , offsetX , offsetY);
                } else {

                    if (!this.canAppend(verticesLength)) {
                        changeMesh();
                    }

                    if (finalColor.a != 0) {
                        this.appendVertices(positions, uvs, finalColor, darkColor, verticesLength, triangles, triangles.length, vertexStride ,offsetX , offsetY);
                    }
                }
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();

        this.createSubMesh(bufferState, subMeshes);
        
        if (this._subMeshIndex < this.subMeshes.length) {
            for (let i = this._subMeshIndex; i < this.subMeshes.length; i++) {
                this.subMeshes[i].destroy();
            }
            this.subMeshes.length = this._subMeshIndex;
            this.needUpdate = true;
        }

        this.uploadBuffer(currentMesh);
    }

    private addMaterial(material: Material): void {
        if (this.materials[this._materialIndex] === material) {
            this._materialIndex++;
            return ;
        }
        this.materials[this._materialIndex] = material;
        this._materialIndex++;
        this.needUpdate = true;
    }

    /**
     * @en Check if the mesh can append more vertices and indices.
     * @param verticesLength Number of vertices to be appended.
     * @returns True if the mesh can append, false otherwise.
     * @zh 检查网格是否能够添加更多的顶点和索引。
     * @param verticesLength 要添加的顶点数量。
     * @returns 如果网格可以添加则返回 true，否则返回 false。
     */
    canAppend(verticesLength: number) {
        return (this.verticesLength + verticesLength) / SpineConst.VERTEX_TWOCOLOR < SpineNormalRenderUpdater.MAX_VERTICES_PER_BUFFER;
    }

    private createSubMesh(bufferState: IBufferState , out: IRenderGeometryElement[]): boolean {
        if (this.indicesLength - this._subMeshIndexStart == 0)
            return false;

        let geometry = this.subMeshes[this._subMeshIndex];
        if (!geometry) {
            geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            this.subMeshes[this._subMeshIndex] = geometry;
            this.needUpdate = true;
        } else {
            geometry.clearRenderParams();
        }

        geometry.bufferState = bufferState;
        let subMeshLength = this.indicesLength - this._subMeshIndexStart;
        geometry.setDrawElemenParams(subMeshLength, this._subMeshIndexStart * 2);
        geometry.indexFormat = IndexFormat.UInt16;

        out.push(geometry);
        

        const subMeshInfo: SubMeshBufferInfo = {
            bufferIndex: this.currentBufferIndex,
            vertexStart: this._subMeshVertexStart,
            vertexLength: this.verticesLength - this._subMeshVertexStart,
            indexStart: this._subMeshIndexStart,
            indexLength: subMeshLength,
            material: this.materials[this._materialIndex - 1]
        };
        this.subMeshBufferInfos[this._subMeshIndex] = subMeshInfo;

        this._subMeshIndexStart = this.indicesLength;
        this._subMeshVertexStart = this.verticesLength;
        this._subMeshIndex++;

        return true;
    }

    private uploadBuffer(mesh: Mesh2D): void {
        if(!mesh) return;
        const verticesInfo = this.getCurrentVerticesInfo();
        
        let vbByteLength = this.verticesLength * 4;
        let ibByteLength = (this.indicesLength - this._meshIndexStart) * 2;
        
        let vertexBuffer = mesh.vertexBuffers[0];
        vertexBuffer.setDataLength(vbByteLength);
        vertexBuffer.setData(verticesInfo.data.buffer as ArrayBuffer, 0, 0, vbByteLength);

        mesh.indexBuffer._setIndexDataLength(ibByteLength);
        mesh.indexBuffer.setData(this.indices.buffer as ArrayBuffer, 0, this._meshIndexStart * 2, ibByteLength);
    }

    /**
     * @en Append clipped vertices and indices.
     * @param vertices Array of vertex data.
     * @param indices Array of index data.
     * @param stride Vertex stride.
     * @param offsetX Offset X.
     * @param offsetY Offset Y.
     * @zh 裁剪后的顶点和索引。
     * @param vertices 顶点数据数组。
     * @param indices 索引数据数组。
     * @param stride 顶点步长。
     * @param offsetX 偏移X。
     * @param offsetY 偏移Y。
     */
    appendVerticesClip(vertices: ArrayLike<number>, indices: ArrayLike<number> , stride: number , offsetX:number , offsetY:number) {
        let verticesLength = vertices.length;
        if (verticesLength == 0) 
            return;
        let indicesLength = indices.length;
        
        let verticesInfo = this.ensureVerticesCapacity(this.verticesLength + verticesLength);
        this.ensureIndicesCapacity(this.indicesLength + indicesLength);
        
        let vertexBuffer = verticesInfo.data as Float32Array;

        let before = this.verticesLength;
        let indexStart = before / stride;

        let vlen = before;
        for (let j = 0; j < verticesLength; vlen += stride, j += stride) {
            vertexBuffer[vlen] = vertices[j + 6];
            vertexBuffer[vlen + 1] = vertices[j + 7];
            vertexBuffer[vlen + 2] = vertices[j + 2];
            vertexBuffer[vlen + 3] = vertices[j + 3];
            vertexBuffer[vlen + 4] = vertices[j + 4];
            vertexBuffer[vlen + 5] = vertices[j + 5];
            vertexBuffer[vlen + 6] = vertices[j] + offsetX;
            vertexBuffer[vlen + 7] = vertices[j + 1] + offsetY;
            vertexBuffer[vlen + 8] = vertices[j + 8];
            vertexBuffer[vlen + 9] = vertices[j + 9];
            vertexBuffer[vlen + 10] = vertices[j + 10];
            vertexBuffer[vlen + 11] = vertices[j + 11];
        }

        this.verticesLength = before + verticesLength;

        let indicesArray = this.indices;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            indicesArray[i] = indices[j] + indexStart;

        this.indicesLength += indicesLength;
        
        verticesInfo.vertexLength = this.verticesLength;
    }

    appendVertices(
        positions: spine.NumberArrayLike, uvs: spine.NumberArrayLike, finalColor: spine.Color, darkColor: spine.Color,
        verticesLength: number,
        indices: spine.NumberArrayLike, indicesLength: number,
        stride: number, offsetX:number , offsetY:number
    ): void {
        if (verticesLength == 0) 
            return;
        
        let verticesInfo = this.ensureVerticesCapacity(this.verticesLength + verticesLength);
        this.ensureIndicesCapacity(this.indicesLength + indicesLength);
        
        let vertices = verticesInfo.data as Float32Array;
        let before = this.verticesLength;
        let indexStart = before / stride;

        for (let u = 0, v = 0, n = verticesLength; v < n; v += stride, u += 2) {
            let size = before + v;
            vertices[size] = uvs[u];
            vertices[size + 1] = uvs[u + 1];
            vertices[size + 2] = finalColor.r;
            vertices[size + 3] = finalColor.g;
            vertices[size + 4] = finalColor.b;
            vertices[size + 5] = finalColor.a;
            vertices[size + 6] = positions[v] + offsetX;
            vertices[size + 7] = positions[v + 1] + offsetY;

            vertices[size + 8] = darkColor.r;
            vertices[size + 9] = darkColor.g;
            vertices[size + 10] = darkColor.b;
            vertices[size + 11] = darkColor.a;
        }


        let newIndices = this.indices;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            newIndices[i] = indices[j] + indexStart;

        this.verticesLength = before + verticesLength;
        this.indicesLength += indicesLength;
        
        verticesInfo.vertexLength = this.verticesLength;
    }
}