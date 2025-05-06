
import { SpineTexture } from "../SpineTexture";
import { SpineTemplet } from "../SpineTemplet";
import { Material } from "../../resource/Material";
import { SpineVirtualMesh } from "../mesh/SpineVirtualMesh";
import { ISpineRender } from "../interface/ISpineRender";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineNormalRenderBase } from "./SpineNormalRenderBase";
import { SpineMeshBase } from "../mesh/SpineMeshBase";
import { SpineShaderInit } from "../material/SpineShaderInit";


interface Renderable {
    vertices: spine.NumberArrayLike;
    numVertices: number;
    numFloats: number;
}

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

/**
 * @en SpineSkeletonRenderer class for rendering Spine skeletons.
 * @zh SpineSkeletonRenderer 类用于渲染 Spine 骨骼。
 */
export class SpineSkeletonRenderer extends SpineNormalRenderBase implements ISpineRender {
    /**
     * @en Indicates if alpha should be premultiplied.
     * @zh 指示是否应预乘 alpha。
     */
    premultipliedAlpha: boolean;
    /**
     * @en Spine templet associated with this renderer.
     * @zh 与此渲染器关联的 Spine 模板。
     */
    templet: SpineTemplet;

    private tempColor: spine.Color;
    private tempColor2: spine.Color;
    private static vertices: spine.NumberArrayLike;
    private renderable: Renderable;
    private clipper: spine.SkeletonClipping;

    /**
     * @en Create a mesh with the given material.
     * @param material The material to be used for the mesh.
     * @returns A SpineMeshBase object.
     * @zh 创建具有给定材质的网格。
     * @param material 用于网格的材质。
     * @returns SpineMeshBase 对象。
     */
    createMesh(material: Material): SpineMeshBase {
        return new SpineVirtualMesh(material);
    }

    /**
     * @en Create a new instance of the SpineSkeletonRenderer class.
     * @param templet The Spine templet to use.
     * @zh 创建 SpineSkeletonRenderer 类的新实例。
     * @param templet 要使用的 Spine 模板。
     */
    constructor(templet: SpineTemplet) {
        super();
        this.templet = templet;
        if (SpineSkeletonRenderer.vertices == null) {
            SpineSkeletonRenderer.vertices = spine.Utils.newFloatArray(12 * 1024);
        }
        this.renderable = { vertices: null, numVertices: 0, numFloats: 0 };
        this.clipper = new spine.SkeletonClipping();
        this.tempColor = new spine.Color();
        this.tempColor2 = new spine.Color();
    }

    // drawOld(skeleton: spine.Skeleton, graphics: Graphics, slotRangeStart: number = -1, slotRangeEnd: number = -1) {
    //     let clipper = this.clipper;
    //     let premultipliedAlpha = this.premultipliedAlpha;
    //     let twoColorTint = false;
    //     let blendMode: spine.BlendMode = null;

    //     let tempPos = this.temp;
    //     let tempUv = this.temp2;
    //     let tempLight = this.temp3;
    //     let tempDark = this.temp4;

    //     let renderable: Renderable = this.renderable;
    //     let uvs: ArrayLike<number> = null;
    //     let triangles: Array<number> = null;
    //     let drawOrder = skeleton.drawOrder;
    //     let attachmentColor: spine.Color = null;
    //     let skeletonColor = skeleton.color;
    //     let vertexSize = twoColorTint ? 12 : 8;
    //     let inRange = false;
    //     let needSlot = this.templet.needSlot;
    //     let staticVetices = SpineSkeletonRenderer.vertices;
    //     if (slotRangeStart == -1) inRange = true;
    //     for (let i = 0, n = drawOrder.length; i < n; i++) {
    //         let clippedVertexSize = clipper.isClipping() ? 2 : vertexSize;
    //         let slot = drawOrder[i];

    //         if (slotRangeStart >= 0 && slotRangeStart == slot.data.index) {
    //             inRange = true;
    //         }

    //         if (!inRange) {
    //             clipper.clipEndWithSlot(slot);
    //             continue;
    //         }

    //         if (slotRangeEnd >= 0 && slotRangeEnd == slot.data.index) {
    //             inRange = false;
    //         }

