import { ERenderType } from "../SpineSkeleton";
import { SpinBone4Mesh } from "../mesh/SpineBone4Mesh";
import { AttachmentParse } from "./AttachmentParse";
import { IGetBone } from "./interface/IGetBone";

export class SlotUtils {
    static checkAttachment(attachment: spine.Attachment) {
        //let attachment = slot.getAttachment();
        if (attachment == null) return ERenderType.rigidBody;
        if (attachment instanceof spine.RegionAttachment) {
            return ERenderType.rigidBody;
        }
        else if (attachment instanceof spine.MeshAttachment) {
            //return false;
            let mesh = attachment as spine.MeshAttachment;
            if (!mesh.bones) {
                return ERenderType.rigidBody
            }
            else {
                return ERenderType.boneGPU;
            }
        }
        else {
            return ERenderType.normal;
        }
    }

    static appendIndexArray(attachmentParse: AttachmentParse, indexArray: Uint16Array, size: number, offset: number) {
        if (!attachmentParse.attachment) return offset;
        let slotindexArray = attachmentParse.indexArray;
        for (let j = 0, n = slotindexArray.length; j < n; j++) {
            indexArray[offset] = slotindexArray[j] + size;
            offset++;
        }
        return offset;
    }

    static appendVertexArray(attachmentParse: AttachmentParse, vertexArray: Float32Array, offset: number, boneGet: IGetBone) {
        if (!attachmentParse.attachment) return offset;
        let vside = SpinBone4Mesh.vertexSize;
        let slotVertex = attachmentParse.vertexArray;
        let uvs = attachmentParse.uvs;
        let color = attachmentParse.color;
        if (attachmentParse.stride == 2) {
            let boneid = boneGet.getBoneId(attachmentParse.boneIndex);
            for (let j = 0, n = slotVertex.length; j < n; j += attachmentParse.stride) {
                ///////////uv
                vertexArray[offset] = uvs[j];
                vertexArray[offset + 1] = uvs[j + 1];
                ///////////color
                vertexArray[offset + 2] = color.r;
                vertexArray[offset + 3] = color.g;
                vertexArray[offset + 4] = color.b;
                vertexArray[offset + 5] = color.a;

                vertexArray[offset + 6] = slotVertex[j];
                vertexArray[offset + 7] = slotVertex[j + 1];
                vertexArray[offset + 8] = 1;
                vertexArray[offset + 9] = boneid;

                let leftsize = vside - 10;
                let ox = offset + 10;
                for (let z = 0; z < leftsize / 4; z++) {
                    vertexArray[ox + z * 4] = 0;
                    vertexArray[ox + z * 4 + 1] = 0;
                    vertexArray[ox + z * 4 + 2] = 0;
                    vertexArray[ox + z * 4 + 3] = 0;
                }
                offset += vside;
            }
        }
        else {
            for (let j = 0, uvid = 0, n = slotVertex.length; j < n; j += attachmentParse.stride, uvid += 2) {
                vertexArray[offset] = uvs[uvid];
                vertexArray[offset + 1] = uvs[uvid + 1];

                vertexArray[offset + 2] = color.r;
                vertexArray[offset + 3] = color.g;
                vertexArray[offset + 4] = color.b;
                vertexArray[offset + 5] = color.a;

                let leftsize = vside - 6;
                let ox = offset + 6;
                for (let z = 0; z < leftsize / 4; z++) {
                    vertexArray[ox + z * 4] = slotVertex[j + z * 4];
                    vertexArray[ox + z * 4 + 1] = slotVertex[j + z * 4 + 1];
                    vertexArray[ox + z * 4 + 2] = slotVertex[j + z * 4 + 2];
                    vertexArray[ox + z * 4 + 3] = boneGet.getBoneId(slotVertex[j + z * 4 + 3]);
                }
                offset += vside;
            }
        }
        return offset;
    }
}