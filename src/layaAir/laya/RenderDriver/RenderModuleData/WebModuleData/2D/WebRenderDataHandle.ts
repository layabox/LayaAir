import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { Vector4 } from "../../../../maths/Vector4";
import { BaseRenderNode2D } from "../../../../NodeRender2D/BaseRenderNode2D";
import { BaseTexture } from "../../../../resource/BaseTexture";
import { Texture } from "../../../../resource/Texture";
import { Texture2D } from "../../../../resource/Texture2D";
import { ShaderDefines2D } from "../../../../webgl/shader/d2/ShaderDefines2D";
import { IRenderContext2D } from "../../../DriverDesign/2DRenderPass/IRenderContext2D";
import { I2DBaseRenderDataHandle, I2DPrimitiveDataHandle, IMesh2DRenderDataHandle, IRender2DDataHandle } from "../../Design/2D/IRender2DDataHandle";
import { WebRenderStruct2D } from "./WebRenderStruct2D";

export abstract class WebRender2DDataHandle implements IRender2DDataHandle {
    owner: WebRenderStruct2D;
    protected _nMatrix_0 = new Vector3();
    protected _nMatrix_1 = new Vector3();
    constructor() {
    }
    destroy(): void {

    }

    inheriteRenderData(context: IRenderContext2D): void {
        //更新位置
        //todo  如果没有更新世界位置 不需要更新Matrix到shaderData
        let data = this.owner.spriteShaderData;
        if (!data)
            return;
        let mat = this.owner.transform.getMatrix();
        this._nMatrix_0.setValue(mat.a, mat.c, mat.tx);
        this._nMatrix_1.setValue(mat.b, mat.d, mat.ty);
        this.owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_0, this._nMatrix_0);
        this.owner.spriteShaderData.setVector3(ShaderDefines2D.UNIFORM_NMATRIX_1, this._nMatrix_1);

        let info = this.owner.getClipInfo();
        // global alpha
        data.setNumber(ShaderDefines2D.UNIFORM_VERTALPHA, this.owner.globalAlpha);

        data.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, info.clipMatDir);
        data.setVector(ShaderDefines2D.UNIFORM_CLIPMATPOS, info.clipMatPos);
    }

}

export class WebPrimitiveDataHandle extends WebRender2DDataHandle implements I2DPrimitiveDataHandle {

    private _textureHost: BaseTexture | Texture;

    public get textureHost(): BaseTexture | Texture {
        return this._textureHost;
    }
    public set textureHost(value: BaseTexture | Texture) {
        if (this._textureHost == value) return;
        this._textureHost = value;
        let textrueReadGamma: boolean = false;
        if (this.textureHost) {
            if (this.textureHost instanceof BaseTexture) {
                textrueReadGamma = (this.textureHost as BaseTexture).gammaCorrection != 1;
            } else if (this.textureHost instanceof Texture && (this.textureHost as Texture).bitmap) {
                textrueReadGamma = (this.textureHost as Texture).bitmap.gammaCorrection != 1;
            }
        }

        let data = this.owner.spriteShaderData
        if (textrueReadGamma) {
            data.addDefine(ShaderDefines2D.GAMMATEXTURE);
        } else {
            data.removeDefine(ShaderDefines2D.GAMMATEXTURE);
        }
        let tex;
        if (value instanceof Texture) {
            tex = value.bitmap;
        } else {
            tex = value;
        }
        data.setTexture(ShaderDefines2D.UNIFORM_SPRITETEXTURE, tex);
    }
}


export class Web2DBaseRenderDataHandle extends WebRender2DDataHandle implements I2DBaseRenderDataHandle {
    private _lightReceive: boolean;

    public get lightReceive(): boolean {
        return this._lightReceive;
    }
    public set lightReceive(value: boolean) {
        this._lightReceive = value;
        if (value) {
            this.owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        } else {
            this.owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_ENABLE);
        }
    }
}

export class WebMesh2DRenderDataHandle extends Web2DBaseRenderDataHandle implements IMesh2DRenderDataHandle {
    private static _setRenderColor: Color = new Color(1, 1, 1, 1);
    private _baseColor: Color = new Color(1, 1, 1, 1);
    private _baseTexture: BaseTexture;
    private _textureRangeIsClip: boolean;
    private _baseTextureRange: Vector4;
    private _normal2DTexture: BaseTexture;
    private _renderAlpha = -1;
    public get baseColor(): Color {
        return this._baseColor;
    }
    public set baseColor(value: Color) {
        if (value != this._baseColor && this._baseColor.equal(value))
            return
        value = value ? value : Color.BLACK;
        value.cloneTo(this._baseColor);
        this._renderAlpha = -1;
    }

