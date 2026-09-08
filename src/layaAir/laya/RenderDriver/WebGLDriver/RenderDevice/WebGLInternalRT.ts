import { timeStamp } from "console";
import { LayaGL } from "../../../layagl/LayaGL";
import { StatElement } from "../../../layagl/StatisticsContext";
import { InternalRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../../RenderDriver/DriverDesign/RenderDevice/InternalTexture";
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
    _texturesOwnsResources: boolean = true;
    _depthOwnsResources: boolean = true;
    /** Source owners for an immutable, non-owning MRT binding. */
    _sharedTargets?: readonly WebGLInternalRT[];
    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    readonly colorFormats?: readonly RenderTargetFormat[];
    depthStencilFormat: RenderTargetFormat;
    private _disposed: boolean = false;

    // 可选：若本 RT 指向某个 Texture2DArray 的单层，记录层号
    _arrayLayerIndex: number = -1;
    
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
        LayaGL.statAgent.recordMemoryData(StatElement.M_GPUMemory, -this._gpuMemory + value);
        LayaGL.statAgent.recordMemoryData(StatElement.M_RenderTexture, -this._gpuMemory + value);
        LayaGL.statAgent.recordMemoryData(StatElement.M_AllTexture, -this._gpuMemory + value);

    }
    constructor(engine: WebGLEngine, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, isCube: boolean, generateMipmap: boolean, samples: number, colorFormats?: readonly RenderTargetFormat[]) {
        super(engine);

        this.colorFormat = colorFormat;
        if (colorFormats)
            this.colorFormats = Object.freeze(colorFormats.slice());
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
        LayaGL.statAgent.recordCountData(StatElement.C_RenderTexture, 1);
    }

    _getSource() {
        return this._textures[0].resource;
    }


    /** @internal Reject stale bindings before using the framebuffer. */
    _validateSharedAttachments(): void {
        if (!this._sharedTargets) return;
        if (this.destroyed) throw new Error("Cannot use a destroyed MRT view.");
        for (let i = 0; i < this._sharedTargets.length; i++) {
            const source = this._sharedTargets[i];
            if (source.destroyed || source._textures?.[0] !== this._textures[i] || !this._textures[i]?.resource)
                throw new Error("MRT view color source was destroyed or replaced; recreate the view.");
        }
        const source = this._sharedTargets[0];
        if (source._depthTexture !== this._depthTexture || source._depthbuffer !== this._depthbuffer
            || (this._depthTexture && !this._depthTexture.resource))
            throw new Error("MRT view depth/stencil source was destroyed or replaced; recreate the view.");
    }

    dispose(): void {
        if (this._disposed)
            return;
        this._disposed = true;
        this._destroyed = true;
        if (this._textures) {
            if (this._texturesOwnsResources) {
                for (let i = this._textures.length - 1; i > -1; i--)
                    this._textures[i].dispose();
            }
        }
        this._textures = null;
        this._depthOwnsResources && this._depthTexture && this._depthTexture.dispose();
        this._depthTexture = null;
        this._framebuffer && this._gl.deleteFramebuffer(this._framebuffer);
        this._framebuffer = null;
        this._depthOwnsResources && this._depthbuffer && this._gl.deleteRenderbuffer(this._depthbuffer);
        this._depthbuffer = null;

        this._msaaFramebuffer && this._gl.deleteFramebuffer(this._msaaFramebuffer);
        this._msaaFramebuffer = null;
        this._msaaRenderbuffer && this._gl.deleteRenderbuffer(this._msaaRenderbuffer);
        this._msaaRenderbuffer = null;
        this._sharedTargets = null;

        this._changeTexMemory(0);
        this._gpuMemory = 0;
        LayaGL.statAgent.recordCountData(StatElement.C_RenderTexture, -1);
    }
}
