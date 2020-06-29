import { Filter } from "./Filter";
import { Matrix } from "../maths/Matrix"
import { Context } from "../resource/Context"
import { RenderTexture2D } from "../resource/RenderTexture2D"
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D"
import { Value2D } from "../webgl/shader/d2/value/Value2D"
import { BlurFilter } from "./BlurFilter";
/**
 * @private
 */
export class BlurFilterGLRender {
    private static blurinfo: any[] = new Array(2);
    render(rt: RenderTexture2D, ctx: Context, width: number, height: number, filter: BlurFilter): void {
        var shaderValue: Value2D = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
        this.setShaderInfo(shaderValue, filter, rt.width, rt.height);
        ctx.drawTarget(rt, 0, 0, width, height, Matrix.EMPTY.identity(), shaderValue);
    }

    setShaderInfo(shader: Value2D, filter: BlurFilter, w: number, h: number): void {
        shader.defines.add(Filter.BLUR);
        var sv: any = (<any>shader);
        BlurFilterGLRender.blurinfo[0] = w; BlurFilterGLRender.blurinfo[1] = h;
        sv.blurInfo = BlurFilterGLRender.blurinfo;
        var sigma: number = filter.strength / 3.0;//3σ以外影响很小。即当σ=1的时候，半径为3;
        var sigma2: number = sigma * sigma;
        filter.strength_sig2_2sig2_gauss1[0] = filter.strength;
        filter.strength_sig2_2sig2_gauss1[1] = sigma2;			//做一些预计算传给shader，提高效率
        filter.strength_sig2_2sig2_gauss1[2] = 2.0 * sigma2;
        filter.strength_sig2_2sig2_gauss1[3] = 1.0 / (2.0 * Math.PI * sigma2);
        sv.strength_sig2_2sig2_gauss1 = filter.strength_sig2_2sig2_gauss1;
    }
}

