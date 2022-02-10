import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "./BaseTexture";
import { InternalRenderTarget } from "./InternalRenderTarget";
import { RenderTarget, RenderTargetFormat } from "./RenderTarget";
import { RenderTexture } from "./RenderTexture";

export class MultiRenderTexture extends BaseTexture implements RenderTarget {

    textureCount: number;

    textures: BaseTexture[];

    depthTexture: BaseTexture;

    _renderTarget: InternalRenderTarget;

    // todo multi color attachment
    constructor(width: number, height: number, count: number, colorFormats: RenderTargetFormat[], depthFormat: RenderTargetFormat, generateMipmap: boolean, multiSamples: number) {

        super(width, height, colorFormats[0]);
        this.textureCount = count;
        this.textures = new Array<BaseTexture>(count);

    }
    _start(): void {
        throw new Error("Method not implemented.");
    }
    _end(): void {
        throw new Error("Method not implemented.");
    }

}