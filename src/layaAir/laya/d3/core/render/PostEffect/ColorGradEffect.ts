import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { FilterMode } from "../../../../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D, ShaderFeatureType } from "../../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../../RenderEngine/RenderShader/VertexMesh";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { Material } from "../../../../resource/Material";
import { CommandBuffer } from "../command/CommandBuffer";
import { PostProcessEffect } from "../PostProcessEffect";
import { PostProcessRenderContext } from "../PostProcessRenderContext";
import BlitVS from "../../../../d3/shader/postprocess/BlitScreen.vs";
import BlitLUTShader from "../../../../d3/shader/postprocess/BlitLUTScreen.fs";
import { Texture2D } from "../../../../resource/Texture2D";
import { Color } from "../../../../maths/Color";
import { PostProcess } from "../../../component/PostProcess";
import { LayaGL } from "../../../../layagl/LayaGL";
import { ShaderDefine } from "../../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { ShaderData, ShaderDataType } from "../../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../../../RenderDriver/RenderModuleData/Design/RenderState";

export enum ToneMappingType {
	None,
	ACES
}

/**
 * @en Class of ColorGradEffect used to create tone mapping effect.
 * @zh ColorGradEffect 类用于创建调色效果
 */
export class ColorGradEffect extends PostProcessEffect {
	/**
	 * @internal
	 * @en ACES macro
	 * @zh ACES宏
	 */
	static SHADERDEFINE_ACES: ShaderDefine;
	/**
	 * @internal
	 * @en Custom LUT macro
	 * @zh 自定义LUT宏
	 */
	static SHADERDEFINE_CUSTOMLUT: ShaderDefine;
	/**@internal */
	static SHADERVALUE_LUT: number;
	/**@internal */
	static SHADERVALUE_LUTPARAMS: number;
	/**@internal */
	static SHADERVALUE_CUSTOMLUT: number;
	/**@internal */
	static SHADERVALUE_CUSTOMLUTPARAMS: number;

	/**
	 * @internal
	 * @en Initialize shader configurations and rendering state settings.
	 * @zh 初始化着色器配置和渲染状态设置。
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
		shader.shaderType = ShaderFeatureType.PostProcess;
		let subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		let pass = subShader.addShaderPass(BlitVS, BlitLUTShader);
		pass.renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		pass.renderState.depthWrite = false;
		pass.renderState.cull = RenderState.CULL_NONE;
		pass.renderState.blend = RenderState.BLEND_DISABLE;
	}

	/**
	 * @en Initialize shader definitions.
	 * @zh 初始化着色器定义。
	 */
	static __initDefine__() {
		ColorGradEffect.SHADERDEFINE_ACES = Shader3D.getDefineByName("ACES");
		ColorGradEffect.SHADERDEFINE_CUSTOMLUT = Shader3D.getDefineByName("CUSTOMLUT");


		ColorGradEffect.SHADERVALUE_LUT = Shader3D.propertyNameToID("u_Lut");
		ColorGradEffect.SHADERVALUE_LUTPARAMS = Shader3D.propertyNameToID("u_LutParams");
		ColorGradEffect.SHADERVALUE_CUSTOMLUT = Shader3D.propertyNameToID("u_CustomLut");
		ColorGradEffect.SHADERVALUE_CUSTOMLUTPARAMS = Shader3D.propertyNameToID("u_CustomLutParams");
	}

	private _needBuildLUT: boolean = false;

	/**@internal */
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
	/**@internal 自动曝光,默认值是1 */
	private _postExposure = 1;
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
	 * @en the tone mapping type.
	 * @zh 色调映射类型
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

	/**
	 * @en Whether split tone effect is enabled.
	 * @zh 是否启用分离色调效果。
	 */
	public get enableSplitTone() {
		return this._enableSplitTone;
	}

	public set enableSplitTone(value: boolean) {
		this._enableSplitTone = value;
		this._needBuildLUT = true;
	}

