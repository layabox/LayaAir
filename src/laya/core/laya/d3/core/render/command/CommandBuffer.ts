import { SetShaderDataTextureCMD } from "././SetShaderDataTextureCMD";
import { BlitScreenQuadCMD } from "././BlitScreenQuadCMD";
import { SetRenderTargetCMD } from "././SetRenderTargetCMD";
import { Camera } from "../../Camera"
	import { RenderTexture } from "../../../resource/RenderTexture"
	import { Shader3D } from "../../../shader/Shader3D"
	import { ShaderData } from "../../../shader/ShaderData"
	import { LayaGL } from "laya/layagl/LayaGL"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	
	/**
	 * <code>CommandBuffer</code> 类用于创建命令流。
	 */
	export class CommandBuffer {
		/**@private */
		 static _screenShaderData:ShaderData = new ShaderData();
		/** @private */
		 static _screenShader:Shader3D = Shader3D.find("BlitScreen");
		
		/** @private */
		 static SCREENTEXTURE_NAME:string = "u_MainTex";//todo：
		/** @private */
		 static MAINTEXTURE_TEXELSIZE_NAME:string = "u_MainTex_TexelSize";//todo：
		/** @private */
		 static SCREENTEXTURE_ID:number = Shader3D.propertyNameToID(CommandBuffer.SCREENTEXTURE_NAME);//todo：
		/** @private */
		 static MAINTEXTURE_TEXELSIZE_ID:number = Shader3D.propertyNameToID(CommandBuffer.MAINTEXTURE_TEXELSIZE_NAME);//todo：
		
		/**@private */
		 _camera:Camera = null;
		/**@private */
		private _commands:Command[] = [];
		
		/**
		 * 创建一个 <code>CommandBuffer</code> 实例。
		 */
		constructor(){
		
		}
		
		/**
		 *@private
		 */
		 _apply():void {
			for (var i:number = 0, n:number = this._commands.length; i < n; i++)
				this._commands[i].run();
		}
		
		/**
		 *@private
		 */
		 setShaderDataTexture(shaderData:ShaderData, nameID:number, source:BaseTexture):void {
			this._commands.push(SetShaderDataTextureCMD.create(shaderData, nameID, source));
		}
		
		/**
		 * 添加一条通过全屏四边形将源纹理渲染到目标渲染纹理指令。
		 * @param	source 源纹理。
		 * @param	dest  目标纹理。
		 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param	subShader subShader索引,默认值为0。
		 */
		 blitScreenQuad(source:BaseTexture, dest:RenderTexture, shader:Shader3D = null, shaderData:ShaderData = null, subShader:number = 0):void {
			this._commands.push(BlitScreenQuadCMD.create(source, dest, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_QUAD));
		}
		
		/**
		 * 添加一条通过全屏三角形将源纹理渲染到目标渲染纹理指令。
		 * @param	source 源纹理。
		 * @param	dest  目标纹理。
		 * @param	shader 着色器,如果为null使用内部拷贝着色器,不做任何处理。
		 * @param	shaderData 着色器数据,如果为null只接收sourceTexture。
		 * @param	subShader subShader索引,默认值为0。
		 */
		 blitScreenTriangle(source:BaseTexture, dest:RenderTexture, shader:Shader3D = null, shaderData:ShaderData = null, subShader:number = 0):void {
			this._commands.push(BlitScreenQuadCMD.create(source, dest, shader, shaderData, subShader, BlitScreenQuadCMD._SCREENTYPE_TRIANGLE));
		}
		
		/**
		 *@private
		 */
		 setRenderTarget(renderTexture:RenderTexture):void {
			this._commands.push(SetRenderTargetCMD.create(renderTexture));
		}
		
		/**
		 *@private
		 */
		 clear():void {
			for (var i:number = 0, n:number = this._commands.length; i < n; i++)
				this._commands[i].recover();
			this._commands.length = 0;
		}
	
	}


