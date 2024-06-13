import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { IRenderElement2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderElement2D";
import { Color } from "../../maths/Color";
import { Texture2D } from "../../resource/Texture2D";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SpineNormalRender implements ISpineOptimizeRender {
    initBake(texture: Texture2D, obj: any): void {
        throw new Error("Method not implemented.");
    }

    _owner: Spine2DRenderNode;
    _renerer: ISpineRender;
    _skeleton: spine.Skeleton;

    init(skeleton: spine.Skeleton, templet: SpineTemplet, renderNode: Spine2DRenderNode, state: spine.AnimationState): void {
        this._renerer = SpineAdapter.createNormalRender(templet, false);
        this._skeleton = skeleton;
        this._owner = renderNode;
        let scolor = skeleton.color;
        let color = new Color(scolor.r * scolor.a, scolor.g * scolor.a, scolor.b * scolor.a, scolor.a);
        renderNode._spriteShaderData.setColor(SpineShaderInit.Color, color);
    }

    play(animationName: string): void {

    }
    setSkinIndex(index: number): void {
        //throw new Error("Method not implemented.");
    }

    render(time: number) {
        this._renerer.draw(this._skeleton, this._owner, -1, -1);
    }
}