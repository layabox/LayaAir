import { Color } from "../../../maths/Color";
import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { SpineTemplet } from "../../SpineTemplet";
import { TSpineBakeData } from "../SketonOptimise";

export interface ISpineOptimizeRender {
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: BaseRenderNode2D, state: spine.AnimationState): void;
    play(animationName: string): void;
    render(time: number): void;
    setSkinIndex(index: number): void;
    initBake(obj: TSpineBakeData): void;
    changeSkeleton(skeleton: spine.Skeleton): void;
    getSpineColor(): Color;
    destroy(): void;
}