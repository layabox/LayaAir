import { Context } from "../resource/Context";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { GlowFilter } from "./GlowFilter";
/**
 * @private
 */
export declare class GlowFilterGLRender {
    private setShaderInfo;
    render(rt: RenderTexture2D, ctx: Context, width: number, height: number, filter: GlowFilter): void;
}
