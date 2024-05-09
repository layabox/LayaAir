import { Graphics } from "../../../display/Graphics";
import { SpineTemplet } from "../../SpineTemplet";

export interface ISpineOptimizeRender {
    init(skeleton: spine.Skeleton, templet: SpineTemplet, graphics: Graphics): void;
    play(animationName: string): void;
    render(time: number): void;
    setSkinIndex(index: number): void;
}