
import BloomVS from "../../../shader/files/postProcess/Bloom/Bloom.vs";
import BloomDownsample13PS from "../../../shader/files/postProcess/Bloom/BloomDownsample13.fs";
import BloomDownsample4PS from "../../../shader/files/postProcess/Bloom/BloomDownsample4.fs";
import BloomPrefilter13PS from "../../../shader/files/postProcess/Bloom/BloomPrefilter13.fs";
import BloomPrefilter4PS from "../../../shader/files/postProcess/Bloom/BloomPrefilter4.fs";
import BloomUpsampleBoxPS from "../../../shader/files/postProcess/Bloom/BloomUpsampleBox.fs";
import BloomUpsampleTentPS from "../../../shader/files/postProcess/Bloom/BloomUpsampleTent.fs";
import CompositePS from "../../../shader/files/postProcess/Bloom/Composite.fs";
import CompositeVS from "../../../shader/files/postProcess/Bloom/Composite.vs";
import SamplingGLSL from "../../../shader/files/postProcess/Sampling.glsl";
import StdLibGLSL from "../../../shader/files/postProcess/StdLib.glsl";
import ColorsGLSL from "../../../shader/files/postProcess/Colors.glsl";
import { LayaGL } from "../../../../layagl/LayaGL";
import { FilterMode } from "../../../../RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "../../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "../../../../RenderEngine/RenderShader/Shader3D";
import { ShaderDataType, ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Texture2D } from "../../../../resource/Texture2D";
import { PostProcess } from "../../../component/PostProcess";
import { Viewport } from "../../../math/Viewport";
import { CommandBuffer } from "../command/CommandBuffer";
import { PostProcessEffect } from "../PostProcessEffect";
import { PostProcessRenderContext } from "../PostProcessRenderContext";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { RenderState } from "../../../../RenderEngine/RenderShader/RenderState";
import { SubShader } from "../../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../../RenderEngine/RenderShader/VertexMesh";

/**
 * <code>BloomEffect</code> 类用于创建泛光效果。
 */
export class BloomEffect extends PostProcessEffect {
	/** @internal */
	static SHADERVALUE_MAINTEX: number;
	/**@internal */
	static SHADERVALUE_AUTOEXPOSURETEX: number;
	/**@internal */
	static SHADERVALUE_SAMPLESCALE: number;
	/**@internal */
	static SHADERVALUE_THRESHOLD: number;
	/**@internal */
	static SHADERVALUE_PARAMS: number;
	/**@internal */
	static SHADERVALUE_BLOOMTEX: number;

	/**@internal */
	static SUBSHADER_PREFILTER13: number = 0;
	/**@internal */
	static SUBSHADER_PREFILTER4: number = 1;
	/**@internal */
	static SUBSHADER_DOWNSAMPLE13: number = 2;
	/**@internal */
	static SUBSHADER_DOWNSAMPLE4: number = 3;
	/**@internal */
	static SUBSHADER_UPSAMPLETENT: number = 4;
	/**@internal */
	static SUBSHADER_UPSAMPLEBOX: number = 5;

	/**@internal */
	private static MAXPYRAMIDSIZE: number = 16; // Just to make sure we handle 64k screens... Future-proof!

