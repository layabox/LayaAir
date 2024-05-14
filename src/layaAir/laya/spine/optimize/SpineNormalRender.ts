import { Graphics } from "../../display/Graphics";
import { SpineSkeletonRenderer } from "../SpineSkeletonRenderer";
import { SpineTemplet } from "../SpineTemplet";
import { ISpineOptimizeRender } from "./interface/ISpineOptimizeRender";

export class SpineNormalRender implements ISpineOptimizeRender {

    graphics: Graphics;
    _renerer: SpineSkeletonRenderer;
    _skeleton: spine.Skeleton;

    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics): void {
        this.graphics = graphics;
        this._renerer = new SpineSkeletonRenderer(templet, false);
        this._skeleton = skeleton;
    }

    play(animationName: string): void {

    }
    setSkinIndex(index: number): void {
        //throw new Error("Method not implemented.");
    }

    render(time: number) {
        this.graphics.clear();
        this._renerer.draw(this._skeleton, this.graphics, -1, -1);
    }
}