    public get baseTexture(): BaseTexture {
        return this._baseTexture;
    }
    public set baseTexture(value: BaseTexture) {
        if (this._baseTexture != null && value == this._baseTexture)
            return;

        if (this._baseTexture)
            this._baseTexture._removeReference();

        this._baseTexture = value;
        value = value ? value : Texture2D.whiteTexture;
        this.owner.spriteShaderData.setTexture(BaseRenderNode2D.BASERENDER2DTEXTURE, value);
        if (value) {
            value._addReference();
            if (value.gammaCorrection != 1) {//预乘纹理特殊处理
                this.owner.spriteShaderData.addDefine(ShaderDefines2D.GAMMATEXTURE);
            } else {
                this.owner.spriteShaderData.removeDefine(ShaderDefines2D.GAMMATEXTURE);
            }
        }
    }

    public get baseTextureRange(): Vector4 {
        return this._baseTextureRange;
    }
    public set baseTextureRange(value: Vector4) {
        if (!value)
            return;
        this.owner.spriteShaderData.setVector(BaseRenderNode2D.BASERENDER2DTEXTURERANGE, value);
        value ? value.cloneTo(this._baseTextureRange) : null;
    }

    public get textureRangeIsClip(): boolean {
        return this._textureRangeIsClip;
    }
    public set textureRangeIsClip(value: boolean) {
        if (this._textureRangeIsClip != value) {
            this._textureRangeIsClip = value;
            if (value)
                this.owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_CLIPMODE);
            else
                this.owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_CLIPMODE);
        }
    }

    public get normal2DTexture(): BaseTexture {
        return this._normal2DTexture;
    }
    public set normal2DTexture(value: BaseTexture) {
        if (value === this._normal2DTexture)
            return;

        if (this._normal2DTexture)
            this._normal2DTexture._removeReference(1)

        if (value)
            value._addReference();
        this._normal2DTexture = value;

        this.owner.spriteShaderData.setTexture(BaseRenderNode2D.NORMAL2DTEXTURE, value);
        if (this._normal2DStrength > 0 && this._normal2DTexture)
            this.owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else
            this.owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }
    private _normal2DStrength: number;
    public get normal2DStrength(): number {
        return this._normal2DStrength;
    }
    public set normal2DStrength(value: number) {
        value = Math.max(0, Math.min(1, value)); //值应该在0~1之间
        if (this._normal2DStrength === value)
            return
        this._normal2DStrength = value;
        this.owner.spriteShaderData.setNumber(BaseRenderNode2D.NORMAL2DSTRENGTH, value);
        if (value > 0 && this._normal2DTexture)
            this.owner.spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
        else this.owner.spriteShaderData.removeDefine(BaseRenderNode2D.SHADERDEFINE_LIGHT2D_NORMAL_PARAM);
    }

    inheriteRenderData(context: IRenderContext2D): void {
        super.inheriteRenderData(context);
        if (this._renderAlpha != this.owner.globalAlpha) {
            let a = this.owner.globalAlpha * this._baseColor.a;
            WebMesh2DRenderDataHandle._setRenderColor.setValue(this._baseColor.r * a, this._baseColor.g * a, this._baseColor.b * a, a);
            this.owner.spriteShaderData.setColor(BaseRenderNode2D.BASERENDER2DCOLOR, WebMesh2DRenderDataHandle._setRenderColor);
            this._renderAlpha = this.owner.globalAlpha;
        }
    }

    //还是否需要这个  按道理 不需要
    // _copyClipInfoToShaderData(shaderData: ShaderData) {
    //     let clipInfo = this._globalClipMatrix;
    //     Vector4.TEMP.setValue(clipInfo.a, clipInfo.b, clipInfo.c, clipInfo.d)
    //     shaderData.setVector(ShaderDefines2D.UNIFORM_CLIPMATDIR, Vector4.TEMP);
    //     Vector2.TEMP.setValue(clipInfo.tx, clipInfo.ty);
    //     shaderData.setVector2(ShaderDefines2D.UNIFORM_CLIPMATPOS, Vector2.TEMP);
    // }

}