import { Texture2D } from "../../../resource/Texture2D";
import { Material } from "../../../resource/Material";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";

/**
 * @en The SkyPanoramicMaterial class is used to implement SkyPanoramicMaterial material.
 * @zh SkyPanoramicMaterial 类用于实现全景天空材质。
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
        SkyPanoramicMaterial.TEXTURE_HDR_PARAMS = Shader3D.propertyNameToID("u_Texture_HDR_params");
    }
    /** @internal */
    private _textureHDRParams: Vector4 = new Vector4(1.0, 0.0, 0.0, 1.0);

    /**
     * @en Tint color of the panoramic sky.
     * @zh 全景天空的颜色。
     */
    get tintColor(): Color {
        return this.getColorByIndex(SkyPanoramicMaterial.TINTCOLOR);
    }

    set tintColor(value: Color) {
        this.setColorByIndex(SkyPanoramicMaterial.TINTCOLOR, value);
    }

    /**
     * @en Exposure intensity of the panoramic sky.
     * @zh 全景天空的曝光强度。
     */
    get exposure(): number {
        return this.getFloatByIndex(SkyPanoramicMaterial.EXPOSURE);
    }

    set exposure(value: number) {
        this.setFloatByIndex(SkyPanoramicMaterial.EXPOSURE, value);
    }

    /**
     * @en Rotation angle of the panoramic sky.
     * @zh 全景天空的旋转角度。
     */
    get rotation(): number {
        return this.getFloatByIndex(SkyPanoramicMaterial.ROTATION);
    }

    set rotation(value: number) {
        this.setFloatByIndex(SkyPanoramicMaterial.ROTATION, value);
    }

    /**
     * @en Panoramic sky texture.
     * @zh 全景天空纹理。
     */
    get panoramicTexture(): Texture2D {
        return <Texture2D>this.getTextureByIndex(SkyPanoramicMaterial.TEXTURE);
    }

    set panoramicTexture(value: Texture2D) {
        this.setTextureByIndex(SkyPanoramicMaterial.TEXTURE, value);
    }

    /** 
     * @ignore
     * @en Creates an instance of SkyPanoramicMaterial.
     * @zh 创建一个 SkyPanoramicMaterial 的实例。
     */
    constructor() {
        super();
        this.setShaderName("SkyPanoramic");
        this.setColorByIndex(SkyPanoramicMaterial.TINTCOLOR, new Color(0.5, 0.5, 0.5, 0.5));
        this.setFloatByIndex(SkyPanoramicMaterial.ROTATION, 0.0);
        this.setVector4ByIndex(SkyPanoramicMaterial.TEXTURE_HDR_PARAMS, this._textureHDRParams);
        this.exposure = 1.3;
    }
}