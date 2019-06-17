import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { Shader3D } from "laya/d3/shader/Shader3D";
/**
 * ...
 * @author ...
 */
export class CustomMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("CustomShader");
    }
    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get diffuseTexture() {
        return this._shaderValues.getTexture(CustomMaterial.DIFFUSETEXTURE);
    }
    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set diffuseTexture(value) {
        this._shaderValues.setTexture(CustomMaterial.DIFFUSETEXTURE, value);
    }
    /**
     * 设置边缘光照颜色。
     * @param value 边缘光照颜色。
     */
    set marginalColor(value) {
        this._shaderValues.setVector3(CustomMaterial.MARGINALCOLOR, value);
    }
}
CustomMaterial.DIFFUSETEXTURE = Shader3D.propertyNameToID("u_texture");
CustomMaterial.MARGINALCOLOR = Shader3D.propertyNameToID("u_marginalColor");
