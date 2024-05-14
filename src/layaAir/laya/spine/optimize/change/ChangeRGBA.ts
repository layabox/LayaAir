import { TAttamentPos, VBCreator } from "../VBCreator";
import { IVBChange } from "../interface/IVBChange";

export class ChangeRGBA implements IVBChange {
    slotId: number;
    sizeMap: Map<string, TAttamentPos>;

    constructor(slotId: number) {
        this.slotId = slotId;
    }

    initChange(vb: VBCreator): boolean {
        this.sizeMap = vb.slotVBMap.get(this.slotId);
        return true;
    }

    updateVB(vb: VBCreator, slots: spine.Slot[]) {
        if (!this.sizeMap) {
            this.sizeMap = vb.slotVBMap.get(this.slotId);
            if (!this.sizeMap) {
                return false;
            }
        }
        let slot = slots[this.slotId];
        let color = slot.color;
        if (slot.attachment) {
            let vertexSize = vb.vertexSize;
            let attachmentPos = this.sizeMap.get(slot.attachment.name);
            let offset = attachmentPos.offset * vertexSize;
            let vbData = vb.vb;
            let attachment = attachmentPos.attachment;
            let r, g, b, a;
            let attachmentColor = attachment.attachmentColor;
            if (!attachmentColor) {
                r = color.r * color.a;
                g = color.g * color.a;
                b = color.b * color.a;
                a = color.a;
            }
            else {
                r = color.r * color.a * attachmentColor.r;
                g = color.g * color.a * attachmentColor.g;
                b = color.b * color.a * attachmentColor.b;
                a = color.a * attachmentColor.a;
            }
            let n = attachment.vertexCount;
            for (let i = 0; i < n; i++) {
                vbData[offset + i * vertexSize + 2] = r;
                vbData[offset + i * vertexSize + 3] = g;
                vbData[offset + i * vertexSize + 4] = b;
                vbData[offset + i * vertexSize + 5] = a;
            }
        }
        return true;
    }

    clone(): IVBChange {
        return new ChangeRGBA(this.slotId);
    }
}
