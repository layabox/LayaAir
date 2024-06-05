import { Spine2DRenderNode } from "../Spine2DRenderNode";

export interface ISpineRender {
    draw(skeleton: spine.Skeleton,renderNode:Spine2DRenderNode, slotRangeStart?: number, slotRangeEnd?: number): void;
}