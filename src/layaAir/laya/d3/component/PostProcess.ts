import { ILaya } from "../../../ILaya"
import { RenderTextureDepthFormat } from "../../resource/RenderTextureFormat"
import { Texture2D } from "../../resource/Texture2D"
import { Camera } from "../core/Camera"
import { CommandBuffer } from "../core/render/command/CommandBuffer"
import { PostProcessEffect } from "../core/render/PostProcessEffect"
import { PostProcessRenderContext } from "../core/render/PostProcessRenderContext"
import { RenderContext3D } from "../core/render/RenderContext3D"
import { RenderTexture } from "../resource/RenderTexture"
import { Shader3D } from "../shader/Shader3D"
import { ShaderData } from "../shader/ShaderData"
import { ShaderDefine } from "../shader/ShaderDefine"
import { Vector4 } from "../math/Vector4"
import { Viewport } from "../math/Viewport"

/**
 * <code>PostProcess</code> 类用于创建后期处理组件。
 */
export class PostProcess {
	/**@internal */
	static SHADERDEFINE_BLOOM_LOW: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_BLOOM: ShaderDefine;
	/**@internal */
	static SHADERDEFINE_FINALPASS: ShaderDefine;
	/**@internal */
	static SHADERVALUE_MAINTEX: number = Shader3D.propertyNameToID("u_MainTex");
	/**@internal */
	static SHADERVALUE_BLOOMTEX: number = Shader3D.propertyNameToID("u_BloomTex");
	/**@internal */
	static SHADERVALUE_AUTOEXPOSURETEX: number = Shader3D.propertyNameToID("u_AutoExposureTex");
	/**@internal */
	static SHADERVALUE_BLOOM_DIRTTEX: number = Shader3D.propertyNameToID("u_Bloom_DirtTex");
	/**@internal */
	static SHADERVALUE_BLOOMTEX_TEXELSIZE: number = Shader3D.propertyNameToID("u_BloomTex_TexelSize");
	/**@internal */
	static SHADERVALUE_BLOOM_DIRTTILEOFFSET: number = Shader3D.propertyNameToID("u_Bloom_DirtTileOffset");
	/**@internal */
	static SHADERVALUE_BLOOM_SETTINGS: number = Shader3D.propertyNameToID("u_Bloom_Settings");
	/**@internal */
	static SHADERVALUE_BLOOM_COLOR: number = Shader3D.propertyNameToID("u_Bloom_Color");

	/**
	 * @internal
	 */
	static __init__(): void {
		PostProcess.SHADERDEFINE_BLOOM_LOW = Shader3D.getDefineByName("BLOOM_LOW");
		PostProcess.SHADERDEFINE_BLOOM = Shader3D.getDefineByName("BLOOM");
		PostProcess.SHADERDEFINE_FINALPASS = Shader3D.getDefineByName("FINALPASS");
	}

	/**@internal */
	private _compositeShader: Shader3D = Shader3D.find("PostProcessComposite");
	/**@internal */
	private _compositeShaderData: ShaderData = new ShaderData();
	/**@internal */
	private _effects: PostProcessEffect[] = [];

	/**@internal */
	_context: PostProcessRenderContext = null;


	/**
	 * 创建一个 <code>PostProcess</code> 实例。
	 */
	constructor() {
		this._context = new PostProcessRenderContext();
		this._context.compositeShaderData = this._compositeShaderData;
	}

	/**
	 *@internal
	 */
	_init(camera: Camera, command: CommandBuffer): void {
		this._context.camera = camera;
		this._context.command = command;
	}

	/**
	 * @internal
	 */
	_render(): void {
		var noteValue: boolean = ShaderData._SET_RUNTIME_VALUE_MODE_REFERENCE_;
		ILaya.Render.supportWebGLPlusRendering && ShaderData.setRuntimeValueMode(false);

		var camera: Camera = this._context.camera;
		var viewport: Viewport = camera.viewport;

		var screenTexture: RenderTexture = RenderTexture.createFromPool(RenderContext3D.clientWidth, RenderContext3D.clientHeight, camera._getRenderTextureFormat(), RenderTextureDepthFormat.DEPTHSTENCIL_NONE);
		var cameraTarget: RenderTexture = camera._internalRenderTexture;
		this._context.command.clear();
		this._context.source = screenTexture;
		this._context.destination = cameraTarget;
		this._context.compositeShaderData.clearDefine();

		this._context.command.blitScreenTriangle(cameraTarget, screenTexture);

		this._context.compositeShaderData.setTexture(PostProcess.SHADERVALUE_AUTOEXPOSURETEX, Texture2D.whiteTexture);//TODO:

		for (var i: number = 0, n: number = this._effects.length; i < n; i++)
			this._effects[i].render(this._context);

		this._compositeShaderData.addDefine(PostProcess.SHADERDEFINE_FINALPASS);
		//dithering.Render(context);

		var offScreenTex: RenderTexture = camera._offScreenRenderTexture;
		var dest: RenderTexture = offScreenTex ? offScreenTex : null;//TODO:如果不画到RenderTarget上,最后一次为null直接画到屏幕上
		this._context.destination = dest;
		var canvasWidth: number = camera._getCanvasWidth(), canvasHeight: number = camera._getCanvasHeight();
		camera._screenOffsetScale.setValue(viewport.x / canvasWidth, viewport.y / canvasHeight, viewport.width / canvasWidth, viewport.height / canvasHeight);
		this._context.command.blitScreenTriangle(this._context.source, dest, camera._screenOffsetScale, this._compositeShader, this._compositeShaderData);

		//context.source = context.destination;
		//context.destination = finalDestination;

		//释放临时纹理
		RenderTexture.recoverToPool(screenTexture);
		var tempRenderTextures: RenderTexture[] = this._context.deferredReleaseTextures;
		for (i = 0, n = tempRenderTextures.length; i < n; i++)
			RenderTexture.recoverToPool(tempRenderTextures[i]);
		tempRenderTextures.length = 0;

		ILaya.Render.supportWebGLPlusRendering && ShaderData.setRuntimeValueMode(noteValue);
	}

	/**
	 * 添加后期处理效果。
	 */
	addEffect(effect: PostProcessEffect): void {
		this._effects.push(effect);
	}

	/**
	 * 移除后期处理效果。
	 */
	removeEffect(effect: PostProcessEffect): void {
		var index: number = this._effects.indexOf(effect);
		if (index !== -1)
			this._effects.splice(index, 1);
	}

}


