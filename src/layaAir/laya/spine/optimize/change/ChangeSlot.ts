import { AttachmentParse } from "../AttachmentParse";
import { VBCreator } from "../VBCreator";
import { IChange } from "../interface/IChange";

export class ChangeSlot implements IChange {

    slotId: number;
    attachment: string;
    attachmentParse: AttachmentParse;

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

    changeOrder(attachMap: AttachmentParse[]): number[] | null {
        attachMap[this.slotId] = this.attachmentParse;
        return null;
    }
}
