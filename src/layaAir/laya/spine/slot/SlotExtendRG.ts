import { SpineTexture } from "../SpineTexture";
import { SlotExtendBase } from "./SlotExtendBase";

const QUAD_TRIANGLES = [0, 1, 2, 2, 3, 0];
export class SlotExtendRG extends SlotExtendBase {

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
                return false;
            }
        }
        return true;
    }
}
