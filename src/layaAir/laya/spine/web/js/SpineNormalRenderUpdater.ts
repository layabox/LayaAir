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
import { AnimatorUpdater } from "../base/optimize/AnimatorUpdater";
import { INormalRenderUpdater } from "../interface/IWebSpine";
import { SpineTexture } from "../SpineTexture";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

export class SpineNormalRenderUpdater implements INormalRenderUpdater {
    /** @internal */
    static _TEMP_COLOR: spine.Color;
    /** @internal */
    static _TEMP_COLOR2: spine.Color;

    static positions: Float32Array;
    static vertices: Float32Array;
    static indices: Uint16Array;
    
    static __init__(): void {
        SpineNormalRenderUpdater.positions = new Float32Array(SpineConst.NORMAL_MAX_VERTEX * 2);
        SpineNormalRenderUpdater.vertices = new Float32Array(SpineConst.NORMAL_MAX_VERTEX * SpineConst.VERTEX_TWOCOLOR);
        SpineNormalRenderUpdater.indices = new Uint16Array(SpineConst.NORMAL_MAX_VERTEX * 3);
        SpineNormalRenderUpdater._TEMP_COLOR = new spine.Color();
        SpineNormalRenderUpdater._TEMP_COLOR2 = new spine.Color();
    }

    private clipper = new spine.SkeletonClipping();

    materials: Material[] = [];
    verticesLength = 0;
    subMeshLength = 0;
    subMeshOffset = 0;
    subMeshCount = 0;
    indicesLength = 0;

    subMeshs:IRenderGeometryElement[] = [];

    renderUpdate(
        skeleton: spine.Skeleton, updater: AnimatorUpdater
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

        let materials = this.materials;
        materials.length = 0;
        
        this.subMeshs.length = 0;
        this.verticesLength = 0;
        this.indicesLength = 0;
        this.subMeshLength = 0;
        this.subMeshOffset = 0;
        this.subMeshCount = 0;

        let verticesLength = 0;
        let vertexCount = 0;

        let vertexDeclaration = SpineShaderInit.SpineNormalVertexDeclaration;;
        let meshIndex = 0;
        let currentMesh = updater.getDynamicMesh(vertexDeclaration, meshIndex);
        let bufferState = currentMesh._bufferState;
        let subMeshes = currentMesh._subMeshes || [];

        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let clippedVertexStride = clipper.isClipping() ? 2 : vertexStride;
            let slot = drawOrder[i];

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
                vertexCount = 4;
                verticesLength = clippedVertexStride << 2;

                if (attachment.sequence != null)
                    attachment.sequence.apply(slot, attachment);

                this.computeWorldVertices_RegionAttachment(region, slot.bone, positions, 0, clippedVertexStride, offsetX, offsetY);
                triangles = QUAD_TRIANGLES;
                uvs = region.uvs;
                texture = <SpineTexture>(region.region as any).page.texture;
                attachmentColor = region.color;

            } else if (attachment instanceof window.spine.MeshAttachment) {
                let mesh = <spine.MeshAttachment>attachment;
                vertexCount = (mesh.worldVerticesLength >> 1);
                verticesLength = vertexCount * clippedVertexStride;
                if (verticesLength > positions.length) {
                    positions = new Float32Array(verticesLength);
                }

                if (attachment.sequence != null)
                    attachment.sequence.apply(slot, attachment);

                this.computeWorldVertices_MeshAttachment(mesh, slot, 0, mesh.worldVerticesLength, positions, 0, clippedVertexStride, offsetX, offsetY);
                triangles = mesh.triangles;
                texture = <SpineTexture>(mesh.region as any).page.texture;
                uvs = mesh.uvs;
                attachmentColor = mesh.color;
            } else if (attachment instanceof window.spine.ClippingAttachment) {
                let clip = <spine.ClippingAttachment>(attachment);
                // clipper.clipStart(slot, clip);
                this.clipStart(this.clipper, slot, clip, offsetX, offsetY);
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
                    materials.push(updater.getMaterial(texture.realTexture, blendMode));
                    this.createSubMesh( bufferState , subMeshes);
                }

                if (clipper.isClipping()) {

                    clipper.clipTriangles(positions, verticesLength, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);
                    
                    if (!this.canAppend(this.verticesLength + clipper.clippedVertices.length , clipper.clippedTriangles.length)) {
                        meshIndex++;
                        this.uploadBuffer(currentMesh);
                        currentMesh = updater.getDynamicMesh(vertexDeclaration, meshIndex);
                        this.verticesLength = 0;
                        this.indicesLength = 0;
                    }

                    this.appendVerticesClip(clipper.clippedVertices, clipper.clippedTriangles, vertexStride);
                } else {

                    if (!this.canAppend(this.verticesLength + verticesLength , triangles.length)) {
                        meshIndex++;
                        this.uploadBuffer(currentMesh);
                        currentMesh = updater.getDynamicMesh(vertexDeclaration, meshIndex);
                        this.verticesLength = 0;
                        this.indicesLength = 0;
                    }

                    if (finalColor.a != 0) {
                        this.appendVertices(positions, uvs, finalColor, darkColor, verticesLength, triangles, triangles.length, vertexStride);
                    }
                }

