import { LayaGL } from "../../layagl/LayaGL";
import { RenderTargetFormat } from "../../resource/RenderTarget";
import { InternalRenderTarget } from "./InternalRenderTarget";
import { InternalTexture } from "./InternalTexture";

export class WebGLInternalRT implements InternalRenderTarget {

    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    _framebuffer: WebGLFramebuffer;

    _depthbuffer: WebGLRenderbuffer;

    _msaaFramebuffer: WebGLFramebuffer;
    _msaaRenderbuffer: WebGLRenderbuffer;

    _isMulti: boolean;
    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    _textures: InternalTexture[];
    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

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
        if (samples > 1) {
            this._msaaFramebuffer = gl.createFramebuffer();
        }
    }


    dispose(): void {
        this._textures.forEach(tex => {
            tex && tex.dispose();
        });
        this._textures = null;
        this._depthTexture && this._depthTexture.dispose();
        this._depthTexture = null;
        this._framebuffer && this._gl.deleteFramebuffer(this._framebuffer);
        this._framebuffer = null;
        this._depthbuffer && this._gl.deleteRenderbuffer(this._depthbuffer);
        this._depthbuffer = null;

        this._msaaFramebuffer && this._gl.deleteFramebuffer(this._msaaFramebuffer);
        this._msaaFramebuffer = null;
        this._msaaRenderbuffer && this._gl.deleteRenderbuffer(this._msaaRenderbuffer);
        this._msaaRenderbuffer = null;
    }

}