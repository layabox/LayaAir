import { ESpineRenderType } from "../SpineSkeleton";
import { AttachmentParse } from "./AttachmentParse";

/**
 * @en Utility class for Spine slot operations.
 * @zh Spine 插槽操作的实用工具类。
 */
export class SlotUtils {
    /**
     * @en Check the type of attachment and determine the appropriate render type.
     * @param attachment The spine attachment to check.
     * @zh 检查附件的类型并确定适当的渲染类型。
     * @param attachment 要检查的 Spine 附件。
     */
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

    /**
     * @en Append index array from attachment parse to the target index array.
     * @param attachmentParse The attachment parse containing the source index array.
     * @param indexArray The target index array to append to.
     * @param size The size to offset each index by.
     * @param offset The starting offset in the target index array.
     * @zh 将附件解析中的索引数组追加到目标索引数组。
     * @param attachmentParse 包含源索引数组的附件解析。
     * @param indexArray 要追加到的目标索引数组。
     * @param size 每个索引的偏移量。
     * @param offset 目标索引数组中的起始偏移量。
     */    
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