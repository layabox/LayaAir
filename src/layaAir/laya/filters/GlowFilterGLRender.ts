import { BlendFactor } from "../RenderEngine/RenderEnum/BlendFactor"
import { RenderStateContext } from "../RenderEngine/RenderStateContext"
import { Matrix } from "../maths/Matrix"
import { Vector4 } from "../maths/Vector4";
import { Context } from "../renders/Context"
import { RenderTexture2D } from "../resource/RenderTexture2D"
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { RenderSpriteData, Value2D } from "../webgl/shader/d2/value/Value2D"
import { GlowFilter } from "./GlowFilter";
/**
 * @private
 */
export class GlowFilterGLRender {
	private setShaderInfo(shader: Value2D, w: number, h: number, data: GlowFilter): void {
		shader.shaderData.addDefine(data.typeDefine);
		var sv = <TextureSV>shader;
		//data._sv_blurInfo1;// [data.blur, data.blur, data.offX, -data.offY];
		Vector4.tempVec4.setValue(data._sv_blurInfo1[0], data._sv_blurInfo1[1], data._sv_blurInfo1[2], data._sv_blurInfo1[3]);
		sv.u_blurInfo1 = Vector4.tempVec4;
		var info2 = data._sv_blurInfo2;
		info2[0] = w; info2[1] = h;
		Vector4.tempVec4.setValue(info2[0], info2[1], info2[2], info2[3]);
		sv.u_blurInfo2 = Vector4.tempVec4;
		var arry = data.getColor();
		Vector4.tempVec4.setValue(arry[0], arry[1], arry[2], arry[3]);
		sv.color = Vector4.tempVec4;
	}
	render(rt: RenderTexture2D, ctx: Context, width: number, height: number, filter: GlowFilter): void {
		var w: number = width, h: number = height;
		var svBlur: Value2D = Value2D.create(RenderSpriteData.Texture2D);
		this.setShaderInfo(svBlur, w, h, filter);
		var svCP: Value2D = Value2D.create(RenderSpriteData.Texture2D);
		var matI: Matrix = Matrix.TEMP.identity();
		ctx.drawTarget(rt, 0, 0, w, h, matI, svBlur);	//先画模糊的底
		ctx.drawTarget(rt, 0, 0, w, h, matI, svCP, null, 9);		//再画原始图片,blend为9是为了解决文字边缘锯齿问题，主要是由于预乘alpha导致的，暂时先用这种方法解决
		//ctx.drawTarget(rt, 0, 0, w, h, matI, svCP);
	}
}

