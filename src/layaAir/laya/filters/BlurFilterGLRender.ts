import { Matrix } from "../maths/Matrix"
import { Context } from "../resource/Context"
import { RenderTexture2D } from "../resource/RenderTexture2D"
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D"
import { RenderSpriteData, Value2D } from "../webgl/shader/d2/value/Value2D"
import { BlurFilter } from "./BlurFilter";
import { Vector2 } from "../maths/Vector2";
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { Vector4 } from "../maths/Vector4";

//积分结果缓存
var _definiteIntegralMap:{[key:number]:number}={};


/**
 * @private
 */
export class BlurFilterGLRender {
    private static blurinfo = new Vector2();
    render(rt: RenderTexture2D, ctx: Context, width: number, height: number, filter: BlurFilter): void {
        var shaderValue: Value2D = Value2D.create(RenderSpriteData.Texture2D);
        this.setShaderInfo(shaderValue, filter, rt.width, rt.height);
        ctx.drawTarget(rt, 0, 0, width, height, Matrix.EMPTY.identity(), shaderValue);
    }

    setShaderInfo(shader: Value2D, filter: BlurFilter, w: number, h: number): void {
        shader.defines.addDefine(ShaderDefines2D.FILTERBLUR);
        var sv = <TextureSV>shader;
        BlurFilterGLRender.blurinfo.x = w; BlurFilterGLRender.blurinfo.y = h;
        sv.blurInfo = BlurFilterGLRender.blurinfo;
        var sigma: number = filter.strength / 3.0;//3σ以外影响很小。即当σ=1的时候，半径为3;
        var sigma2: number = sigma * sigma;
        let vz = 2.0 * sigma2;
        let vw = 1.0 / (2.0 * Math.PI * sigma2);
        //由于目前shader中写死了blur宽度是9，相当于希望3σ是4，可是实际使用的时候经常会strength超过4，
        //这时候blur范围内的积分<1会导致变暗变透明，所以需要计算实际积分值进行放大
        //使用公式计算误差较大，直接累加把
        if (filter.strength > 4) {
            let s = 0;
            let key = Math.floor(filter.strength * 10);
            if (_definiteIntegralMap[key] != undefined) {
                s = _definiteIntegralMap[key];
            }else{
                for (let y = -4; y <= 4; ++y) {
                    for (let x = -4; x <= 4; ++x) {
                        s += vw * Math.exp(-(x * x + y * y) / vz);
                    }
                }
                _definiteIntegralMap[key] = s;
            }
            vw /= s;
        }        

        Vector4.tempVec4.x = filter.strength_sig2_2sig2_gauss1[0] = filter.strength;
        Vector4.tempVec4.y = filter.strength_sig2_2sig2_gauss1[1] = sigma2;			//做一些预计算传给shader，提高效率
        Vector4.tempVec4.z = filter.strength_sig2_2sig2_gauss1[2] = vz;
        Vector4.tempVec4.w = filter.strength_sig2_2sig2_gauss1[3] = vw;

        sv.strength_sig2_2sig2_gauss1 = Vector4.tempVec4;
    }
}

