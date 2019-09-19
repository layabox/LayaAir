import { Material } from "laya/d3/core/material/Material";
import { Vector3 } from "laya/d3/math/Vector3";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { BaseTexture } from "laya/resource/BaseTexture";


export class GlowingEdgeMaterial extends Material {
    public static DIFFUSETEXTURE: number =  Shader3D.propertyNameToID("u_texture");
    public static MARGINALCOLOR: number = Shader3D.propertyNameToID("u_marginalColor");
    constructor() {
        super();
        this.setShaderName("GlowingEdgeMaterial");
    }
    /**
     * 获取漫反射贴图。
     *  漫反射贴图。
     */
    public get diffuseTexture(): BaseTexture {
        return this._shaderValues.getTexture(GlowingEdgeMaterial.DIFFUSETEXTURE);
    }

    /**
     * 设置漫反射贴图。
     * 漫反射贴图。
     */
    public set diffuseTexture(value:BaseTexture) {
        this._shaderValues.setTexture(GlowingEdgeMaterial.DIFFUSETEXTURE,value);
    }

    /**
     * 设置边缘光照颜色。
     * 边缘光照颜色。
     */
    public set marginalColor(value:Vector3) {
        this._shaderValues.setVector3(GlowingEdgeMaterial.MARGINALCOLOR, value);
    }
}
