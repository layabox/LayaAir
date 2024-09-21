import { AttachmentParse } from "../AttachmentParse";
import { VBCreator } from "../VBCreator";
import { IChange } from "../interface/IChange";

/**
 * @en Represents a change in draw order for spine animation.
 * @zh 表示骨骼动画中绘制顺序的变化。
 */
export class ChangeDrawOrder implements IChange {
    /**
     * @en The new draw order for slots.
     * @zh 插槽的绘制顺序。
     */
    order: number[];
    /**
     * @en Changes the draw order of attachments.
     * @param attachMap An array of AttachmentParse objects.
     * @returns The new draw order as an array of numbers, or null if no change is needed.
     * @zh 更改附件的绘制顺序。
     * @param attachMap AttachmentParse对象的数组。
     * @returns 新的绘制顺序（数字数组），如果不需要更改则返回null。
     */
    changeOrder(attachMap: AttachmentParse[]): number[] | null {
        // debugger;
        //return [34,0,1,2,3,4,5,6,7,9,10,14,15,16,17,18,19,20,26,21,22,23,24,28,29,25,30,31,32,33,35,27,8,11,12,13]
        //return null;
        return this.order;
        //throw new Error("Method not implemented.");
    }
    /**
     * @en Applies the draw order change to the vertex buffer.
     * @param vb The VBCreator to update.
     * @param slotAttachMap A map of slot IDs to their attachment maps.
     * @zh 将绘制顺序变化应用到顶点缓冲区。
     * @param vb 要更新的VBCreator。
     * @param slotAttachMap 插槽ID到其附件映射的Map。
     */
    change(vb: VBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>): boolean {
        //throw new Error("Method not implemented.");
        return true;
    }
}