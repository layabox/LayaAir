import { ESpineRenderType } from "../SpineSkeleton";
import { AttachmentParse } from "./AttachmentParse";

export class SlotUtils {
    static checkAttachment(attachment: spine.Attachment) {
        //let attachment = slot.getAttachment();
        if (attachment == null) return ESpineRenderType.rigidBody;
        if (attachment instanceof window.spine.RegionAttachment) {
            return ESpineRenderType.rigidBody;
        }
        else if (attachment instanceof window.spine.MeshAttachment) {
            //return false;
            let mesh = attachment as spine.MeshAttachment;
            if (!mesh.bones) {
                return ESpineRenderType.rigidBody
            }
            else {
                return ESpineRenderType.boneGPU;
            }
        }
        else {
            return ESpineRenderType.normal;
        }
    }

    static appendIndexArray(attachmentParse: AttachmentParse, indexArray: Uint16Array | Uint8Array | Uint32Array, size: number, offset: number) {
        if (!attachmentParse.attachment || !attachmentParse.indexArray) return offset;
        let slotindexArray = attachmentParse.indexArray;
        for (let j = 0, n = slotindexArray.length; j < n; j++) {
            indexArray[offset] = slotindexArray[j] + size;
            offset++;
        }
        return offset;
    }
}