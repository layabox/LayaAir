import { Matrix } from "../maths/Matrix";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
/**
 * @private
 */
export class GlowFilterGLRender {
    setShaderInfo(shader, w, h, data) {
        shader.defines.add(data.type);
        var sv = shader;
        sv.u_blurInfo1 = data._sv_blurInfo1; // [data.blur, data.blur, data.offX, -data.offY];
        var info2 = data._sv_blurInfo2;
        info2[0] = w;
        info2[1] = h;
        sv.u_blurInfo2 = info2;
        sv.u_color = data.getColor();
    }
    render(rt, ctx, width, height, filter) {
        var w = width, h = height;
        var svBlur = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
        this.setShaderInfo(svBlur, w, h, filter);
        var svCP = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
        var matI = Matrix.TEMP.identity();
        ctx.drawTarget(rt, 0, 0, w, h, matI, svBlur); //先画模糊的底
        ctx.drawTarget(rt, 0, 0, w, h, matI, svCP); //再画原始图片
    }
}