	/**
	 * bloom resource init
	 */
	static init() {
		Shader3D.addInclude("StdLib.glsl", StdLibGLSL);
		Shader3D.addInclude("Colors.glsl", ColorsGLSL);
		Shader3D.addInclude("Sampling.glsl", SamplingGLSL);
		var attributeMap: any = {
			'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
		};

		var uniformMap: any = {
			"u_MainTex": ShaderDataType.Texture2D,
			"u_MainTex_TexelSize": ShaderDataType.Vector4,
			"u_AutoExposureTex": ShaderDataType.Texture2D,
			"u_Threshold": ShaderDataType.Vector4,
			"u_Params": ShaderDataType.Vector4,
			"u_BloomTex": ShaderDataType.Texture2D,
			"u_SampleScale": ShaderDataType.Float,
		};
		var shader = Shader3D.add("PostProcessBloom");
		//subShader0
		var subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		var shaderPass = subShader.addShaderPass(BloomVS, BloomPrefilter13PS);
		var renderState: RenderState = shaderPass.renderState;
		renderState = shaderPass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
		//subShader1
		subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		shaderPass = subShader.addShaderPass(BloomVS, BloomPrefilter4PS);
		renderState = shaderPass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
		//subShader2
		subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		shaderPass = subShader.addShaderPass(BloomVS, BloomDownsample13PS);
		renderState = shaderPass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
		//subShader3
		subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		shaderPass = subShader.addShaderPass(BloomVS, BloomDownsample4PS);
		renderState = shaderPass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
		//subShader4
		subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		shaderPass = subShader.addShaderPass(BloomVS, BloomUpsampleTentPS);
		renderState = shaderPass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
		//subShader5
		subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		shaderPass = subShader.addShaderPass(BloomVS, BloomUpsampleBoxPS);
		renderState = shaderPass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
		BloomEffect.CompositeInit();
		BloomEffect.__initDefine__();
	}

	static CompositeInit() {
		//PostProcessComposite
		let attributeMap: any = {
			'a_PositionTexcoord': [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4],
		};
		let uniformMap = {
			'u_MainTex': ShaderDataType.Texture2D,
			'u_BloomTex': ShaderDataType.Texture2D,
			'u_AutoExposureTex': ShaderDataType.Texture2D,
			'u_Bloom_DirtTex': ShaderDataType.Texture2D,
			'u_BloomTex_TexelSize': ShaderDataType.Vector4,
			'u_Bloom_DirtTileOffset': ShaderDataType.Vector4,
			'u_Bloom_Settings': ShaderDataType.Vector3,
			'u_Bloom_Color': ShaderDataType.Vector3,
		};
		let shader = Shader3D.add("PostProcessComposite");

		let subShader = new SubShader(attributeMap, uniformMap);
		shader.addSubShader(subShader);
		let shaderPass = subShader.addShaderPass(CompositeVS, CompositePS);
		let renderState = shaderPass.renderState;
		renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		renderState.depthWrite = false;
		renderState.cull = RenderState.CULL_NONE;
		renderState.blend = RenderState.BLEND_DISABLE;
	}

	static __initDefine__() {
		BloomEffect.SHADERVALUE_MAINTEX = Shader3D.propertyNameToID("u_MainTex");
		BloomEffect.SHADERVALUE_AUTOEXPOSURETEX = Shader3D.propertyNameToID("u_AutoExposureTex");
		BloomEffect.SHADERVALUE_SAMPLESCALE = Shader3D.propertyNameToID("u_SampleScale");
		BloomEffect.SHADERVALUE_THRESHOLD = Shader3D.propertyNameToID("u_Threshold");
		BloomEffect.SHADERVALUE_PARAMS = Shader3D.propertyNameToID("u_Params");
		BloomEffect.SHADERVALUE_BLOOMTEX = Shader3D.propertyNameToID("u_BloomTex");
	}

	/**@internal */
	private _shader: Shader3D = null;
	/**@internal */
	private _shaderData: ShaderData = LayaGL.renderOBJCreate.createShaderData(null);
	/**@internal */
	private _linearColor: Color = new Color();
	/**@internal */
	private _bloomTextureTexelSize: Vector4 = new Vector4();

	/**@internal */
	private _shaderThreshold: Vector4 = new Vector4();
	/**@internal */
	private _shaderParams: Vector4 = new Vector4();
	/**@internal */
	private _pyramid: any[] = null;
	/**@internal */
	private _intensity: number = 0.0;
	/**@internal */
	private _threshold: number = 1.0;
	/**@internal */
	private _softKnee: number = 0.5;
	/**@internal */
	private _diffusion: number = 7.0;
	/**@internal */
	private _anamorphicRatio: number = 0.0;
	/**@internal */
	private _dirtIntensity: number = 0.0;
	/**@internal */
	private _shaderSetting: Vector4 = new Vector4();
	/**@internal */
	private _dirtTileOffset: Vector4 = new Vector4();

