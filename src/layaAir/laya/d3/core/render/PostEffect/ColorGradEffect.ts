import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { FilterMode } from "../../../../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "../../../../RenderEngine/RenderShader/ShaderData";
import { ShaderDefine } from "../../../../RenderEngine/RenderShader/ShaderDefine";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../../RenderEngine/RenderShader/VertexMesh";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { Material } from "../../../../resource/Material";
import { CommandBuffer } from "../command/CommandBuffer";
import { PostProcessEffect } from "../PostProcessEffect";
import { PostProcessRenderContext } from "../PostProcessRenderContext";
import BlitVS from "../../../../d3/shader/postprocess/BlitScreen.vs";
import BlitLUTShader from "../../../../d3/shader/postprocess/BlitLUTScreen.fs";
import { RenderState } from "../../../../RenderEngine/RenderShader/RenderState";
import { Texture2D } from "../../../../resource/Texture2D";
import { RenderContext3D } from "../RenderContext3D";
import { Color } from "../../../../maths/Color";
import { PostProcess } from "../../../component/PostProcess";
import { LayaGL } from "../../../../layagl/LayaGL";

export enum ToneMappingType {
	None,
	ACES
}

/**
 * <code>ColorGradEffect</code> 类用于创建调色Effect
 */
export class ColorGradEffect extends PostProcessEffect {
	static SHADERDEFINE_ACES: ShaderDefine;
	static SHADERDEFINE_CUSTOMLUT: ShaderDefine;

	static SHADERVALUE_LUT: number;
	static SHADERVALUE_LUTPARAMS: number;
	static SHADERVALUE_CUSTOMLUT: number;
	static SHADERVALUE_CUSTOMLUTPARAMS: number;

	/**
	 * bloom resource init
	 */
	static init() {
		ColorGradEffect.__initDefine__();
		let attributeMap: { [name: string]: [number, ShaderDataType] } = {
			"a_PositionTexcoord": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
		};

		let uniformMap = {
			"u_OffsetScale": ShaderDataType.Vector4,
			"u_MainTex": ShaderDataType.Texture2D,
			"u_MainTex_TexelSize": ShaderDataType.Vector4, //x:width,y:height,z:1/width,w:1/height
		};
		let shader = Shader3D.add("blitLUTShader");
		let subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		let pass = subShader.addShaderPass(BlitVS, BlitLUTShader);
		pass.renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		pass.renderState.depthWrite = false;
		pass.renderState.cull = RenderState.CULL_NONE;
		pass.renderState.blend = RenderState.BLEND_DISABLE;
	}

	static __initDefine__() {
		ColorGradEffect.SHADERDEFINE_ACES = Shader3D.getDefineByName("ACES");
		ColorGradEffect.SHADERDEFINE_CUSTOMLUT = Shader3D.getDefineByName("CUSTOMLUT");


		ColorGradEffect.SHADERVALUE_LUT = Shader3D.propertyNameToID("u_Lut");
		ColorGradEffect.SHADERVALUE_LUTPARAMS = Shader3D.propertyNameToID("u_LutParams");
		ColorGradEffect.SHADERVALUE_CUSTOMLUT = Shader3D.propertyNameToID("u_CustomLut");
		ColorGradEffect.SHADERVALUE_CUSTOMLUTPARAMS = Shader3D.propertyNameToID("u_CustomLutParams");
	}

	private _needBuildLUT: boolean = false;

	private _lutCommond: CommandBuffer;
	_lutTex: RenderTexture;
	private _lutBuilderMat = new Material();


	private _LUTShader: Shader3D;
	private _lutShaderData: ShaderData;
	private _blitlutParams: Vector4;

	/**color Tone */
	/**@internal */
	private _toneMapping: ToneMappingType;
	/**@internal lut height size */
	private _lutSize = 32;

	// split toning
	/**@internal */
	private _enableSplitTone: boolean = false;
	private _splitShadow: Vector3 = new Vector3(0.5, 0.5, 0.5);
	private _splitBalance: number = 0;//-1-1
	private _splithighlights: Vector3 = new Vector3(0.5, 0.5, 0.5);
	private _u_SplitShadow: Vector4 = new Vector4(0, 0, 0);

