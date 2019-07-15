import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";

export class WebGLContext {
	/**@private */
	static mainContext: WebGLRenderingContext = null;

	/**@internal */
	static _activeTextures: any[] = new Array(8);
	/**@internal */
	static _glTextureIDs: any[];
	/**@internal */
	static _useProgram: any = null;
	/**@internal */
	static _depthTest: boolean = true;
	/**@internal */
	static _depthMask: boolean = true;
	/**@internal */
	static _depthFunc: number;

	/**@internal */
	static _blend: boolean = false;
	/**@internal */
	static _sFactor: number;
	/**@internal */
	static _dFactor: number;
	/**@internal */
	static _srcAlpha: number;
	/**@internal */
	static _dstAlpha: number;

	/**@internal */
	static _cullFace: boolean = false;
	/**@internal */
	static _frontFace: number;
	/**@internal */
	static _activedTextureID: number;


	/**
	 * @internal
	 */
	static __init__(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		WebGLContext._depthFunc = gl.LESS;
		WebGLContext._sFactor = gl.ONE;//待确认
		WebGLContext._dFactor = gl.ZERO;//待确认
		WebGLContext._srcAlpha = gl.ONE;//待确认
		WebGLContext._dstAlpha = gl.ZERO;//待确认
		WebGLContext._activedTextureID = gl.TEXTURE0;//默认激活纹理区为0
		WebGLContext._glTextureIDs = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7];
	}

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
		value !== WebGLContext._depthTest && (WebGLContext._depthTest = value, value ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST));
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
		value !== WebGLContext._blend && (WebGLContext._blend = value, value ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND));
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
		value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE));
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
		if (WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] !== texture) {
			gl.bindTexture(target, texture);
			WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] = texture;
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
		if (value) gl.enable(gl.DEPTH_TEST);
		else gl.disable(gl.DEPTH_TEST);
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
		if (value) gl.enable(gl.BLEND);
		else gl.disable(gl.BLEND);
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
		if (value) gl.enable(gl.CULL_FACE)
		else gl.disable(gl.CULL_FACE);
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


