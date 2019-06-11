import { Shader3D } from "../../shader/Shader3D";
import { BaseMaterial } from "././BaseMaterial";
/**
 * <code>SkyBoxMaterial</code> 类用于实现SkyBoxMaterial材质。
 */
export class SkyBoxMaterial extends BaseMaterial {
    /**
     * 创建一个 <code>SkyBoxMaterial</code> 实例。
     */
    constructor() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        this.setShaderName("SkyBox");
    }
    /**
    * @private
    */
    static __initDefine__() {
    }
    /**
     * 获取颜色。
     * @return  颜色。
     */
    get tintColor() {
        return this._shaderValues.getVector(SkyBoxMaterial.TINTCOLOR);
    }
    /**
     * 设置颜色。
     * @param value 颜色。
     */
    set tintColor(value) {
        this._shaderValues.setVector(SkyBoxMaterial.TINTCOLOR, value);
    }
    /**
     * 获取曝光强度。
     * @return 曝光强度。
     */
    get exposure() {
        return this._shaderValues.getNumber(SkyBoxMaterial.EXPOSURE);
    }
    /**
     * 设置曝光强度。
     * @param value 曝光强度。
     */
    set exposure(value) {
        this._shaderValues.setNumber(SkyBoxMaterial.EXPOSURE, value);
    }
    /**
     * 获取曝光强度。
     * @return 曝光强度。
     */
    get rotation() {
        return this._shaderValues.getNumber(SkyBoxMaterial.ROTATION);
    }
    /**
     * 设置曝光强度。
     * @param value 曝光强度。
     */
    set rotation(value) {
        this._shaderValues.setNumber(SkyBoxMaterial.ROTATION, value);
    }
    /**
     * 获取天空盒纹理。
     */
    get textureCube() {
        return this._shaderValues.getTexture(SkyBoxMaterial.TEXTURECUBE);
    }
    /**
     * 设置天空盒纹理。
     */
    set textureCube(value) {
        this._shaderValues.setTexture(SkyBoxMaterial.TEXTURECUBE, value);
    }
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone() {
        var dest = new SkyBoxMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
SkyBoxMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_TintColor");
SkyBoxMaterial.EXPOSURE = Shader3D.propertyNameToID("u_Exposure");
SkyBoxMaterial.ROTATION = Shader3D.propertyNameToID("u_Rotation");
SkyBoxMaterial.TEXTURECUBE = Shader3D.propertyNameToID("u_CubeTexture");
