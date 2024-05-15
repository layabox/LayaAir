import { ERenderType } from "../SpineSkeleton";
import { AttachmentParse } from "./AttachmentParse";

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
}