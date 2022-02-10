import { LayaGL } from "../../layagl/LayaGL";
import { InternalRenderTarget } from "./InternalRenderTarget";
import { InternalTexture } from "./InternalTexture";

export class WebGLInternalRT implements InternalRenderTarget {

    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    _framebuffer: WebGLFramebuffer;

    _depthbuffer: WebGLRenderbuffer;

    _isMulti: boolean;
    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    _textures: InternalTexture[];
    _depthTexture: InternalTexture;

    constructor(isMRT: boolean, isCube: boolean, generateMipmap: boolean, samples: number) {
        let gl = LayaGL.instance;
        this._gl = gl;

        this._isMulti = isMRT;
        this._isCube = isCube;
        this._generateMipmap = generateMipmap;
        this._samples = samples;

        this._textures = [];
        this._depthTexture = null;

        this._framebuffer = gl.createFramebuffer();
    }


}