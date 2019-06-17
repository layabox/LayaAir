export declare class WebGLContext {
    static DEPTH_BUFFER_BIT: number;
    static STENCIL_BUFFER_BIT: number;
    static COLOR_BUFFER_BIT: number;
    static POINTS: number;
    static LINES: number;
    static LINE_LOOP: number;
    static LINE_STRIP: number;
    static TRIANGLES: number;
    static TRIANGLE_STRIP: number;
    static TRIANGLE_FAN: number;
    static ZERO: number;
    static ONE: number;
    static SRC_COLOR: number;
    static ONE_MINUS_SRC_COLOR: number;
    static SRC_ALPHA: number;
    static ONE_MINUS_SRC_ALPHA: number;
    static DST_ALPHA: number;
    static ONE_MINUS_DST_ALPHA: number;
    static DST_COLOR: number;
    static ONE_MINUS_DST_COLOR: number;
    static SRC_ALPHA_SATURATE: number;
    static FUNC_ADD: number;
    static BLEND_EQUATION: number;
    static BLEND_EQUATION_RGB: number;
    static BLEND_EQUATION_ALPHA: number;
    static FUNC_SUBTRACT: number;
    static FUNC_REVERSE_SUBTRACT: number;
    static BLEND_DST_RGB: number;
    static BLEND_SRC_RGB: number;
    static BLEND_DST_ALPHA: number;
    static BLEND_SRC_ALPHA: number;
    static CONSTANT_COLOR: number;
    static ONE_MINUS_CONSTANT_COLOR: number;
    static CONSTANT_ALPHA: number;
    static ONE_MINUS_CONSTANT_ALPHA: number;
    static BLEND_COLOR: number;
    static ARRAY_BUFFER: number;
    static ELEMENT_ARRAY_BUFFER: number;
    static ARRAY_BUFFER_BINDING: number;
    static ELEMENT_ARRAY_BUFFER_BINDING: number;
    static STREAM_DRAW: number;
    static STATIC_DRAW: number;
    static DYNAMIC_DRAW: number;
    static BUFFER_SIZE: number;
    static BUFFER_USAGE: number;
    static CURRENT_VERTEX_ATTRIB: number;
    static FRONT: number;
    static BACK: number;
    static CULL_FACE: number;
    static FRONT_AND_BACK: number;
    static BLEND: number;
    static DITHER: number;
    static STENCIL_TEST: number;
    static DEPTH_TEST: number;
    static SCISSOR_TEST: number;
    static POLYGON_OFFSET_FILL: number;
    static SAMPLE_ALPHA_TO_COVERAGE: number;
    static SAMPLE_COVERAGE: number;
    static NO_ERROR: number;
    static INVALID_ENUM: number;
    static INVALID_VALUE: number;
    static INVALID_OPERATION: number;
    static OUT_OF_MEMORY: number;
    static CW: number;
    static CCW: number;
    static LINE_WIDTH: number;
    static ALIASED_POINT_SIZE_RANGE: number;
    static ALIASED_LINE_WIDTH_RANGE: number;
    static CULL_FACE_MODE: number;
    static FRONT_FACE: number;
    static DEPTH_RANGE: number;
    static DEPTH_WRITEMASK: number;
    static DEPTH_CLEAR_VALUE: number;
    static DEPTH_FUNC: number;
    static STENCIL_CLEAR_VALUE: number;
    static STENCIL_FUNC: number;
    static STENCIL_FAIL: number;
    static STENCIL_PASS_DEPTH_FAIL: number;
    static STENCIL_PASS_DEPTH_PASS: number;
    static STENCIL_REF: number;
    static STENCIL_VALUE_MASK: number;
    static STENCIL_WRITEMASK: number;
    static STENCIL_BACK_FUNC: number;
    static STENCIL_BACK_FAIL: number;
    static STENCIL_BACK_PASS_DEPTH_FAIL: number;
    static STENCIL_BACK_PASS_DEPTH_PASS: number;
    static STENCIL_BACK_REF: number;
    static STENCIL_BACK_VALUE_MASK: number;
    static STENCIL_BACK_WRITEMASK: number;
    static VIEWPORT: number;
    static SCISSOR_BOX: number;
    static COLOR_CLEAR_VALUE: number;
    static COLOR_WRITEMASK: number;
    static UNPACK_ALIGNMENT: number;
    static PACK_ALIGNMENT: number;
    static MAX_TEXTURE_SIZE: number;
    static MAX_VIEWPORT_DIMS: number;
    static SUBPIXEL_BITS: number;
    static RED_BITS: number;
    static GREEN_BITS: number;
    static BLUE_BITS: number;
    static ALPHA_BITS: number;
    static DEPTH_BITS: number;
    static STENCIL_BITS: number;
    static POLYGON_OFFSET_UNITS: number;
    static POLYGON_OFFSET_FACTOR: number;
    static TEXTURE_BINDING_2D: number;
    static SAMPLE_BUFFERS: number;
    static SAMPLES: number;
    static SAMPLE_COVERAGE_VALUE: number;
    static SAMPLE_COVERAGE_INVERT: number;
    static NUM_COMPRESSED_TEXTURE_FORMATS: number;
    static COMPRESSED_TEXTURE_FORMATS: number;
    static DONT_CARE: number;
    static FASTEST: number;
    static NICEST: number;
    static GENERATE_MIPMAP_HINT: number;
    static BYTE: number;
    static UNSIGNED_BYTE: number;
    static SHORT: number;
    static UNSIGNED_SHORT: number;
    static INT: number;
    static UNSIGNED_INT: number;
    static FLOAT: number;
    static DEPTH_COMPONENT: number;
    static ALPHA: number;
    static RGB: number;
    static RGBA: number;
    static LUMINANCE: number;
    static LUMINANCE_ALPHA: number;
    static UNSIGNED_SHORT_4_4_4_4: number;
    static UNSIGNED_SHORT_5_5_5_1: number;
    static UNSIGNED_SHORT_5_6_5: number;
    static FRAGMENT_SHADER: number;
    static VERTEX_SHADER: number;
    static MAX_VERTEX_ATTRIBS: number;
    static MAX_VERTEX_UNIFORM_VECTORS: number;
    static MAX_VARYING_VECTORS: number;
    static MAX_COMBINED_TEXTURE_IMAGE_UNITS: number;
    static MAX_VERTEX_TEXTURE_IMAGE_UNITS: number;
    static MAX_TEXTURE_IMAGE_UNITS: number;
    static MAX_FRAGMENT_UNIFORM_VECTORS: number;
    static SHADER_TYPE: number;
    static DELETE_STATUS: number;
    static LINK_STATUS: number;
    static VALIDATE_STATUS: number;
    static ATTACHED_SHADERS: number;
    static ACTIVE_UNIFORMS: number;
    static ACTIVE_ATTRIBUTES: number;
    static SHADING_LANGUAGE_VERSION: number;
    static CURRENT_PROGRAM: number;
    static NEVER: number;
    static LESS: number;
    static EQUAL: number;
    static LEQUAL: number;
    static GREATER: number;
    static NOTEQUAL: number;
    static GEQUAL: number;
    static ALWAYS: number;
    static KEEP: number;
    static REPLACE: number;
    static INCR: number;
    static DECR: number;
    static INVERT: number;
    static INCR_WRAP: number;
    static DECR_WRAP: number;
    static VENDOR: number;
    static RENDERER: number;
    static VERSION: number;
    static NEAREST: number;
    static LINEAR: number;
    static NEAREST_MIPMAP_NEAREST: number;
    static LINEAR_MIPMAP_NEAREST: number;
    static NEAREST_MIPMAP_LINEAR: number;
    static LINEAR_MIPMAP_LINEAR: number;
    static TEXTURE_MAG_FILTER: number;
    static TEXTURE_MIN_FILTER: number;
    static TEXTURE_WRAP_S: number;
    static TEXTURE_WRAP_T: number;
    static TEXTURE_2D: number;
    static TEXTURE_3D: number;
    static TEXTURE: number;
    static TEXTURE_CUBE_MAP: number;
    static TEXTURE_BINDING_CUBE_MAP: number;
    static TEXTURE_CUBE_MAP_POSITIVE_X: number;
    static TEXTURE_CUBE_MAP_NEGATIVE_X: number;
    static TEXTURE_CUBE_MAP_POSITIVE_Y: number;
    static TEXTURE_CUBE_MAP_NEGATIVE_Y: number;
    static TEXTURE_CUBE_MAP_POSITIVE_Z: number;
    static TEXTURE_CUBE_MAP_NEGATIVE_Z: number;
    static MAX_CUBE_MAP_TEXTURE_SIZE: number;
    static TEXTURE0: number;
    static TEXTURE1: number;
    static TEXTURE2: number;
    static TEXTURE3: number;
    static TEXTURE4: number;
    static TEXTURE5: number;
    static TEXTURE6: number;
    static TEXTURE7: number;
    static TEXTURE8: number;
    static TEXTURE9: number;
    static TEXTURE10: number;
    static TEXTURE11: number;
    static TEXTURE12: number;
    static TEXTURE13: number;
    static TEXTURE14: number;
    static TEXTURE15: number;
    static TEXTURE16: number;
    static TEXTURE17: number;
    static TEXTURE18: number;
    static TEXTURE19: number;
    static TEXTURE20: number;
    static TEXTURE21: number;
    static TEXTURE22: number;
    static TEXTURE23: number;
    static TEXTURE24: number;
    static TEXTURE25: number;
    static TEXTURE26: number;
    static TEXTURE27: number;
    static TEXTURE28: number;
    static TEXTURE29: number;
    static TEXTURE30: number;
    static TEXTURE31: number;
    static ACTIVE_TEXTURE: number;
    static REPEAT: number;
    static CLAMP_TO_EDGE: number;
    static MIRRORED_REPEAT: number;
    static FLOAT_VEC2: number;
    static FLOAT_VEC3: number;
    static FLOAT_VEC4: number;
    static INT_VEC2: number;
    static INT_VEC3: number;
    static INT_VEC4: number;
    static BOOL: number;
    static BOOL_VEC2: number;
    static BOOL_VEC3: number;
    static BOOL_VEC4: number;
    static FLOAT_MAT2: number;
    static FLOAT_MAT3: number;
    static FLOAT_MAT4: number;
    static SAMPLER_2D: number;
    static SAMPLER_CUBE: number;
    static VERTEX_ATTRIB_ARRAY_ENABLED: number;
    static VERTEX_ATTRIB_ARRAY_SIZE: number;
    static VERTEX_ATTRIB_ARRAY_STRIDE: number;
    static VERTEX_ATTRIB_ARRAY_TYPE: number;
    static VERTEX_ATTRIB_ARRAY_NORMALIZED: number;
    static VERTEX_ATTRIB_ARRAY_POINTER: number;
    static VERTEX_ATTRIB_ARRAY_BUFFER_BINDING: number;
    static COMPILE_STATUS: number;
    static LOW_FLOAT: number;
    static MEDIUM_FLOAT: number;
    static HIGH_FLOAT: number;
    static LOW_INT: number;
    static MEDIUM_INT: number;
    static HIGH_INT: number;
    static FRAMEBUFFER: number;
    static RENDERBUFFER: number;
    static RGBA4: number;
    static RGB5_A1: number;
    static RGB565: number;
    static DEPTH_COMPONENT16: number;
    static STENCIL_INDEX: number;
    static STENCIL_INDEX8: number;
    static DEPTH_STENCIL: number;
    static RENDERBUFFER_WIDTH: number;
    static RENDERBUFFER_HEIGHT: number;
    static RENDERBUFFER_INTERNAL_FORMAT: number;
    static RENDERBUFFER_RED_SIZE: number;
    static RENDERBUFFER_GREEN_SIZE: number;
    static RENDERBUFFER_BLUE_SIZE: number;
    static RENDERBUFFER_ALPHA_SIZE: number;
    static RENDERBUFFER_DEPTH_SIZE: number;
    static RENDERBUFFER_STENCIL_SIZE: number;
    static FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE: number;
    static FRAMEBUFFER_ATTACHMENT_OBJECT_NAME: number;
    static FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL: number;
    static FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE: number;
    static COLOR_ATTACHMENT0: number;
    static DEPTH_ATTACHMENT: number;
    static STENCIL_ATTACHMENT: number;
    static DEPTH_STENCIL_ATTACHMENT: number;
    static NONE: number;
    static FRAMEBUFFER_COMPLETE: number;
    static FRAMEBUFFER_INCOMPLETE_ATTACHMENT: number;
    static FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: number;
    static FRAMEBUFFER_INCOMPLETE_DIMENSIONS: number;
    static FRAMEBUFFER_UNSUPPORTED: number;
    static FRAMEBUFFER_BINDING: number;
    static RENDERBUFFER_BINDING: number;
    static MAX_RENDERBUFFER_SIZE: number;
    static INVALID_FRAMEBUFFER_OPERATION: number;
    static UNPACK_FLIP_Y_WEBGL: number;
    static UNPACK_PREMULTIPLY_ALPHA_WEBGL: number;
    static CONTEXT_LOST_WEBGL: number;
    static UNPACK_COLORSPACE_CONVERSION_WEBGL: number;
    static BROWSER_DEFAULT_WEBGL: number;
    static HALF_FLOAT: number;
    static RGB16F: number;
    static RGBA16F: number;
    /**@private */
    static mainContext: WebGLContext;
    /**@private */
    static _activeTextures: any[];
    /**@private */
    static _glTextureIDs: any[];
    /**@private */
    static _useProgram: any;
    /**@private */
    static _depthTest: boolean;
    /**@private */
    static _depthMask: boolean;
    /**@private */
    static _depthFunc: number;
    /**@private */
    static _blend: boolean;
    /**@private */
    static _sFactor: number;
    /**@private */
    static _dFactor: number;
    /**@private */
    static _srcAlpha: number;
    /**@private */
    static _dstAlpha: number;
    /**@private */
    static _cullFace: boolean;
    /**@private */
    static _frontFace: number;
    /**@private */
    static _activedTextureID: number;
    /**
     * @private
     */
    static useProgram(gl: WebGLContext, program: any): boolean;
    /**
     * @private
     */
    static setDepthTest(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthMask(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthFunc(gl: WebGLContext, value: number): void;
    /**
     * @private
     */
    static setBlend(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setBlendFunc(gl: WebGLContext, sFactor: number, dFactor: number): void;
    /**
     * @private
     */
    static setBlendFuncSeperate(gl: WebGLContext, srcRGB: number, dstRGB: number, srcAlpha: number, dstAlpha: number): void;
    /**
     * @private
     */
    static setCullFace(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setFrontFace(gl: WebGLContext, value: number): void;
    /**
     * @private
     */
    static activeTexture(gl: WebGLContext, textureID: number): void;
    /**
     * @private
     */
    static bindTexture(gl: WebGLContext, target: any, texture: any): void;
    getContextAttributes(): any;
    isContextLost(): void;
    getSupportedExtensions(): any;
    getExtension(name: string): any;
    activeTexture(texture: any): void;
    attachShader(program: any, shader: any): void;
    bindAttribLocation(program: any, index: number, name: string): void;
    bindBuffer(target: any, buffer: any): void;
    bindFramebuffer(target: any, framebuffer: any): void;
    bindRenderbuffer(target: any, renderbuffer: any): void;
    bindTexture(target: any, texture: any): void;
    useTexture(value: boolean): void;
    blendColor(red: any, green: any, blue: any, alpha: number): void;
    blendEquation(mode: any): void;
    blendEquationSeparate(modeRGB: any, modeAlpha: any): void;
    blendFunc(sfactor: any, dfactor: any): void;
    blendFuncSeparate(srcRGB: any, dstRGB: any, srcAlpha: any, dstAlpha: any): void;
    bufferData(target: any, size: any, usage: any): void;
    bufferSubData(target: any, offset: number, data: any): void;
    checkFramebufferStatus(target: any): any;
    clear(mask: number): void;
    clearColor(red: any, green: any, blue: any, alpha: number): void;
    clearDepth(depth: any): void;
    clearStencil(s: any): void;
    colorMask(red: boolean, green: boolean, blue: boolean, alpha: boolean): void;
    compileShader(shader: any): void;
    copyTexImage2D(target: any, level: any, internalformat: any, x: number, y: number, width: number, height: number, border: any): void;
    copyTexSubImage2D(target: any, level: any, xoffset: number, yoffset: number, x: number, y: number, width: number, height: number): void;
    createBuffer(): any;
    createFramebuffer(): any;
    createProgram(): any;
    createRenderbuffer(): any;
    createShader(type: any): any;
    createTexture(): any;
    cullFace(mode: any): void;
    deleteBuffer(buffer: any): void;
    deleteFramebuffer(framebuffer: any): void;
    deleteProgram(program: any): void;
    deleteRenderbuffer(renderbuffer: any): void;
    deleteShader(shader: any): void;
    deleteTexture(texture: any): void;
    depthFunc(func: any): void;
    depthMask(flag: any): void;
    depthRange(zNear: any, zFar: any): void;
    detachShader(program: any, shader: any): void;
    disable(cap: any): void;
    disableVertexAttribArray(index: number): void;
    drawArrays(mode: any, first: number, count: number): void;
    drawElements(mode: any, count: number, type: any, offset: number): void;
    enable(cap: any): void;
    enableVertexAttribArray(index: number): void;
    finish(): void;
    flush(): void;
    framebufferRenderbuffer(target: any, attachment: any, renderbuffertarget: any, renderbuffer: any): void;
    framebufferTexture2D(target: any, attachment: any, textarget: any, texture: any, level: any): void;
    frontFace(mode: any): any;
    generateMipmap(target: any): any;
    getActiveAttrib(program: any, index: number): any;
    getActiveUniform(program: any, index: number): any;
    getAttribLocation(program: any, name: string): any;
    getParameter(pname: any): any;
    getBufferParameter(target: any, pname: any): any;
    getError(): any;
    getFramebufferAttachmentParameter(target: any, attachment: any, pname: any): void;
    getProgramParameter(program: any, pname: any): number;
    getProgramInfoLog(program: any): any;
    getRenderbufferParameter(target: any, pname: any): any;
    getShaderPrecisionFormat(...arg: any[]): any;
    getShaderParameter(shader: any, pname: any): any;
    getShaderInfoLog(shader: any): any;
    getShaderSource(shader: any): any;
    getTexParameter(target: any, pname: any): void;
    getUniform(program: any, location: number): void;
    getUniformLocation(program: any, name: string): any;
    getVertexAttrib(index: number, pname: any): any;
    getVertexAttribOffset(index: number, pname: any): any;
    hint(target: any, mode: any): void;
    isBuffer(buffer: any): void;
    isEnabled(cap: any): void;
    isFramebuffer(framebuffer: any): void;
    isProgram(program: any): void;
    isRenderbuffer(renderbuffer: any): void;
    isShader(shader: any): void;
    isTexture(texture: any): void;
    lineWidth(width: number): void;
    linkProgram(program: any): void;
    pixelStorei(pname: any, param: any): void;
    polygonOffset(factor: any, units: any): void;
    readPixels(x: number, y: number, width: number, height: number, format: any, type: any, pixels: any): void;
    renderbufferStorage(target: any, internalformat: any, width: number, height: number): void;
    sampleCoverage(value: any, invert: any): void;
    scissor(x: number, y: number, width: number, height: number): void;
    shaderSource(shader: any, source: any): void;
    stencilFunc(func: number, ref: number, mask: number): void;
    stencilFuncSeparate(face: number, func: number, ref: number, mask: number): void;
    stencilMask(mask: any): void;
    stencilMaskSeparate(face: any, mask: any): void;
    stencilOp(fail: number, zfail: number, zpass: number): void;
    stencilOpSeparate(face: number, fail: number, zfail: number, zpass: number): void;
    texImage2D(...args: any[]): void;
    texParameterf(target: any, pname: any, param: any): void;
    texParameteri(target: any, pname: any, param: any): void;
    texSubImage2D(...args: any[]): void;
    uniform1f(location: any, x: number): void;
    uniform1fv(location: any, v: any): void;
    uniform1i(location: any, x: number): void;
    uniform1iv(location: any, v: any): void;
    uniform2f(location: any, x: number, y: number): void;
    uniform2fv(location: any, v: any): void;
    uniform2i(location: any, x: number, y: number): void;
    uniform2iv(location: any, v: any): void;
    uniform3f(location: any, x: number, y: number, z: number): void;
    uniform3fv(location: any, v: any): void;
    uniform3i(location: any, x: number, y: number, z: number): void;
    uniform3iv(location: any, v: any): void;
    uniform4f(location: any, x: number, y: number, z: number, w: number): void;
    uniform4fv(location: any, v: any): void;
    uniform4i(location: any, x: number, y: number, z: number, w: number): void;
    uniform4iv(location: any, v: any): void;
    uniformMatrix2fv(location: any, transpose: any, value: any): void;
    uniformMatrix3fv(location: any, transpose: any, value: any): void;
    uniformMatrix4fv(location: any, transpose: any, value: any): void;
    useProgram(program: any): void;
    validateProgram(program: any): void;
    vertexAttrib1f(indx: any, x: number): void;
    vertexAttrib1fv(indx: any, values: any): void;
    vertexAttrib2f(indx: any, x: number, y: number): void;
    vertexAttrib2fv(indx: any, values: any): void;
    vertexAttrib3f(indx: any, x: number, y: number, z: number): void;
    vertexAttrib3fv(indx: any, values: any): void;
    vertexAttrib4f(indx: any, x: number, y: number, z: number, w: number): void;
    vertexAttrib4fv(indx: any, values: any): void;
    vertexAttribPointer(indx: any, size: any, type: any, normalized: any, stride: any, offset: number): void;
    viewport(x: number, y: number, width: number, height: number): void;
    configureBackBuffer(width: number, height: number, antiAlias: number, enableDepthAndStencil?: boolean, wantsBestResolution?: boolean): void;
    compressedTexImage2D(...args: any[]): void;
    /**
     * @private
     */
    static __init_native(): void;
    /**
     * @private
     */
    static useProgramForNative(gl: WebGLContext, program: any): boolean;
    /**
     * @private
     */
    static setDepthTestForNative(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthMaskForNative(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setDepthFuncForNative(gl: WebGLContext, value: number): void;
    /**
     * @private
     */
    static setBlendForNative(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setBlendFuncForNative(gl: WebGLContext, sFactor: number, dFactor: number): void;
    /**
     * @private
     */
    static setCullFaceForNative(gl: WebGLContext, value: boolean): void;
    /**
     * @private
     */
    static setFrontFaceForNative(gl: WebGLContext, value: number): void;
    /**
     * @private
     */
    static activeTextureForNative(gl: WebGLContext, textureID: number): void;
    /**
     * @private
     */
    static bindTextureForNative(gl: WebGLContext, target: any, texture: any): void;
    /**
     * @private
     */
    static bindVertexArrayForNative(gl: WebGLContext, vertexArray: any): void;
}
