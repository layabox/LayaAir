import { Camera } from "../core/Camera"
	import { PostProcessEffect } from "../core/render/PostProcessEffect"
	import { PostProcessRenderContext } from "../core/render/PostProcessRenderContext"
	import { RenderContext3D } from "../core/render/RenderContext3D"
	import { CommandBuffer } from "../core/render/command/CommandBuffer"
	import { RenderTexture } from "../resource/RenderTexture"
	import { Shader3D } from "../shader/Shader3D"
	import { ShaderData } from "../shader/ShaderData"
	import { ShaderDefines } from "../shader/ShaderDefines"
	import { BaseTexture } from "../../resource/BaseTexture"
	import { Texture2D } from "../../resource/Texture2D"
	
	/**
	 * <code>PostProcess</code> 类用于创建后期处理组件。
	 */
	export class PostProcess {
		/**@private */
		 static SHADERDEFINE_BLOOM_LOW:number;
		/**@private */
		 static SHADERDEFINE_BLOOM:number;
		/**@private */
		 static SHADERDEFINE_FINALPASS:number;
		/**@private */
		 static SHADERVALUE_MAINTEX:number = Shader3D.propertyNameToID("u_MainTex");
		/**@private */
		 static SHADERVALUE_BLOOMTEX:number = Shader3D.propertyNameToID("u_BloomTex");
		/**@private */
		 static SHADERVALUE_AUTOEXPOSURETEX:number = Shader3D.propertyNameToID("u_AutoExposureTex");
		/**@private */
		 static SHADERVALUE_BLOOM_DIRTTEX:number = Shader3D.propertyNameToID("u_Bloom_DirtTex");
		/**@private */
		 static SHADERVALUE_BLOOMTEX_TEXELSIZE:number = Shader3D.propertyNameToID("u_BloomTex_TexelSize");
		/**@private */
		 static SHADERVALUE_BLOOM_DIRTTILEOFFSET:number = Shader3D.propertyNameToID("u_Bloom_DirtTileOffset");
		/**@private */
		 static SHADERVALUE_BLOOM_SETTINGS:number = Shader3D.propertyNameToID("u_Bloom_Settings");
		/**@private */
		 static SHADERVALUE_BLOOM_COLOR:number = Shader3D.propertyNameToID("u_Bloom_Color");
		
		/**@private */
		 static shaderDefines:ShaderDefines = new ShaderDefines();
		
		/**
		 * @private
		 */
		 static __init__():void {
			PostProcess.SHADERDEFINE_BLOOM_LOW = PostProcess.shaderDefines.registerDefine("BLOOM_LOW");
			PostProcess.SHADERDEFINE_BLOOM = PostProcess.shaderDefines.registerDefine("BLOOM");
			PostProcess.SHADERDEFINE_FINALPASS = PostProcess.shaderDefines.registerDefine("FINALPASS");
		}
		
		/**@private */
		private _compositeShader:Shader3D = Shader3D.find("PostProcessComposite");
		/**@private */
		private _compositeShaderData:ShaderData = new ShaderData();
		/**@private */
		 _context:PostProcessRenderContext = null;
		/**@private */
		private _effects:PostProcessEffect[] = [];
		
		/**
		 * 创建一个 <code>PostProcess</code> 实例。
		 */
		constructor(){
			this._context = new PostProcessRenderContext();
			this._context.compositeShaderData = this._compositeShaderData;
		}
		
		/**
		 *@private
		 */
		 _init(camera:Camera, command:CommandBuffer):void {
			this._context.camera = camera;
			this._context.command = command;
		}
		
		/**
		 * @private
		 */
		 _render():void {
			var camera:Camera = this._context.camera;
			
			var screenTexture:RenderTexture = RenderTexture.createFromPool(RenderContext3D.clientWidth, RenderContext3D.clientHeight, camera._getRenderTextureFormat(), BaseTexture.FORMAT_DEPTHSTENCIL_NONE);
			var cameraTarget:RenderTexture = camera._renderTexture;
			this._context.command.clear();
			this._context.source = screenTexture;
			this._context.destination = cameraTarget;
			this._context.compositeShaderData.clearDefine();
			
			this._context.command.blitScreenTriangle(cameraTarget, screenTexture);
			
			this._context.compositeShaderData.setTexture(PostProcess.SHADERVALUE_AUTOEXPOSURETEX, Texture2D.whiteTexture);//TODO:
			
			for (var i:number = 0, n:number = this._effects.length; i < n; i++)
				this._effects[i].render(this._context);
			
			this._compositeShaderData.addDefine(PostProcess.SHADERDEFINE_FINALPASS);
			//dithering.Render(context);
			
			var offScreenTexture:RenderTexture = camera.renderTarget;
			var dest:RenderTexture = offScreenTexture ? offScreenTexture : null;//TODO:如果不画到RenderTarget上,最后一次为null直接画到屏幕上
			this._context.destination = dest;
			this._context.command.blitScreenTriangle(this._context.source, dest, this._compositeShader, this._compositeShaderData);
			
			//context.source = context.destination;
			//context.destination = finalDestination;
			
			//释放临时纹理
			RenderTexture.recoverToPool(screenTexture);
			var tempRenderTextures:RenderTexture[] = this._context.deferredReleaseTextures;
			for (i = 0, n = tempRenderTextures.length; i < n; i++)
				RenderTexture.recoverToPool(tempRenderTextures[i]);
			tempRenderTextures.length = 0;
		}
		
		/**
		 * 添加后期处理效果。
		 */
		 addEffect(effect:PostProcessEffect):void {
			this._effects.push(effect);
		}
		
		/**
		 * 移除后期处理效果。
		 */
		 removeEffect(effect:PostProcessEffect):void {
			var index:number = this._effects.indexOf(effect);
			if (index !== -1)
				this._effects.splice(index, 1);
		}
	
	}


