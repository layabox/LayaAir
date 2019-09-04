import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";

/**
 * @private
 */
export class WebGLContext {
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
    static _blendEquation: number;
    /**@internal */
    static _blendEquationRGB: number;
    /**@internal */
    static _blendEquationAlpha: number;
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

    /**@internal */
    static mainContext: WebGLRenderingContext = null;


	/**
	 * @internal
	 */
    static __init__(): void {
        var gl: WebGLRenderingContext = LayaGL.instance;
        WebGLContext._depthFunc = gl.LESS;
        WebGLContext._blendEquation = gl.FUNC_ADD;
        WebGLContext._blendEquationRGB = gl.FUNC_ADD;
        WebGLContext._blendEquationAlpha = gl.FUNC_ADD;
        WebGLContext._sFactor = gl.ONE;
        WebGLContext._dFactor = gl.ZERO;
        WebGLContext._srcAlpha = gl.ONE;
        WebGLContext._dstAlpha = gl.ZERO;
        WebGLContext._activedTextureID = gl.TEXTURE0;//默认激活纹理区为0
        WebGLContext._glTextureIDs = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7];
    }

	/**
	 * @internal
	 */
    static useProgram(gl: WebGLRenderingContext, program: any): boolean {
        if (WebGLContext._useProgram === program)
            return false;
        gl.useProgram(program);
        WebGLContext._useProgram = program;
        return true;
    }


	/**
	 * @internal
	 */
    static setDepthTest(gl: WebGLRenderingContext, value: boolean): void {
        value !== WebGLContext._depthTest && (WebGLContext._depthTest = value, value ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH_TEST));
    }

	/**
	 * @internal
	 */
    static setDepthMask(gl: WebGLRenderingContext, value: boolean): void {
        value !== WebGLContext._depthMask && (WebGLContext._depthMask = value, gl.depthMask(value));
    }

	/**
	 * @internal
	 */
    static setDepthFunc(gl: WebGLRenderingContext, value: number): void {
        value !== WebGLContext._depthFunc && (WebGLContext._depthFunc = value, gl.depthFunc(value));
    }

	/**
	 * @internal
	 */
    static setBlend(gl: WebGLRenderingContext, value: boolean): void {
        value !== WebGLContext._blend && (WebGLContext._blend = value, value ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND));
    }

    /**
     * @internal
     */
    static setBlendEquation(gl: WebGLRenderingContext, blendEquation: number): void {
        (blendEquation !== WebGLContext._blendEquation) && (WebGLContext._blendEquation = blendEquation, gl.blendEquation(blendEquation));
    }

    /**
     * @internal
     */
    static setBlendEquationSeparate(gl: WebGLRenderingContext, blendEquationRGB: number, blendEquationAlpha: number): void {
        (blendEquationRGB !== WebGLContext._blendEquationRGB || blendEquationAlpha !== WebGLContext._blendEquationAlpha) && (WebGLContext._blendEquationRGB = blendEquationRGB, WebGLContext._blendEquationAlpha = blendEquationAlpha, gl.blendEquationSeparate(blendEquationRGB, blendEquationAlpha));
    }

	/**
	 * @internal
	 */
    static setBlendFunc(gl: WebGLRenderingContext, sFactor: number, dFactor: number): void {
        (sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor = WebGLContext._srcAlpha = sFactor, WebGLContext._dFactor = WebGLContext._dstAlpha = dFactor, gl.blendFunc(sFactor, dFactor));
    }

	/**
	 * @internal
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
	 * @internal
	 */
    static setCullFace(gl: WebGLRenderingContext, value: boolean): void {
        value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value ? gl.enable(gl.CULL_FACE) : gl.disable(gl.CULL_FACE));
    }

	/**
	 * @internal
	 */
    static setFrontFace(gl: WebGLRenderingContext, value: number): void {
        value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
    }


	/**
	 * @internal
	 */
    static activeTexture(gl: WebGLRenderingContext, textureID: number): void {
        if (WebGLContext._activedTextureID !== textureID) {
            gl.activeTexture(textureID);
            WebGLContext._activedTextureID = textureID;
        }
    }

	/**
	 * @internal
	 */
    static bindTexture(gl: WebGLRenderingContext, target: any, texture: any): void {
        if (WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] !== texture) {
            gl.bindTexture(target, texture);
            WebGLContext._activeTextures[WebGLContext._activedTextureID - gl.TEXTURE0] = texture;
        }
    }

    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------

	/**
	 * @internal
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
	 * @internal
	 */
    static useProgramForNative(gl: WebGLRenderingContext, program: any): boolean {
        gl.useProgram(program);
        return true;
    }


	/**
	 * @internal
	 */
    static setDepthTestForNative(gl: WebGLRenderingContext, value: boolean): void {
        if (value) gl.enable(gl.DEPTH_TEST);
        else gl.disable(gl.DEPTH_TEST);
    }

	/**
	 * @internal
	 */
    static setDepthMaskForNative(gl: WebGLRenderingContext, value: boolean): void {
        gl.depthMask(value);
    }

	/**
	 * @internal
	 */
    static setDepthFuncForNative(gl: WebGLRenderingContext, value: number): void {
        gl.depthFunc(value);
    }

	/**
	 * @internal
	 */
    static setBlendForNative(gl: WebGLRenderingContext, value: boolean): void {
        if (value) gl.enable(gl.BLEND);
        else gl.disable(gl.BLEND);
    }

	/**
	 * @internal
	 */
    static setBlendFuncForNative(gl: WebGLRenderingContext, sFactor: number, dFactor: number): void {
        gl.blendFunc(sFactor, dFactor);
    }

	/**
	 * @internal
	 */
    static setCullFaceForNative(gl: WebGLRenderingContext, value: boolean): void {
        if (value) gl.enable(gl.CULL_FACE)
        else gl.disable(gl.CULL_FACE);
    }

	/**
	 * @internal
	 */
    static setFrontFaceForNative(gl: WebGLRenderingContext, value: number): void {
        gl.frontFace(value);
    }


	/**
	 * @internal
	 */
    static activeTextureForNative(gl: WebGLRenderingContext, textureID: number): void {
        gl.activeTexture(textureID);
    }

	/**
	 * @internal
	 */
    static bindTextureForNative(gl: WebGLRenderingContext, target: any, texture: any): void {
        gl.bindTexture(target, texture);
    }

	/**
	 * @internal
	 */
    static bindVertexArrayForNative(gl: WebGLContext, vertexArray: any): void {
        (gl as any).bindVertexArray(vertexArray);
    }

}


