import { InternalRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { RenderStatisticsInfo } from "../../RenderEnum/RenderStatInfo";
import { RenderTargetFormat } from "../../RenderEnum/RenderTargetFormat";
import { GLObject } from "./GLObject";
import { WebGLEngine } from "./WebGLEngine";

export class WebGLInternalRT extends GLObject implements InternalRenderTarget {

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

    isSRGB: boolean;

    /**bytelength */
    _gpuMemory: number = 0;

    get gpuMemory(): number {
        return this._gpuMemory;
    }
    set gpuMemory(value: number) {

        this._gpuMemory = value;
        this._engine._addStatisticsInfo(RenderStatisticsInfo.GPUMemory, this._gpuMemory);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.RenderTextureMemory, this._gpuMemory);
    }


    constructor(engine: WebGLEngine, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, isCube: boolean, generateMipmap: boolean, samples: number) {
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

        this._engine._addStatisticsInfo(RenderStatisticsInfo.GPUMemory,-this._gpuMemory);
        this._engine._addStatisticsInfo(RenderStatisticsInfo.RenderTextureMemory,-this._gpuMemory);
        this._gpuMemory = 0;
    }
}