	/**@internal*/
	private _clamp: number;

	/**泛光颜色。*/
	private _color: Color;

	/**是否开启快速模式。该模式通过降低质量来提升性能。*/
	private _fastMode: boolean = false;

	/**镜头污渍纹路,用于为泛光特效增加污渍灰尘效果*/
	private _dirtTexture: BaseTexture = null;

	/**
	 * 泛光像素的数量,该值在伽马空间
	 */
	get clamp(): number {
		return this._clamp;
	}

	set clamp(value: number) {
		this._clamp = value;
	}

	/**
	 * 泛光颜色。
	 */
	get color(): Color {
		return this._color;
	}

	set color(value: Color) {
		this._color = value;
	}

	/**
	 * 快速模式
	 */
	get fastMode(): boolean {
		return this._fastMode;
	}

	set fastMode(value: boolean) {
		this._fastMode = value;
	}

	/**
	 * 脏迹贴图
	 */
	get dirtTexture() {
		return this._dirtTexture;
	}

	set dirtTexture(value: BaseTexture) {
		this._dirtTexture && this._dirtTexture._removeReference(1);
		this._dirtTexture = value;
		this._dirtTexture && this._dirtTexture._addReference(1);
	}

	/**
	 * 获取泛光过滤器强度,最小值为0。
	 * @return 强度。
	 */
	get intensity(): number {
		return this._intensity;
	}

	/**
	 * 设置泛光过滤器强度,最小值为0。
	 * @param value 强度。
	 */
	set intensity(value: number) {
		this._intensity = Math.max(value, 0.0);
	}

	/**
	 * 设置泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
	 * @return 阈值。
	 */
	get threshold(): number {
		return this._threshold;
	}

	/**
	 * 获取泛光阈值,在该阈值亮度以下的像素会被过滤掉,该值在伽马空间。
	 * @param value 阈值。
	 */
	set threshold(value: number) {
		this._threshold = Math.max(value, 0.0);
	}

	/**
	 * 获取软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
	 * @return 软膝盖值。
	 */
	get softKnee(): number {
		return this._softKnee;
	}

	/**
	 * 设置软膝盖过渡强度,在阈值以下进行渐变过渡(0为完全硬过度,1为完全软过度)。
	 * @param value 软膝盖值。
	 */
	set softKnee(value: number) {
		this._softKnee = Math.min(Math.max(value, 0.0), 1.0);
	}

	/**
	 * 获取扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
	 * @return 光晕的扩散范围。
	 */
	get diffusion(): number {
		return this._diffusion;
	}

	/**
	 * 设置扩散值,改变泛光的扩散范围,最好使用整数值保证效果,该值会改变内部的迭代次数,范围是1到10。
	 * @param value 光晕的扩散范围。
	 */
	set diffusion(value: number) {
		this._diffusion = Math.min(Math.max(value, 1), 10);
	}

	/**
	 * 获取形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。-1 - 1
	 * @return 形变比。
	 */
	get anamorphicRatio(): number {
		return this._anamorphicRatio;
	}

	/**
	 * 设置形变比,通过扭曲泛光产生视觉上形变,负值为垂直扭曲,正值为水平扭曲。-1 - 1
	 * @param value 形变比。
	 */
	set anamorphicRatio(value: number) {
		this._anamorphicRatio = Math.min(Math.max(value, -1.0), 1.0);
	}

	/**
	 * 获取污渍强度。
	 * @return 污渍强度。
	 */
	get dirtIntensity(): number {
		return this._dirtIntensity;
	}

	/**
	 * 设置污渍强度。0-1
	 * @param value 污渍强度。
	 */
	set dirtIntensity(value: number) {
		this._dirtIntensity = Math.max(value, 0.0);
	}