	// shadows, midtones, highlights
	private _enableSMH: boolean = false;
	/**@internal */
	private _shadows: Vector3 = new Vector3(1, 1, 1);//0-5
	/**@internal */
	private _midtones: Vector3 = new Vector3(1, 1, 1);//0-5
	/**@internal */
	private _highlights: Vector3 = new Vector3(1, 1, 1);//0-5
	/**@internal */
	private _limits: Vector4 = new Vector4(0, 0.33, 0.55, 1);

	//lift gamma gain
	private _enableLiftGammaGain: boolean = false;
	/**@internal */
	private _lift: Vector3 = new Vector3(0, 0, 0);//-1-1
	/**@internal */
	private _gamma: Vector3 = new Vector3(1, 1, 1);//999-0.5
	/**@internal */
	private _gain: Vector3 = new Vector3(1, 1, 1);//0-2

	//white balance
	private _enableBalance: boolean = false;
	/**@internal tint,temperature */
	private _balance: Vector3 = new Vector3();
	private _tint: number = 0;//-100-100
	private _temperature: number = 0;//-100-1

	//Color Adjustments
	/**@internal */
	private _enableColorAdjust: boolean = false;
	/**@internal */
	private _postExposure = 1;//自动曝光,默认值是1
	/**@internal */
	private _contrast = 1;//range 0-2//对比度HueSatCon.z
	/**@internal */
	private _colorFilter = new Color(1, 1, 1);//正片叠底
	/**@internal */
	private _HueShift = 0;//-0.5-0.5 色相HueSatCon.x

	/**@internal */
	private _saturation = 1;//0-2饱和度HueSatCon.y

	/**@internal _HueShift,_saturation,_contrast*/
	private _HueSatCon: Vector4 = new Vector4(0, 1, 1, 0);

	/**
	 * Tone Map色彩空间
	 */
	public get toneMapping(): ToneMappingType {
		return this._toneMapping;
	}

	public set toneMapping(value: ToneMappingType) {
		if (value == this._toneMapping)
			return
		this._needBuildLUT = true;
		this._toneMapping = value;
	}

	// split toning
	/**
	 * 是否开启Split Tone
	 */
	public get enableSplitTone() {
		return this._enableSplitTone;
	}

	public set enableSplitTone(value: boolean) {
		this._enableSplitTone = value;
		this._needBuildLUT = true;
	}

	/**
	 * split shadow
	 */
	public get splitShadow(): Vector3 {
		return this._splitShadow;
	}

	public set splitShadow(value: Vector3) {
		this._needBuildLUT = true;
		value.cloneTo(this._splitShadow);
	}

	/**
	 * split hightLight
	 */
	public get splithighlights(): Vector3 {
		return this._splithighlights;
	}
	public set splithighlights(value: Vector3) {
		if (this._splithighlights.equal(value))
			return;
		this._needBuildLUT = true;
		value.cloneTo(this._splithighlights);
	}

	/**
	 * split balance
	 */
	public get splitBalance(): number {
		return this._splitBalance;
	}

	public set splitBalance(value: number) {
		this._needBuildLUT = true;
		this._splitBalance = value;
	}

	// shadows, midtones, highlights
	public get enableSMH(): boolean {
		return this._enableSMH;
	}

	public set enableSMH(value: boolean) {
		this._needBuildLUT = true;
		this._enableSMH = value;
	}

	/**
	 * shadows 0-5
	 */
	public get shadows(): Vector3 {
		return this._shadows;
	}

	public set shadows(value: Vector3) {
		if (this._shadows.equal(value))
			return;
		this._needBuildLUT = true;
		value.cloneTo(this._shadows);
	}

	/**
	 * midtones 0-5
	 */
	public get midtones(): Vector3 {
		return this._midtones;
	}
	public set midtones(value: Vector3) {
		if (this._midtones.equal(value))
			return;
		this._needBuildLUT = true;
		value.cloneTo(this._midtones);
	}

	/**
	 * highlights 0-5
	 */
	public get highlights(): Vector3 {
		return this._highlights;
	}
	public set highlights(value: Vector3) {
		if (this._highlights.equal(value))
			return;
		this._needBuildLUT = true;
		value.cloneTo(this._highlights);
	}

	/**
	 * shadow limit start 0-1
	 */
	public get shadowLimitStart(): number {
		return this._limits.x;
	}

