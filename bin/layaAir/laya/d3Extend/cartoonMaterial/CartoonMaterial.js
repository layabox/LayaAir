import { BaseMaterial } from "laya/d3/core/material/BaseMaterial";
import { RenderState } from "laya/d3/core/material/RenderState";
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";
import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
import { Vector4 } from "laya/d3/math/Vector4";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { ShaderDefines } from "laya/d3/shader/ShaderDefines";
import { SubShader } from "laya/d3/shader/SubShader";
import CartoonFS from "./shader/cartoon.fs";
import CartoonVS from "./shader/cartoon.vs";
import OutlineFS from "./shader/outline.fs";
import OutlineVS from "./shader/outline.vs";
export class CartoonMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("CartoonShader");
        this._shaderValues.setVector(CartoonMaterial.SHADOWCOLOR, new Vector4(0.6663285, 0.6544118, 1, 1));
        this._shaderValues.setNumber(CartoonMaterial.SHADOWRANGE, 0);
        this._shaderValues.setNumber(CartoonMaterial.SHADOWINTENSITY, 0.7956449);
        this._shaderValues.setNumber(CartoonMaterial.SPECULARRANGE, 0.9820514);
        this._shaderValues.setNumber(CartoonMaterial.SPECULARINTENSITY, 1);
        this._shaderValues.setNumber(CartoonMaterial.OUTLINEWIDTH, 0.01581197);
        this._shaderValues.setNumber(CartoonMaterial.OUTLINELIGHTNESS, 1);
    }
    /**
     * @private
     */
    static __init__() {
        CartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE = CartoonMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
        CartoonMaterial.SHADERDEFINE_BLENDTEXTURE = CartoonMaterial.shaderDefines.registerDefine("BLENDTEXTURE");
        CartoonMaterial.SHADERDEFINE_OUTLINETEXTURE = CartoonMaterial.shaderDefines.registerDefine("OUTLINETEXTURE");
        CartoonMaterial.SHADERDEFINE_TILINGOFFSET = CartoonMaterial.shaderDefines.registerDefine("TILINGOFFSET");
    }
    static initShader() {
        CartoonMaterial.__init__();
        var attributeMap = {
            'a_Position': VertexMesh.MESH_POSITION0,
            'a_Normal': VertexMesh.MESH_NORMAL0,
            'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0
        };
        var uniformMap = {
            'u_MvpMatrix': Shader3D.PERIOD_SPRITE,
            'u_WorldMat': Shader3D.PERIOD_SPRITE,
            'u_CameraPos': Shader3D.PERIOD_CAMERA,
            'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
            'u_BlendTexture': Shader3D.PERIOD_MATERIAL,
            'u_OutlineTexture': Shader3D.PERIOD_MATERIAL,
            'u_ShadowColor': Shader3D.PERIOD_MATERIAL,
            'u_ShadowRange': Shader3D.PERIOD_MATERIAL,
            'u_ShadowIntensity': Shader3D.PERIOD_MATERIAL,
            'u_SpecularRange': Shader3D.PERIOD_MATERIAL,
            'u_SpecularIntensity': Shader3D.PERIOD_MATERIAL,
            'u_OutlineWidth': Shader3D.PERIOD_MATERIAL,
            'u_OutlineLightness': Shader3D.PERIOD_MATERIAL,
            'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE,
            'u_DirectionLight.Color': Shader3D.PERIOD_SCENE
        };
        var cartoonShader3D = Shader3D.add("CartoonShader");
        var subShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, CartoonMaterial.shaderDefines);
        cartoonShader3D.addSubShader(subShader);
        var pass1 = subShader.addShaderPass(OutlineVS, OutlineFS);
        pass1.renderState.cull = RenderState.CULL_FRONT;
        subShader.addShaderPass(CartoonVS, CartoonFS);
    }
    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get albedoTexture() {
        return this._shaderValues.getTexture(CartoonMaterial.ALBEDOTEXTURE);
    }
    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set albedoTexture(value) {
        if (value)
            this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(CartoonMaterial.ALBEDOTEXTURE, value);
    }
    /**
     * 获取混合贴图。
     * @return 混合贴图。
     */
    get blendTexture() {
        return this._shaderValues.getTexture(CartoonMaterial.BLENDTEXTURE);
    }
    /**
     * 设置混合贴图。
     * @param value 混合贴图。
     */
    set blendTexture(value) {
        if (value)
            this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_BLENDTEXTURE);
        else
            this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_BLENDTEXTURE);
        this._shaderValues.setTexture(CartoonMaterial.BLENDTEXTURE, value);
    }
    /**
     * 获取漫轮廓贴图。
     * @return 轮廓贴图。
     */
    get outlineTexture() {
        return this._shaderValues.getTexture(CartoonMaterial.OUTLINETEXTURE);
    }
    /**
     * 设置轮廓贴图。
     * @param value 轮廓贴图。
     */
    set outlineTexture(value) {
        if (value)
            this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_OUTLINETEXTURE);
        else
            this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_OUTLINETEXTURE);
        this._shaderValues.setTexture(CartoonMaterial.OUTLINETEXTURE, value);
    }
    /**
     * 获取阴影颜色。
     * @return 阴影颜色。
     */
    get shadowColor() {
        return this._shaderValues.getVector(CartoonMaterial.SHADOWCOLOR);
    }
    /**
     * 设置阴影颜色。
     * @param value 阴影颜色。
     */
    set shadowColor(value) {
        this._shaderValues.setVector(CartoonMaterial.SHADOWCOLOR, value);
    }
    /**
     * 获取阴影范围。
     * @return 阴影范围,范围为0到1。
     */
    get shadowRange() {
        return this._shaderValues.getNumber(CartoonMaterial.SHADOWRANGE);
    }
    /**
     * 设置阴影范围。
     * @param value 阴影范围,范围为0到1。
     */
    set shadowRange(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(CartoonMaterial.SHADOWRANGE, value);
    }
    /**
     * 获取阴影强度。
     * @return 阴影强度,范围为0到1。
     */
    get shadowIntensity() {
        return this._shaderValues.getNumber(CartoonMaterial.SHADOWINTENSITY);
    }
    /**
     * 设置阴影强度。
     * @param value 阴影强度,范围为0到1。
     */
    set shadowIntensity(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(CartoonMaterial.SHADOWINTENSITY, value);
    }
    /**
     * 获取高光范围。
     * @return 高光范围,范围为0.9到1。
     */
    get specularRange() {
        return this._shaderValues.getNumber(CartoonMaterial.SPECULARRANGE);
    }
    /**
     * 设置高光范围。
     * @param value 高光范围,范围为0.9到1。
     */
    set specularRange(value) {
        value = Math.max(0.9, Math.min(1.0, value));
        this._shaderValues.setNumber(CartoonMaterial.SPECULARRANGE, value);
    }
    /**
     * 获取高光强度。
     * @return 高光强度,范围为0到1。
     */
    get specularIntensity() {
        return this._shaderValues.getNumber(CartoonMaterial.SPECULARINTENSITY);
    }
    /**
     * 获取轮廓宽度。
     * @return 轮廓宽度,范围为0到0.05。
     */
    get outlineWidth() {
        return this._shaderValues.getNumber(CartoonMaterial.OUTLINEWIDTH);
    }
    /**
     * 设置轮廓宽度。
     * @param value 轮廓宽度,范围为0到0.05。
     */
    set outlineWidth(value) {
        value = Math.max(0.0, Math.min(0.05, value));
        this._shaderValues.setNumber(CartoonMaterial.OUTLINEWIDTH, value);
    }
    /**
     * 获取轮廓亮度。
     * @return 轮廓亮度,范围为0到1。
     */
    get outlineLightness() {
        return this._shaderValues.getNumber(CartoonMaterial.OUTLINELIGHTNESS);
    }
    /**
     * 设置轮廓亮度。
     * @param value 轮廓亮度,范围为0到1。
     */
    set outlineLightness(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(CartoonMaterial.OUTLINELIGHTNESS, value);
    }
    /**
     * 设置高光强度。
     * @param value 高光范围,范围为0到1。
     */
    set specularIntensity(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(CartoonMaterial.SPECULARINTENSITY, value);
    }
    /**
     * 获取纹理平铺和偏移。
     * @return 纹理平铺和偏移。
     */
    get tilingOffset() {
        return this._shaderValues.getVector(CartoonMaterial.TILINGOFFSET);
    }
    /**
     * 设置纹理平铺和偏移。
     * @param value 纹理平铺和偏移。
     */
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(CartoonMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(CartoonMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(CartoonMaterial.TILINGOFFSET, value);
    }
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone() {
        var dest = new CartoonMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
CartoonMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
CartoonMaterial.BLENDTEXTURE = Shader3D.propertyNameToID("u_BlendTexture");
CartoonMaterial.OUTLINETEXTURE = Shader3D.propertyNameToID("u_OutlineTexture");
CartoonMaterial.SHADOWCOLOR = Shader3D.propertyNameToID("u_ShadowColor");
CartoonMaterial.SHADOWRANGE = Shader3D.propertyNameToID("u_ShadowRange");
CartoonMaterial.SHADOWINTENSITY = Shader3D.propertyNameToID("u_ShadowIntensity");
CartoonMaterial.SPECULARRANGE = Shader3D.propertyNameToID("u_SpecularRange");
CartoonMaterial.SPECULARINTENSITY = Shader3D.propertyNameToID("u_SpecularIntensity");
CartoonMaterial.OUTLINEWIDTH = Shader3D.propertyNameToID("u_OutlineWidth");
CartoonMaterial.OUTLINELIGHTNESS = Shader3D.propertyNameToID("u_OutlineLightness");
/**@private */
CartoonMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
