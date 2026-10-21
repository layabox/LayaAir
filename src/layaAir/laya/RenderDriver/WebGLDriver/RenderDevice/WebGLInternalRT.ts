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

    _textures: (InternalTexture | null)[];
    /** 仅主颜色子 FBO 借用整组附件，不拥有纹理和深度存储。 */
    _owner: WebGLInternalRT = null;
    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    readonly colorFormats?: readonly (RenderTargetFormat | null)[];
    /** 整组 MRT 缓存的主颜色绑定，只拥有 FBO，与整组共享颜色 0 和深度。 */
    _color0Target: WebGLInternalRT = null;
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
    constructor(engine: WebGLEngine, colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat, isCube: boolean, generateMipmap: boolean, samples: number, colorFormats?: readonly (RenderTargetFormat | null)[]) {
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


    dispose(): void {
        if (this._disposed)
            return;
        this._disposed = true;
        this._destroyed = true;
        // 先删除引用存储的子 FBO，再统一释放整组纹理和深度。
        this._color0Target?.dispose();
        this._color0Target = null;
        if (this._textures) {
            if (!this._owner) {
                for (let i = this._textures.length - 1; i > -1; i--)
                    this._textures[i]?.dispose();
            }
        }
        this._textures = null;
        !this._owner && this._depthTexture && this._depthTexture.dispose();
        this._depthTexture = null;
        this._framebuffer && this._gl.deleteFramebuffer(this._framebuffer);
        this._framebuffer = null;
        !this._owner && this._depthbuffer && this._gl.deleteRenderbuffer(this._depthbuffer);
        this._depthbuffer = null;

        this._msaaFramebuffer && this._gl.deleteFramebuffer(this._msaaFramebuffer);
        this._msaaFramebuffer = null;
        this._msaaRenderbuffer && this._gl.deleteRenderbuffer(this._msaaRenderbuffer);
        this._msaaRenderbuffer = null;
        this._owner = null;

        this._changeTexMemory(0);
        this._gpuMemory = 0;
        LayaGL.statAgent.recordCountData(StatElement.C_RenderTexture, -1);
    }
}
