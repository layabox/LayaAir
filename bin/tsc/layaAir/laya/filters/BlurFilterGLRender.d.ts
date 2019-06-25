import { Context } from "../resource/Context";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { BlurFilter } from "./BlurFilter";
/**
 * @private
 */
export declare class BlurFilterGLRender {
    private static blurinfo;
    render(rt: RenderTexture2D, ctx: Context, width: number, height: number, filter: BlurFilter): void;
    setShaderInfo(shader: Value2D, filter: BlurFilter, w: number, h: number): void;
}
