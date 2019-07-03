import { ILaya } from "../../ILaya";
export class WebGLContext {
    /**
     * @private
     */
    static useProgram(gl, program) {
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
    static setDepthTest(gl, value) {
        value !== WebGLContext._depthTest && (WebGLContext._depthTest = value, value ? gl.enable(WebGL2RenderingContext.DEPTH_TEST) : gl.disable(WebGL2RenderingContext.DEPTH_TEST));
    }
    /**
     * @private
     */
    //TODO:coverage
    static setDepthMask(gl, value) {
        value !== WebGLContext._depthMask && (WebGLContext._depthMask = value, gl.depthMask(value));
    }
    /**
     * @private
     */
    //TODO:coverage
    static setDepthFunc(gl, value) {
        value !== WebGLContext._depthFunc && (WebGLContext._depthFunc = value, gl.depthFunc(value));
    }
    /**
     * @private
     */
    static setBlend(gl, value) {
        value !== WebGLContext._blend && (WebGLContext._blend = value, value ? gl.enable(WebGL2RenderingContext.BLEND) : gl.disable(WebGL2RenderingContext.BLEND));
    }
    /**
     * @private
     */
    static setBlendFunc(gl, sFactor, dFactor) {
        (sFactor !== WebGLContext._sFactor || dFactor !== WebGLContext._dFactor) && (WebGLContext._sFactor = WebGLContext._srcAlpha = sFactor, WebGLContext._dFactor = WebGLContext._dstAlpha = dFactor, gl.blendFunc(sFactor, dFactor));
    }
    /**
     * @private
     */
    static setBlendFuncSeperate(gl, srcRGB, dstRGB, srcAlpha, dstAlpha) {
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
    static setCullFace(gl, value) {
        value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value ? gl.enable(WebGL2RenderingContext.CULL_FACE) : gl.disable(WebGL2RenderingContext.CULL_FACE));
    }
    /**
     * @private
     */
    //TODO:coverage
    static setFrontFace(gl, value) {
        value !== WebGLContext._frontFace && (WebGLContext._frontFace = value, gl.frontFace(value));
    }
    /**
     * @private
     */
    static activeTexture(gl, textureID) {
        if (WebGLContext._activedTextureID !== textureID) {
            gl.activeTexture(textureID);
            WebGLContext._activedTextureID = textureID;
        }
    }
    /**
     * @private
     */
    static bindTexture(gl, target, texture) {
        if (WebGLContext._activeTextures[WebGLContext._activedTextureID - WebGL2RenderingContext.TEXTURE0] !== texture) {
            gl.bindTexture(target, texture);
            WebGLContext._activeTextures[WebGLContext._activedTextureID - WebGL2RenderingContext.TEXTURE0] = texture;
        }
    }
    //--------------------------------------------------------------------------------------------------------------------------------------------------------------------
    /**
     * @private
     */
    static __init_native() {
        if (!ILaya.Render.supportWebGLPlusRendering)
            return;
        var webGLContext = WebGLContext;
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
    static useProgramForNative(gl, program) {
        gl.useProgram(program);
        return true;
    }
    /**
     * @private
     */
    //TODO:coverage
    static setDepthTestForNative(gl, value) {
        if (value)
            gl.enable(WebGL2RenderingContext.DEPTH_TEST);
        else
            gl.disable(WebGL2RenderingContext.DEPTH_TEST);
    }
    /**
     * @private
     */
    //TODO:coverage
    static setDepthMaskForNative(gl, value) {
        gl.depthMask(value);
    }
    /**
     * @private
     */
    //TODO:coverage
    static setDepthFuncForNative(gl, value) {
        gl.depthFunc(value);
    }
    /**
     * @private
     */
    //TODO:coverage
    static setBlendForNative(gl, value) {
        if (value)
            gl.enable(WebGL2RenderingContext.BLEND);
        else
            gl.disable(WebGL2RenderingContext.BLEND);
    }
    /**
     * @private
     */
    //TODO:coverage
    static setBlendFuncForNative(gl, sFactor, dFactor) {
        gl.blendFunc(sFactor, dFactor);
    }
    /**
     * @private
     */
    //TODO:coverage
    static setCullFaceForNative(gl, value) {
        if (value)
            gl.enable(WebGL2RenderingContext.CULL_FACE);
        else
            gl.disable(WebGL2RenderingContext.CULL_FACE);
    }
    /**
     * @private
     */
    //TODO:coverage
    static setFrontFaceForNative(gl, value) {
        gl.frontFace(value);
    }
    /**
     * @private
     */
    //TODO:coverage
    static activeTextureForNative(gl, textureID) {
        gl.activeTexture(textureID);
    }
    /**
     * @private
     */
    //TODO:coverage
    static bindTextureForNative(gl, target, texture) {
        gl.bindTexture(target, texture);
    }
    /**
     * @private
     */
    //TODO:coverage
    static bindVertexArrayForNative(gl, vertexArray) {
        gl.bindVertexArray(vertexArray);
    }
}
/**@private */
WebGLContext.mainContext = null;
/**@internal */
WebGLContext._activeTextures = new Array(8);
/**@internal */
WebGLContext._glTextureIDs = [WebGL2RenderingContext.TEXTURE0, WebGL2RenderingContext.TEXTURE1, WebGL2RenderingContext.TEXTURE2, WebGL2RenderingContext.TEXTURE3, WebGL2RenderingContext.TEXTURE4, WebGL2RenderingContext.TEXTURE5, WebGL2RenderingContext.TEXTURE6, WebGL2RenderingContext.TEXTURE7];
/**@internal */
WebGLContext._useProgram = null;
/**@internal */
WebGLContext._depthTest = true;
/**@internal */
WebGLContext._depthMask = true;
/**@internal */
WebGLContext._depthFunc = WebGL2RenderingContext.LESS;
/**@internal */
WebGLContext._blend = false;
/**@internal */
WebGLContext._sFactor = WebGL2RenderingContext.ONE; //待确认
/**@internal */
WebGLContext._dFactor = WebGL2RenderingContext.ZERO; //待确认
/**@internal */
WebGLContext._srcAlpha = WebGL2RenderingContext.ONE; //待确认
/**@internal */
WebGLContext._dstAlpha = WebGL2RenderingContext.ZERO; //待确认
/**@internal */
WebGLContext._cullFace = false;
/**@internal */
WebGLContext._frontFace = WebGL2RenderingContext.CCW;
/**@internal */
WebGLContext._activedTextureID = WebGL2RenderingContext.TEXTURE0; //默认激活纹理区为0
