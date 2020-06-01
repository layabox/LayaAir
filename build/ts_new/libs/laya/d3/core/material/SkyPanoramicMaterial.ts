import { Texture2D } from "../../../resource/Texture2D";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { Vector4 } from "../../math/Vector4";
import SkyPanoramicFS from "../../shader/files/SkyPanoramic.fs";
import SkyPanoramicVS from "../../shader/files/SkyPanoramic.vs";
import { Shader3D } from "../../shader/Shader3D";
import { SubShader } from "../../shader/SubShader";
import { Material } from "./Material";
import { TextureDecodeFormat } from "../../../resource/TextureDecodeFormat";
import { BaseTexture } from "../../../resource/BaseTexture";
import { ShaderData } from "../../shader/ShaderData";

/**
 * <code>SkyPanoramicMaterial</code> 类用于实现SkyPanoramicMaterial材质。
 */
export class SkyPanoramicMaterial extends Material {
    static TINTCOLOR: number = Shader3D.propertyNameToID("u_TintColor");
    static EXPOSURE: number = Shader3D.propertyNameToID("u_Exposure");
    static ROTATION: number = Shader3D.propertyNameToID("u_Rotation");
    static TEXTURE: number = Shader3D.propertyNameToID("u_Texture");
    static TEXTURE_HDR_PARAMS: number = Shader3D.propertyNameToID("u_TextureHDRParams");

    /**
	 * @internal
	 */
    static __init__(): void {
        var attributeMap: any = {
            'a_Position': VertexMesh.MESH_POSITION0
        };
        var uniformMap: any = {
            'u_TintColor': Shader3D.PERIOD_MATERIAL,
            'u_TextureHDRParams': Shader3D.PERIOD_MATERIAL,
            'u_Rotation': Shader3D.PERIOD_MATERIAL,
            'u_Texture': Shader3D.PERIOD_MATERIAL,
            'u_ViewProjection': Shader3D.PERIOD_CAMERA
        };
        var shader: Shader3D = Shader3D.add("SkyPanoramic");
        var subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(SkyPanoramicVS, SkyPanoramicFS);
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
    get tintColor(): Vector4 {
        return <Vector4>this._shaderValues.getVector(SkyPanoramicMaterial.TINTCOLOR);
    }

    set tintColor(value: Vector4) {
        this._shaderValues.setVector(SkyPanoramicMaterial.TINTCOLOR, value);
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
                this._textureHDRParams.x = value * BaseTexture._rgbmRange;
            else
                this._textureHDRParams.x = value;
        }
    }

	/**
	 * 旋转角度。
	 */
    get rotation(): number {
        return this._shaderValues.getNumber(SkyPanoramicMaterial.ROTATION);
    }

    set rotation(value: number) {
        this._shaderValues.setNumber(SkyPanoramicMaterial.ROTATION, value);
    }

	/**
	 * 全景天空纹理。
	 */
    get panoramicTexture(): Texture2D {
        return <Texture2D>this._shaderValues.getTexture(SkyPanoramicMaterial.TEXTURE);
    }

    set panoramicTexture(value: Texture2D) {
        this._shaderValues.setTexture(SkyPanoramicMaterial.TEXTURE, value);
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
                this._textureHDRParams.x = this._exposure * BaseTexture._rgbmRange;
            else
                this._textureHDRParams.x = this._exposure;
        }
    }

    /**
	 * 创建一个 <code>SkyPanoramicMaterial</code> 实例。
	 */
    constructor() {
        super();
        this.setShaderName("SkyPanoramic");
        var shaderValues: ShaderData = this._shaderValues;
        shaderValues.setVector(SkyPanoramicMaterial.TINTCOLOR, new Vector4(0.5, 0.5, 0.5, 0.5));
        shaderValues.setNumber(SkyPanoramicMaterial.ROTATION, 0.0);
        shaderValues.setVector(SkyPanoramicMaterial.TEXTURE_HDR_PARAMS, this._textureHDRParams);
    }
}