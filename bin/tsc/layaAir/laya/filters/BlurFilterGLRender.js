import { Filter } from "./Filter";
import { Matrix } from "../maths/Matrix";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
/**
 * @private
 */
export class BlurFilterGLRender {
    render(rt, ctx, width, height, filter) {
        var shaderValue = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
        this.setShaderInfo(shaderValue, filter, rt.width, rt.height);
        ctx.drawTarget(rt, 0, 0, width, height, Matrix.EMPTY.identity(), shaderValue);
    }
    setShaderInfo(shader, filter, w, h) {
        shader.defines.add(Filter.BLUR);
        var sv = shader;
        BlurFilterGLRender.blurinfo[0] = w;
        BlurFilterGLRender.blurinfo[1] = h;
        sv.blurInfo = BlurFilterGLRender.blurinfo;
        var sigma = filter.strength / 3.0; //3σ以外影响很小。即当σ=1的时候，半径为3;
        var sigma2 = sigma * sigma;
        filter.strength_sig2_2sig2_gauss1[0] = filter.strength;
        filter.strength_sig2_2sig2_gauss1[1] = sigma2; //做一些预计算传给shader，提高效率
        filter.strength_sig2_2sig2_gauss1[2] = 2.0 * sigma2;
        filter.strength_sig2_2sig2_gauss1[3] = 1.0 / (2.0 * Math.PI * sigma2);
        sv.strength_sig2_2sig2_gauss1 = filter.strength_sig2_2sig2_gauss1;
    }
}
BlurFilterGLRender.blurinfo = new Array(2);
