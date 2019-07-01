import { ILaya } from "../../ILaya";

	export class WebGLContext
	{		
		/**@private */
		 static mainContext:WebGLContext = null;
		
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
		 static useProgram(gl:WebGLContext,program:any):boolean{
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
		 static setDepthTest(gl:WebGLContext, value:boolean):void{
			value !== WebGLContext._depthTest && (WebGLContext._depthTest=value, value?gl.enable(WebGL2RenderingContext.DEPTH_TEST):gl.disable(WebGL2RenderingContext.DEPTH_TEST));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthMask(gl:WebGLContext, value:boolean):void{
			value !== WebGLContext._depthMask && (WebGLContext._depthMask=value, gl.depthMask(value));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthFunc(gl:WebGLContext, value:number):void{
			value !== WebGLContext._depthFunc && (WebGLContext._depthFunc=value, gl.depthFunc(value));
		}
		
		/**
		 * @private
		 */
		 static setBlend(gl:WebGLContext, value:boolean):void{
			value !== WebGLContext._blend && (WebGLContext._blend=value, value?gl.enable(WebGL2RenderingContext.BLEND):gl.disable(WebGL2RenderingContext.BLEND));
		}
		
		/**
		 * @private
		 */
		 static setBlendFunc(gl:WebGLContext, sFactor:number, dFactor:number):void{
			(sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor =WebGLContext._srcAlpha= sFactor, WebGLContext._dFactor =WebGLContext._dstAlpha= dFactor, gl.blendFunc(sFactor, dFactor));
		}
		
		/**
		 * @private
		 */
		 static setBlendFuncSeperate(gl:WebGLContext, srcRGB:number, dstRGB:number, srcAlpha:number, dstAlpha:number):void{
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
		 static setCullFace(gl:WebGLContext, value:boolean):void{
			 value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value?gl.enable(WebGL2RenderingContext.CULL_FACE):gl.disable(WebGL2RenderingContext.CULL_FACE));
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setFrontFace(gl:WebGLContext, value:number):void{
			value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
		}
		
		
		/**
		 * @private
		 */
		 static activeTexture(gl:WebGLContext, textureID:number):void{
			if (WebGLContext._activedTextureID !== textureID) {
				gl.activeTexture(textureID);	
				WebGLContext._activedTextureID = textureID;
			}
		}
		
		/**
		 * @private
		 */
		 static bindTexture(gl:WebGLContext, target:any, texture:any):void {
			if (WebGLContext._activeTextures[WebGLContext._activedTextureID-WebGL2RenderingContext.TEXTURE0] !== texture){
				gl.bindTexture(target, texture);
				WebGLContext._activeTextures[WebGLContext._activedTextureID-WebGL2RenderingContext.TEXTURE0] = texture;
			}
		}
		

	
		 getContextAttributes():any{return null;}
		
		 isContextLost():void{}
		
		 getSupportedExtensions():any{return null;}
		
		 getExtension(name:string):any{return null;}
		
		 activeTexture(texture:any):void{}
		
		 attachShader(program:any, shader:any):void{}
		
		 bindAttribLocation(program:any, index:number, name:string):void{}
		
		 bindBuffer(target:any, buffer:any):void{}
		
		 bindFramebuffer(target:any, framebuffer:any):void{}
		
		 bindRenderbuffer(target:any, renderbuffer:any):void{}
		
		 bindTexture(target:any, texture:any):void { }
		
		 useTexture(value:boolean):void{}
		
		 blendColor(red:any, green:any, blue:any, alpha:number):void{}
		
		 blendEquation(mode:any):void{}
		
		 blendEquationSeparate(modeRGB:any, modeAlpha:any):void{}
		
		 blendFunc(sfactor:any, dfactor:any):void{}
		
		 blendFuncSeparate(srcRGB:any, dstRGB:any, srcAlpha:any, dstAlpha:any):void{}
		
		 bufferData(target:any, size:any, usage:any):void{}
		
		 bufferSubData(target:any, offset:number, data:any):void{}
		
		 checkFramebufferStatus(target:any):any{ return null; }
		
		 clear(mask:number):void{}
		
		 clearColor(red:any, green:any, blue:any, alpha:number):void{}
		
		 clearDepth(depth:any):void{}
		
		 clearStencil(s:any):void{}
		
		 colorMask(red:boolean, green:boolean, blue:boolean, alpha:boolean):void{}
		
		 compileShader(shader:any):void{}
		
		 copyTexImage2D(target:any, level:any, internalformat:any, x:number, y:number, width:number, height:number, border:any):void{}
		
		 copyTexSubImage2D(target:any, level:any, xoffset:number, yoffset:number, x:number, y:number, width:number, height:number):void{}
		
		 createBuffer():any{}
		
		 createFramebuffer():any{}
		
		 createProgram():any{}
		
		 createRenderbuffer():any{}
		
		 createShader(type:any):any{}
		
		 createTexture():any{return null}
		
		 cullFace(mode:any):void{}
		
		 deleteBuffer(buffer:any):void{}
		
		 deleteFramebuffer(framebuffer:any):void{}
		
		 deleteProgram(program:any):void{}
		
		 deleteRenderbuffer(renderbuffer:any):void{}
		
		 deleteShader(shader:any):void{}
		
		 deleteTexture(texture:any):void{}
		
		 depthFunc(func:any):void{}
		
		 depthMask(flag:any):void{}
		
		 depthRange(zNear:any, zFar:any):void{}
		
		 detachShader(program:any, shader:any):void{}
		
		 disable(cap:any):void{}
		
		 disableVertexAttribArray(index:number):void{}
		
		 drawArrays(mode:any, first:number, count:number):void{}
		
		 drawElements(mode:any, count:number, type:any, offset:number):void{}
		
		 enable(cap:any):void{}
		
		 enableVertexAttribArray(index:number):void{}
		
		 finish():void{}
		
		 flush():void{}
		
		 framebufferRenderbuffer(target:any, attachment:any, renderbuffertarget:any, renderbuffer:any):void{}
		
		 framebufferTexture2D(target:any, attachment:any, textarget:any, texture:any, level:any):void{}
		
		 frontFace(mode:any):any{return null;}
		
		 generateMipmap(target:any):any{return null;}
		
		 getActiveAttrib(program:any, index:number):any{return null;}
		
		 getActiveUniform(program:any, index:number):any{return null;}
		
		 getAttribLocation(program:any, name:string):any{return 0;}
		
		 getParameter(pname:any):any{return null;}
		
		 getBufferParameter(target:any, pname:any):any{return null;}
		
		 getError():any{return null;}
		
		 getFramebufferAttachmentParameter(target:any, attachment:any, pname:any):void{}
		
		 getProgramParameter(program:any, pname:any):number{return 0;}
		
		 getProgramInfoLog(program:any):any{return null;}
		
		 getRenderbufferParameter(target:any, pname:any):any{return null; }
	
		 getShaderPrecisionFormat(...arg):any{return null; }
		
		 getShaderParameter(shader:any, pname:any):any{}
		
		 getShaderInfoLog(shader:any):any{return null;}
		
		 getShaderSource(shader:any):any{return null;}
		
		 getTexParameter(target:any, pname:any):void{}
		
		 getUniform(program:any, location:number):void{}
		
		 getUniformLocation(program:any, name:string):any{return null;}
		
		 getVertexAttrib(index:number, pname:any):any{return null;}
		
		 getVertexAttribOffset(index:number, pname:any):any{return null;}
		
		 hint(target:any, mode:any):void{}
		
		 isBuffer(buffer:any):void{}
		
		 isEnabled(cap:any):void{}
		
		 isFramebuffer(framebuffer:any):void{}
		
		 isProgram(program:any):void{}
		
		 isRenderbuffer(renderbuffer:any):void{}
		
		 isShader(shader:any):void{}
		
		 isTexture(texture:any):void{}
		
		 lineWidth(width:number):void{}
		
		 linkProgram(program:any):void{}
		
		 pixelStorei(pname:any, param:any):void{}
		
		 polygonOffset(factor:any, units:any):void{}
		
		 readPixels(x:number, y:number, width:number, height:number, format:any, type:any, pixels:any):void{}
		
		 renderbufferStorage(target:any, internalformat:any, width:number, height:number):void{}
		
		 sampleCoverage(value:any, invert:any):void{}
		
		 scissor(x:number, y:number, width:number, height:number):void{}
		
		 shaderSource(shader:any, source:any):void{}
		
		 stencilFunc(func:number, ref:number, mask:number):void{}
		
		 stencilFuncSeparate(face:number, func:number, ref:number, mask:number):void{}
		
		 stencilMask(mask:any):void{}
		
		 stencilMaskSeparate(face:any, mask:any):void{}
		
		 stencilOp(fail:number, zfail:number, zpass:number):void{}
		
		 stencilOpSeparate(face:number, fail:number, zfail:number, zpass:number):void{}
		
		 texImage2D(... args):void{}
		
		 texParameterf(target:any, pname:any, param:any):void{}
		
		 texParameteri(target:any, pname:any, param:any):void{}
		
		 texSubImage2D(... args):void{}
		
		 uniform1f(location:any, x:number):void{}
		
		 uniform1fv(location:any, v:any):void{}
		
		 uniform1i(location:any, x:number):void{}
		
		 uniform1iv(location:any, v:any):void{}
		
		 uniform2f(location:any, x:number, y:number):void{}
		
		 uniform2fv(location:any, v:any):void{}
		
		 uniform2i(location:any, x:number, y:number):void{}
		
		 uniform2iv(location:any, v:any):void{}
		
		 uniform3f(location:any, x:number, y:number, z:number):void{}
		
		 uniform3fv(location:any, v:any):void{}
		
		 uniform3i(location:any, x:number, y:number, z:number):void{}
		
		 uniform3iv(location:any, v:any):void{}
		
		 uniform4f(location:any, x:number, y:number, z:number, w:number):void{}
		
		 uniform4fv(location:any, v:any):void{}
		
		 uniform4i(location:any, x:number, y:number, z:number, w:number):void{}
		
		 uniform4iv(location:any, v:any):void{}
		
		 uniformMatrix2fv(location:any, transpose:any, value:any):void{}
		
		 uniformMatrix3fv(location:any, transpose:any, value:any):void{}
		
		 uniformMatrix4fv(location:any, transpose:any, value:any):void{}
		
		 useProgram(program:any):void{}
		
		 validateProgram(program:any):void{}
		
		 vertexAttrib1f(indx:any, x:number):void{}
		
		 vertexAttrib1fv(indx:any, values:any):void{}
		
		 vertexAttrib2f(indx:any, x:number, y:number):void{}
		
		 vertexAttrib2fv(indx:any, values:any):void{}
		
		 vertexAttrib3f(indx:any, x:number, y:number, z:number):void{}
		
		 vertexAttrib3fv(indx:any, values:any):void{}
		
		 vertexAttrib4f(indx:any, x:number, y:number, z:number, w:number):void{}
		
		 vertexAttrib4fv(indx:any, values:any):void{}
		
		 vertexAttribPointer(indx:any, size:any, type:any, normalized:any, stride:any, offset:number):void{}
		
		 viewport(x:number, y:number, width:number, height:number):void { }
		
		 configureBackBuffer(width:number, height:number, antiAlias:number, enableDepthAndStencil:boolean = true, wantsBestResolution:boolean = false):void{}/*;*/
		
		 compressedTexImage2D(... args):void{}
		
		
		
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
		 static useProgramForNative(gl:WebGLContext,program:any):boolean{
			gl.useProgram(program);
			return true;
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthTestForNative(gl:WebGLContext, value:boolean):void{
			if (value)gl.enable(WebGL2RenderingContext.DEPTH_TEST);
			else gl.disable(WebGL2RenderingContext.DEPTH_TEST);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthMaskForNative(gl:WebGLContext, value:boolean):void{
			gl.depthMask(value);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setDepthFuncForNative(gl:WebGLContext, value:number):void{
			gl.depthFunc(value);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setBlendForNative(gl:WebGLContext, value:boolean):void{
			if (value) gl.enable(WebGL2RenderingContext.BLEND);
			else gl.disable(WebGL2RenderingContext.BLEND);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setBlendFuncForNative(gl:WebGLContext, sFactor:number, dFactor:number):void{
			gl.blendFunc(sFactor, dFactor);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setCullFaceForNative(gl:WebGLContext, value:boolean):void{
			 if (value) gl.enable(WebGL2RenderingContext.CULL_FACE)
			 else gl.disable(WebGL2RenderingContext.CULL_FACE);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static setFrontFaceForNative(gl:WebGLContext, value:number):void{
			gl.frontFace(value);
		}
		
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static activeTextureForNative(gl:WebGLContext, textureID:number):void{
			gl.activeTexture(textureID);
		}
		
		/**
		 * @private
		 */
		//TODO:coverage
		 static bindTextureForNative(gl:WebGLContext, target:any, texture:any):void {
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


