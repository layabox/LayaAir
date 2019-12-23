import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { Vector4 } from "../../math/Vector4";
import { TextureCube } from "../../resource/TextureCube";
import SkyPanoramicFS from "../../shader/files/SkyPanoramic.fs";
import SkyPanoramicVS from "../../shader/files/SkyPanoramic.vs";
import { Shader3D } from "../../shader/Shader3D";
import { SubShader } from "../../shader/SubShader";
import { Material } from "./Material";

/**
 * <code>SkyPanoramicMaterial</code> 类用于实现SkyPanoramicMaterial材质。
 */
export class SkyPanoramicMaterial extends Material {
    static TINTCOLOR: number = Shader3D.propertyNameToID("u_TintColor");
    static EXPOSURE: number = Shader3D.propertyNameToID("u_Exposure");
    static ROTATION: number = Shader3D.propertyNameToID("u_Rotation");
    static TEXTURE: number = Shader3D.propertyNameToID("u_Texture");

    /**
	 * @internal
	 */
    static __init__(): void {
        var attributeMap: any = {
            'a_Position': VertexMesh.MESH_POSITION0
        };
        var uniformMap: any = {
            'u_TintColor': Shader3D.PERIOD_MATERIAL,
            'u_Exposure': Shader3D.PERIOD_MATERIAL,
            'u_Rotation': Shader3D.PERIOD_MATERIAL,
            'u_Texture': Shader3D.PERIOD_MATERIAL,
            'u_ViewProjection': Shader3D.PERIOD_CAMERA
        };
        var shader: Shader3D = Shader3D.add("SkyPanoramic");
        var subShader: SubShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        subShader.addShaderPass(SkyPanoramicVS, SkyPanoramicFS);
    }

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
        return this._shaderValues.getNumber(SkyPanoramicMaterial.EXPOSURE);
    }

    set exposure(value: number) {
        this._shaderValues.setNumber(SkyPanoramicMaterial.EXPOSURE, value);
    }

	/**
	 * 曝光强度。
	 */
    get rotation(): number {
        return this._shaderValues.getNumber(SkyPanoramicMaterial.ROTATION);
    }

    set rotation(value: number) {
        this._shaderValues.setNumber(SkyPanoramicMaterial.ROTATION, value);
    }

	/**
	 * 天空盒纹理。
	 */
    get textureCube(): TextureCube {
        return (<TextureCube>this._shaderValues.getTexture(SkyPanoramicMaterial.TEXTURE));
    }

    set textureCube(value: TextureCube) {
        this._shaderValues.setTexture(SkyPanoramicMaterial.TEXTURE, value);
    }

    /**
	 * 创建一个 <code>SkyPanoramicMaterial</code> 实例。
	 */
    constructor() {
        super();
        this.setShaderName("SkyPanoramic");
        this.tintColor = new Vector4(0.5, 0.5, 0.5, 0.5);
        this.exposure = 1.2;
        this.rotation = 0;
    }
}