	public set shadowLimitStart(value: number) {
		this._needBuildLUT = true;
		this._limits.x = Math.min(value, this.shadowLimitEnd);
	}

	/**
	 * shadow limit end 0-1
	 */
	public get shadowLimitEnd(): number {
		return this._limits.y;
	}

	public set shadowLimitEnd(value: number) {
		this._needBuildLUT = true;
		this._limits.y = Math.max(value, this.shadowLimitStart);
	}


	/**
	 * high Light limit start 0-1
	 */
	public get highLightLimitStart(): number {
		return this._limits.z;
	}

	public set highLightLimitStart(value: number) {
		this._needBuildLUT = true;
		this._limits.z = Math.min(value, this.highLightLimitEnd);
	}

	/**
	 * high Light limit end 0-1
	 */
	public get highLightLimitEnd(): number {
		return this._limits.w;
	}

	public set highLightLimitEnd(value: number) {
		this._needBuildLUT = true;
		this._limits.w = Math.max(this.highLightLimitStart, value);
	}


	//lift gamma gain
	public get enableLiftGammaGain() {
		return this._enableLiftGammaGain;
	}

	public set enableLiftGammaGain(value: boolean) {
		this._needBuildLUT = true;
		this._enableLiftGammaGain = value;
	}

	/**
	 * lift -1-1
	 */
	public get lift(): Vector3 {
		return this._lift;
	}

	public set lift(value: Vector3) {
		if (this.lift.equal(value))
			return;
		this._needBuildLUT = true;
		value.cloneTo(this._lift);
	}


	/**
	 * gamma 999-0.5
	 */
	public get gamma(): Vector3 {
		return this._gamma;
	}

	public set gamma(value: Vector3) {
		if (this._gamma.equal(value))
			return;
		this._needBuildLUT = true;
		value.cloneTo(this._gamma);
	}

	/**
	 * gain 0-2
	 */
	public get gain(): Vector3 {
		return this._gain;
	}

	public set gain(value: Vector3) {
		if (this._gain.equal(value))
			return;
		this._needBuildLUT = true;
		value.cloneTo(this._gain);
	}

	private _StandardIlluminantY(x: number) {
		return 2.87 * x - 3 * x * x - 0.27509507;
	};

	private _CIExyToLMS(x: number, y: number) {
		let Y = 1;
		let X = Y * x / y;
		let Z = Y * (1 - x - y) / y;

		let L = 0.7328 * X + 0.4296 * Y - 0.1624 * Z;
		let M = -0.7036 * X + 1.6975 * Y + 0.0061 * Z;
		let S = 0.0030 * X + 0.0136 * Y + 0.9834 * Z;

		return new Vector3(L, M, S);
	}

	// Converts white balancing parameter to LMS coefficients.
	private _ColorBalanceToLMSCoeffs(temperature: number, tint: number) {

		// Range ~[-1.5;1.5] works best
		let t1 = temperature / 65.0;
		let t2 = tint / 65.0;

		// Get the CIE xy chromaticity of the reference white point.
		// Note: 0.31271 = x value on the D65 white point
		let x = 0.31271 - t1 * (t1 < 0 ? 0.1 : 0.05);
		let y = this._StandardIlluminantY(x) + t2 * 0.05;

		// Calculate the coefficients in the LMS space.
		let w1 = new Vector3(0.949237, 1.03542, 1.08728);
		let w2 = this._CIExyToLMS(x, y);

		this._balance.set(w1.x / w2.x, w1.y / w2.y, w1.z / w2.z);
	}

	//balance
	public get enableBalance() {
		return this._enableBalance;
	}

	public set enableBalance(value: boolean) {
		this._needBuildLUT = true;
		this._enableBalance = value;
	}

	/**
	 * tint -100 - 100
	 */
	public get tint(): number {
		return this._tint;
	}


	public set tint(value: number) {
		this._needBuildLUT = true;
		this._tint = value;
		this._ColorBalanceToLMSCoeffs(this._temperature, this._tint);
	}

	/**
	 * temperature -100-100
	 */
	public get temperature(): number {
		return this._temperature;
	}

	public set temperature(value: number) {
		this._needBuildLUT = true;
		this._temperature = value;
		this._ColorBalanceToLMSCoeffs(this._temperature, this._tint);
	}