    //         let attachment = slot.getAttachment();
    //         let name: string = null;
    //         let texture: SpineTexture;
    //         if (attachment instanceof this.templet.ns.RegionAttachment) {
    //             let region = <spine.RegionAttachment>attachment;
    //             renderable.vertices = staticVetices;
    //             renderable.numVertices = 4;
    //             renderable.numFloats = clippedVertexSize << 2;
    //             region.computeWorldVertices(needSlot ? slot as any : slot.bone, renderable.vertices, 0, clippedVertexSize);
    //             triangles = QUAD_TRIANGLES;
    //             uvs = region.uvs;
    //             if (needSlot) {
    //                 name = (region.region as any).page.name;
    //             } else {
    //                 name = region.region.renderObject.page.name;
    //             }
    //             texture = this.templet.getTexture(name);
    //             attachmentColor = region.color;
    //         } else if (attachment instanceof this.templet.ns.MeshAttachment) {
    //             let mesh = <spine.MeshAttachment>attachment;
    //             renderable.vertices = staticVetices;
    //             renderable.numVertices = (mesh.worldVerticesLength >> 1);
    //             renderable.numFloats = renderable.numVertices * clippedVertexSize;
    //             if (renderable.numFloats > renderable.vertices.length) {
    //                 renderable.vertices = staticVetices = this.templet.ns.Utils.newFloatArray(renderable.numFloats);
    //             }
    //             mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, renderable.vertices, 0, clippedVertexSize);
    //             triangles = mesh.triangles;
    //             if ("4.1" == SpineTemplet.RuntimeVersion) {
    //                 name = (mesh.region as any).page.name;
    //             } else {
    //                 name = mesh.region.renderObject.page.name;
    //             }
    //             texture = this.templet.getTexture(name);
    //             uvs = mesh.uvs;
    //             attachmentColor = mesh.color;
    //         } else if (attachment instanceof this.templet.ns.ClippingAttachment) {
    //             let clip = <spine.ClippingAttachment>(attachment);
    //             clipper.clipStart(slot, clip);
    //             continue;
    //         } else {
    //             clipper.clipEndWithSlot(slot);
    //             continue;
    //         }

    //         if (texture != null) {
    //             let slotColor = slot.color;
    //             let finalColor = this.tempColor;
    //             finalColor.r = skeletonColor.r * slotColor.r * attachmentColor.r;
    //             finalColor.g = skeletonColor.g * slotColor.g * attachmentColor.g;
    //             finalColor.b = skeletonColor.b * slotColor.b * attachmentColor.b;
    //             finalColor.a = skeletonColor.a * slotColor.a * attachmentColor.a;
    //             if (premultipliedAlpha) {
    //                 finalColor.r *= finalColor.a;
    //                 finalColor.g *= finalColor.a;
    //                 finalColor.b *= finalColor.a;
    //             }

    //             let slotBlendMode = slot.data.blendMode;
    //             if (slotBlendMode != blendMode) {
    //                 blendMode = slotBlendMode;
    //             }

    //             if (clipper.isClipping()) {
    //                 clipper.clipTriangles(renderable.vertices, renderable.numFloats, triangles, triangles.length, uvs, finalColor, null, twoColorTint);
    //                 let clippedVertices = new Float32Array(clipper.clippedVertices);
    //                 let clippedTriangles = clipper.clippedTriangles;
    //                 let mVertices = [];
    //                 let mUVs = [];
    //                 let colorNum = 0xffffff;
    //                 let alpha = 1;
    //                 if (this.vertexEffect != null) {
    //                     let vertexEffect = this.vertexEffect;
    //                     let verts = clippedVertices;
    //                     if (!twoColorTint) {
    //                         for (let v = 0, n = clippedVertices.length; v < n; v += vertexSize) {
    //                             tempPos.x = verts[v];
    //                             tempPos.y = verts[v + 1];
    //                             tempLight.set(verts[v + 2], verts[v + 3], verts[v + 4], verts[v + 5]);
    //                             tempUv.x = verts[v + 6];
    //                             tempUv.y = verts[v + 7];
    //                             tempDark.set(0, 0, 0, 0);
    //                             vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
    //                             verts[v] = tempPos.x;
    //                             verts[v + 1] = tempPos.y;
    //                             verts[v + 2] = tempLight.r;
    //                             verts[v + 3] = tempLight.g;
    //                             verts[v + 4] = tempLight.b;
    //                             verts[v + 5] = tempLight.a;
    //                             verts[v + 6] = tempUv.x;
    //                             verts[v + 7] = tempUv.y

