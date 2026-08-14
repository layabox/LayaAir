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
    _depthTexture: InternalTexture;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

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
        LayaGL.statAgent.recordCountData(StatElement.C_RenderTexture, 1);
    }

    _getSource() {
        return this._textures[0].resource;
    }


    dispose(): void {
        if (this._textures) {
            if (this._texturesOwnsResources) {
                for (let i = this._textures.length - 1; i > -1; i--)
                    this._textures[i].dispose();
            }
        }
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
        this._gpuMemory = 0;
        LayaGL.statAgent.recordCountData(StatElement.C_RenderTexture, -1);
    }
}
