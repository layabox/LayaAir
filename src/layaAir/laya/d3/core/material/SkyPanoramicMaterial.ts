import { Texture2D } from "../../../resource/Texture2D";
import { Vector4 } from "../../math/Vector4";
import SkyPanoramicFS from "../../shader/files/SkyPanoramic.fs";
import SkyPanoramicVS from "../../shader/files/SkyPanoramic.vs";
import { SubShader } from "../../shader/SubShader";
import { Material } from "./Material";
import { TextureDecodeFormat } from "../../../RenderEngine/RenderEnum/TextureDecodeFormat";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../math/Color";

/**
 * <code>SkyPanoramicMaterial</code> 类用于实现SkyPanoramicMaterial材质。
 */
export class SkyPanoramicMaterial extends Material {
    static TINTCOLOR: number;
    static EXPOSURE: number;
    static ROTATION: number;
    static TEXTURE: number;
    static TEXTURE_HDR_PARAMS: number;

    /**
     * @internal
     */
    static __init__(): void {

        SkyPanoramicMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_TintColor");
        SkyPanoramicMaterial.EXPOSURE = Shader3D.propertyNameToID("u_Exposure");
        SkyPanoramicMaterial.ROTATION = Shader3D.propertyNameToID("u_Rotation");
        SkyPanoramicMaterial.TEXTURE = Shader3D.propertyNameToID("u_Texture");
        SkyPanoramicMaterial.TEXTURE_HDR_PARAMS = Shader3D.propertyNameToID("u_TextureHDRParams");

        // var shader: Shader3D = Shader3D.add("SkyPanoramic");
        // var subShader: SubShader = new SubShader();
        // shader.addSubShader(subShader);
        // subShader.addShaderPass(SkyPanoramicVS, SkyPanoramicFS);
    }

    /** @internal */
    private _exposure: number = 1.0;
    /** @internal */
    private _textureDecodeFormat: TextureDecodeFormat = TextureDecodeFormat.Normal;
    /** @internal */
    private _textureHDRParams: Vector4 = new Vector4(1.0, 0.0, 0.0, 1.0);

    /**
     * 颜色。
     */
    get tintColor(): Color {
        return this.getColorByIndex(SkyPanoramicMaterial.TINTCOLOR);
    }

    set tintColor(value: Color) {
        this.setColorByIndex(SkyPanoramicMaterial.TINTCOLOR, value);
    }

    /**
     * 曝光强度。
     */
    get exposure(): number {
        return this._exposure;
    }

    set exposure(value: number) {
        if (this._exposure !== value) {
            this._exposure = value;
            if (this._textureDecodeFormat == TextureDecodeFormat.RGBM)
                this._textureHDRParams.x = value * 5.0 /**BaseTexture._rgbmRange */;
            else
                this._textureHDRParams.x = value;
        }
        this.setVector4ByIndex(SkyPanoramicMaterial.TEXTURE_HDR_PARAMS, this._textureHDRParams);
    }

    /**
     * 旋转角度。
     */
    get rotation(): number {
        return this.getFloatByIndex(SkyPanoramicMaterial.ROTATION);
    }

    set rotation(value: number) {
        this.setFloatByIndex(SkyPanoramicMaterial.ROTATION, value);
    }

    /**
     * 全景天空纹理。
     */
    get panoramicTexture(): Texture2D {
        return <Texture2D>this.getTextureByIndex(SkyPanoramicMaterial.TEXTURE);
    }

    set panoramicTexture(value: Texture2D) {
        this.setTextureByIndex(SkyPanoramicMaterial.TEXTURE, value);
    }

    /**
     * 全景天空纹理解码格式。
     */
    get panoramicTextureDecodeFormat(): TextureDecodeFormat {
        return this._textureDecodeFormat;
    }

    set panoramicTextureDecodeFormat(value: TextureDecodeFormat) {
        if (this._textureDecodeFormat !== value) {
            this._textureDecodeFormat = value;
            if (value == TextureDecodeFormat.RGBM)
                this._textureHDRParams.x = this._exposure * 5.0/**BaseTexture._rgbmRange */;
            else
                this._textureHDRParams.x = this._exposure;
        }
        this.setVector4ByIndex(SkyPanoramicMaterial.TEXTURE_HDR_PARAMS, this._textureHDRParams);
    }

    /**
     * 创建一个 <code>SkyPanoramicMaterial</code> 实例。
     */
    constructor() {
        super();
        this.setShaderName("SkyPanoramic");
        this.setColorByIndex(SkyPanoramicMaterial.TINTCOLOR, new Color(0.5, 0.5, 0.5, 0.5));
        this.setFloatByIndex(SkyPanoramicMaterial.ROTATION, 0.0);
        this.setVector4ByIndex(SkyPanoramicMaterial.TEXTURE_HDR_PARAMS, this._textureHDRParams);
    }
}