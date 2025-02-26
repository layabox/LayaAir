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

    apply(frame:number , vb: VBCreator, slots: spine.Slot[]): boolean {
        this.updateVB(vb , slots);
        return frame >= this.startFrame;
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
            let vbData = vb.vb;
            let offset = attachmentPos.offset * vertexSize;
            let attachment = attachmentPos.attachment;
            let r, g, b, a;
            let attachmentColor = attachment.lightColor;
            let twoColorTint = vb.twoColorTint;
            
            let colorElement = vb.vertexDeclaration.getVertexElementByUsage(1);
            let cOffset = colorElement.offset / 4;

            let c2Offset = 0;
            if (twoColorTint) {
                let color2Element = vb.vertexDeclaration.getVertexElementByUsage(11);
                c2Offset = color2Element.offset / 4;
            }

            if (!attachmentColor) {
                r = color.r;
                g = color.g;
                b = color.b;
                a = color.a;
            }
            else {
                r = color.r * attachmentColor.r;
                g = color.g * attachmentColor.g;
                b = color.b * attachmentColor.b;
                a = color.a * attachmentColor.a;
            }
            
            let darkColor = slot.darkColor;
            let darkColorR = 0, darkColorG = 0 , darkColorB = 0 , darkColorA = 1;
            if (darkColor) {
                darkColorR = darkColor.r;
                darkColorG = darkColor.g;
                darkColorB = darkColor.b;
                darkColorA = darkColor.a;
            }

            let n = attachment.vertexCount;
            for (let i = 0; i < n; i++) {
                let co = offset + i * vertexSize + cOffset;
                vbData[co] = r;
                vbData[co + 1] = g;
                vbData[co + 2] = b;
                vbData[co + 3] = a;

                if (twoColorTint) {
                    let c2o = offset + i * vertexSize + c2Offset;
                    vbData[c2o] = darkColorR;
                    vbData[c2o + 1] = darkColorG;
                    vbData[c2o + 2] = darkColorB;
                    vbData[c2o + 3] = darkColorA;
                }
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
