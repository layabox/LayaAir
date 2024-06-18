import { BlendEquationSeparate } from "../../../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../../../RenderEngine/RenderEnum/BlendFactor";
import { BlendType } from "../../../RenderEngine/RenderEnum/BlendType";
import { CompareFunction } from "../../../RenderEngine/RenderEnum/CompareFunction";
import { CullMode } from "../../../RenderEngine/RenderEnum/CullMode";
import { StencilOperation } from "../../../RenderEngine/RenderEnum/StencilOperation";
import { Vector3 } from "../../../maths/Vector3";

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
	static DEPTHTEST_OFF: number = CompareFunction.Off;/*WebGLContext.NEVER*/;//TODO:什么鬼
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


	static STENCILTEST_OFF: number = CompareFunction.Off;
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
	private _cull: number;
	public get cull(): number {
		return this._cull;
	}
	public set cull(value: number) {
		this._cull = value;
	}
	/**透明混合。*/
	private _blend: number;
	public get blend(): number {
		return this._blend;
	}
	public set blend(value: number) {
		this._blend = value;
	}
	/**源混合参数,在blend为BLEND_ENABLE_ALL时生效。*/
	private _srcBlend: number;
	public get srcBlend(): number {
		return this._srcBlend;
	}
	public set srcBlend(value: number) {
		this._srcBlend = value;
	}
	/**目标混合参数,在blend为BLEND_ENABLE_ALL时生效。*/
	private _dstBlend: number;
	public get dstBlend(): number {
		return this._dstBlend;
	}
	public set dstBlend(value: number) {
		this._dstBlend = value;
	}
	/**RGB源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	private _srcBlendRGB: number;
	public get srcBlendRGB(): number {
		return this._srcBlendRGB;
	}
	public set srcBlendRGB(value: number) {
		this._srcBlendRGB = value;
	}
	/**RGB目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	private _dstBlendRGB: number;
	public get dstBlendRGB(): number {
		return this._dstBlendRGB;
	}
	public set dstBlendRGB(value: number) {
		this._dstBlendRGB = value;
	}
	/**Alpha源混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	private _srcBlendAlpha: number;
	public get srcBlendAlpha(): number {
		return this._srcBlendAlpha;
	}
	public set srcBlendAlpha(value: number) {
		this._srcBlendAlpha = value;
	}
	/**Alpha目标混合参数,在blend为BLEND_ENABLE_SEPERATE时生效。*/
	private _dstBlendAlpha: number;
	public get dstBlendAlpha(): number {
		return this._dstBlendAlpha;
	}
	public set dstBlendAlpha(value: number) {
		this._dstBlendAlpha = value;
	}
	/**混合方程。*/
	private _blendEquation: number;
	public get blendEquation(): number {
		return this._blendEquation;
	}
	public set blendEquation(value: number) {
		this._blendEquation = value;
	}
	/**RGB混合方程。*/
	private _blendEquationRGB: number;
	public get blendEquationRGB(): number {
		return this._blendEquationRGB;
	}
	public set blendEquationRGB(value: number) {
		this._blendEquationRGB = value;
	}
	/**Alpha混合方程。*/
	private _blendEquationAlpha: number;
	public get blendEquationAlpha(): number {
		return this._blendEquationAlpha;
	}
	public set blendEquationAlpha(value: number) {
		this._blendEquationAlpha = value;
	}
	/**深度测试函数。*/
	private _depthTest: number;
	public get depthTest(): number {
		return this._depthTest;
	}
	public set depthTest(value: number) {
		this._depthTest = value;
	}
	/**是否深度测试。*/
	private _depthWrite: boolean;
	public get depthWrite(): boolean {
		return this._depthWrite;
	}
	public set depthWrite(value: boolean) {
		this._depthWrite = value;
	}
	/**是否模板写入 */
	private _stencilWrite: boolean;
	public get stencilWrite(): boolean {
		return this._stencilWrite;
	}
	public set stencilWrite(value: boolean) {
		this._stencilWrite = value;
	}
	/**是否开启模板测试 */
	private _stencilTest: number;
	public get stencilTest(): number {
		return this._stencilTest;
	}
	public set stencilTest(value: number) {
		this._stencilTest = value;
	}
	/**模板值 一般会在0-255*/
	private _stencilRef: number;
	public get stencilRef(): number {
		return this._stencilRef;
	}
	public set stencilRef(value: number) {
		this._stencilRef = value;
	}
	/**模板设置值 */
	private _stencilOp: Vector3 = new Vector3();
	public get stencilOp(): Vector3 {
		return this._stencilOp;
	}
	public set stencilOp(value: Vector3) {
		this._stencilOp = value;
	}

	protected createObj(){
		//native TODO 历史包袱
	}

	/**
	 * 创建一个 <code>RenderState</code> 实例。
	 */
	constructor() {
		this.createObj();
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
		this.stencilOp.set(null, null, null);
	}

	/**
	 * 克隆
	 * @param dest 
	 */
	cloneTo(dest: RenderState) {
		dest.cull = this.cull;
		dest.blend = this.blend;
		dest.srcBlend = this.srcBlend;
		dest.dstBlend = this.dstBlend;
		dest.srcBlendRGB = this.srcBlendRGB;
		dest.dstBlendRGB = this.dstBlendRGB;
		dest.srcBlendAlpha = this.srcBlendAlpha;
		dest.dstBlendAlpha = this.dstBlendAlpha;
		dest.blendEquation = this.blendEquation;
		dest.blendEquationRGB = this.blendEquationRGB;
		dest.blendEquationAlpha = this.blendEquationAlpha;
		dest.depthTest = this.depthTest;
		dest.depthWrite = this.depthWrite;
		dest.stencilRef = this.stencilRef;
		dest.stencilTest = this.stencilTest;
		dest.stencilWrite = this.stencilWrite;
		this.stencilOp.cloneTo(dest.stencilOp);
	}


	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): RenderState {
		var dest: RenderState = new RenderState();
		this.cloneTo(dest);
		return dest;
	}

}


