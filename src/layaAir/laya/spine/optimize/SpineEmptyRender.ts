import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { SpineTemplet } from "../SpineTemplet";
import { TSpineBakeData } from "./SketonOptimise";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SpineEmptyRender implements ISpineOptimizeRender{
    changeSkeleton(skeleton: spine.Skeleton): void {
        //throw new Error("Method not implemented.");
    }
    static instance:SpineEmptyRender=new SpineEmptyRender();
    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: BaseRenderNode2D, state: spine.AnimationState): void {
        //throw new Error("Method not implemented.");
    }
    play(animationName: string): void {
        //throw new Error("Method not implemented.");
    }
    render(time: number): void {
        //throw new Error("Method not implemented.");
    }
    setSkinIndex(index: number): void {
        //throw new Error("Method not implemented.");
    }
    initBake(obj: TSpineBakeData): void {
        //throw new Error("Method not implemented.");
    }
    destroy(): void {
        //throw new Error("Method not implemented.");
    }
    
}