    //                             mVertices.push(verts[v], -verts[v + 1]);
    //                             colorNum = (verts[v + 2] * 255 << 16) + (verts[v + 3] * 255 << 8) + verts[v + 4];
    //                             alpha = verts[v + 5];
    //                             mUVs.push(verts[v + 6], verts[v + 7]);
    //                         }
    //                     }
    //                 } else {
    //                     let vi = 0;
    //                     while (Number.isFinite(clippedVertices[vi + 6]) && Number.isFinite(clippedVertices[vi + 7])) {
    //                         mVertices.push(clippedVertices[vi]);
    //                         mVertices.push(-clippedVertices[vi + 1]);
    //                         colorNum = (clippedVertices[vi + 2] * 255 << 16) + (clippedVertices[vi + 3] * 255 << 8) + clippedVertices[vi + 4] * 255;
    //                         alpha = clippedVertices[vi + 5];
    //                         mUVs.push(clippedVertices[vi + 6]);
    //                         mUVs.push(clippedVertices[vi + 7]);
    //                         vi += this.vertexSize;
    //                     }
    //                 }
    //                 let blendMode;
    //                 switch (slotBlendMode) {
    //                     case 1:
    //                         blendMode = "light";
    //                         break;
    //                     case 2:
    //                         blendMode = "multiply";
    //                         break;
    //                     case 3:
    //                         blendMode = "screen";
    //                         break;
    //                     default:
    //                         blendMode = "normal";
    //                 }
    //                 graphics.drawTriangles(texture.realTexture, 0, 0, <any>mVertices, <any>mUVs, new Uint16Array(clippedTriangles), Matrix.EMPTY, alpha, colorNum, blendMode);
    //             } else {
    //                 let verts = renderable.vertices;
    //                 let mVertices = [];
    //                 let mUVs = [];
    //                 let colorNum = 0xffffff;
    //                 let alpha = 1;
    //                 if (this.vertexEffect != null) {
    //                     let vertexEffect = this.vertexEffect;
    //                     if (!twoColorTint) {
    //                         for (let v = 0, u = 0, n = renderable.numFloats; v < n; v += vertexSize, u += 2) {
    //                             tempPos.x = verts[v];
    //                             tempPos.y = verts[v + 1];
    //                             tempUv.x = uvs[u];
    //                             tempUv.y = uvs[u + 1]
    //                             tempLight.setFromColor(finalColor);
    //                             tempDark.set(0, 0, 0, 0);
    //                             vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
    //                             verts[v] = tempPos.x;
    //                             verts[v + 1] = tempPos.y;
    //                             verts[v + 2] = tempLight.r;
    //                             verts[v + 3] = tempLight.g;
    //                             verts[v + 4] = tempLight.b;
    //                             verts[v + 5] = tempLight.a;
    //                             verts[v + 6] = tempUv.x;
    //                             verts[v + 7] = tempUv.y

    //                             mVertices.push(verts[v], -verts[v + 1]);
    //                             colorNum = (verts[v + 2] * 255 << 16) + (verts[v + 3] * 255 << 8) + verts[v + 4] * 255;
    //                             alpha = verts[v + 5];
    //                             mUVs.push(verts[v + 6], verts[v + 7]);
    //                         }
    //                     }
    //                 } else {
    //                     if (!twoColorTint) {
    //                         for (let v = 2, u = 0, n = renderable.numFloats; v < n; v += vertexSize, u += 2) {
    //                             verts[v] = finalColor.r;
    //                             verts[v + 1] = finalColor.g;
    //                             verts[v + 2] = finalColor.b;
    //                             verts[v + 3] = finalColor.a;
    //                             verts[v + 4] = uvs[u];
    //                             verts[v + 5] = uvs[u + 1];

    //                             mVertices.push(verts[v - 2], -verts[v - 1]);
    //                             colorNum = (verts[v] * 255 << 16) + (verts[v + 1] * 255 << 8) + verts[v + 2] * 255;
    //                             alpha = verts[v + 3];
    //                             mUVs.push(verts[v + 4], verts[v + 5]);
    //                         }
    //                     }
    //                 }
    //                 let blendMode;
    //                 switch (slotBlendMode) {
    //                     case 1:
    //                         blendMode = "light";
    //                         break;
    //                     case 2:
    //                         blendMode = "multiply";
    //                         break;
    //                     case 3:
    //                         blendMode = "screen";
    //                         break;
    //                     default:
    //                         blendMode = "normal";
    //                 }
    //                 graphics.drawTriangles(texture.realTexture, 0, 0, <any>mVertices, <any>mUVs, new Uint16Array(triangles), Matrix.EMPTY, alpha, colorNum, blendMode);
    //             }
    //         }

    //         clipper.clipEndWithSlot(slot);
    //     }
    //     clipper.clipEnd();
    // }

