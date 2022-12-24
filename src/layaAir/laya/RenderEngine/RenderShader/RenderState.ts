import { Vector3 } from "../../maths/Vector3";
import { BlendEquationSeparate } from "../RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../RenderEnum/BlendFactor";
import { BlendType } from "../RenderEnum/BlendType";
import { CompareFunction } from "../RenderEnum/CompareFunction";
import { CullMode } from "../RenderEnum/CullMode";
import { StencilOperation } from "../RenderEnum/StencilOperation";



/**
 * <code>RenderState</code> 类用于控制渲染状态。
 */
export class RenderState {
	/**剔除枚举_不剔除。*/
	static CULL_NONE: number = CullMode.Off;
	/**剔除枚举_剔除正面。*/
	static CULL_FRONT: number = CullMode.Front;
	/**剔除枚举_剔除背面。*/
	static CULL_BACK: number = CullMode.Back;

	/**混合枚举_禁用。*/
	static BLEND_DISABLE: number = BlendType.BLEND_DISABLE;
	/**混合枚举_启用_RGB和Alpha统一混合。*/
	static BLEND_ENABLE_ALL: number = BlendType.BLEND_ENABLE_ALL;
	/**混合枚举_启用_RGB和Alpha单独混合。*/
	static BLEND_ENABLE_SEPERATE: number = BlendType.BLEND_ENABLE_SEPERATE;

	/**混合参数枚举_零,例：RGB(0,0,0),Alpha:(1)。*/
	static BLENDPARAM_ZERO: number = BlendFactor.Zero;
	/**混合参数枚举_一,例：RGB(1,1,1),Alpha:(1)。*/
	static BLENDPARAM_ONE: number = BlendFactor.One;
	/**混合参数枚举_源颜色,例：RGB(Rs, Gs, Bs)，Alpha(As)。*/
	static BLENDPARAM_SRC_COLOR: number = BlendFactor.SourceColor;
	/**混合参数枚举_一减源颜色,例：RGB(1-Rs, 1-Gs, 1-Bs)，Alpha(1-As)。*/
	static BLENDPARAM_ONE_MINUS_SRC_COLOR: number = BlendFactor.OneMinusSourceColor;
	/**混合参数枚举_目标颜色,例：RGB(Rd, Gd, Bd),Alpha(Ad)。*/
	static BLENDPARAM_DST_COLOR: number = BlendFactor.DestinationColor;
	/**混合参数枚举_一减目标颜色,例：RGB(1-Rd, 1-Gd, 1-Bd)，Alpha(1-Ad)。*/
	static BLENDPARAM_ONE_MINUS_DST_COLOR: number = BlendFactor.OneMinusDestinationColor;
	/**混合参数枚举_源透明,例:RGB(As, As, As),Alpha(1-As)。*/
	static BLENDPARAM_SRC_ALPHA: number = BlendFactor.SourceAlpha;
	/**混合参数枚举_一减源阿尔法,例:RGB(1-As, 1-As, 1-As),Alpha(1-As)。*/
	static BLENDPARAM_ONE_MINUS_SRC_ALPHA: number = BlendFactor.OneMinusSourceAlpha;
	/**混合参数枚举_目标阿尔法，例：RGB(Ad, Ad, Ad),Alpha(Ad)。*/
	static BLENDPARAM_DST_ALPHA: number = BlendFactor.DestinationAlpha;
	/**混合参数枚举_一减目标阿尔法,例：RGB(1-Ad, 1-Ad, 1-Ad),Alpha(Ad)。*/
	static BLENDPARAM_ONE_MINUS_DST_ALPHA: number = BlendFactor.OneMinusDestinationAlpha;
	/**混合参数枚举_阿尔法饱和，例：RGB(min(As, 1 - Ad), min(As, 1 - Ad), min(As, 1 - Ad)),Alpha(1)。*/
	static BLENDPARAM_SRC_ALPHA_SATURATE: number = BlendFactor.SourceAlphaSaturate;
	/**混合参数枚举_混合设置颜色 */
	static BLENDPARAM_BLENDCOLOR: number = BlendFactor.BlendColor;
	/**很合参数枚举_混合颜色取反 */
	static BLENDPARAM_BLEND_ONEMINUS_COLOR: number = BlendFactor.OneMinusBlendColor;

	/**混合方程枚举_加法,例：source + destination*/
	static BLENDEQUATION_ADD: number = BlendEquationSeparate.ADD;
	/**混合方程枚举_减法，例：source - destination*/
	static BLENDEQUATION_SUBTRACT: number = BlendEquationSeparate.SUBTRACT;
	/**混合方程枚举_反序减法，例：destination - source*/
	static BLENDEQUATION_REVERSE_SUBTRACT: number = BlendEquationSeparate.REVERSE_SUBTRACT;
	/**混合方程枚举_取最小 TODO */
	static BLENDEQUATION_MIN: number = BlendEquationSeparate.MIN;
	/**混合方程枚举_取最大 TODO*/
	static BLENDEQUATION_MAX: number = BlendEquationSeparate.MAX;

