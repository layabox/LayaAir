import { VBCreator } from "../VBCreator";
import { IVBChange } from "../interface/IVBChange";

export class ChangeRGBA implements IVBChange {
    slotId: number;
    sizeMap: Map<string, number>;

    constructor(slotId: number) {
        this.slotId = slotId;
    }

    initChange(vb: VBCreator): boolean {
        this.sizeMap = vb.slotVBMap.get(this.slotId);
        return !!this.sizeMap;
    }

    updateVB(vb: VBCreator, slots: spine.Slot[]) {
        // if (!this.sizeMap) {
        //     return;
        //     //this.sizeMap = vb.slotVBMap.get(this.slotId);
        // }
        let slot = slots[this.slotId];
        let color = slot.color;
        if (slot.attachment) {
            let vertexSize = vb.vertexSize;
            let offset = this.sizeMap.get(slot.attachment.name) * vertexSize;
            let vbData = vb.vb;
            //slot.attachment.color
            //@ts-ignore
            let n = slot.attachment.uvs.length / 2;
            for (let i = 0; i < n; i++) {
                vbData[offset + i * vertexSize + 2] = color.r;
                vbData[offset + i * vertexSize + 3] = color.g;
                vbData[offset + i * vertexSize + 4] = color.b;
                vbData[offset + i * vertexSize + 5] = color.a;
            }
        }
    }

    clone(): IVBChange {
        return new ChangeRGBA(this.slotId);
    }
}
