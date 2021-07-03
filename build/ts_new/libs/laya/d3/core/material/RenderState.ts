import { IClone } from "../IClone"
import { Vector4 } from "../../math/Vector4"


/**
 * <code>RenderState</code> 类用于控制渲染状态。
 */
export class RenderState implements IClone {
	/**剔除枚举_不剔除。*/
	static CULL_NONE: number = 0;
	/**剔除枚举_剔除正面。*/
	static CULL_FRONT: number = 1;
	/**剔除枚举_剔除背面。*/
	static CULL_BACK: number = 2;

	/**混合枚举_禁用。*/
	static BLEND_DISABLE: number = 0;
	/**混合枚举_启用_RGB和Alpha统一混合。*/
	static BLEND_ENABLE_ALL: number = 1;
	/**混合枚举_启用_RGB和Alpha单独混合。*/
	static BLEND_ENABLE_SEPERATE: number = 2;

	/**混合参数枚举_零,例：RGB(0,0,0),Alpha:(1)。*/
	static BLENDPARAM_ZERO: number = 0;
	/**混合参数枚举_一,例：RGB(1,1,1),Alpha:(1)。*/
	static BLENDPARAM_ONE: number = 1;
	/**混合参数枚举_源颜色,例：RGB(Rs, Gs, Bs)，Alpha(As)。*/
	static BLENDPARAM_SRC_COLOR: number = 0x0300;
	/**混合参数枚举_一减源颜色,例：RGB(1-Rs, 1-Gs, 1-Bs)，Alpha(1-As)。*/
	static BLENDPARAM_ONE_MINUS_SRC_COLOR: number = 0x0301;
	/**混合参数枚举_目标颜色,例：RGB(Rd, Gd, Bd),Alpha(Ad)。*/
	static BLENDPARAM_DST_COLOR: number = 0x0306;
	/**混合参数枚举_一减目标颜色,例：RGB(1-Rd, 1-Gd, 1-Bd)，Alpha(1-Ad)。*/
	static BLENDPARAM_ONE_MINUS_DST_COLOR: number = 0x0307;
	/**混合参数枚举_源透明,例:RGB(As, As, As),Alpha(1-As)。*/
	static BLENDPARAM_SRC_ALPHA: number = 0x0302;
	/**混合参数枚举_一减源阿尔法,例:RGB(1-As, 1-As, 1-As),Alpha(1-As)。*/
	static BLENDPARAM_ONE_MINUS_SRC_ALPHA: number = 0x0303;
	/**混合参数枚举_目标阿尔法，例：RGB(Ad, Ad, Ad),Alpha(Ad)。*/
	static BLENDPARAM_DST_ALPHA: number = 0x0304;
	/**混合参数枚举_一减目标阿尔法,例：RGB(1-Ad, 1-Ad, 1-Ad),Alpha(Ad)。*/
	static BLENDPARAM_ONE_MINUS_DST_ALPHA: number = 0x0305;
	/**混合参数枚举_阿尔法饱和，例：RGB(min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad)),Alpha(1)。*/
	static BLENDPARAM_SRC_ALPHA_SATURATE: number = 0x0308;

	/**混合方程枚举_加法,例：source + destination*/
	static BLENDEQUATION_ADD: number = 0x8006;
	/**混合方程枚举_减法，例：source - destination*/
	static BLENDEQUATION_SUBTRACT: number = 0x800A;
	/**混合方程枚举_反序减法，例：destination - source*/
	static BLENDEQUATION_REVERSE_SUBTRACT: number = 0x800B;

