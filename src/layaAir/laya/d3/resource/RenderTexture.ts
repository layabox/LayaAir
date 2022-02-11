import { LayaGL } from "../../layagl/LayaGL";
import { BaseTexture } from "../../resource/BaseTexture";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { InternalRenderTarget } from "../WebGL/InternalRenderTarget";
import { TextureDimension } from "../WebGL/InternalTexture";
import { RenderTarget, RenderTargetFormat } from "../../resource/RenderTarget";


export class RenderTexture extends BaseTexture implements RenderTarget {

    // todo 记录当前 绑定 rt  位置不放在这里
    protected static _currentActive: RenderTexture = null;

    static get currentActive(): RenderTexture {
        return RenderTexture._currentActive;
    }

    private static _pool: RenderTexture[] = [];

    static createFromPool(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, mipmap: boolean, multiSamples: number) {

        // todo mipmap 判断
        mipmap = mipmap && (width & (width - 1)) === 0 && (height & (height - 1)) === 0;

        let n = RenderTexture._pool.length;
        for (let index = 0; index < n; index++) {
            let rt = RenderTexture._pool[index];

            if (rt.width == width && rt.height == height && rt.colorFormat == colorFormat && rt.depthStencilFormat == depthFormat && rt._generateMipmap == mipmap && rt.multiSamples == multiSamples) {
                rt._inPool = false;
                let end = RenderTexture._pool[n - 1];
                RenderTexture._pool[index] = end;
                RenderTexture._pool.length -= 1;
                return rt;
            }
        }

        let rt = new RenderTexture(width, height, colorFormat, depthFormat, mipmap, multiSamples);
        rt.lock = true;
        return rt;
    }

    static recoverToPool(rt: RenderTexture): void {
        if (rt._inPool || rt.destroyed)
            return;

        RenderTexture._pool.push(rt);
        rt._inPool = true;
    }

    /** @internal 最后绑定到主画布上的结果 此值可能为null*/
    private static _bindCanvasRender: RenderTexture;
    /**
     * 绑定到主画布上的RenderTexture
     */
    static get bindCanvasRender(): RenderTexture {
        return RenderTexture._bindCanvasRender;
    }

    static set bindCanvasRender(value: RenderTexture) {
        if (value != this._bindCanvasRender)
            (this._bindCanvasRender) && RenderTexture.recoverToPool(this._bindCanvasRender);
        this._bindCanvasRender = value;
    }


    _inPool: boolean = false;

    _isCameraTarget: boolean = false;

    _renderTarget: InternalRenderTarget;

    _generateMipmap: boolean;

    colorFormat: RenderTargetFormat;
    depthStencilFormat: RenderTargetFormat;

    multiSamples: number;

    get isCube(): boolean {
        return this._renderTarget._isCube;
    }

    get isMulti(): boolean {
        return this._renderTarget._isMulti;
    }

    // todo format
    constructor(width: number, height: number, colorFormat: RenderTargetFormat, depthFormat: RenderTargetFormat, generateMipmap: boolean, multiSamples: number) {
        super(width, height, colorFormat);

        this._dimension = TextureDimension.Tex2D;
        this._gammaSpace = true;

        this.colorFormat = colorFormat;
        this.depthStencilFormat = depthFormat;
        this._generateMipmap = generateMipmap;
        this.multiSamples = multiSamples;

        // todo format 
        this._createRenderTarget();
    }

    _createRenderTarget() {
        this._renderTarget = LayaGL.layaContext.createRenderTargetInternal(this._dimension, this.width, this.height, this.colorFormat, this._generateMipmap, true, this.depthStencilFormat, this.multiSamples);

        this._texture = this._renderTarget._textures[0];
    }

    _start() {
        RenderTexture._currentActive = this;

        LayaGL.layaContext.bindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = true);
    }

    _end() {
        RenderTexture._currentActive = null;

        LayaGL.layaContext.unbindRenderTarget(this._renderTarget);
        (this._isCameraTarget) && (RenderContext3D._instance.invertY = false);
    }

    protected _disposeResource(): void {
        this._renderTarget.dispose();
    }

}