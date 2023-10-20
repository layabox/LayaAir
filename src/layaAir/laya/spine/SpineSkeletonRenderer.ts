import { Graphics } from "../display/Graphics";
import { Matrix } from "../maths/Matrix";
import { SpineTexture } from "./SpineTexture";
import { SpineTemplet } from "./SpineTemplet";

interface Renderable {
    vertices: spine.ArrayLike<number>;
    numVertices: number;
    numFloats: number;
}

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];

export class SpineSkeletonRenderer {
    premultipliedAlpha: boolean;
    vertexEffect: spine.VertexEffect = null;
    templet: SpineTemplet;

    private tempColor = new spine.Color();
    private tempColor2 = new spine.Color();
    private vertices: ArrayLike<number>;
    private vertexSize = 2 + 2 + 4;
    private twoColorTint = false;
    private renderable: Renderable;
    private clipper: spine.SkeletonClipping;
    private temp = new spine.Vector2();
    private temp2 = new spine.Vector2();
    private temp3 = new spine.Color();
    private temp4 = new spine.Color();

    constructor(templet: SpineTemplet, twoColorTint: boolean = true) {
        this.twoColorTint = twoColorTint;
        if (twoColorTint)
            this.vertexSize += 4;
        this.templet = templet;
        this.vertices = templet.ns.Utils.newFloatArray(this.vertexSize * 1024);
        this.renderable = { vertices: null, numVertices: 0, numFloats: 0 };
        this.clipper = new templet.ns.SkeletonClipping();
    }

