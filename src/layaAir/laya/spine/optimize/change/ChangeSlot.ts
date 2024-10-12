import { AttachmentParse } from "../AttachmentParse";
import { VBCreator } from "../VBCreator";
import { IChange } from "../interface/IChange";

/**
 * @en Represents a change in slot attachment for a spine animation.
 * @zh 表示骨骼动画中插槽附件的变化。
 */
export class ChangeSlot implements IChange {

    /**
     * @en The ID of the slot to change.
     * @zh 要更改的插槽ID。
     */
    slotId: number;
    /**
     * @en The name of the new attachment.
     * @zh 新附件的名称。
     */
    attachment: string;
    /**
     * @en The parsed attachment data.
     * @zh 解析后的附件数据。
     */
    attachmentParse: AttachmentParse;

    /**
     * @en Applies the slot change to the vertex buffer.
     * @param vb The VBCreator to update.
     * @param slotAttachMap A map of slot IDs to their attachment maps.
     * @zh 将插槽变化应用到顶点缓冲区。
     * @param vb 要更新的VBCreator。
     * @param slotAttachMap 插槽ID到其附件映射的Map。
     */
    change(vb: VBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>) {
        //debugger;
        let map = slotAttachMap.get(this.slotId);
        let attachmentParse = map.get(this.attachment);
        if (attachmentParse) {
            vb.appendVB(attachmentParse);
        }
        else{
            attachmentParse = map.get(null);
        }
        this.attachmentParse = attachmentParse;
        return !this.attachmentParse.isclip;
    }

    /**
     * @en Updates the attachment map with the new attachment.
     * @param attachMap An array of AttachmentParse objects.
     * @zh 使用新附件更新附件映射。
     * @param attachMap AttachmentParse对象的数组。
     */
    changeOrder(attachMap: AttachmentParse[]): number[] | null {
        attachMap[this.slotId] = this.attachmentParse;
        return null;
    }
}
