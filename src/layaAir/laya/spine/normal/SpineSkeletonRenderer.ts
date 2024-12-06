
import { SpineTexture } from "../SpineTexture";
import { SpineTemplet } from "../SpineTemplet";
import { Material } from "../../resource/Material";
import { SpineVirtualMesh } from "../mesh/SpineVirtualMesh";
import { ISpineRender } from "../interface/ISpineRender";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineNormalRenderBase } from "./SpineNormalRenderBase";
import { SpineMeshBase } from "../mesh/SpineMeshBase";


interface Renderable {
    vertices: spine.ArrayLike<number>;
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
     * @en Vertex effect to be applied during rendering.
     * @zh 渲染期间要应用的顶点效果。
     */
    vertexEffect: spine.VertexEffect = null;
    /**
     * @en Spine templet associated with this renderer.
     * @zh 与此渲染器关联的 Spine 模板。
     */
    templet: SpineTemplet;

    private tempColor = new window.spine.Color();
    private tempColor2 = new window.spine.Color();
    private static vertices: ArrayLike<number>;
    private vertexSize = 2 + 2 + 4;
    private twoColorTint = false;
    private renderable: Renderable;
    private clipper: spine.SkeletonClipping;

    // private temp = new window.spine.Vector2();
    // private temp2 = new window.spine.Vector2();
    // private temp3 = new window.spine.Color();
    // private temp4 = new window.spine.Color();

    
    /**
     * @en Create a mesh with the given material.
     * @param material The material to be used for the mesh.
     * @returns A SpineMeshBase object.
     * @zh 创建具有给定材质的网格。
     * @param material 用于网格的材质。
     * @returns SpineMeshBase 对象。
     */
    createMesh(material: Material): SpineMeshBase{
        return new SpineVirtualMesh(material);
    }

    /**
     * @en Create a new instance of the SpineSkeletonRenderer class.
     * @param templet The Spine templet to use.
     * @param twoColorTint Whether to use two-color tinting.
     * @zh 创建 SpineSkeletonRenderer 类的新实例。
     * @param templet 要使用的 Spine 模板。
     * @param twoColorTint 是否使用双色调色。
     */
    constructor(templet: SpineTemplet, twoColorTint: boolean = true) {
        super();
        this.twoColorTint = twoColorTint;
        if (twoColorTint)
            this.vertexSize += 4;
        this.templet = templet;
        if (SpineSkeletonRenderer.vertices == null) {
            SpineSkeletonRenderer.vertices = spine.Utils.newFloatArray(12 * 1024);
        }
        this.renderable = { vertices: null, numVertices: 0, numFloats: 0 };
        this.clipper = new spine.SkeletonClipping();
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
        let premultipliedAlpha = true;//this.premultipliedAlpha;
        let twoColorTint = this.twoColorTint;
        let blendMode: spine.BlendMode | null = null;

        let renderable: Renderable = this.renderable;
        let uvs: ArrayLike<number>;
        let triangles: Array<number>;
        let drawOrder = skeleton.drawOrder;
        let attachmentColor: spine.Color;
        let skeletonColor = skeleton.color;
        let vertexSize = twoColorTint ? SpineVirtualMesh.vertexSize_TwoColor : SpineVirtualMesh.vertexSize;
        let inRange = false;
        if (slotRangeStart == -1) inRange = true;
        let mesh: SpineVirtualMesh;
        //mesh.clear();
        let spineTex;
        let needSlot = this.templet.needSlot;
        let staticVetices = SpineSkeletonRenderer.vertices;
        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let clippedVertexSize = clipper.isClipping() ? 2 : vertexSize;
            let slot = drawOrder[i];
            let boneOrSlot = needSlot ? slot : slot.bone;
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
                region.computeWorldVertices(boneOrSlot as any, renderable.vertices, 0, clippedVertexSize);
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
                mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, renderable.vertices, 0, clippedVertexSize);
                triangles = mesh.triangles;
                texture = <SpineTexture>(mesh.region as any).page.texture;
                uvs = mesh.uvs;
                attachmentColor = mesh.color;
            } else if (attachment instanceof window.spine.ClippingAttachment) {
                let clip = <spine.ClippingAttachment>(attachment);
                clipper.clipStart(slot, clip);
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
                if (premultipliedAlpha) {
                    finalColor.r *= finalColor.a;
                    finalColor.g *= finalColor.a;
                    finalColor.b *= finalColor.a;
                }
                let darkColor = this.tempColor2;
                if (!slot.darkColor)
                    darkColor.set(0, 0, 0, 1.0);
                else {
                    if (premultipliedAlpha) {
                        darkColor.r = slot.darkColor.r * finalColor.a;
                        darkColor.g = slot.darkColor.g * finalColor.a;
                        darkColor.b = slot.darkColor.b * finalColor.a;
                    } else {
                        darkColor.setFromColor(slot.darkColor);
                    }
                    darkColor.a = premultipliedAlpha ? 1.0 : 0.0;
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
                    mesh && mesh.draw();
                    let mat = renderNode.getMaterial(texture.realTexture, blendMode);
                    mesh = this.nextBatch(mat, renderNode) as SpineVirtualMesh;
                    mesh.clear();
                }

                if (clipper.isClipping()) {
                    clipper.clipTriangles(renderable.vertices, renderable.numFloats, triangles, triangles.length, uvs, finalColor, darkColor, twoColorTint);
                    if (!mesh.canAppend(clipper.clippedVertices.length, clipper.clippedTriangles.length)) {
                        mesh.draw();
                        mesh = this.nextBatch(mesh.material, renderNode) as SpineVirtualMesh;
                        mesh.clear();
                    }
                    mesh.appendVerticesClip(clipper.clippedVertices, clipper.clippedTriangles);
                } else {
                    if (!mesh.canAppend(renderable.numFloats, triangles.length)) {
                        mesh.draw();
                        mesh = this.nextBatch(mesh.material, renderNode) as SpineVirtualMesh;
                        mesh.clear();
                    }
                    if (finalColor.a != 0) {
                        mesh.appendVertices(renderable.vertices, renderable.numFloats, triangles, triangles.length, finalColor, uvs);
                    }
                }
            }
            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();
        
        mesh && mesh.draw();
    }
}
