import { TAttamentPos, VBCreator } from "../VBCreator";
import { IVBChange } from "../interface/IVBChange";

/**
 * @en Represents a change in RGBA color for a slot in a spine animation.
 * @zh 表示骨骼动画中一个插槽的RGBA颜色变化。
 */
export class ChangeRGBA implements IVBChange {
    /**
     * @en The ID of the slot affected by this color change.
     * @zh 受此颜色变化影响的插槽ID。
     */
    slotId: number;
    /**
     * @en Map storing the attachment positions for the slot.
     * @zh 存储插槽附件位置的映射。
     */
    sizeMap: Map<string, TAttamentPos>;
    /**
     * @en The start frame of this Change.
     * @zh 变化的起始帧。
     */
    startFrame: number;
    /**
     * @en The end frame of this Change.
     * @zh 变化的结束帧。
     */
    endFrame: number;

    /**
     * @en Creates a new instance of ChangeRGBA.
     * @param slotId The ID of the slot to change.
     * @zh 创建ChangeRGBA的新实例。
     * @param slotId 要更改的插槽ID。
     */
    constructor(slotId: number) {
        this.slotId = slotId;
    }

    /**
     * @en Initializes the change with the given VBCreator.
     * @param vb The VBCreator to initialize with.
     * @returns True if initialization is successful, false otherwise.
     * @zh 使用给定的VBCreator初始化变化。
     * @param vb 用于初始化的VBCreator。
     * @returns 如果初始化成功则返回true，否则返回false。
     */
    initChange(vb: VBCreator): boolean {
        this.sizeMap = vb.slotVBMap.get(this.slotId);
        return true;
    }

    /**
     * @en Updates the vertex buffer with new RGBA values.
     * @param vb The VBCreator to update.
     * @param slots Array of spine slots.
     * @returns True if the update is successful, false otherwise.
     * @zh 使用新的RGBA值更新顶点缓冲区。
     * @param vb 要更新的VBCreator。
     * @param slots 骨骼插槽数组。
     * @returns 如果更新成功则返回true，否则返回false。
     */
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
            let attachmentColor = attachment.lightColor;
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

    /**
     * @en Creates a clone of this ChangeRGBA instance.
     * @returns A new IVBChange instance with the same slot ID.
     * @zh 创建此ChangeRGBA实例的克隆。
     * @returns 具有相同插槽ID的新IVBChange实例。
     */
    clone(): IVBChange {
        let out = new ChangeRGBA(this.slotId);
        out.startFrame = this.startFrame;
        out.endFrame = this.endFrame;
        return out
    }
}
