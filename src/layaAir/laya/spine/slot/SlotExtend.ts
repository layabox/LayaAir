import { SpineTexture } from "../SpineTexture";
import { SlotExtendBase } from "./SlotExtendBase";


const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
export class SlotExtend extends SlotExtendBase {
    
    init(slot: spine.Slot, vside: number) {
        this.bone = slot.bone;
        this.boneIndex = slot.bone.skeleton.bones.indexOf(slot.bone);
        let attachment = this.attchment = slot.getAttachment();
        if (attachment instanceof spine.RegionAttachment) {
            let region = attachment as spine.RegionAttachment;
            this.vertexArray = region.offset as Float32Array;
            this.stride = 2;
            this.indexArray = QUAD_TRIANGLES;
            this.uvs = region.uvs;
            this.texture = (<SpineTexture>(region.region as any).texture).realTexture;
        }
        else {
            //return false;
            let mesh = attachment as spine.MeshAttachment;
            if (!mesh.bones) {
                if (slot.deform.length > 1) {
                    //debugger;
                    this.vertexArray = new Float32Array(slot.deform);
                }
                else {
                    this.vertexArray = mesh.vertices as Float32Array;
                }
                this.stride = 2;
                this.indexArray = mesh.triangles;
                this.uvs = mesh.uvs;
                this.texture = (<SpineTexture>(mesh.region as any).texture).realTexture;
            }
            else {
                if (slot.deform.length > 1) {
                    debugger;
                }
                this.stride = vside - 6;
                let vertexSize = mesh.uvs.length / 2;
                // debugger;
                let vertexArray = this.vertexArray = new Float32Array(vertexSize * this.stride);
                this.indexArray = mesh.triangles;
                this.uvs = mesh.uvs;
                this.texture = (<SpineTexture>(mesh.region as any).texture).realTexture;

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
        return true;
    }
}