	/**深度测试函数枚举_关闭深度测试。*/
	static DEPTHTEST_OFF: number = 0/*WebGLContext.NEVER*/;//TODO:什么鬼
	/**深度测试函数枚举_从不通过。*/
	static DEPTHTEST_NEVER: number = CompareFunction.Never/*WebGLContext.NEVER*/;
	/**深度测试函数枚举_小于时通过。*/
	static DEPTHTEST_LESS: number = CompareFunction.Less/*WebGLContext.LESS*/;
	/**深度测试函数枚举_等于时通过。*/
	static DEPTHTEST_EQUAL: number = CompareFunction.Equal/*WebGLContext.EQUAL*/;
	/**深度测试函数枚举_小于等于时通过。*/
	static DEPTHTEST_LEQUAL: number = CompareFunction.LessEqual/*WebGLContext.LEQUAL*/;
	/**深度测试函数枚举_大于时通过。*/
	static DEPTHTEST_GREATER: number = CompareFunction.Greater/*WebGLContext.GREATER*/;
	/**深度测试函数枚举_不等于时通过。*/
	static DEPTHTEST_NOTEQUAL: number = CompareFunction.NotEqual/*WebGLContext.NOTEQUAL*/;
	/**深度测试函数枚举_大于等于时通过。*/
	static DEPTHTEST_GEQUAL: number = CompareFunction.GreaterEqual/*WebGLContext.GEQUAL*/;
	/**深度测试函数枚举_总是通过。*/
	static DEPTHTEST_ALWAYS: number = CompareFunction.Always/*WebGLContext.ALWAYS*/;


	static STENCILTEST_OFF: number = 0;
	/**深度测试函数枚举_从不通过。*/
	static STENCILTEST_NEVER: number = CompareFunction.Never/*WebGLContext.NEVER*/;
	/**深度测试函数枚举_小于时通过。*/
	static STENCILTEST_LESS: number = CompareFunction.Less/*WebGLContext.LESS*/;
	/**深度测试函数枚举_等于时通过。*/
	static STENCILTEST_EQUAL: number = CompareFunction.Equal/*WebGLContext.EQUAL*/;
	/**深度测试函数枚举_小于等于时通过。*/
	static STENCILTEST_LEQUAL: number = CompareFunction.LessEqual/*WebGLContext.LEQUAL*/;
	/**深度测试函数枚举_大于时通过。*/
	static STENCILTEST_GREATER: number = CompareFunction.Greater/*WebGLContext.GREATER*/;
	/**深度测试函数枚举_不等于时通过。*/
	static STENCILTEST_NOTEQUAL: number = CompareFunction.NotEqual/*WebGLContext.NOTEQUAL*/;
	/**深度测试函数枚举_大于等于时通过。*/
	static STENCILTEST_GEQUAL: number = CompareFunction.GreaterEqual/*WebGLContext.GEQUAL*/;
	/**深度测试函数枚举_总是通过。*/
	static STENCILTEST_ALWAYS: number = CompareFunction.Always/*WebGLContext.ALWAYS*/;
	/**保持当前值*/
	static STENCILOP_KEEP: number = StencilOperation.Keep;
	/**将模板缓冲区值设置为0*/
	static STENCILOP_ZERO: number = StencilOperation.Zero;
	/**将模具缓冲区值设置为指定的参考值*/
	static STENCILOP_REPLACE: number = StencilOperation.Replace;
	/**增加当前模具缓冲区值+1 */
	static STENCILOP_INCR: number = StencilOperation.IncrementSaturate;
	/**增加当前模具缓冲区值,超过最大值的时候循环*/
	static STENCILOP_INCR_WRAP: number = StencilOperation.IncrementWrap;
	/**递减当前模板缓冲区的值*/
	static STENCILOP_DECR: number = StencilOperation.DecrementSaturate;
	/**递减当前模板缓冲去的值，小于0时会循环*/
	static STENCILOP_DECR_WRAP: number = StencilOperation.DecrementWrap;
	/**按位反转当前的模板缓冲区的值*/
	static STENCILOP_INVERT: number = StencilOperation.Invert;

	/** @internal */
	static readonly Default: Readonly<RenderState> = new RenderState();

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
	/**混合方程。*/
	blendEquation: number;
	/**RGB混合方程。*/
	blendEquationRGB: number;
	/**Alpha混合方程。*/
	blendEquationAlpha: number;
	/**深度测试函数。*/
	depthTest: number;
	/**是否深度测试。*/
	depthWrite: boolean;
	/**是否模板写入 */
	stencilWrite: boolean;
	/**是否开启模板测试 */
	stencilTest: number;
	/**模板值 一般会在0-255*/
	stencilRef: number;
	/**模板设置值 */
	stencilOp: Vector3;

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
		this.blendEquation = RenderState.BLENDEQUATION_ADD;
		this.blendEquationRGB = RenderState.BLENDEQUATION_ADD;
		this.blendEquationAlpha = RenderState.BLENDEQUATION_ADD;
		this.depthTest = RenderState.DEPTHTEST_LEQUAL;
		this.depthWrite = true;
		this.stencilRef = 1;
		this.stencilTest = RenderState.STENCILTEST_OFF;
		this.stencilWrite = false;
		this.stencilOp = new Vector3(RenderState.STENCILOP_KEEP, RenderState.STENCILOP_KEEP, RenderState.STENCILOP_REPLACE);
	}

	/**
	 * @internal
	 */
	setNull() {
		this.cull = null;
		this.blend = null;
		this.srcBlend = null;
		this.dstBlend = null;
		this.srcBlendRGB = null;
		this.dstBlendRGB = null;
		this.srcBlendAlpha = null;
		this.dstBlendAlpha = null;
		this.blendEquation = null;
		this.blendEquationRGB = null;
		this.blendEquationAlpha = null;
		this.depthTest = null;
		this.depthWrite = null;
		this.stencilRef = null;
		this.stencilTest = null;
		this.stencilWrite = null;
		this.stencilOp = null;
	}


	// /**
	//  * 克隆。
	//  * @return	 克隆副本。
	//  */
	// clone(): any {
	// 	var dest: RenderState = new RenderState();
	// 	this.cloneTo(dest);
	// 	return dest;
	// }

}


