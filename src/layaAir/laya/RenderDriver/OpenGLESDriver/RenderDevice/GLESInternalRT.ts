import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { InternalTexture } from "../../DriverDesign/RenderDevice/InternalTexture";
import { GLESInternalTex } from "./GLESInternalTex";


export class GLESInternalRT implements InternalRenderTarget {
    _texturesRef: InternalTexture[];
    _depthTextureRef: InternalTexture;
    _nativeObj: any;

    constructor(nativeObj: any) {
        this._nativeObj = nativeObj;
    }
    get _isCube(): boolean {
        return this._nativeObj._isCube;
    }
    set _isCube(value: boolean) {
        this._nativeObj._isCube = value;
    }
    get _samples(): number {
        return this._nativeObj._samples;
    }
    set _samples(value: number) {
        this._nativeObj._samples = value;
    }
    get _generateMipmap(): boolean {
        return this._nativeObj._generateMipmap;
    }
    set _generateMipmap(value: boolean) {
        this._nativeObj._generateMipmap = value;
    }
    get colorFormat(): RenderTargetFormat {
        return this._nativeObj._colorFormat;
    }
    set colorFormat(value: RenderTargetFormat) {
        this._nativeObj._colorFormat = value;
    }
    get depthStencilFormat(): RenderTargetFormat {
        return this._nativeObj._depthStencilFormat;
    }
    set depthStencilFormat(value: RenderTargetFormat) {
        this._nativeObj._depthStencilFormat = value;
    }
    get isSRGB(): boolean {
        return this._nativeObj._isSRGB;
    }
    set isSRGB(value: boolean) {
        this._nativeObj._isSRGB = value;
    }
    get gpuMemory(): number {
        return this._nativeObj._gpuMemory;
    }
    set gpuMemory(value: number) {
        this._nativeObj._gpuMemory = value;
    }
    get _textures(): InternalTexture[] {
        if (this._texturesRef) {
            return this._texturesRef;
        }
        else {
            this._texturesRef = [];
            let textures: any = this._nativeObj.getTextures();
            textures.forEach((element: any) => {
                this._texturesRef.push(new GLESInternalTex(element));
            });
            return this._texturesRef;
        }
    }
    get _depthTexture(): InternalTexture {
        if (this._depthTextureRef) {
            return this._depthTextureRef;
        }
        else {
            var nativeObj = this._nativeObj.getDepthTexture();
            if (nativeObj)
                this._depthTextureRef = new GLESInternalTex(nativeObj);
            return this._depthTextureRef;
        }
    }
    dispose(): void {
        this._nativeObj.dispose();
    }

}