import { ILaya3D } from "ILaya3D";
import { LayaGL } from "laya/layagl/LayaGL";
import { BaseTexture } from "laya/resource/BaseTexture";
import { Vector4 } from "../../../math/Vector4";
import { RenderTexture } from "../../../resource/RenderTexture";
import { Shader3D } from "../../../shader/Shader3D";
import { ShaderData } from "../../../shader/ShaderData";
import { ShaderInstance } from "../../../shader/ShaderInstance";
import { ShaderPass } from "../../../shader/ShaderPass";
import { SubShader } from "../../../shader/SubShader";
import { RenderContext3D } from "../RenderContext3D";
import { ScreenQuad } from "../ScreenQuad";
import { ScreenTriangle } from "../ScreenTriangle";
import { Command } from "././Command";
	
	/**
	 * @private
	 * <code>BlitCMD</code> 类用于创建从一张渲染目标输出到另外一张渲染目标指令。
	 */
	export class BlitScreenQuadCMD extends Command {
		/**@private */
		 static _SCREENTYPE_QUAD:number = 0;
		/**@private */
		 static _SCREENTYPE_TRIANGLE:number = 1;
		
		/**@private */
		private static _pool:any[] = [];
		
		/**@private */
		private _source:BaseTexture = null;
		/**@private */
		private _dest:RenderTexture = null;
		/**@private */
		private _shader:Shader3D = null;
		/**@private */
		private _shaderData:ShaderData = null;
		/**@private */
		private _subShader:number = 0;
		/**@private */
		private _sourceTexelSize:Vector4 = new Vector4();
		/**@private */
		private _screenType:number = 0;
		
		/**
		 * @private
		 */
		 static create(source:BaseTexture, dest:RenderTexture, shader:Shader3D = null, shaderData:ShaderData = null, subShader:number = 0, screenType:number = BlitScreenQuadCMD._SCREENTYPE_QUAD):BlitScreenQuadCMD {
			var cmd:BlitScreenQuadCMD;
			cmd = BlitScreenQuadCMD._pool.length > 0 ? BlitScreenQuadCMD._pool.pop() : new BlitScreenQuadCMD();
			cmd._source = source;
			cmd._dest = dest;
			cmd._shader = shader;
			cmd._shaderData = shaderData;
			cmd._subShader = subShader;
			cmd._screenType = screenType;
			return cmd;
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  run():void {//TODO:相机的UV
			var shader:Shader3D = this._shader || ILaya3D.CommandBuffer._screenShader;
			var shaderData:ShaderData = this._shaderData || ILaya3D.CommandBuffer._screenShaderData;
			var dest:RenderTexture = this._dest;
			
			LayaGL.instance.viewport(0, 0, dest ? dest.width : RenderContext3D.clientWidth, dest ? dest.height : RenderContext3D.clientHeight);//TODO:是否在此
			
			//TODO:优化
			shaderData.setTexture(ILaya3D.CommandBuffer.SCREENTEXTURE_ID, this._source);
			this._sourceTexelSize.setValue(1.0 / this._source.width, 1.0 / this._source.height, this._source.width, this._source.height);
			shaderData.setVector(ILaya3D.CommandBuffer.MAINTEXTURE_TEXELSIZE_ID, this._sourceTexelSize);
			
			(dest) && (dest._start());
			var subShader:SubShader = shader.getSubShaderAt(this._subShader);
			var passes:ShaderPass[] = subShader._passes;
			for (var i:number = 0, n:number = passes.length; i < n; i++) {
				var shaderPass:ShaderInstance = passes[i].withCompile(0, 0, shaderData._defineValue);//TODO:define处理
				shaderPass.bind();
				shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, shaderData, true);//TODO:最后一个参数处理
				shaderPass.uploadRenderStateBlendDepth(shaderData);
				shaderPass.uploadRenderStateFrontFace(shaderData,false, null);//TODO: //利用UV翻转,无需设置为true
				switch (this._screenType) {
				case BlitScreenQuadCMD._SCREENTYPE_QUAD: 
					dest ? ScreenQuad.instance.renderInvertUV() : ScreenQuad.instance.render();
					break;
				case BlitScreenQuadCMD._SCREENTYPE_TRIANGLE: 
					dest ? ScreenTriangle.instance.renderInvertUV() : ScreenTriangle.instance.render();
					break;
					throw "BlitScreenQuadCMD:unknown screen Type.";
				}
			}
			(dest) && (dest._end());
		}
		
		/**
		 * @inheritDoc
		 */
		/*override*/  recover():void {
			BlitScreenQuadCMD._pool.push(this);
			this._dest = null;
			this._shader = null;
			this._shaderData = null;
			super.recover();
		}
	
	}


