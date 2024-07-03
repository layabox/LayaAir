import { Color } from "../../maths/Color";
import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { SpineAdapter } from "../SpineAdapter";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineRender } from "../interface/ISpineRender";
import { SpineShaderInit } from "../material/SpineShaderInit";
import { TSpineBakeData } from "./SketonOptimise";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SpineNormalRender implements ISpineOptimizeRender {
    destroy(): void {
        //throw new Error("Method not implemented.");
    }
    initBake(obj: TSpineBakeData): void {
        //throw new Error("Method not implemented.");
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
        renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_FAST);
        renderNode._spriteShaderData.removeDefine(SpineShaderInit.SPINE_RB);
    }

    play(animationName: string): void {

    }
    setSkinIndex(index: number): void {
        //throw new Error("Method not implemented.");
    }

    
    changeSkeleton(skeleton:spine.Skeleton){
        this._skeleton=skeleton;
    }

    render(time: number) {
        this._owner.clear();
        this._renerer.draw(this._skeleton, this._owner, -1, -1);
    }
}