    /**
     * @en Draw the skeleton.
     * @param skeleton The skeleton to draw.
     * @param renderNode The render node.
     * @param slotRangeStart The starting slot index.
     * @param slotRangeEnd The ending slot index.
     * @zh 绘制骨骼。
     * @param skeleton 要绘制的骨骼。
     * @param renderNode 渲染节点。
     * @param slotRangeStart 起始插槽索引。
     * @param slotRangeEnd 结束插槽索引。
     */
    draw(skeleton: spine.Skeleton, renderNode: Spine2DRenderNode, slotRangeStart?: number, slotRangeEnd?: number): void {

        let clipper = this.clipper;
        this.clearBatch();
        // let premultipliedAlpha = this.templet.premultipliedAlpha;
        let twoColorTint = true;//renderNode.twoColorTint;
        let blendMode: spine.BlendMode | null = null;

        let renderable: Renderable = this.renderable;
        let uvs: spine.NumberArrayLike;
        let triangles: spine.NumberArrayLike;
        let drawOrder = skeleton.drawOrder;
        let attachmentColor: spine.Color;
        let skeletonColor = skeleton.color;

        let vertexSize: number = SpineVirtualMesh.vertexSize_TwoColor;

        let inRange = false;
        if (slotRangeStart == -1) inRange = true;
        let virtualMesh: SpineVirtualMesh;
        let spineTex;
        let staticVetices = SpineSkeletonRenderer.vertices;
        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let clippedVertexSize = clipper.isClipping() ? 2 : vertexSize;
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
                renderable.vertices = staticVetices;
                renderable.numVertices = 4;
                renderable.numFloats = clippedVertexSize << 2;

                if (attachment.sequence != null)
                    attachment.sequence.apply(slot, attachment);

                this.computeWorldVertices_RegionAttachment(region, slot.bone, renderable.vertices, 0, clippedVertexSize, -skeleton.x, -skeleton.y);
                triangles = QUAD_TRIANGLES;
                uvs = region.uvs;
                texture = <SpineTexture>(region.region as any).page.texture;
                attachmentColor = region.color;
                // graphics.drawTexture(texture.realTexture,0,0,100,100,null,1,"#ffffff","normal",uvs as any)

            } else if (attachment instanceof window.spine.MeshAttachment) {
                //continue;
                //debugger;
                let mesh = <spine.MeshAttachment>attachment;
                renderable.vertices = staticVetices;
                renderable.numVertices = (mesh.worldVerticesLength >> 1);
                renderable.numFloats = renderable.numVertices * clippedVertexSize;
                if (renderable.numFloats > renderable.vertices.length) {
                    renderable.vertices = staticVetices = window.spine.Utils.newFloatArray(renderable.numFloats);
                }

                if (attachment.sequence != null)
                    attachment.sequence.apply(slot, attachment);

                this.computeWorldVertices_MeshAttachment(mesh, slot, 0, mesh.worldVerticesLength, renderable.vertices, 0, clippedVertexSize, -skeleton.x, -skeleton.y);
                triangles = mesh.triangles;
                texture = <SpineTexture>(mesh.region as any).page.texture;
                uvs = mesh.uvs;
                attachmentColor = mesh.color;
            } else if (attachment instanceof window.spine.ClippingAttachment) {
                let clip = <spine.ClippingAttachment>(attachment);
                // clipper.clipStart(slot, clip);
                this.clipStart(this.clipper, slot, clip, -skeleton.x, -skeleton.y);
                continue;
            } else {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (texture) {
                let slotColor = slot.color;
                let finalColor = this.tempColor;
                finalColor.r = skeletonColor.r * slotColor.r * attachmentColor.r;
                finalColor.g = skeletonColor.g * slotColor.g * attachmentColor.g;
                finalColor.b = skeletonColor.b * slotColor.b * attachmentColor.b;
                finalColor.a = skeletonColor.a * slotColor.a * attachmentColor.a;
                // if (premultipliedAlpha) {
                //     finalColor.r *= finalColor.a;
                //     finalColor.g *= finalColor.a;
                //     finalColor.b *= finalColor.a;
                // }
                let darkColor = this.tempColor2;
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
                    virtualMesh && virtualMesh.draw();
                    let mat = renderNode.templet.getMaterial(texture.realTexture, blendMode);
                    virtualMesh = this.nextBatch(mat, renderNode) as SpineVirtualMesh;
                    virtualMesh.clear();
                }

                if (clipper.isClipping()) {
                    clipper.clipTriangles(renderable.vertices, renderable.numFloats, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);
                    if (!virtualMesh.canAppend(clipper.clippedVertices.length, clipper.clippedTriangles.length)) {
                        virtualMesh.draw();
                        virtualMesh = this.nextBatch(virtualMesh.material, renderNode) as SpineVirtualMesh;
                        virtualMesh.clear();
                    }
                    virtualMesh.appendVerticesClip(clipper.clippedVertices, clipper.clippedTriangles);
                } else {
                    if (!virtualMesh.canAppend(renderable.numFloats, triangles.length)) {
                        virtualMesh.draw();
                        virtualMesh = this.nextBatch(virtualMesh.material, renderNode) as SpineVirtualMesh;
                        virtualMesh.clear();
                    }
                    if (finalColor.a != 0) {
                        virtualMesh.appendVertices(renderable.vertices, renderable.numFloats, triangles, triangles.length, finalColor, darkColor, uvs);
                    }
                }
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();

        virtualMesh && virtualMesh.draw();
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
        let deformArray = slot.deform;
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
