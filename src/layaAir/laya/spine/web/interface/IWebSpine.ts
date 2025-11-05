import { Color } from "../../../maths/Color";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { SpineTemplet } from "../../SpineTemplet";
import { VBCreator } from "../base/buffer/VBCreator";
import { AttachmentParse } from "../base/optimize/AttachmentParse";
import { TSpineBakeData } from "../base/optimize/SkeletonOptimise";


export interface IVBChange {
    slotId:number;
    startFrame:number;
    endFrame:number;
    apply(frame:number , vb: VBCreator, slots: spine.Slot[]):boolean;
    initChange(vb: VBCreator): boolean;
    clone(): IVBChange;
}

/**
 * @blueprintIgnore
 */
export interface ISpineOptimizeRender {
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: BaseRenderNode2D, state: spine.AnimationState): void;
    play(animationName: string): void;
    render(time: number): void;
    setSkinIndex(index: number): void;
    initBake(obj: TSpineBakeData): void;
    changeSkeleton(skeleton: spine.Skeleton): void;
    clearCacheMaterials(): void;
    getSpineColor(): Color;
    complete(): void;
    destroy(): void;
}

export interface IChange {
    change(vb: VBCreator, slotAttachMap: Map<number, Map<string, AttachmentParse>>): boolean;

    changeOrder(attachMap: AttachmentParse[]): number[] | null;
}