import { IRenderElement2D } from "../../../../DriverDesign/2DRenderPass/IRenderElement2D";
import { PostProcess2D, PostProcessRenderContext2D } from "../PostProcess2D";
import { PostProcess2DEffect } from "../PostProcess2DEffect";

export class GlowEffect2D extends PostProcess2DEffect {
    private _blitElement: IRenderElement2D;
    private _glowElement: IRenderElement2D;
    private _compositeElement: IRenderElement2D;
    private _blitRT: IRenderElement2D;
    effectInit(postprocess: PostProcess2D): void {

    }


    render(context: PostProcessRenderContext2D): void {
        let marginLeft = 50;
        let marginTop = 50;
        let width = context.indirectTarget.width;
        let height = context.indirectTarget.height;
        let texwidth = width + 2 * marginLeft;
        let texheight = height + 2 * marginTop;
    }
}