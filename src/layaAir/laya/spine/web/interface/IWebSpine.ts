import { Color } from "../../../maths/Color";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { SpineTemplet } from "../../SpineTemplet";
import { VBCreator } from "../base/buffer/VBCreator";
import { AttachmentParse } from "../base/optimize/AttachmentParse";
import { AnimatorUpdater } from "../base/optimize/AnimatorUpdater";


export interface IVBChange {
    slotId:number;
    startFrame:number;
    endFrame:number;
    apply(frame:number , vb: VBCreator, slots: spine.Slot[]):boolean;
    initChange(vb: VBCreator): boolean;
    clone(): IVBChange;
}

export interface IChange {
    change(vb: VBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>): boolean;

    changeOrder(attachMap: AttachmentParse[]): number[] | null;
}

export interface INormalRenderUpdater {
    renderUpdate(skeleton: spine.Skeleton, updater: AnimatorUpdater, slotRangeStart?: number, slotRangeEnd?: number , offsetX?: number , offsetY?: number ): void;
}