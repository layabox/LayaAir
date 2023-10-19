import { BlendFactor } from "../RenderEngine/RenderEnum/BlendFactor"
import { RenderStateContext } from "../RenderEngine/RenderStateContext"
import { Matrix } from "../maths/Matrix"
import { Context } from "../resource/Context"
import { RenderTexture2D } from "../resource/RenderTexture2D"
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D"
import { Value2D } from "../webgl/shader/d2/value/Value2D"
import { GlowFilter } from "./GlowFilter";
/**
 * @private
 */
export class GlowFilterGLRender {
	private setShaderInfo(shader: Value2D, w: number, h: number, data: GlowFilter): void {
		shader.defines.add(data.type);
		var sv: any = (<any>shader);
		sv.u_blurInfo1 = data._sv_blurInfo1;// [data.blur, data.blur, data.offX, -data.offY];
		var info2: any = data._sv_blurInfo2;
		info2[0] = w; info2[1] = h;
		sv.u_blurInfo2 = info2;
		sv.u_color = data.getColor();
	}
	render(rt: RenderTexture2D, ctx: Context, width: number, height: number, filter: GlowFilter): void {
		var w: number = width, h: number = height;
		var svBlur: Value2D = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
		this.setShaderInfo(svBlur, w, h, filter);
		var svCP: Value2D = Value2D.create(ShaderDefines2D.TEXTURE2D, 0);
		var matI: Matrix = Matrix.TEMP.identity();
		ctx.drawTarget(rt, 0, 0, w, h, matI, svBlur);	//先画模糊的底
		ctx.drawTarget(rt, 0, 0, w, h, matI, svCP, null, 9);		//再画原始图片,blend为9是为了解决文字边缘锯齿问题，主要是由于预乘alpha导致的，暂时先用这种方法解决
		//ctx.drawTarget(rt, 0, 0, w, h, matI, svCP);
	}
}