	/**
   * @en The color of shadows in split tone effect.
   * @zh 分离色调效果中阴影的颜色。
   */
	public get splitShadow(): Vector3 {
		return this._splitShadow;
	}

	public set splitShadow(value: Vector3) {
		this._needBuildLUT = true;
		value.cloneTo(this._splitShadow);
	}

	/**
	 * @en The color of highlights in split tone effect.
	 * @zh 分离色调效果中高光的颜色。
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
	* @en The balance between shadow and highlight coloring in split tone effect.
	* @zh 分离色调效果中阴影和高光着色的平衡。
	*/
	public get splitBalance(): number {
		return this._splitBalance;
	}

	public set splitBalance(value: number) {
		this._needBuildLUT = true;
		this._splitBalance = value;
	}

	/**
	 * @en wheather to enable shadows, midtones, highlights 
	 * @zh 是否启用阴影，中亮，高亮调节
	 */
	public get enableSMH(): boolean {
		return this._enableSMH;
	}

	public set enableSMH(value: boolean) {
		this._needBuildLUT = true;
		this._enableSMH = value;
	}

	/**
	 * @en Shadows value, range 0-5.
	 * @zh 阴影值，取值范围0-5
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
	 * @en Midtones value, range 0-5.
	 * @zh 中亮值，取值范围0-5
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
	 * @en Highlights value, range 0-5.
	 * @zh 高亮值，取值范围0-5
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
	 * @en Shadow limit start 0-1
	 * @zh 阴影限界起点，取值范围0-1
	 */
	public get shadowLimitStart(): number {
		return this._limits.x;
	}

	public set shadowLimitStart(value: number) {
		this._needBuildLUT = true;
		this._limits.x = Math.min(value, this.shadowLimitEnd);
	}

	/**
	 * @en Shadow limit end 0-1
	 * @zh 阴影限界终点，取值范围0-1
	 */
	public get shadowLimitEnd(): number {
		return this._limits.y;
	}

	public set shadowLimitEnd(value: number) {
		this._needBuildLUT = true;
		this._limits.y = Math.max(value, this.shadowLimitStart);
	}


	/**
	 * @en HighLight limit start 0-1
	 * @zh 高光限界起点，取值范围0-1
	 */
	public get highLightLimitStart(): number {
		return this._limits.z;
	}

	public set highLightLimitStart(value: number) {
		this._needBuildLUT = true;
		this._limits.z = Math.min(value, this.highLightLimitEnd);
	}

	/**
	 * @en HighLight limit end 0-1
	 * @zh 高光限界终点，取值范围0-1
	 */
	public get highLightLimitEnd(): number {
		return this._limits.w;
	}

	public set highLightLimitEnd(value: number) {
		this._needBuildLUT = true;
		this._limits.w = Math.max(this.highLightLimitStart, value);
	}


	/**
	 * @en Whether lift, gamma, gain adjustments are enabled.
	 * @zh 是否启用暗部、中间调、亮部调整。
	 */
	public get enableLiftGammaGain() {
		return this._enableLiftGammaGain;
	}

	public set enableLiftGammaGain(value: boolean) {
		this._needBuildLUT = true;
		this._enableLiftGammaGain = value;
	}

	/**
	 * @en The lift adjustment value. Primarily affects the shadow areas of the image, with a range of -1-1.
	 * @zh 暗部调整值。主要影响图像的阴影区域，范围 -1-1
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
	 * @en The gamma adjustment value. Affects the midtones of the image, but also influences shadows and highlights. with a range of 999-0.5.
	 * @zh 中间调调整值。影响图像的中间调，范围 999-0.5
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
	 * @en The gain adjustment value. Primarily affects the highlight areas of the image, with a range of 0-2.
	 * @zh 亮部调整值。主要影响图像的高光区域，范围 0-2
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

	/**
	 * @zh Wheather to enable white balance.
	 * @zh 白平衡是否开启
	 */
	public get enableBalance() {
		return this._enableBalance;
	}

