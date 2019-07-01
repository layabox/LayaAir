import { ILaya } from "../../ILaya";

	export class WebGLContext
	{		
		/**@private */
		 static mainContext:WebGL2RenderingContext = null;
		
		/**@internal */
		 static _activeTextures:any[] = new Array(8);
		/**@internal */
		 static _glTextureIDs:any[] =  [WebGL2RenderingContext.TEXTURE0, WebGL2RenderingContext.TEXTURE1, WebGL2RenderingContext.TEXTURE2, WebGL2RenderingContext.TEXTURE3, WebGL2RenderingContext.TEXTURE4, WebGL2RenderingContext.TEXTURE5, WebGL2RenderingContext.TEXTURE6, WebGL2RenderingContext.TEXTURE7];
		/**@internal */
		 static _useProgram:any = null;
		/**@internal */
		 static _depthTest:boolean = true;
		/**@internal */
		 static _depthMask:boolean = true;
		/**@internal */
		 static _depthFunc:number = WebGL2RenderingContext.LESS; 
	
		/**@internal */
		 static _blend:boolean = false;
		/**@internal */
		 static _sFactor:number = WebGL2RenderingContext.ONE;//待确认
		/**@internal */
		 static _dFactor:number = WebGL2RenderingContext.ZERO;//待确认
		/**@internal */
		 static _srcAlpha:number = WebGL2RenderingContext.ONE;//待确认
		/**@internal */
		 static _dstAlpha:number =WebGL2RenderingContext.ZERO;//待确认
		
		/**@internal */
		 static _cullFace:boolean = false;
		/**@internal */
		 static _frontFace:number = WebGL2RenderingContext.CCW;
		/**@internal */
		 static _activedTextureID:number = WebGL2RenderingContext.TEXTURE0;//默认激活纹理区为0
		
		
		
		/**
		 * @private
		 */
		 static useProgram(gl:WebGL2RenderingContext,program:any):boolean{
			if (WebGLContext._useProgram === program) 
				return false;
			gl.useProgram(program);
			WebGLContext._useProgram = program;
			return true;
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthTest(gl:WebGL2RenderingContext, value:boolean):void{
			value !== WebGLContext._depthTest && (WebGLContext._depthTest=value, value?gl.enable(WebGL2RenderingContext.DEPTH_TEST):gl.disable(WebGL2RenderingContext.DEPTH_TEST));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthMask(gl:WebGL2RenderingContext, value:boolean):void{
			value !== WebGLContext._depthMask && (WebGLContext._depthMask=value, gl.depthMask(value));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthFunc(gl:WebGL2RenderingContext, value:number):void{
			value !== WebGLContext._depthFunc && (WebGLContext._depthFunc=value, gl.depthFunc(value));
		}
		
		/**
		 * @private
		 */
		 static setBlend(gl:WebGL2RenderingContext, value:boolean):void{
			value !== WebGLContext._blend && (WebGLContext._blend=value, value?gl.enable(WebGL2RenderingContext.BLEND):gl.disable(WebGL2RenderingContext.BLEND));
		}
		
		/**
		 * @private
		 */
		 static setBlendFunc(gl:WebGL2RenderingContext, sFactor:number, dFactor:number):void{
			(sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor =WebGLContext._srcAlpha= sFactor, WebGLContext._dFactor =WebGLContext._dstAlpha= dFactor, gl.blendFunc(sFactor, dFactor));
		}
		
		/**
		 * @private
		 */
		 static setBlendFuncSeperate(gl:WebGL2RenderingContext, srcRGB:number, dstRGB:number, srcAlpha:number, dstAlpha:number):void{
			if (srcRGB !== WebGLContext._sFactor || dstRGB !== WebGLContext._dFactor || srcAlpha !== WebGLContext._srcAlpha || dstAlpha !== WebGLContext._dstAlpha){
				WebGLContext._sFactor = srcRGB;
				WebGLContext._dFactor = dstRGB;
				WebGLContext._srcAlpha = srcAlpha;
				WebGLContext._dstAlpha = dstAlpha;
				gl.blendFuncSeparate(srcRGB, dstRGB,srcAlpha,dstAlpha);
			}
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setCullFace(gl:WebGL2RenderingContext, value:boolean):void{
			 value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value?gl.enable(WebGL2RenderingContext.CULL_FACE):gl.disable(WebGL2RenderingContext.CULL_FACE));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setFrontFace(gl:WebGL2RenderingContext, value:number):void{
			value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
		}
		
		
		/**
		 * @private
		 */
		 static activeTexture(gl:WebGL2RenderingContext, textureID:number):void{
			if (WebGLContext._activedTextureID !== textureID) {
				gl.activeTexture(textureID);	
				WebGLContext._activedTextureID = textureID;
			}
		}
		
		/**
		 * @private
		 */
		 static bindTexture(gl:WebGL2RenderingContext, target:any, texture:any):void {
			if (WebGLContext._activeTextures[WebGLContext._activedTextureID-WebGL2RenderingContext.TEXTURE0] !== texture){
				gl.bindTexture(target, texture);
				WebGLContext._activeTextures[WebGLContext._activedTextureID-WebGL2RenderingContext.TEXTURE0] = texture;
			}
		}
		
		//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
		
		/**
		 * @private
		 */
		 static __init_native():void
		{
			if (!ILaya.Render.supportWebGLPlusRendering) return;
			var webGLContext:any= WebGLContext;
			webGLContext.activeTexture = webGLContext.activeTextureForNative;
			webGLContext.bindTexture = webGLContext.bindTextureForNative;
			/*webGLContext.useProgram = webGLContext.useProgramForNative;
			webGLContext.bindVertexArray = webGLContext.bindVertexArrayForNative;
			webGLContext.setDepthTest = webGLContext.setDepthTestForNative;
			webGLContext.setDepthMask = webGLContext.setDepthMaskForNative;
			webGLContext.setDepthFunc = webGLContext.setDepthFuncForNative;
			webGLContext.setBlend = webGLContext.setBlendForNative;
			webGLContext.setBlendFunc = webGLContext.setBlendFuncForNative;
			webGLContext.setCullFace = webGLContext.setCullFaceForNative;
			webGLContext.setFrontFace = webGLContext.setFrontFaceForNative;*/
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static useProgramForNative(gl:WebGL2RenderingContext,program:any):boolean{
			gl.useProgram(program);
			return true;
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthTestForNative(gl:WebGL2RenderingContext, value:boolean):void{
			if (value)gl.enable(WebGL2RenderingContext.DEPTH_TEST);
			else gl.disable(WebGL2RenderingContext.DEPTH_TEST);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthMaskForNative(gl:WebGL2RenderingContext, value:boolean):void{
			gl.depthMask(value);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthFuncForNative(gl:WebGL2RenderingContext, value:number):void{
			gl.depthFunc(value);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setBlendForNative(gl:WebGL2RenderingContext, value:boolean):void{
			if (value) gl.enable(WebGL2RenderingContext.BLEND);
			else gl.disable(WebGL2RenderingContext.BLEND);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setBlendFuncForNative(gl:WebGL2RenderingContext, sFactor:number, dFactor:number):void{
			gl.blendFunc(sFactor, dFactor);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setCullFaceForNative(gl:WebGL2RenderingContext, value:boolean):void{
			 if (value) gl.enable(WebGL2RenderingContext.CULL_FACE)
			 else gl.disable(WebGL2RenderingContext.CULL_FACE);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setFrontFaceForNative(gl:WebGL2RenderingContext, value:number):void{
			gl.frontFace(value);
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static activeTextureForNative(gl:WebGL2RenderingContext, textureID:number):void{
			gl.activeTexture(textureID);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static bindTextureForNative(gl:WebGL2RenderingContext, target:any, texture:any):void {
			gl.bindTexture(target, texture);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static bindVertexArrayForNative(gl:WebGLContext, vertexArray:any):void {
			(gl as any).bindVertexArray(vertexArray);
		}
		
	}


