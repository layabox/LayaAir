import { BaseRenderNode2D } from "../../../NodeRender2D/BaseRenderNode2D";
import { IRenderElement2D } from "../../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Graphics } from "../../../display/Graphics";
import { Texture2D } from "../../../resource/Texture2D";
import { SpineTemplet } from "../../SpineTemplet";

export interface ISpineOptimizeRender {
    init(skeleton: spine.Skeleton, templet: SpineTemplet,renderNode:BaseRenderNode2D,state:spine.AnimationState): void;
    play(animationName: string): void;
    render(time: number): void;
    setSkinIndex(index: number): void;
    initBake(texture:Texture2D,obj:any):void;
}