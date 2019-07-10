import { ILaya } from "../../ILaya";

export class WebGLContext {
	/**@private */
	static mainContext: WebGLRenderingContext = null;

	/**@internal */
	static _activeTextures: any[] = new Array(8);
	/**@internal */
	static _glTextureIDs: any[] = [WebGLRenderingContext.TEXTURE0, WebGLRenderingContext.TEXTURE1, WebGLRenderingContext.TEXTURE2, WebGLRenderingContext.TEXTURE3, WebGLRenderingContext.TEXTURE4, WebGLRenderingContext.TEXTURE5, WebGLRenderingContext.TEXTURE6, WebGLRenderingContext.TEXTURE7];
	/**@internal */
	static _useProgram: any = null;
	/**@internal */
	static _depthTest: boolean = true;
	/**@internal */
	static _depthMask: boolean = true;
	/**@internal */
	static _depthFunc: number = WebGLRenderingContext.LESS;

	/**@internal */
	static _blend: boolean = false;
	/**@internal */
	static _sFactor: number = WebGLRenderingContext.ONE;//待确认
	/**@internal */
	static _dFactor: number = WebGLRenderingContext.ZERO;//待确认
	/**@internal */
	static _srcAlpha: number = WebGLRenderingContext.ONE;//待确认
	/**@internal */
	static _dstAlpha: number = WebGLRenderingContext.ZERO;//待确认

	/**@internal */
	static _cullFace: boolean = false;
	/**@internal */
	static _frontFace: number = WebGLRenderingContext.CCW;
	/**@internal */
	static _activedTextureID: number = WebGLRenderingContext.TEXTURE0;//默认激活纹理区为0



	/**
	 * @private
	 */
	static useProgram(gl: WebGLRenderingContext, program: any): boolean {
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
	static setDepthTest(gl: WebGLRenderingContext, value: boolean): void {
		value !== WebGLContext._depthTest && (WebGLContext._depthTest = value, value ? gl.enable(WebGLRenderingContext.DEPTH_TEST) : gl.disable(WebGLRenderingContext.DEPTH_TEST));
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setDepthMask(gl: WebGLRenderingContext, value: boolean): void {
		value !== WebGLContext._depthMask && (WebGLContext._depthMask = value, gl.depthMask(value));
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setDepthFunc(gl: WebGLRenderingContext, value: number): void {
		value !== WebGLContext._depthFunc && (WebGLContext._depthFunc = value, gl.depthFunc(value));
	}

	/**
	 * @private
	 */
	static setBlend(gl: WebGLRenderingContext, value: boolean): void {
		value !== WebGLContext._blend && (WebGLContext._blend = value, value ? gl.enable(WebGLRenderingContext.BLEND) : gl.disable(WebGLRenderingContext.BLEND));
	}

	/**
	 * @private
	 */
	static setBlendFunc(gl: WebGLRenderingContext, sFactor: number, dFactor: number): void {
		(sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor = WebGLContext._srcAlpha = sFactor, WebGLContext._dFactor = WebGLContext._dstAlpha = dFactor, gl.blendFunc(sFactor, dFactor));
	}

	/**
	 * @private
	 */
	static setBlendFuncSeperate(gl: WebGLRenderingContext, srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void {
		if (srcRGB !== WebGLContext._sFactor || dstRGB !== WebGLContext._dFactor || srcAlpha !== WebGLContext._srcAlpha || dstAlpha !== WebGLContext._dstAlpha) {
			WebGLContext._sFactor = srcRGB;
			WebGLContext._dFactor = dstRGB;
			WebGLContext._srcAlpha = srcAlpha;
			WebGLContext._dstAlpha = dstAlpha;
			gl.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
		}
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setCullFace(gl: WebGLRenderingContext, value: boolean): void {
		value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value ? gl.enable(WebGLRenderingContext.CULL_FACE) : gl.disable(WebGLRenderingContext.CULL_FACE));
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setFrontFace(gl: WebGLRenderingContext, value: number): void {
		value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
	}


	/**
	 * @private
	 */
	static activeTexture(gl: WebGLRenderingContext, textureID: number): void {
		if (WebGLContext._activedTextureID !== textureID) {
			gl.activeTexture(textureID);
			WebGLContext._activedTextureID = textureID;
		}
	}

	/**
	 * @private
	 */
	static bindTexture(gl: WebGLRenderingContext, target: any, texture: any): void {
		if (WebGLContext._activeTextures[WebGLContext._activedTextureID - WebGLRenderingContext.TEXTURE0] !== texture) {
			gl.bindTexture(target, texture);
			WebGLContext._activeTextures[WebGLContext._activedTextureID - WebGLRenderingContext.TEXTURE0] = texture;
		}
	}

	//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

	/**
	 * @private
	 */
	static __init_native(): void {
		if (!ILaya.Render.supportWebGLPlusRendering) return;
		var webGLContext: any = WebGLContext;
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
	static useProgramForNative(gl: WebGLRenderingContext, program: any): boolean {
		gl.useProgram(program);
		return true;
	}


	/**
	 * @private
	 */
	//TODO:coverage
	static setDepthTestForNative(gl: WebGLRenderingContext, value: boolean): void {
		if (value) gl.enable(WebGLRenderingContext.DEPTH_TEST);
		else gl.disable(WebGLRenderingContext.DEPTH_TEST);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setDepthMaskForNative(gl: WebGLRenderingContext, value: boolean): void {
		gl.depthMask(value);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setDepthFuncForNative(gl: WebGLRenderingContext, value: number): void {
		gl.depthFunc(value);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setBlendForNative(gl: WebGLRenderingContext, value: boolean): void {
		if (value) gl.enable(WebGLRenderingContext.BLEND);
		else gl.disable(WebGLRenderingContext.BLEND);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setBlendFuncForNative(gl: WebGLRenderingContext, sFactor: number, dFactor: number): void {
		gl.blendFunc(sFactor, dFactor);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setCullFaceForNative(gl: WebGLRenderingContext, value: boolean): void {
		if (value) gl.enable(WebGLRenderingContext.CULL_FACE)
		else gl.disable(WebGLRenderingContext.CULL_FACE);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static setFrontFaceForNative(gl: WebGLRenderingContext, value: number): void {
		gl.frontFace(value);
	}


	/**
	 * @private
	 */
	//TODO:coverage
	static activeTextureForNative(gl: WebGLRenderingContext, textureID: number): void {
		gl.activeTexture(textureID);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static bindTextureForNative(gl: WebGLRenderingContext, target: any, texture: any): void {
		gl.bindTexture(target, texture);
	}

	/**
	 * @private
	 */
	//TODO:coverage
	static bindVertexArrayForNative(gl: WebGLContext, vertexArray: any): void {
		(gl as any).bindVertexArray(vertexArray);
	}

}