	public set enableBalance(value: boolean) {
		this._needBuildLUT = true;
		this._enableBalance = value;
	}

	/**
	 * @en Controls the white balance color to compensate for a green or magenta tint. Range -100-100.
	 * @zh 白平衡颜色，用于补偿绿色或品红色。范围 -100-100。
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
	 * @en White Balance Temperature. Range -100-100.
	 * @zh 白平衡色温。范围 -100-100.
	 */
	public get temperature(): number {
		return this._temperature;
	}

	public set temperature(value: number) {
		this._needBuildLUT = true;
		this._temperature = value;
		this._ColorBalanceToLMSCoeffs(this._temperature, this._tint);
	}

	/**
	 * @en Whether color adjust is enabled.
	 * @zh 是否开启颜色调整
	 */
	public get enableColorAdjust() {
		return this._enableColorAdjust;
	}

	public set enableColorAdjust(value: boolean) {
		this._needBuildLUT = true;
		this._enableColorAdjust = value;
	}

	/**
	 * @en The overall exposure of the scene.
	 * @zh 场景的整体曝光
	 */
	public get postExposure() {
		return this._postExposure;
	}

	public set postExposure(value) {
		this._postExposure = value;
	}

	/**
	 * @en Color Contrast. Range 0-2.
	 * @zh 颜色对比度，范围 0-2
	 */
	public get contrast() {
		return this._contrast;
	}

	public set contrast(value) {
		this._needBuildLUT = true;
		this._contrast = value;
	}

	/**
	 * @en The color filter.
	 * @zh 颜色过滤器
	 */
	public get colorFilter() {
		return this._colorFilter;
	}

	public set colorFilter(value: Color) {
		this._needBuildLUT = true;
		value.cloneTo(this._colorFilter);
	}

	/**
	 * @en The Hue Shift. Range -0.5-0.5.
	 * @zh 色相偏移，范围 -0.5-0.5
	 */
	public get HueShift() {
		return this._HueShift;
	}
	public set HueShift(value) {
		this._needBuildLUT = true;
		this._HueShift = value;
	}

	/**
	 * @en Saturation. 
	 * @zh 饱和度
	 */
	public get saturation() {
		return this._saturation;
	}
	public set saturation(value) {
		this._needBuildLUT = true;
		this._saturation = value;
	}


	/** 
	 * @en initialize the color grad effect instance.
	 * @zh 初始化调色效果实例
	 */
	constructor() {
		super();
		this.singleton = true;
		this.active = true;
		this._needBuildLUT = true;
		this._toneMapping = ToneMappingType.None;
		this._blitlutParams = new Vector4();
		this._lutShaderData = LayaGL.renderDeviceFactory.createShaderData(null);
		this.lutSize = 32;
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
		this._postProcess._context.command.blitScreenQuadByMaterial(Texture2D.whiteTexture, this._lutTex, null, this._lutBuilderMat);
	}
	private _postProcess: PostProcess

	/**
	 * @en Called when added to the post-processing stack.
	 * @param postprocess The post-processing node.
	 * @zh 在添加到后期处理栈时调用。
	 * @param postprocess 后期处理节点。
	 */
	effectInit(postprocess: PostProcess) {
		super.effectInit(postprocess);
		this._lutBuilderMat.setShaderName("LUTBuilder");
		this._LUTShader = Shader3D.find("blitLUTShader");
		postprocess._enableColorGrad = true;
		postprocess._ColorGradEffect = this;
		this._postProcess = postprocess;
		// this._shader = Shader3D.find("PostProcessBloom");
		// this._pyramid = new Array(BloomEffect.MAXPYRAMIDSIZE * 2);
	}

	/**
	 * @en Release the Effect.
	 * @param postprocess The post-processing node.
	 * @zh 释放Effect。
	 * @param postprocess 后期处理节点。
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
	 * @en Render the effect.
	 * @param context The post-processing rendering context.
	 * @zh 渲染效果。
	 * @param context 后期处理渲染上下文。
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