	/**深度测试函数枚举_关闭深度测试。*/
	static DEPTHTEST_OFF: number = 0/*WebGLContext.NEVER*/;//TODO:什么鬼
	/**深度测试函数枚举_从不通过。*/
	static DEPTHTEST_NEVER: number = 0x0200/*WebGLContext.NEVER*/;
	/**深度测试函数枚举_小于时通过。*/
	static DEPTHTEST_LESS: number = 0x0201/*WebGLContext.LESS*/;
	/**深度测试函数枚举_等于时通过。*/
	static DEPTHTEST_EQUAL: number = 0x0202/*WebGLContext.EQUAL*/;
	/**深度测试函数枚举_小于等于时通过。*/
	static DEPTHTEST_LEQUAL: number = 0x0203/*WebGLContext.LEQUAL*/;
	/**深度测试函数枚举_大于时通过。*/
	static DEPTHTEST_GREATER: number = 0x0204/*WebGLContext.GREATER*/;
	/**深度测试函数枚举_不等于时通过。*/
	static DEPTHTEST_NOTEQUAL: number = 0x0205/*WebGLContext.NOTEQUAL*/;
	/**深度测试函数枚举_大于等于时通过。*/
	static DEPTHTEST_GEQUAL: number = 0x0206/*WebGLContext.GEQUAL*/;
	/**深度测试函数枚举_总是通过。*/
	static DEPTHTEST_ALWAYS: number = 0x0207/*WebGLContext.ALWAYS*/;

	/**渲染剔除状态。*/
	cull: number;
	/**透明混合。*/
	blend: number;
	/**源混合参数,在blend为BLEND_ENABLE_ALL时生效。*/
	srcBlend: number;
	/**目标混合参数,在blend为BLEND_ENABLE_ALL时生效。*/
	dstBlend: number;
	/**RGB源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	srcBlendRGB: number;
	/**RGB目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	dstBlendRGB: number;
	/**Alpha源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	srcBlendAlpha: number;
	/**Alpha目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	dstBlendAlpha: number;
	/**混合常量颜色。*/
	blendConstColor: Vector4;
	/**混合方程。*/
	blendEquation: number;
	/**RGB混合方程。*/
	blendEquationRGB: number;
	/**Alpha混合方程。*/
	blendEquationAlpha: number;
	/**深度测试函数。*/
	depthTest: number;
	/**是否深度写入。*/
	depthWrite: boolean;

	/**
	 * 创建一个 <code>RenderState</code> 实例。
	 */
	constructor() {
		this.cull = RenderState.CULL_BACK;
		this.blend = RenderState.BLEND_DISABLE;
		this.srcBlend = RenderState.BLENDPARAM_ONE;
		this.dstBlend = RenderState.BLENDPARAM_ZERO;
		this.srcBlendRGB = RenderState.BLENDPARAM_ONE;
		this.dstBlendRGB = RenderState.BLENDPARAM_ZERO;
		this.srcBlendAlpha = RenderState.BLENDPARAM_ONE;
		this.dstBlendAlpha = RenderState.BLENDPARAM_ZERO;
		this.blendConstColor = new Vector4(1, 1, 1, 1);
		this.blendEquation = RenderState.BLENDEQUATION_ADD;
		this.blendEquationRGB = RenderState.BLENDEQUATION_ADD;
		this.blendEquationAlpha = RenderState.BLENDEQUATION_ADD;
		this.depthTest = RenderState.DEPTHTEST_LEQUAL;
		this.depthWrite = true;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(dest: any): void {
		var destState: RenderState = (<RenderState>dest);
		destState.cull = this.cull;
		destState.blend = this.blend;
		destState.srcBlend = this.srcBlend;
		destState.dstBlend = this.dstBlend;
		destState.srcBlendRGB = this.srcBlendRGB;
		destState.dstBlendRGB = this.dstBlendRGB;
		destState.srcBlendAlpha = this.srcBlendAlpha;
		destState.dstBlendAlpha = this.dstBlendAlpha;
		this.blendConstColor.cloneTo(destState.blendConstColor);
		destState.blendEquation = this.blendEquation;
		destState.blendEquationRGB = this.blendEquationRGB;
		destState.blendEquationAlpha = this.blendEquationAlpha;
		destState.depthTest = this.depthTest;
		destState.depthWrite = this.depthWrite;
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {
		var dest: RenderState = new RenderState();
		this.cloneTo(dest);
		return dest;
	}

}