	//Color Adjustments
	public get enableColorAdjust() {
		return this._enableColorAdjust;
	}

	public set enableColorAdjust(value: boolean) {
		this._needBuildLUT = true;
		this._enableColorAdjust = value;
	}

	/**
	 * 曝光
	 */
	public get postExposure() {
		return this._postExposure;
	}

	public set postExposure(value) {
		this._postExposure = value;
	}

	/**
	 * contrast颜色对比度range 0-2
	 */
	public get contrast() {
		return this._contrast;
	}

	public set contrast(value) {
		this._needBuildLUT = true;
		this._contrast = value;
	}

	/**
	 * 正片叠底
	 */
	public get colorFilter() {
		return this._colorFilter;
	}

	public set colorFilter(value: Color) {
		this._needBuildLUT = true;
		value.cloneTo(this._colorFilter);
	}

	/**色相 -0.5-0.5*/
	public get HueShift() {
		return this._HueShift;
	}
	public set HueShift(value) {
		this._needBuildLUT = true;
		this._HueShift = value;
	}

	/**
	 * 饱和度
	 */
	public get saturation() {
		return this._saturation;
	}
	public set saturation(value) {
		this._needBuildLUT = true;
		this._saturation = value;
	}



	/**
	 * 创建一个 <code>BloomEffect</code> 实例。
	 */
	constructor() {
		super();
		this.singleton = true;
		this.active = true;
		this._needBuildLUT = true;
		this._toneMapping = ToneMappingType.None;
		this._blitlutParams = new Vector4();
		this._lutShaderData = LayaGL.renderOBJCreate.createShaderData(null);
		this.lutSize = 32;
		this._lutCommond = new CommandBuffer();
		this._lutBuilderMat = new Material();
	}



	private get lutSize() {
		return this._lutSize;
	}
	private set lutSize(value) {
		if (value > 32)//64*6 = 4096
			return
		this._lutSize = value;
		if (this._lutTex)
			this._lutTex.destroy();
		this._lutTex = new RenderTexture(this._lutSize * this._lutSize, this._lutSize, RenderTargetFormat.R16G16B16A16, null, false, 1, false, false);
		this._lutTex.anisoLevel = 1;
		this._lutTex.wrapModeU = WrapMode.Clamp;
		this._lutTex.wrapModeV = WrapMode.Clamp;
		this._lutTex.filterMode = FilterMode.Bilinear;
	}



