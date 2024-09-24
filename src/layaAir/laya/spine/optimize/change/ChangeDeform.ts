import { AttachmentParse } from "../AttachmentParse";
import { TAttamentPos, VBCreator } from "../VBCreator";
import { IVBChange } from "../interface/IVBChange";

/**
 * @en Represents a change in deformation for a slot in a spine animation.
 * @zh 表示骨骼动画中一个插槽的变形变化。
 */
export class ChangeDeform implements IVBChange {
    /**
     * @en The ID of the slot affected by this deformation change.
     * @zh 受此变形变化影响的插槽ID。
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

    /** @ignore */
    constructor() {
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
     * @en Updates the vertex buffer based on the deformation change.
     * @param vb The VBCreator to update.
     * @param slots Array of spine slots.
     * @returns True if the update is successful, false otherwise.
     * @zh 根据变形变化更新顶点缓冲区。
     * @param vb 要更新的VBCreator。
     * @param slots 骨骼插槽数组。
     * @returns 如果更新成功则返回true，否则返回false。
     */
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

    /**
     * @en Creates a clone of this ChangeDeform instance.
     * @returns A new IVBChange instance with the same properties as this one.
     * @zh 创建此ChangeDeform实例的克隆。
     * @returns 具有与此实例相同属性的新IVBChange实例。
     */
    clone(): IVBChange {
        let out = new ChangeDeform;
        out.slotId = this.slotId;
        out.startFrame = this.startFrame;
        out.endFrame = this.endFrame;
        // out.attachment = this.attachment;
        return out;
    }
}