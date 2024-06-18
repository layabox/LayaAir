import { InternalRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WebGLEngine } from "./WebGLEngine";
import { GLObject } from "./WebGLEngine/GLObject";

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
        this._changeTexMemory(value);
        this._gpuMemory = value;
    }

    private _changeTexMemory(value: number) {
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.M_GPUMemory, -this._gpuMemory + value);
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.M_ALLRenderTexture, -this._gpuMemory + value);

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
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.RC_ALLRenderTexture, 1);
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

        this._changeTexMemory(0);
        this.gpuMemory = 0;
        this._engine._addStatisticsInfo(GPUEngineStatisticsInfo.RC_ALLRenderTexture, -1);
    }
}