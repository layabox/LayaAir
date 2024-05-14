import { Texture } from "../../resource/Texture";
import { SpineTexture } from "../SpineTexture";
import { SpineOptimizeConst } from "./SpineOptimizeConst";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
export class AttachmentParse {
    slotId: number;
    attachment: string;
    color: spine.Color;
    attachmentColor:spine.Color;
    blendMode: number;
    vertexArray: Float32Array;
    indexArray: Array<number>;
    uvs: spine.ArrayLike<number>;
    stride: number;
    boneIndex: number;
    texture: Texture;
    isclip: boolean;
    sourceData: spine.Attachment;
    vertexCount: number;

    init(attachment: spine.Attachment, boneIndex: number, slotId: number, deform: number[], slot: spine.SlotData) {
        this.slotId = slotId;
        this.sourceData = attachment;
        this.attachment = attachment.name;
        this.boneIndex = boneIndex;
        let slotColor = slot.color;
        this.blendMode = slot.blendMode;
        let color = this.color = new spine.Color();
        let attchmentColor: spine.Color;
        if (attachment instanceof spine.RegionAttachment) {
            attchmentColor = attachment.color;
            let region = attachment as spine.RegionAttachment;
            this.vertexArray = region.offset as Float32Array;
            this.stride = 2;
            this.indexArray = QUAD_TRIANGLES;
            this.uvs = region.uvs;
            //region.region.
            this.texture = (<SpineTexture>(region.region as any).page.texture).realTexture;
        }
        else if (attachment instanceof spine.MeshAttachment) {
            attchmentColor = attachment.color;
            let vside =  SpineOptimizeConst.BONEVERTEX;
            //return false;
            let mesh = attachment as spine.MeshAttachment;
            this.texture = (<SpineTexture>(mesh.region as any).page.texture).realTexture;
            if (!mesh.bones) {
                if (deform && deform.length > 1) {
                    //debugger;
                    this.vertexArray = new Float32Array(deform);
                }
                else {
                    this.vertexArray = mesh.vertices as Float32Array;
                }
                this.stride = 2;
                this.indexArray = mesh.triangles;
                this.uvs = mesh.uvs;

            }
            else {
                if (deform && deform.length > 1) {
                    debugger;
                }
                this.stride = vside - 6;
                let vertexSize = mesh.uvs.length / 2;
                // debugger;
                let vertexArray = this.vertexArray = new Float32Array(vertexSize * this.stride);
                this.indexArray = mesh.triangles;
                this.uvs = mesh.uvs;


                let vertices = mesh.vertices;
                let bones = mesh.bones;
                let v = 0;
                let needPoint = (vside - 6) / 4;
                for (let w = 0, b = 0; w < vertexSize; w++) {
                    let n = bones[v++];
                    n += v;
                    let offset = w * this.stride;
                    let nid = 0;

                    let result = [];
                    for (; v < n; v++, b += 3, nid++) {
                        result.push([vertices[b], vertices[b + 1], vertices[b + 2], bones[v]]);
                    }
                    if (result.length == needPoint) {

                    }
                    else if (result.length < needPoint) {
                        let n = needPoint - result.length;
                        for (let i = 0; i < n; i++) {
                            result.push([0, 0, 0, 0]);
                        }
                    }
                    else {
                        result = result.sort((a: any, b: any) => {
                            return b[2] - a[2];
                        });
                        result.length = needPoint;
                    }

                    for (let i = 0; i < result.length; i++) {
                        let v: any = result[i];
                        vertexArray[offset + i * 4] = v[0];
                        vertexArray[offset + i * 4 + 1] = v[1];
                        vertexArray[offset + i * 4 + 2] = v[2];
                        vertexArray[offset + i * 4 + 3] = v[3];
                    }
                }
            }
        }
        else if (attachment instanceof spine.ClippingAttachment) {
            this.attachment = null;
            this.isclip = true;
        }
        else {
            //debugger;
            this.attachment = null;
        }
        if(this.uvs){
            this.vertexCount=this.uvs.length/2;
        }
        if (attchmentColor) {
            if(attchmentColor.a!=1||attchmentColor.r!=1||attchmentColor.g!=1&&attchmentColor.b!=1){
                this.attachmentColor=attchmentColor;
            }
            color.r = slotColor.r * attchmentColor.r;
            color.g = slotColor.g * attchmentColor.g;
            color.b = slotColor.b * attchmentColor.b;
            let a=color.a = slotColor.a * attchmentColor.a;
            //预乘
            color.r*=a;
            color.g*=a;
            color.b*=a;
        }
        return true;
    }
}