    draw(skeleton: spine.Skeleton, graphics: Graphics, slotRangeStart: number = -1, slotRangeEnd: number = -1) {
        let clipper = this.clipper;
        let premultipliedAlpha = this.premultipliedAlpha;
        let twoColorTint = false;
        let blendMode: spine.BlendMode = null;

        let tempPos = this.temp;
        let tempUv = this.temp2;
        let tempLight = this.temp3;
        let tempDark = this.temp4;

        let renderable: Renderable = this.renderable;
        let uvs: ArrayLike<number> = null;
        let triangles: Array<number> = null;
        let drawOrder = skeleton.drawOrder;
        let attachmentColor: spine.Color = null;
        let skeletonColor = skeleton.color;
        let vertexSize = twoColorTint ? 12 : 8;
        let inRange = false;

        if (slotRangeStart == -1) inRange = true;
        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let clippedVertexSize = clipper.isClipping() ? 2 : vertexSize;
            let slot = drawOrder[i];

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
            let name: string = null;
            let texture: SpineTexture;
            if (attachment instanceof this.templet.ns.RegionAttachment) {
                let region = <spine.RegionAttachment>attachment;
                renderable.vertices = this.vertices;
                renderable.numVertices = 4;
                renderable.numFloats = clippedVertexSize << 2;
                if ("4.1" == SpineTemplet.RuntimeVersion) {
                    region.computeWorldVertices(slot as any, renderable.vertices, 0, clippedVertexSize);
                } else {
                    region.computeWorldVertices(slot.bone, renderable.vertices, 0, clippedVertexSize);
                }
                triangles = QUAD_TRIANGLES;
                uvs = region.uvs;
                if ("4.1" == SpineTemplet.RuntimeVersion) {
                    name = (region.region as any).page.name;
                } else {
                    name = region.region.renderObject.page.name;
                }
                texture = this.templet.getTexture(name);
                attachmentColor = region.color;
            } else if (attachment instanceof this.templet.ns.MeshAttachment) {
                let mesh = <spine.MeshAttachment>attachment;
                renderable.vertices = this.vertices;
                renderable.numVertices = (mesh.worldVerticesLength >> 1);
                renderable.numFloats = renderable.numVertices * clippedVertexSize;
                if (renderable.numFloats > renderable.vertices.length) {
                    renderable.vertices = this.vertices = this.templet.ns.Utils.newFloatArray(renderable.numFloats);
                }
                mesh.computeWorldVertices(slot, 0, mesh.worldVerticesLength, renderable.vertices, 0, clippedVertexSize);
                triangles = mesh.triangles;
                if ("4.1" == SpineTemplet.RuntimeVersion) {
                    name = (mesh.region as any).page.name;
                } else {
                    name = mesh.region.renderObject.page.name;
                }
                texture = this.templet.getTexture(name);
                uvs = mesh.uvs;
                attachmentColor = mesh.color;
            } else if (attachment instanceof this.templet.ns.ClippingAttachment) {
                let clip = <spine.ClippingAttachment>(attachment);
                clipper.clipStart(slot, clip);
                continue;
            } else {
                clipper.clipEndWithSlot(slot);
                continue;
            }

            if (texture != null) {
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

                let slotBlendMode = slot.data.blendMode;
                if (slotBlendMode != blendMode) {
                    blendMode = slotBlendMode;
                }

                if (clipper.isClipping()) {
                    clipper.clipTriangles(renderable.vertices, renderable.numFloats, triangles, triangles.length, uvs, finalColor, null, twoColorTint);
                    let clippedVertices = new Float32Array(clipper.clippedVertices);
                    let clippedTriangles = clipper.clippedTriangles;
                    let mVertices = [];
                    let mUVs = [];
                    let colorNum = 0xffffff;
                    let alpha = 1;
                    if (this.vertexEffect != null) {
                        let vertexEffect = this.vertexEffect;
                        let verts = clippedVertices;
                        if (!twoColorTint) {
                            for (let v = 0, n = clippedVertices.length; v < n; v += vertexSize) {
                                tempPos.x = verts[v];
                                tempPos.y = verts[v + 1];
                                tempLight.set(verts[v + 2], verts[v + 3], verts[v + 4], verts[v + 5]);
                                tempUv.x = verts[v + 6];
                                tempUv.y = verts[v + 7];
                                tempDark.set(0, 0, 0, 0);
                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
                                verts[v] = tempPos.x;
                                verts[v + 1] = tempPos.y;
                                verts[v + 2] = tempLight.r;
                                verts[v + 3] = tempLight.g;
                                verts[v + 4] = tempLight.b;
                                verts[v + 5] = tempLight.a;
                                verts[v + 6] = tempUv.x;
                                verts[v + 7] = tempUv.y

                                mVertices.push(verts[v], -verts[v + 1]);
                                colorNum = (verts[v + 2] * 255 << 16) + (verts[v + 3] * 255 << 8) + verts[v + 4];
                                alpha = verts[v + 5];
                                mUVs.push(verts[v + 6], verts[v + 7]);
                            }
                        }
                    } else {
                        let vi = 0;
                        while (Number.isFinite(clippedVertices[vi + 6]) && Number.isFinite(clippedVertices[vi + 7])) {
                            mVertices.push(clippedVertices[vi]);
                            mVertices.push(-clippedVertices[vi + 1]);
                            colorNum = (clippedVertices[vi + 2] * 255 << 16) + (clippedVertices[vi + 3] * 255 << 8) + clippedVertices[vi + 4] * 255;
                            alpha = clippedVertices[vi + 5];
                            mUVs.push(clippedVertices[vi + 6]);
                            mUVs.push(clippedVertices[vi + 7]);
                            vi += this.vertexSize;
                        }
                    }
                    let blendMode;
                    switch (slotBlendMode) {
                        case 1:
                            blendMode = "light";
                            break;
                        case 2:
                            blendMode = "multiply";
                            break;
                        case 3:
                            blendMode = "screen";
                            break;
                        default:
                            blendMode = "normal";
                    }
                    graphics.drawTriangles(texture.realTexture, 0, 0, <any>mVertices, <any>mUVs, new Uint16Array(clippedTriangles), Matrix.EMPTY, alpha, colorNum, blendMode);
                } else {
                    let verts = renderable.vertices;
                    let mVertices = [];
                    let mUVs = [];
                    let colorNum = 0xffffff;
                    let alpha = 1;
                    if (this.vertexEffect != null) {
                        let vertexEffect = this.vertexEffect;
                        if (!twoColorTint) {
                            for (let v = 0, u = 0, n = renderable.numFloats; v < n; v += vertexSize, u += 2) {
                                tempPos.x = verts[v];
                                tempPos.y = verts[v + 1];
                                tempUv.x = uvs[u];
                                tempUv.y = uvs[u + 1]
                                tempLight.setFromColor(finalColor);
                                tempDark.set(0, 0, 0, 0);
                                vertexEffect.transform(tempPos, tempUv, tempLight, tempDark);
                                verts[v] = tempPos.x;
                                verts[v + 1] = tempPos.y;
                                verts[v + 2] = tempLight.r;
                                verts[v + 3] = tempLight.g;
                                verts[v + 4] = tempLight.b;
                                verts[v + 5] = tempLight.a;
                                verts[v + 6] = tempUv.x;
                                verts[v + 7] = tempUv.y

                                mVertices.push(verts[v], -verts[v + 1]);
                                colorNum = (verts[v + 2] * 255 << 16) + (verts[v + 3] * 255 << 8) + verts[v + 4] * 255;
                                alpha = verts[v + 5];
                                mUVs.push(verts[v + 6], verts[v + 7]);
                            }
                        }
                    } else {
                        if (!twoColorTint) {
                            for (let v = 2, u = 0, n = renderable.numFloats; v < n; v += vertexSize, u += 2) {
                                verts[v] = finalColor.r;
                                verts[v + 1] = finalColor.g;
                                verts[v + 2] = finalColor.b;
                                verts[v + 3] = finalColor.a;
                                verts[v + 4] = uvs[u];
                                verts[v + 5] = uvs[u + 1];

                                mVertices.push(verts[v - 2], -verts[v - 1]);
                                colorNum = (verts[v] * 255 << 16) + (verts[v + 1] * 255 << 8) + verts[v + 2] * 255;
                                alpha = verts[v + 3];
                                mUVs.push(verts[v + 4], verts[v + 5]);
                            }
                        }
                    }
                    let blendMode;
                    switch (slotBlendMode) {
                        case 1:
                            blendMode = "light";
                            break;
                        case 2:
                            blendMode = "multiply";
                            break;
                        case 3:
                            blendMode = "screen";
                            break;
                        default:
                            blendMode = "normal";
                    }
                    graphics.drawTriangles(texture.realTexture, 0, 0, <any>mVertices, <any>mUVs, new Uint16Array(triangles), Matrix.EMPTY, alpha, colorNum, blendMode);
                }
            }

            clipper.clipEndWithSlot(slot);
        }
        clipper.clipEnd();
    }
}
