import { AttachmentParse } from "../AttachmentParse";
import { TAttamentPos, VBCreator } from "../VBCreator";
import { IVBChange } from "../interface/IVBChange";

export class ChangeDeform implements IVBChange {
    slotId: number;
    // attachment: string;
    sizeMap: Map<string, TAttamentPos>;

    constructor() {
    }

    initChange(vb: VBCreator): boolean {
        this.sizeMap = vb.slotVBMap.get(this.slotId);
        return true;
    }

    updateVB(vb: VBCreator, slots: spine.Slot[]): boolean {
        if (!this.sizeMap) {
            this.sizeMap = vb.slotVBMap.get(this.slotId);
            if (!this.sizeMap) {
                return false;
            }
        }

        let slot = slots[this.slotId];

        if (slot.attachment) {
            let deform :number[] = slot.deform;
            if (!deform || !deform.length) {
                return false;
                // deform = (slot.attachment as spine.MeshAttachment).vertices
            }
            let vertexSize = vb.vertexSize;
            let attachmentPos = this.sizeMap.get(slot.attachment.name);
            let offset = attachmentPos.offset * vertexSize ;
            let vbData = vb.vb;
            // let attachment = slot.attachment as spine.MeshAttachment;
            // let vetrexs = attachment.vertices;
            let attachmentParse = attachmentPos.attachment;
            // console.log(deform[0]);
            // let n = attachmentParse.vertexCount;
            // attachment.computeWorldVertices(slot , 0 , n  * 2, vbData , offset , vb);
            // vb.appendVertexArray(attachmentParse, vbData ,offset,vb);
            vb.appendDeform(attachmentParse , deform , offset  , vbData );
            // vb.appendVB(attachmentParse);
            // for (let i = 0; i < n; i++) {
            //     let vbOffset = offset + i * vertexSize ;
            //     let deformOffset = i * 2;
            //     let vertexOffset = i * 3;
            //     vbData[vbOffset + 6] = vetrexs[vertexOffset] + deform[deformOffset];
            //     vbData[vbOffset + 7] = vetrexs[vertexOffset + 1] + deform[deformOffset + 1];
            // }
        }        

        return true;
    }

    clone(): IVBChange {
        let out = new ChangeDeform;
        out.slotId = this.slotId;
        // out.attachment = this.attachment;
        return out;
    }
}