import { SpinBone4Mesh } from "../../mesh/SpineBone4Mesh";
import { VBCreator } from "../VBCreator";
import { IVBChange } from "../interface/IVBChange";

export class ChangeRGBA implements IVBChange {
    slotId: number;
    sizeMap: Map<string, number>;

    initChange(slotId: number, vb: VBCreator) {
        this.slotId = slotId;
        this.sizeMap = vb.slotVBMap.get(slotId)
    }

    updateVB(vb: VBCreator, slots: spine.Slot[]) {
        let slot = slots[this.slotId];
        let color = slot.color;
        if (!this.sizeMap) {
            this.sizeMap = vb.slotVBMap.get(this.slotId);
        }
        if (slot.attachment) {
            let vertexSize = SpinBone4Mesh.vertexSize;
            let offset = this.sizeMap.get(slot.attachment.name) * vertexSize;
            let vbData = vb.vb;
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
}
