import { RenderTargetFormat } from "../../RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../RenderInterface/InternalRenderTarget";
import { InternalTexture } from "../../RenderInterface/InternalTexture";
import { NativeGLObject } from "./NativeGLObject";
import { NativeWebGLEngine } from "./NativeWebGLEngine";

export class NativeWebGLInternalRT extends NativeGLObject implements InternalRenderTarget {

    _gl: WebGLRenderingContext | WebGL2RenderingContext;

    _framebuffer: WebGLFramebuffer;

    _depthbuffer: WebGLRenderbuffer;

    _msaaFramebuffer: WebGLFramebuffer;
    _msaaRenderbuffer: WebGLRenderbuffer;

    _isCube: boolean;
    _samples: number;

    _generateMipmap: boolean;

    _textures: InternalTexture[];
    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

    constructor(engine: NativeWebGLEngine, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, isCube: boolean, generateMipmap: boolean, samples: number) {
        super(engine);

        this.colorFormat = colorFormat;
        this.depthStencilFormat = depthStencilFormat;
        this._isCube = isCube;
        this._generateMipmap = generateMipmap;
        this._samples = samples;

        this._textures = [];
        this._depthTexture = null;

        this._framebuffer = this._gl.createFramebuffer();
        if (samples > 1) {
            this._msaaFramebuffer = this._gl.createFramebuffer();
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