                this.verticesLength += vertexCount * vertexStride;
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();

        this.createSubMesh( bufferState , subMeshes);

        if (subMeshes.length > this.subMeshCount) {
            for (let i = this.subMeshCount; i < subMeshes.length; i++) {
                subMeshes[i].destroy();
            }
            subMeshes.length = this.subMeshCount;
        }
    }
    
    /**
     * @en Check if the mesh can append more vertices and indices.
     * @param verticesLength Number of vertices to be appended.
     * @param indicesLength Number of indices to be appended.
     * @returns True if the mesh can append, false otherwise.
     * @zh 检查网格是否能够添加更多的顶点和索引。
     * @param verticesLength 要添加的顶点数量。
     * @param indicesLength 要添加的索引数量。
     * @returns 如果网格可以添加则返回 true，否则返回 false。
     */
    canAppend(verticesLength: number, indicesLength: number) {
        return this.verticesLength + verticesLength < SpineNormalRenderUpdater.vertices.length && this.indicesLength + indicesLength < SpineNormalRenderUpdater.indices.length;
    }

    private createSubMesh(bufferState: IBufferState , out: IRenderGeometryElement[]): void {
        if (!this.subMeshLength)
            return;

        let geometry = out[this.subMeshCount];
        if (!geometry) {
            geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            out[this.subMeshCount] = geometry;
        } else {
            geometry.clearRenderParams();
        }

        geometry.bufferState = bufferState;
        geometry.setDrawElemenParams(this.subMeshLength, this.subMeshOffset * 2);
        geometry.indexFormat = IndexFormat.UInt16;

        this.subMeshs.push(geometry);
        this.subMeshOffset = this.indicesLength;
        this.subMeshLength = 0;
    }

    private uploadBuffer(mesh: Mesh2D): void {
        let vertices = SpineNormalRenderUpdater.vertices;
        let indices = SpineNormalRenderUpdater.indices;
        let vbByteLength = this.verticesLength * 4;
        let ibByteLength = this.indicesLength * 2;
        
        let vertexBuffer = mesh.vertexBuffers[0];
        vertexBuffer.setDataLength(vbByteLength);
        vertexBuffer.setData(vertices.buffer as ArrayBuffer, 0, 0, vbByteLength);

        mesh.indexBuffer._setIndexDataLength(this.indicesLength);
        mesh.indexBuffer.setData(indices.buffer as ArrayBuffer, 0, 0, ibByteLength);
    }

    /**
     * @en Append clipped vertices and indices.
     * @param vertices Array of vertex data.
     * @param indices Array of index data.
     * @zh 裁剪后的顶点和索引。
     * @param vertices 顶点数据数组。
     * @param indices 索引数据数组。
     */
    appendVerticesClip(vertices: ArrayLike<number>, indices: ArrayLike<number> , stride: number) {
        let indicesLength = indices.length;
        let verticesLength = vertices.length;
        let vertexBuffer = SpineNormalRenderUpdater.vertices;

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
            vertexBuffer[vlen + 6] = vertices[j];
            vertexBuffer[vlen + 7] = vertices[j + 1];
            vertexBuffer[vlen + 8] = vertices[j + 8];
            vertexBuffer[vlen + 9] = vertices[j + 9];
            vertexBuffer[vlen + 10] = vertices[j + 10];
            vertexBuffer[vlen + 11] = vertices[j + 11];
        }

        this.verticesLength = before + verticesLength;

        let indicesArray = SpineNormalRenderUpdater.indices;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            indicesArray[i] = indices[j] + indexStart;

        this.indicesLength += indicesLength;
        this.subMeshLength += indicesLength;
    }

    appendVertices(
        positions: spine.NumberArrayLike, uvs: spine.NumberArrayLike, finalColor: spine.Color, darkColor: spine.Color,
        verticesLength: number,
        indices: spine.NumberArrayLike, indicesLength: number,
        stride: number,
    ): void {
        let vertices = SpineNormalRenderUpdater.vertices;
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
            vertices[size + 6] = positions[v];
            vertices[size + 7] = positions[v + 1];

            vertices[size + 8] = darkColor.r;
            vertices[size + 9] = darkColor.g;
            vertices[size + 10] = darkColor.b;
            vertices[size + 11] = darkColor.a;
        }


        let newIndices = SpineNormalRenderUpdater.indices;
        for (let i = this.indicesLength, j = 0; j < indicesLength; i++, j++)
            newIndices[i] = indices[j] + indexStart;

        this.verticesLength = before + verticesLength;
        this.indicesLength += indicesLength;
        this.subMeshLength += indicesLength;
    }

    /**
     * @param clipper 
     * @param slot 
     * @param clip 
     * @param ofx 
     * @param ofy 
     * @returns 
     */
    clipStart(clipper: spine.SkeletonClipping, slot: spine.Slot, clip: spine.VertexAttachment, ofx: number, ofy: number) {
        //@ts-ignore
        if (clipper.clipAttachment)
            return 0;
        //@ts-ignore
        clipper.clipAttachment = clip;
        let n = clip.worldVerticesLength;
        //@ts-ignore
        let vertices: spine.NumberArrayLike = spine.Utils.setArraySize(clipper.clippingPolygon, n);
        // clip.computeWorldVertices(slot, 0, n, vertices, 0, 2);
        this.computeWorldVertices_MeshAttachment(clip, slot, 0, n, vertices, 0, 2, ofx, ofy);
        //@ts-ignore
        let clippingPolygon = clipper.clippingPolygon;
        spine.SkeletonClipping.makeClockwise(clippingPolygon);
        //@ts-ignore
        let clippingPolygons = clipper.clippingPolygons = clipper.triangulator.decompose(clippingPolygon, clipper.triangulator.triangulate(clippingPolygon));
        for (let i = 0, n = clippingPolygons.length; i < n; i++) {
            let polygon = clippingPolygons[i];
            spine.SkeletonClipping.makeClockwise(polygon);
            polygon.push(polygon[0]);
            polygon.push(polygon[1]);
        }
        return clippingPolygons.length;
    }

    /**
     * @param attachment 
     * @param bone 
     * @param worldVertices 
     * @param offset 
     * @param stride 
     * @param ofx 
     * @param ofy 
     */
    private computeWorldVertices_RegionAttachment(attachment: spine.RegionAttachment, bone: spine.Bone, worldVertices: spine.NumberArrayLike, offset: number, stride: number, ofx: number, ofy: number) {
        // RegionAttachment.OX1 = 0;
        // RegionAttachment.OY1 = 1;
        // RegionAttachment.OX2 = 2;
        // RegionAttachment.OY2 = 3;
        // RegionAttachment.OX3 = 4;
        // RegionAttachment.OY3 = 5;
        // RegionAttachment.OX4 = 6;
        // RegionAttachment.OY4 = 7;
        let vertexOffset = attachment.offset;
        let x = bone.worldX + ofx, y = bone.worldY + ofy;
        let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
        let offsetX = 0, offsetY = 0;
        offsetX = vertexOffset[0];
        offsetY = vertexOffset[1];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        offset += stride;
        offsetX = vertexOffset[2];
        offsetY = vertexOffset[3];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        offset += stride;
        offsetX = vertexOffset[4];
        offsetY = vertexOffset[5];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
        offset += stride;
        offsetX = vertexOffset[6];
        offsetY = vertexOffset[7];
        worldVertices[offset] = offsetX * a + offsetY * b + x;
        worldVertices[offset + 1] = offsetX * c + offsetY * d + y;
    }

    /**
     * @param attachment 
     * @param slot 
     * @param start 
     * @param count 
     * @param worldVertices 
     * @param offset 
     * @param stride 
     * @param ofx 
     * @param ofy 
     * @returns 
     */
    private computeWorldVertices_MeshAttachment(attachment: spine.VertexAttachment, slot: spine.Slot, start: number, count: number, worldVertices: spine.NumberArrayLike, offset: number, stride: number, ofx: number, ofy: number) {
        count = offset + (count >> 1) * stride;
        let skeleton = slot.bone.skeleton;
        //@ts-ignore
        let deformArray = slot.deform || slot.attachmentVertices;
        
        let vertices = attachment.vertices;
        let bones = attachment.bones;
        if (bones == null) {
            if (deformArray.length > 0)
                vertices = deformArray;
            let bone = slot.bone;
            let x = bone.worldX + ofx;
            let y = bone.worldY + ofy;
            let a = bone.a, b = bone.b, c = bone.c, d = bone.d;
            for (let v = start, w = offset; w < count; v += 2, w += stride) {
                let vx = vertices[v], vy = vertices[v + 1];
                worldVertices[w] = vx * a + vy * b + x;
                worldVertices[w + 1] = vx * c + vy * d + y;
            }
            return;
        }
        let v = 0, skip = 0;
        for (let i = 0; i < start; i += 2) {
            let n = bones[v];
            v += n + 1;
            skip += n;
        }
        let skeletonBones = skeleton.bones;
        if (deformArray.length == 0) {
            for (let w = offset, b = skip * 3; w < count; w += stride) {
                let wx = 0, wy = 0;
                let n = bones[v++];
                n += v;
                for (; v < n; v++, b += 3) {
                    let bone = skeletonBones[bones[v]];
                    let vx = vertices[b], vy = vertices[b + 1], weight = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX + ofx) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY + ofy) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
            }
        }
        else {
            let deform = deformArray;
            for (let w = offset, b = skip * 3, f = skip << 1; w < count; w += stride) {
                let wx = 0, wy = 0;
                let n = bones[v++];
                n += v;
                for (; v < n; v++, b += 3, f += 2) {
                    let bone = skeletonBones[bones[v]];
                    let vx = vertices[b] + deform[f], vy = vertices[b + 1] + deform[f + 1], weight = vertices[b + 2];
                    wx += (vx * bone.a + vy * bone.b + bone.worldX + ofx) * weight;
                    wy += (vx * bone.c + vy * bone.d + bone.worldY + ofy) * weight;
                }
                worldVertices[w] = wx;
                worldVertices[w + 1] = wy;
            }
        }
    }
    
}