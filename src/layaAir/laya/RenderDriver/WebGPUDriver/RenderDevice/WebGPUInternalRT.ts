import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { WebGPUInternalTex } from "./WebGPUInternalTex";
import { WebGPUGlobal } from "./WebGPUStatis/WebGPUGlobal";



// 静态计数器，用于记录每种格式的RT数量


export class WebGPUInternalRT implements InternalRenderTarget {
    private static _formatCounter: Map<string, number> = new Map();
    private static _pipelineAttachIDCounter: number = 0;
    _isCube: boolean;
    _samples: number; //>1表示启用多重采样
    _generateMipmap: boolean;
    _textures: WebGPUInternalTex[];
    _texturesResolve: WebGPUInternalTex[]; //当启用多重采样时，用于解析的纹理
    _depthTexture: WebGPUInternalTex;
    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;
    isSRGB: boolean = false;
    gpuMemory: number = 0;
    stateCacheKey: string = '';
    stateCacheID: number;

    _colorStates: GPUColorTargetState[];
    _depthState: GPUColorTargetState;

    _renderPassDescriptor: GPURenderPassDescriptor;

    constructor(colorFormat: RenderTargetFormat, depthStencilFormat: RenderTargetFormat,
        isCube: boolean, generateMipmap: boolean, samples: number, sRGB: boolean) {
        this._isCube = isCube;
        this._samples = samples;
        this.isSRGB = sRGB;
        this._generateMipmap = generateMipmap;
        this.colorFormat = colorFormat;
        this.depthStencilFormat = depthStencilFormat;
        this._textures = [];
        if (samples > 1)
            this._texturesResolve = [];
        this._colorStates = [];
        this._getCacheInfo();
        this._renderPassDescriptor = { colorAttachments: [] };
    }

    /**
     * 获取附件格式ID
     * @returns 基于颜色和深度格式的唯一标识符
     */
    private _getCacheInfo(): void {
        let id = this.stateCacheKey;
        // 添加所有颜色附件的格式
        if (this._textures && this._textures.length > 0) {
            for (let i = 0; i < this._textures.length; i++) {
                if (this._textures[i]) {
                    id += `c${i}_${this._textures[i].format}_`;
                }
            }
        }
        // 添加深度附件的格式
        if (this._depthTexture) {
            id += `d_${this._depthTexture.format}`;
        }
        // 添加多重采样信息
        id += `_s${this._samples}`;
        // 添加sRGB信息
        id += this.isSRGB ? '_srgb' : '';
        // 静态计数器，用于记录这是第几个相同格式的RT
        if (!WebGPUInternalRT._formatCounter) {
            WebGPUInternalRT._formatCounter = new Map<string, number>();
        }

        if (WebGPUInternalRT._formatCounter.has(id)) {
            this.stateCacheID = WebGPUInternalRT._formatCounter.get(id);
        } else {
            this.stateCacheID = WebGPUInternalRT._pipelineAttachIDCounter++;
            WebGPUInternalRT._formatCounter.set(id, this.stateCacheID);
        }
    }
    dispose(): void {
        WebGPUGlobal.releaseId(this);

        if (this._textures) {
            for (let i = this._textures.length - 1; i > -1; i--)
                this._textures[i].dispose();
            this._textures.length = 0;
        }
        if (this._texturesResolve) {
            for (let i = this._texturesResolve.length - 1; i > -1; i--)
                this._texturesResolve[i].dispose();
            this._texturesResolve.length = 0;
        }
        if (this._depthTexture) {
            this._depthTexture.dispose();
            this._depthTexture = null;
        }
    }
}