	private default_balance = new Vector3(1, 1, 1);
	private default_splitShadow = new Vector4(0.5, 0.5, 0.5, 0.0);
	private default_splithighlights = new Vector3(0.5, 0.5, 0.5);
	private default_shadow = new Vector3(1, 1, 1);
	private default_midtones = new Vector3(1, 1, 1);
	private default_highlight = new Vector3(1, 1, 1);
	private default_limint = new Vector4(0.0, 0.3, 0.55, 1.0);
	private default_lift = new Vector3(0, 0, 0);
	private default_gamma = new Vector3(1, 1, 1);
	private default_gain = new Vector3(1, 1, 1);
	private default_ColorFilter = new Color(1, 1, 1, 1);
	private default_HueSatCon = new Vector4(0, 1, 1, 0);
	/**
	 * @internal
	 * 生成LUT纹理
	 */
	_buildLUT() {
		if (!this._needBuildLUT)
			return;
		let lutHeight = this.lutSize;
		let lutWidth = this.lutSize * this.lutSize;
		let lutParams = new Vector4(lutHeight, 0.5 / lutWidth, 0.5 / lutHeight, lutHeight / (lutHeight - 1));
		this._lutBuilderMat.setVector4("u_LutParams", lutParams);

		if (this.enableBalance) {
			this._ColorBalanceToLMSCoeffs(this.temperature, this.tint);
			this._lutBuilderMat.setVector3("u_ColorBalance", this._balance);
		} else {
			this._lutBuilderMat.setVector3("u_ColorBalance", this.default_balance);
		}

		if (this.enableSplitTone) {
			this._u_SplitShadow.setValue(this._splitShadow.x, this._splitShadow.y, this._splitShadow.z, this.splitBalance);
			this._lutBuilderMat.setVector4("u_SplitShadows", this._u_SplitShadow);
			this._lutBuilderMat.setVector3("u_Splithighlights", this._splithighlights);
		} else {
			this._lutBuilderMat.setVector4("u_SplitShadows", this.default_splitShadow);
			this._lutBuilderMat.setVector3("u_Splithighlights", this.default_splithighlights);
		}

		if (this.enableSMH) {
			this._lutBuilderMat.setVector3("u_Shadows", this._shadows);
			this._lutBuilderMat.setVector3("u_Midtones", this._midtones);
			this._lutBuilderMat.setVector3("u_Highlights", this._highlights);
			this._lutBuilderMat.setVector4("u_Limits", this._limits);
		} else {
			this._lutBuilderMat.setVector3("u_Shadows", this.default_shadow);
			this._lutBuilderMat.setVector3("u_Midtones", this.default_midtones);
			this._lutBuilderMat.setVector3("u_Highlights", this.default_highlight);
			this._lutBuilderMat.setVector4("u_Limits", this.default_limint);
		}
		if (this._enableLiftGammaGain) {
			this._lutBuilderMat.setVector3("u_Lift", this._lift);
			this._lutBuilderMat.setVector3("u_Gamma", this._gamma);
			this._lutBuilderMat.setVector3("u_Gain", this._gain);
		} else {
			this._lutBuilderMat.setVector3("u_Lift", this.default_lift);
			this._lutBuilderMat.setVector3("u_Gamma", this.default_gamma);
			this._lutBuilderMat.setVector3("u_Gain", this.default_gain);
		}
		if (this.enableColorAdjust) {
			//_HueShift,_saturation,_contrast
			this._HueSatCon.setValue(this._HueShift, this.saturation, this._contrast, 0.0);
			this._lutBuilderMat.setColor("u_ColorFilter", this._colorFilter);
			this._lutBuilderMat.setVector4("u_HueSatCon", this._HueSatCon);
		} else {
			this._lutBuilderMat.setColor("u_ColorFilter", this.default_ColorFilter);
			this._lutBuilderMat.setVector4("u_HueSatCon", this.default_HueSatCon);
		}



		if (this._toneMapping == ToneMappingType.ACES) {
			this._lutBuilderMat.addDefine(ColorGradEffect.SHADERDEFINE_ACES);
		} else {
			this._lutBuilderMat.removeDefine(ColorGradEffect.SHADERDEFINE_ACES);
		}
		this._lutCommond.blitScreenQuadByMaterial(Texture2D.whiteTexture, this._lutTex, null, this._lutBuilderMat);
		this._lutCommond.context = RenderContext3D._instance;
		this._lutCommond._apply();
		this._lutCommond.clear();
	}

	/**
	 * 添加到后期处理栈时,会调用
	 */
	effectInit(postprocess: PostProcess) {
		super.effectInit(postprocess);
		this._lutBuilderMat.setShaderName("LUTBuilder");
		this._LUTShader = Shader3D.find("blitLUTShader");
		postprocess._enableColorGrad = true;
		postprocess._ColorGradEffect = this;
		// this._shader = Shader3D.find("PostProcessBloom");
		// this._pyramid = new Array(BloomEffect.MAXPYRAMIDSIZE * 2);
	}

	/**
	 * 释放Effect
	 */
	release(postprocess: PostProcess) {
		super.release(postprocess);
		postprocess._enableColorGrad = false;
		postprocess._ColorGradEffect = null;

	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	render(context: PostProcessRenderContext): void {
		let cmd: CommandBuffer = context.command;
		let source: RenderTexture = context.indirectTarget;
		if (true) {
			this._blitlutParams.setValue(1 / this._lutTex.width, 1 / this._lutTex.height, this._lutTex.height - 1, this.enableColorAdjust ? this._postExposure : 1);
			this._lutBuilderMat.removeDefine(ColorGradEffect.SHADERDEFINE_CUSTOMLUT);
			this._lutShaderData.setTexture(ColorGradEffect.SHADERVALUE_LUT, this._lutTex);
			this._lutShaderData.setVector(ColorGradEffect.SHADERVALUE_LUTPARAMS, this._blitlutParams);
		}
		else {
			//TODO:CustomLUT
			this._lutBuilderMat.addDefine(ColorGradEffect.SHADERDEFINE_CUSTOMLUT);

		}
		cmd.blitScreenTriangle(source, context.destination, null, this._LUTShader, this._lutShaderData);
	}

}