	/**
	 * 创建一个 <code>BloomEffect</code> 实例。
	 */
	constructor() {
		super();
		this.singleton = true;
		this.active = true;
		this.intensity = 1.0;
		this.threshold = 1.0;
		this.softKnee = 0.5;
		this.clamp = 65472;
		this.diffusion = 7;
		this.anamorphicRatio = 0;
		this.color = new Color(1.0,1.0,1.0,1.0);

	}

	/**
	 * 添加到后期处理栈时,会调用
	 */
	effectInit() {
		super.effectInit();
		this._shader = Shader3D.find("PostProcessBloom");
		this._pyramid = new Array(BloomEffect.MAXPYRAMIDSIZE * 2);
	}

	/**
	 * 根据后期处理设置cameraDepthTextureMode
	 * @inheritDoc
	 * @override
	 * @returns 
	 */
	getCameraDepthTextureModeFlag() {
		return 0;
	}

	/**
	 * 释放Effect
	 */
	release() {
		super.release();
		this._shader = null;
		this._pyramid = [];
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	render(context: PostProcessRenderContext): void {
		var cmd: CommandBuffer = context.command;
		var viewport: Viewport = context.camera.viewport;

		//应用自动曝光调整纹理
		this._shaderData.setTexture(BloomEffect.SHADERVALUE_AUTOEXPOSURETEX, Texture2D.whiteTexture);

		//获取垂直扭曲和水平扭曲宽高
		var ratio: number = this._anamorphicRatio;
		var rw: number = ratio < 0 ? -ratio : 0;
		var rh: number = ratio > 0 ? ratio : 0;

		//半分辨率模糊,性效比较高
		var tw: number = Math.floor(viewport.width / (2 - rw));
		var th: number = Math.floor(viewport.height / (2 - rh));

		//计算迭代次数
		var s: number = Math.max(tw, th);
		var logs: number;
		logs = Math.log2(s) + this._diffusion - 10;
		var logsInt: number = Math.floor(logs);
		var iterations: number = Math.min(Math.max(logsInt, 1), BloomEffect.MAXPYRAMIDSIZE);
		var sampleScale: number = 0.5 + logs - logsInt;
		this._shaderData.setNumber(BloomEffect.SHADERVALUE_SAMPLESCALE, sampleScale);

		//预过滤参数
		var lthresh: number = Color.gammaToLinearSpace(this.threshold);
		var knee: number = lthresh * this._softKnee + 1e-5;
		this._shaderThreshold.setValue(lthresh, lthresh - knee, knee * 2, 0.25 / knee);
		this._shaderData.setVector(BloomEffect.SHADERVALUE_THRESHOLD, this._shaderThreshold);
		var lclamp: number = Color.gammaToLinearSpace(this.clamp);

		this._shaderParams.setValue(lclamp, 0, 0, 0);
		this._shaderData.setVector(BloomEffect.SHADERVALUE_PARAMS, this._shaderParams);

		var qualityOffset: number = this.fastMode ? 1 : 0;

		// Downsample
		var lastDownTexture: RenderTexture = context.indirectTarget;
		for (var i: number = 0; i < iterations; i++) {
			var downIndex: number = i * 2;
			var upIndex: number = downIndex + 1;
			var subShader: number = i == 0 ? BloomEffect.SUBSHADER_PREFILTER13 + qualityOffset : BloomEffect.SUBSHADER_DOWNSAMPLE13 + qualityOffset;

			var mipDownTexture: RenderTexture = RenderTexture.createFromPool(tw, th, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false, 1);
			mipDownTexture.filterMode = FilterMode.Bilinear;
			this._pyramid[downIndex] = mipDownTexture;

			if (i !== iterations - 1) {
				var mipUpTexture: RenderTexture = RenderTexture.createFromPool(tw, th, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false, 1);
				mipUpTexture.filterMode = FilterMode.Bilinear;
				this._pyramid[upIndex] = mipUpTexture;
			}

			cmd.blitScreenTriangle(lastDownTexture, mipDownTexture, null, this._shader, this._shaderData, subShader);

			lastDownTexture = mipDownTexture;
			tw = Math.max(Math.floor(tw / 2), 1);
			th = Math.max(Math.floor(th / 2), 1);
		}
		// Upsample
		var lastUpTexture: RenderTexture = this._pyramid[(iterations - 1) * 2];//down
		for (i = iterations - 2; i >= 0; i--) {
			downIndex = i * 2;
			upIndex = downIndex + 1;
			mipDownTexture = this._pyramid[downIndex];
			mipUpTexture = this._pyramid[upIndex];
			cmd.setShaderDataTexture(this._shaderData, BloomEffect.SHADERVALUE_BLOOMTEX, mipDownTexture);//通过指令延迟设置
			cmd.blitScreenTriangle(lastUpTexture, mipUpTexture, null, this._shader, this._shaderData, BloomEffect.SUBSHADER_UPSAMPLETENT + qualityOffset);
			lastUpTexture = mipUpTexture;
		}

		var linearColor: Color = this._linearColor;
		this.color.toLinear(linearColor);
		var intensity: number = Math.pow(2, this._intensity / 10.0) - 1.0;
		var shaderSettings: Vector4 = this._shaderSetting;
		this._shaderSetting.setValue(sampleScale, intensity, this._dirtIntensity, iterations);

		//镜头污渍
		//需要保证污渍纹理不变型
		var usedirtTexture = this._dirtTexture ? this._dirtTexture : Texture2D.blackTexture;

		var dirtRatio: number = usedirtTexture.width / usedirtTexture.height;
		var screenRatio: number = viewport.width / viewport.height;
		var dirtTileOffset: Vector4 = this._dirtTileOffset;
		if (dirtRatio > screenRatio)
			dirtTileOffset.setValue(screenRatio / dirtRatio, 1.0, (1.0 - dirtTileOffset.x) * 0.5, 0.0);
		else if (dirtRatio < screenRatio)
			dirtTileOffset.setValue(1.0, dirtRatio / screenRatio, 0.0, (1.0 - dirtTileOffset.y) * 0.5);

		//合成Shader属性
		var compositeShaderData: ShaderData = context.compositeShaderData;
		if (this.fastMode)
			compositeShaderData.addDefine(PostProcess.SHADERDEFINE_BLOOM_LOW);
		else
			compositeShaderData.addDefine(PostProcess.SHADERDEFINE_BLOOM);

		this._bloomTextureTexelSize.setValue(1.0 / lastUpTexture.width, 1.0 / lastUpTexture.height, lastUpTexture.width, lastUpTexture.height);

		compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOM_DIRTTILEOFFSET, dirtTileOffset);
		compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOM_SETTINGS, shaderSettings);
		compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOM_COLOR, new Vector4(linearColor.r, linearColor.g, linearColor.b, linearColor.a));//TODO:需要Color支持
		compositeShaderData.setTexture(PostProcess.SHADERVALUE_BLOOM_DIRTTEX, usedirtTexture);
		compositeShaderData.setTexture(PostProcess.SHADERVALUE_BLOOMTEX, lastUpTexture);
		compositeShaderData.setVector(PostProcess.SHADERVALUE_BLOOMTEX_TEXELSIZE, this._bloomTextureTexelSize);

		let _compositeShader: Shader3D = Shader3D.find("PostProcessComposite");

		cmd.blitScreenTriangle(context.indirectTarget, context.destination, context.camera._screenOffsetScale, _compositeShader, compositeShaderData, 0);


		//释放渲染纹理
		for (i = 0; i < iterations; i++) {
			downIndex = i * 2;
			upIndex = downIndex + 1;
			RenderTexture.recoverToPool(this._pyramid[downIndex]);
			(i !== 0 && i !== iterations - 1) && (RenderTexture.recoverToPool(this._pyramid[upIndex]));//i==0为lastUpTexture,需延迟释放,i==iterations - 1,不存在
		}

		context.deferredReleaseTextures.push(lastUpTexture);//TODO:是否需要改机制
	}

}


