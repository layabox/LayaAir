import { ILaya } from "../../ILaya";
export class WebGLContext {
    /**
     * @private
     */
    static _forceSupportVAOPlatform() {
        var Browser = ILaya.Browser;
        return (Browser.onMiniGame && Browser.onIOS) || Browser.onBDMiniGame || Browser.onQGMiniGame;
    }
    /**
     * @private
     */
    static __init__(gl) {
        WebGLContext._checkExtensions(gl);
        if (!ILaya.WebGL._isWebGL2 && !ILaya.Render.isConchApp) {
            if (window._setupVertexArrayObject) { //兼容VAO
                if (WebGLContext._forceSupportVAOPlatform())
                    window._forceSetupVertexArrayObject(gl);
                else
                    window._setupVertexArrayObject(gl);
            }
            var ext = ((gl).rawgl || gl).getExtension("OES_vertex_array_object"); //gl.rawgl是为了个能兼容glinspector调试
            if (ext) {
                //console.log("EXT:webgl support OES_vertex_array_object！");	
                /**
                 * 创建一个vao对象。只有支持 OES_vertex_array_object 扩展或者使用polyfill的时候这个函数才有实现。
                 */
                var glContext = gl;
                glContext.createVertexArray = function () { return ext.createVertexArrayOES(); };
                glContext.bindVertexArray = function (vao) { ext.bindVertexArrayOES(vao); };
                glContext.deleteVertexArray = function (vao) { ext.deleteVertexArrayOES(vao); };
                glContext.isVertexArray = function (vao) { ext.isVertexArrayOES(vao); };
            }
        }
    }
    /**
     * @private
     */
    static _getExtension(gl, name) {
        var prefixes = WebGLContext._extentionVendorPrefixes;
        for (var k in prefixes) {
            var ext = gl.getExtension(prefixes[k] + name);
            if (ext)
                return ext;
        }
        return null;
    }
    /**
     * @private
     */
    static _checkExtensions(gl) {
        WebGLContext._extTextureFilterAnisotropic = WebGLContext._getExtension(gl, "EXT_texture_filter_anisotropic");
        WebGLContext._compressedTextureS3tc = WebGLContext._getExtension(gl, "WEBGL_compressed_texture_s3tc");
        WebGLContext._compressedTexturePvrtc = WebGLContext._getExtension(gl, "WEBGL_compressed_texture_pvrtc");
        WebGLContext._compressedTextureEtc1 = WebGLContext._getExtension(gl, "WEBGL_compressed_texture_etc1");
        if (!WebGLContext._forceSupportVAOPlatform())
            WebGLContext._angleInstancedArrays = WebGLContext._getExtension(gl, "ANGLE_instanced_arrays");
    }
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
        value !== WebGLContext._depthTest && (WebGLContext._depthTest = value, value ? gl.enable(WebGLContext.DEPTH_TEST) : gl.disable(WebGLContext.DEPTH_TEST));
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
        value !== WebGLContext._blend && (WebGLContext._blend = value, value ? gl.enable(WebGLContext.BLEND) : gl.disable(WebGLContext.BLEND));
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
        value !== WebGLContext._cullFace && (WebGLContext._cullFace = value, value ? gl.enable(WebGLContext.CULL_FACE) : gl.disable(WebGLContext.CULL_FACE));
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
        if (WebGLContext._activeTextures[WebGLContext._activedTextureID - WebGLContext.TEXTURE0] !== texture) {
            gl.bindTexture(target, texture);
            WebGLContext._activeTextures[WebGLContext._activedTextureID - WebGLContext.TEXTURE0] = texture;
        }
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
            gl.enable(WebGLContext.DEPTH_TEST);
        else
            gl.disable(WebGLContext.DEPTH_TEST);
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
            gl.enable(WebGLContext.BLEND);
        else
            gl.disable(WebGLContext.BLEND);
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
            gl.enable(WebGLContext.CULL_FACE);
        else
            gl.disable(WebGLContext.CULL_FACE);
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
    getContextAttributes() { return null; }
    isContextLost() { }
    getSupportedExtensions() { return null; }
    getExtension(name) { return null; }
    activeTexture(texture) { }
    attachShader(program, shader) { }
    bindAttribLocation(program, index, name) { }
    bindBuffer(target, buffer) { }
    bindFramebuffer(target, framebuffer) { }
    bindRenderbuffer(target, renderbuffer) { }
    bindTexture(target, texture) { }
    useTexture(value) { }
    blendColor(red, green, blue, alpha) { }
    blendEquation(mode) { }
    blendEquationSeparate(modeRGB, modeAlpha) { }
    blendFunc(sfactor, dfactor) { }
    blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha) { }
    bufferData(target, size, usage) { }
    bufferSubData(target, offset, data) { }
    checkFramebufferStatus(target) { return null; }
    clear(mask) { }
    clearColor(red, green, blue, alpha) { }
    clearDepth(depth) { }
    clearStencil(s) { }
    colorMask(red, green, blue, alpha) { }
    compileShader(shader) { }
    copyTexImage2D(target, level, internalformat, x, y, width, height, border) { }
    copyTexSubImage2D(target, level, xoffset, yoffset, x, y, width, height) { }
    createBuffer() { }
    createFramebuffer() { }
    createProgram() { }
    createRenderbuffer() { }
    createShader(type) { }
    createTexture() { return null; }
    cullFace(mode) { }
    deleteBuffer(buffer) { }
    deleteFramebuffer(framebuffer) { }
    deleteProgram(program) { }
    deleteRenderbuffer(renderbuffer) { }
    deleteShader(shader) { }
    deleteTexture(texture) { }
    depthFunc(func) { }
    depthMask(flag) { }
    depthRange(zNear, zFar) { }
    detachShader(program, shader) { }
    disable(cap) { }
    disableVertexAttribArray(index) { }
    drawArrays(mode, first, count) { }
    drawElements(mode, count, type, offset) { }
    enable(cap) { }
    enableVertexAttribArray(index) { }
    finish() { }
    flush() { }
    framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) { }
    framebufferTexture2D(target, attachment, textarget, texture, level) { }
    frontFace(mode) { return null; }
    generateMipmap(target) { return null; }
    getActiveAttrib(program, index) { return null; }
    getActiveUniform(program, index) { return null; }
    getAttribLocation(program, name) { return 0; }
    getParameter(pname) { return null; }
    getBufferParameter(target, pname) { return null; }
    getError() { return null; }
    getFramebufferAttachmentParameter(target, attachment, pname) { }
    getProgramParameter(program, pname) { return 0; }
    getProgramInfoLog(program) { return null; }
    getRenderbufferParameter(target, pname) { return null; }
    getShaderPrecisionFormat(...arg) { return null; }
    getShaderParameter(shader, pname) { }
    getShaderInfoLog(shader) { return null; }
    getShaderSource(shader) { return null; }
    getTexParameter(target, pname) { }
    getUniform(program, location) { }
    getUniformLocation(program, name) { return null; }
    getVertexAttrib(index, pname) { return null; }
    getVertexAttribOffset(index, pname) { return null; }
    hint(target, mode) { }
    isBuffer(buffer) { }
    isEnabled(cap) { }
    isFramebuffer(framebuffer) { }
    isProgram(program) { }
    isRenderbuffer(renderbuffer) { }
    isShader(shader) { }
    isTexture(texture) { }
    lineWidth(width) { }
    linkProgram(program) { }
    pixelStorei(pname, param) { }
    polygonOffset(factor, units) { }
    readPixels(x, y, width, height, format, type, pixels) { }
    renderbufferStorage(target, internalformat, width, height) { }
    sampleCoverage(value, invert) { }
    scissor(x, y, width, height) { }
    shaderSource(shader, source) { }
    stencilFunc(func, ref, mask) { }
    stencilFuncSeparate(face, func, ref, mask) { }
    stencilMask(mask) { }
    stencilMaskSeparate(face, mask) { }
    stencilOp(fail, zfail, zpass) { }
    stencilOpSeparate(face, fail, zfail, zpass) { }
    texImage2D(...args) { }
    texParameterf(target, pname, param) { }
    texParameteri(target, pname, param) { }
    texSubImage2D(...args) { }
    uniform1f(location, x) { }
    uniform1fv(location, v) { }
    uniform1i(location, x) { }
    uniform1iv(location, v) { }
    uniform2f(location, x, y) { }
    uniform2fv(location, v) { }
    uniform2i(location, x, y) { }
    uniform2iv(location, v) { }
    uniform3f(location, x, y, z) { }
    uniform3fv(location, v) { }
    uniform3i(location, x, y, z) { }
    uniform3iv(location, v) { }
    uniform4f(location, x, y, z, w) { }
    uniform4fv(location, v) { }
    uniform4i(location, x, y, z, w) { }
    uniform4iv(location, v) { }
    uniformMatrix2fv(location, transpose, value) { }
    uniformMatrix3fv(location, transpose, value) { }
    uniformMatrix4fv(location, transpose, value) { }
    useProgram(program) { }
    validateProgram(program) { }
    vertexAttrib1f(indx, x) { }
    vertexAttrib1fv(indx, values) { }
    vertexAttrib2f(indx, x, y) { }
    vertexAttrib2fv(indx, values) { }
    vertexAttrib3f(indx, x, y, z) { }
    vertexAttrib3fv(indx, values) { }
    vertexAttrib4f(indx, x, y, z, w) { }
    vertexAttrib4fv(indx, values) { }
    vertexAttribPointer(indx, size, type, normalized, stride, offset) { }
    viewport(x, y, width, height) { }
    configureBackBuffer(width, height, antiAlias, enableDepthAndStencil = true, wantsBestResolution = false) { } /*;*/
    compressedTexImage2D(...args) { }
    //WebGL1.0下为扩展方法
    //TODO:coverage
    createVertexArray() {
        throw "not implemented";
    }
    //TODO:coverage
    bindVertexArray(vao) {
        throw "not implemented";
    }
    //TODO:coverage
    deleteVertexArray(vao) {
        throw "not implemented";
    }
    //TODO:coverage
    isVertexArray(vao) {
        throw "not implemented";
    }
}
WebGLContext.DEPTH_BUFFER_BIT = 0x00000100;
WebGLContext.STENCIL_BUFFER_BIT = 0x00000400;
WebGLContext.COLOR_BUFFER_BIT = 0x00004000;
WebGLContext.POINTS = 0x0000;
WebGLContext.LINES = 0x0001;
WebGLContext.LINE_LOOP = 0x0002;
WebGLContext.LINE_STRIP = 0x0003;
WebGLContext.TRIANGLES = 0x0004;
WebGLContext.TRIANGLE_STRIP = 0x0005;
WebGLContext.TRIANGLE_FAN = 0x0006;
WebGLContext.ZERO = 0;
WebGLContext.ONE = 1;
WebGLContext.SRC_COLOR = 0x0300;
WebGLContext.ONE_MINUS_SRC_COLOR = 0x0301;
WebGLContext.SRC_ALPHA = 0x0302;
WebGLContext.ONE_MINUS_SRC_ALPHA = 0x0303;
WebGLContext.DST_ALPHA = 0x0304;
WebGLContext.ONE_MINUS_DST_ALPHA = 0x0305;
WebGLContext.DST_COLOR = 0x0306;
WebGLContext.ONE_MINUS_DST_COLOR = 0x0307;
WebGLContext.SRC_ALPHA_SATURATE = 0x0308;
WebGLContext.FUNC_ADD = 0x8006;
WebGLContext.BLEND_EQUATION = 0x8009;
WebGLContext.BLEND_EQUATION_RGB = 0x8009;
WebGLContext.BLEND_EQUATION_ALPHA = 0x883D;
WebGLContext.FUNC_SUBTRACT = 0x800A;
WebGLContext.FUNC_REVERSE_SUBTRACT = 0x800B;
WebGLContext.BLEND_DST_RGB = 0x80C8;
WebGLContext.BLEND_SRC_RGB = 0x80C9;
WebGLContext.BLEND_DST_ALPHA = 0x80CA;
WebGLContext.BLEND_SRC_ALPHA = 0x80CB;
WebGLContext.CONSTANT_COLOR = 0x8001;
WebGLContext.ONE_MINUS_CONSTANT_COLOR = 0x8002;
WebGLContext.CONSTANT_ALPHA = 0x8003;
WebGLContext.ONE_MINUS_CONSTANT_ALPHA = 0x8004;
WebGLContext.BLEND_COLOR = 0x8005;
WebGLContext.ARRAY_BUFFER = 0x8892;
WebGLContext.ELEMENT_ARRAY_BUFFER = 0x8893;
WebGLContext.ARRAY_BUFFER_BINDING = 0x8894;
WebGLContext.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;
WebGLContext.STREAM_DRAW = 0x88E0;
WebGLContext.STATIC_DRAW = 0x88E4;
WebGLContext.DYNAMIC_DRAW = 0x88E8;
WebGLContext.BUFFER_SIZE = 0x8764;
WebGLContext.BUFFER_USAGE = 0x8765;
WebGLContext.CURRENT_VERTEX_ATTRIB = 0x8626;
WebGLContext.FRONT = 0x0404;
WebGLContext.BACK = 0x0405;
WebGLContext.CULL_FACE = 0x0B44;
WebGLContext.FRONT_AND_BACK = 0x0408;
WebGLContext.BLEND = 0x0BE2;
WebGLContext.DITHER = 0x0BD0;
WebGLContext.STENCIL_TEST = 0x0B90;
WebGLContext.DEPTH_TEST = 0x0B71;
WebGLContext.SCISSOR_TEST = 0x0C11;
WebGLContext.POLYGON_OFFSET_FILL = 0x8037;
WebGLContext.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;
WebGLContext.SAMPLE_COVERAGE = 0x80A0;
WebGLContext.NO_ERROR = 0;
WebGLContext.INVALID_ENUM = 0x0500;
WebGLContext.INVALID_VALUE = 0x0501;
WebGLContext.INVALID_OPERATION = 0x0502;
WebGLContext.OUT_OF_MEMORY = 0x0505;
WebGLContext.CW = 0x0900;
WebGLContext.CCW = 0x0901;
WebGLContext.LINE_WIDTH = 0x0B21;
WebGLContext.ALIASED_POINT_SIZE_RANGE = 0x846D;
WebGLContext.ALIASED_LINE_WIDTH_RANGE = 0x846E;
WebGLContext.CULL_FACE_MODE = 0x0B45;
WebGLContext.FRONT_FACE = 0x0B46;
WebGLContext.DEPTH_RANGE = 0x0B70;
WebGLContext.DEPTH_WRITEMASK = 0x0B72;
WebGLContext.DEPTH_CLEAR_VALUE = 0x0B73;
WebGLContext.DEPTH_FUNC = 0x0B74;
WebGLContext.STENCIL_CLEAR_VALUE = 0x0B91;
WebGLContext.STENCIL_FUNC = 0x0B92;
WebGLContext.STENCIL_FAIL = 0x0B94;
WebGLContext.STENCIL_PASS_DEPTH_FAIL = 0x0B95;
WebGLContext.STENCIL_PASS_DEPTH_PASS = 0x0B96;
WebGLContext.STENCIL_REF = 0x0B97;
WebGLContext.STENCIL_VALUE_MASK = 0x0B93;
WebGLContext.STENCIL_WRITEMASK = 0x0B98;
WebGLContext.STENCIL_BACK_FUNC = 0x8800;
WebGLContext.STENCIL_BACK_FAIL = 0x8801;
WebGLContext.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;
WebGLContext.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;
WebGLContext.STENCIL_BACK_REF = 0x8CA3;
WebGLContext.STENCIL_BACK_VALUE_MASK = 0x8CA4;
WebGLContext.STENCIL_BACK_WRITEMASK = 0x8CA5;
WebGLContext.VIEWPORT = 0x0BA2;
WebGLContext.SCISSOR_BOX = 0x0C10;
WebGLContext.COLOR_CLEAR_VALUE = 0x0C22;
WebGLContext.COLOR_WRITEMASK = 0x0C23;
WebGLContext.UNPACK_ALIGNMENT = 0x0CF5;
WebGLContext.PACK_ALIGNMENT = 0x0D05;
WebGLContext.MAX_TEXTURE_SIZE = 0x0D33;
WebGLContext.MAX_VIEWPORT_DIMS = 0x0D3A;
WebGLContext.SUBPIXEL_BITS = 0x0D50;
WebGLContext.RED_BITS = 0x0D52;
WebGLContext.GREEN_BITS = 0x0D53;
WebGLContext.BLUE_BITS = 0x0D54;
WebGLContext.ALPHA_BITS = 0x0D55;
WebGLContext.DEPTH_BITS = 0x0D56;
WebGLContext.STENCIL_BITS = 0x0D57;
WebGLContext.POLYGON_OFFSET_UNITS = 0x2A00;
WebGLContext.POLYGON_OFFSET_FACTOR = 0x8038;
WebGLContext.TEXTURE_BINDING_2D = 0x8069;
WebGLContext.SAMPLE_BUFFERS = 0x80A8;
WebGLContext.SAMPLES = 0x80A9;
WebGLContext.SAMPLE_COVERAGE_VALUE = 0x80AA;
WebGLContext.SAMPLE_COVERAGE_INVERT = 0x80AB;
WebGLContext.NUM_COMPRESSED_TEXTURE_FORMATS = 0x86A2;
WebGLContext.COMPRESSED_TEXTURE_FORMATS = 0x86A3;
WebGLContext.DONT_CARE = 0x1100;
WebGLContext.FASTEST = 0x1101;
WebGLContext.NICEST = 0x1102;
WebGLContext.GENERATE_MIPMAP_HINT = 0x8192;
WebGLContext.BYTE = 0x1400;
WebGLContext.UNSIGNED_BYTE = 0x1401;
WebGLContext.SHORT = 0x1402;
WebGLContext.UNSIGNED_SHORT = 0x1403;
WebGLContext.INT = 0x1404;
WebGLContext.UNSIGNED_INT = 0x1405;
WebGLContext.FLOAT = 0x1406;
WebGLContext.DEPTH_COMPONENT = 0x1902;
WebGLContext.ALPHA = 0x1906;
WebGLContext.RGB = 0x1907;
WebGLContext.RGBA = 0x1908;
WebGLContext.LUMINANCE = 0x1909;
WebGLContext.LUMINANCE_ALPHA = 0x190A;
WebGLContext.UNSIGNED_SHORT_4_4_4_4 = 0x8033;
WebGLContext.UNSIGNED_SHORT_5_5_5_1 = 0x8034;
WebGLContext.UNSIGNED_SHORT_5_6_5 = 0x8363;
WebGLContext.FRAGMENT_SHADER = 0x8B30;
WebGLContext.VERTEX_SHADER = 0x8B31;
WebGLContext.MAX_VERTEX_ATTRIBS = 0x8869;
WebGLContext.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;
WebGLContext.MAX_VARYING_VECTORS = 0x8DFC;
WebGLContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
WebGLContext.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;
WebGLContext.MAX_TEXTURE_IMAGE_UNITS = 0x8872;
WebGLContext.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;
WebGLContext.SHADER_TYPE = 0x8B4F;
WebGLContext.DELETE_STATUS = 0x8B80;
WebGLContext.LINK_STATUS = 0x8B82;
WebGLContext.VALIDATE_STATUS = 0x8B83;
WebGLContext.ATTACHED_SHADERS = 0x8B85;
WebGLContext.ACTIVE_UNIFORMS = 0x8B86;
WebGLContext.ACTIVE_ATTRIBUTES = 0x8B89;
WebGLContext.SHADING_LANGUAGE_VERSION = 0x8B8C;
WebGLContext.CURRENT_PROGRAM = 0x8B8D;
WebGLContext.NEVER = 0x0200;
WebGLContext.LESS = 0x0201;
WebGLContext.EQUAL = 0x0202;
WebGLContext.LEQUAL = 0x0203;
WebGLContext.GREATER = 0x0204;
WebGLContext.NOTEQUAL = 0x0205;
WebGLContext.GEQUAL = 0x0206;
WebGLContext.ALWAYS = 0x0207;
WebGLContext.KEEP = 0x1E00;
WebGLContext.REPLACE = 0x1E01;
WebGLContext.INCR = 0x1E02;
WebGLContext.DECR = 0x1E03;
WebGLContext.INVERT = 0x150A;
WebGLContext.INCR_WRAP = 0x8507;
WebGLContext.DECR_WRAP = 0x8508;
WebGLContext.VENDOR = 0x1F00;
WebGLContext.RENDERER = 0x1F01;
WebGLContext.VERSION = 0x1F02;
WebGLContext.NEAREST = 0x2600;
WebGLContext.LINEAR = 0x2601;
WebGLContext.NEAREST_MIPMAP_NEAREST = 0x2700;
WebGLContext.LINEAR_MIPMAP_NEAREST = 0x2701;
WebGLContext.NEAREST_MIPMAP_LINEAR = 0x2702;
WebGLContext.LINEAR_MIPMAP_LINEAR = 0x2703;
WebGLContext.TEXTURE_MAG_FILTER = 0x2800;
WebGLContext.TEXTURE_MIN_FILTER = 0x2801;
WebGLContext.TEXTURE_WRAP_S = 0x2802;
WebGLContext.TEXTURE_WRAP_T = 0x2803;
WebGLContext.TEXTURE_2D = 0x0DE1;
WebGLContext.TEXTURE_3D = 0x806f;
WebGLContext.TEXTURE = 0x1702;
WebGLContext.TEXTURE_CUBE_MAP = 0x8513;
WebGLContext.TEXTURE_BINDING_CUBE_MAP = 0x8514;
WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;
WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;
WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;
WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;
WebGLContext.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;
WebGLContext.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;
WebGLContext.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;
WebGLContext.TEXTURE0 = 0x84C0;
WebGLContext.TEXTURE1 = 0x84C1;
WebGLContext.TEXTURE2 = 0x84C2;
WebGLContext.TEXTURE3 = 0x84C3;
WebGLContext.TEXTURE4 = 0x84C4;
WebGLContext.TEXTURE5 = 0x84C5;
WebGLContext.TEXTURE6 = 0x84C6;
WebGLContext.TEXTURE7 = 0x84C7;
WebGLContext.TEXTURE8 = 0x84C8;
WebGLContext.TEXTURE9 = 0x84C9;
WebGLContext.TEXTURE10 = 0x84CA;
WebGLContext.TEXTURE11 = 0x84CB;
WebGLContext.TEXTURE12 = 0x84CC;
WebGLContext.TEXTURE13 = 0x84CD;
WebGLContext.TEXTURE14 = 0x84CE;
WebGLContext.TEXTURE15 = 0x84CF;
WebGLContext.TEXTURE16 = 0x84D0;
WebGLContext.TEXTURE17 = 0x84D1;
WebGLContext.TEXTURE18 = 0x84D2;
WebGLContext.TEXTURE19 = 0x84D3;
WebGLContext.TEXTURE20 = 0x84D4;
WebGLContext.TEXTURE21 = 0x84D5;
WebGLContext.TEXTURE22 = 0x84D6;
WebGLContext.TEXTURE23 = 0x84D7;
WebGLContext.TEXTURE24 = 0x84D8;
WebGLContext.TEXTURE25 = 0x84D9;
WebGLContext.TEXTURE26 = 0x84DA;
WebGLContext.TEXTURE27 = 0x84DB;
WebGLContext.TEXTURE28 = 0x84DC;
WebGLContext.TEXTURE29 = 0x84DD;
WebGLContext.TEXTURE30 = 0x84DE;
WebGLContext.TEXTURE31 = 0x84DF;
WebGLContext.ACTIVE_TEXTURE = 0x84E0;
WebGLContext.REPEAT = 0x2901;
WebGLContext.CLAMP_TO_EDGE = 0x812F;
WebGLContext.MIRRORED_REPEAT = 0x8370;
WebGLContext.FLOAT_VEC2 = 0x8B50;
WebGLContext.FLOAT_VEC3 = 0x8B51;
WebGLContext.FLOAT_VEC4 = 0x8B52;
WebGLContext.INT_VEC2 = 0x8B53;
WebGLContext.INT_VEC3 = 0x8B54;
WebGLContext.INT_VEC4 = 0x8B55;
WebGLContext.BOOL = 0x8B56;
WebGLContext.BOOL_VEC2 = 0x8B57;
WebGLContext.BOOL_VEC3 = 0x8B58;
WebGLContext.BOOL_VEC4 = 0x8B59;
WebGLContext.FLOAT_MAT2 = 0x8B5A;
WebGLContext.FLOAT_MAT3 = 0x8B5B;
WebGLContext.FLOAT_MAT4 = 0x8B5C;
WebGLContext.SAMPLER_2D = 0x8B5E;
WebGLContext.SAMPLER_CUBE = 0x8B60;
WebGLContext.VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;
WebGLContext.VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;
WebGLContext.VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;
WebGLContext.VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;
WebGLContext.VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;
WebGLContext.VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;
WebGLContext.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;
WebGLContext.COMPILE_STATUS = 0x8B81;
WebGLContext.LOW_FLOAT = 0x8DF0;
WebGLContext.MEDIUM_FLOAT = 0x8DF1;
WebGLContext.HIGH_FLOAT = 0x8DF2;
WebGLContext.LOW_INT = 0x8DF3;
WebGLContext.MEDIUM_INT = 0x8DF4;
WebGLContext.HIGH_INT = 0x8DF5;
WebGLContext.FRAMEBUFFER = 0x8D40;
WebGLContext.RENDERBUFFER = 0x8D41;
WebGLContext.RGBA4 = 0x8056;
WebGLContext.RGB5_A1 = 0x8057;
WebGLContext.RGB565 = 0x8D62;
WebGLContext.DEPTH_COMPONENT16 = 0x81A5;
WebGLContext.STENCIL_INDEX = 0x1901;
WebGLContext.STENCIL_INDEX8 = 0x8D48;
WebGLContext.DEPTH_STENCIL = 0x84F9;
WebGLContext.RENDERBUFFER_WIDTH = 0x8D42;
WebGLContext.RENDERBUFFER_HEIGHT = 0x8D43;
WebGLContext.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;
WebGLContext.RENDERBUFFER_RED_SIZE = 0x8D50;
WebGLContext.RENDERBUFFER_GREEN_SIZE = 0x8D51;
WebGLContext.RENDERBUFFER_BLUE_SIZE = 0x8D52;
WebGLContext.RENDERBUFFER_ALPHA_SIZE = 0x8D53;
WebGLContext.RENDERBUFFER_DEPTH_SIZE = 0x8D54;
WebGLContext.RENDERBUFFER_STENCIL_SIZE = 0x8D55;
WebGLContext.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;
WebGLContext.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;
WebGLContext.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;
WebGLContext.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;
WebGLContext.COLOR_ATTACHMENT0 = 0x8CE0;
WebGLContext.DEPTH_ATTACHMENT = 0x8D00;
WebGLContext.STENCIL_ATTACHMENT = 0x8D20;
WebGLContext.DEPTH_STENCIL_ATTACHMENT = 0x821A;
WebGLContext.NONE = 0;
WebGLContext.FRAMEBUFFER_COMPLETE = 0x8CD5;
WebGLContext.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;
WebGLContext.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
WebGLContext.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;
WebGLContext.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;
WebGLContext.FRAMEBUFFER_BINDING = 0x8CA6;
WebGLContext.RENDERBUFFER_BINDING = 0x8CA7;
WebGLContext.MAX_RENDERBUFFER_SIZE = 0x84E8;
WebGLContext.INVALID_FRAMEBUFFER_OPERATION = 0x0506;
WebGLContext.UNPACK_FLIP_Y_WEBGL = 0x9240;
WebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
WebGLContext.CONTEXT_LOST_WEBGL = 0x9242;
WebGLContext.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
WebGLContext.BROWSER_DEFAULT_WEBGL = 0x9244;
/**@private */
WebGLContext.mainContext = null;
/**@private */
WebGLContext._extentionVendorPrefixes = ["", "WEBKIT_", "MOZ_"];
/**@private */
WebGLContext._activeTextures = new Array(8);
/**@private */
WebGLContext._glTextureIDs = [WebGLContext.TEXTURE0, WebGLContext.TEXTURE1, WebGLContext.TEXTURE2, WebGLContext.TEXTURE3, WebGLContext.TEXTURE4, WebGLContext.TEXTURE5, WebGLContext.TEXTURE6, WebGLContext.TEXTURE7];
/**@private */
WebGLContext._useProgram = null;
/**@private */
WebGLContext._depthTest = true;
/**@private */
WebGLContext._depthMask = true;
/**@private */
WebGLContext._depthFunc = WebGLContext.LESS;
/**@private */
WebGLContext._blend = false;
/**@private */
WebGLContext._sFactor = WebGLContext.ONE; //待确认
/**@private */
WebGLContext._dFactor = WebGLContext.ZERO; //待确认
/**@private */
WebGLContext._srcAlpha = WebGLContext.ONE; //待确认
/**@private */
WebGLContext._dstAlpha = WebGLContext.ZERO; //待确认
/**@private */
WebGLContext._cullFace = false;
/**@private */
WebGLContext._frontFace = WebGLContext.CCW;
/**@private */
WebGLContext._activedTextureID = WebGLContext.TEXTURE0; //默认激活纹理区为0
