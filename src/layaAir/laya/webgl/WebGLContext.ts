import { ILaya } from "../../ILaya";
import { LayaGL } from "../layagl/LayaGL";

/**
 * @private
 * 
 * iOS的下 sFactor !== WebGLContext._sFactor 这个判断有问题，但是 sFactor!=_sFactor却没有问题，不知道为什么
 */
var  _sFactor=1;
var  _dFactor=0;

/**
 * @private
 */
export class WebGLContext {
    /**@internal */
    private static _activeTextures: Array<number> = new Array(1);
    /**@internal */
    private static _useProgram: any = null;
    /**@internal */
    private static _depthTest: boolean = true;
    /**@internal */
    private static _depthMask: boolean = true;
    /**@internal */
    private static _depthFunc: number;
    /**@internal */
    private static _blend: boolean = false;
    /**@internal */
    private static _blendEquation: number;
    /**@internal */
    private static _blendEquationRGB: number;
    /**@internal */
    private static _blendEquationAlpha: number;
    /**@internal */
    private static _sFactor: number;
    /**@internal */
    private static _dFactor: number;
    /**@internal */
    private static _sFactorRGB: number;
    /**@internal */
    private static _dFactorRGB: number;
    /**@internal */
    private static _sFactorAlpha: number;
    /**@internal */
    private static _dFactorAlpha: number;
    /**@internal */
    private static _cullFace: boolean = false;
    /**@internal */
    private static _frontFace: number;
    /**@internal */
    private static _activedTextureID: number;
    /**@internal */
    private static _maxUniformFragmentVectors:number;

    /**@internal */
    static _glTextureIDs: Array<number>;

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
        _sFactor = gl.ONE;	// 由于有iOS的问题，先改成普通的全局变量
        _dFactor = gl.ZERO;
        WebGLContext._sFactorAlpha = gl.ONE;
        WebGLContext._dFactorAlpha = gl.ZERO;
        WebGLContext._activedTextureID = gl.TEXTURE0;//默认激活纹理区为0
        var maxTexturenum:number = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
        WebGLContext._activeTextures = new Array(maxTexturenum);
        WebGLContext._glTextureIDs = [gl.TEXTURE0, gl.TEXTURE1, gl.TEXTURE2, gl.TEXTURE3, gl.TEXTURE4, gl.TEXTURE5, gl.TEXTURE6, gl.TEXTURE7,gl.TEXTURE8,gl.TEXTURE9,gl.TEXTURE10,gl.TEXTURE11,gl.TEXTURE12,gl.TEXTURE13,gl.TEXTURE14,gl.TEXTURE15,gl.TEXTURE16,gl.TEXTURE17,gl.TEXTURE18,gl.TEXTURE19,gl.TEXTURE20,gl.TEXTURE21,gl.TEXTURE22,gl.TEXTURE23,gl.TEXTURE24,gl.TEXTURE25,gl.TEXTURE26,gl.TEXTURE27,gl.TEXTURE28,gl.TEXTURE29,gl.TEXTURE30,gl.TEXTURE31];
        var maxVertexUniform:number = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
        var maxFragUniform:number = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
        WebGLContext._maxUniformFragmentVectors = Math.min(maxVertexUniform,maxFragUniform);
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
        if (blendEquation !== WebGLContext._blendEquation) {
            WebGLContext._blendEquation = blendEquation;
            WebGLContext._blendEquationRGB = WebGLContext._blendEquationAlpha = null;
            gl.blendEquation(blendEquation);
        }
    }

    /**
     * @internal
     */
    static setBlendEquationSeparate(gl: WebGLRenderingContext, blendEquationRGB: number, blendEquationAlpha: number): void {
        if (blendEquationRGB !== WebGLContext._blendEquationRGB || blendEquationAlpha !== WebGLContext._blendEquationAlpha) {
            WebGLContext._blendEquationRGB = blendEquationRGB;
            WebGLContext._blendEquationAlpha = blendEquationAlpha;
            WebGLContext._blendEquation = null;
            gl.blendEquationSeparate(blendEquationRGB, blendEquationAlpha);
        }
    }

	/**
	 * @internal
	 */
    static setBlendFunc(gl: WebGLRenderingContext, sFactor: number, dFactor: number,force:boolean=false): void {
		// 有个iOS的bug，用原来的写法有时候会出错
        if (force || sFactor !== _sFactor || dFactor !== _dFactor) {
            _sFactor = sFactor;
            _dFactor = dFactor;
            WebGLContext._sFactorRGB = null;
            WebGLContext._dFactorRGB = null;
            WebGLContext._sFactorAlpha = null;
            WebGLContext._dFactorAlpha = null;
            gl.blendFunc(sFactor, dFactor);
        }
    }

	/**
	 * @internal
	 */
    static setBlendFuncSeperate(gl: WebGLRenderingContext, srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void {
        if (srcRGB !== WebGLContext._sFactorRGB || dstRGB !== WebGLContext._dFactorRGB || srcAlpha !== WebGLContext._sFactorAlpha || dstAlpha !== WebGLContext._dFactorAlpha) {
            WebGLContext._sFactorRGB = srcRGB;
            WebGLContext._dFactorRGB = dstRGB;
            WebGLContext._sFactorAlpha = srcAlpha;
            WebGLContext._dFactorAlpha = dstAlpha;
            _sFactor = null;
            _dFactor = null;
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

    static getUniformMaxVector():number{
        return WebGLContext._maxUniformFragmentVectors;
    }

}


