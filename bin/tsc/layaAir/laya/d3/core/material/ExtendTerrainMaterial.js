import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
/**
 * ...
 * @author ...
 */
export class ExtendTerrainMaterial extends BaseMaterial {
    constructor() {
        super();
        /**@private */
        this._enableLighting = true;
        this.setShaderName("ExtendTerrain");
        this.renderMode = ExtendTerrainMaterial.RENDERMODE_OPAQUE;
    }
    /**
     * @private
     */
    static __initDefine__() {
        ExtendTerrainMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM1 = ExtendTerrainMaterial.shaderDefines.registerDefine("ExtendTerrain_DETAIL_NUM1");
        ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM2 = ExtendTerrainMaterial.shaderDefines.registerDefine("ExtendTerrain_DETAIL_NUM2");
        ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM3 = ExtendTerrainMaterial.shaderDefines.registerDefine("ExtendTerrain_DETAIL_NUM3");
        ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM4 = ExtendTerrainMaterial.shaderDefines.registerDefine("ExtendTerrain_DETAIL_NUM4");
        ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM5 = ExtendTerrainMaterial.shaderDefines.registerDefine("ExtendTerrain_DETAIL_NUM5");
    }
    /**
     * 获取splatAlpha贴图。
     * @return splatAlpha贴图。
     */
    get splatAlphaTexture() {
        return this._shaderValues.getTexture(ExtendTerrainMaterial.SPLATALPHATEXTURE);
    }
    /**
     * 设置splatAlpha贴图。
     * @param value splatAlpha贴图。
     */
    set splatAlphaTexture(value) {
        this._shaderValues.setTexture(ExtendTerrainMaterial.SPLATALPHATEXTURE, value);
    }
    /**
     * 设置第一层贴图。
     * @param value 第一层贴图。
     */
    set diffuseTexture1(value) {
        this._shaderValues.setTexture(ExtendTerrainMaterial.DIFFUSETEXTURE1, value);
        this._setDetailNum(1);
    }
    /**
     * 获取第二层贴图。
     * @return 第二层贴图。
     */
    get diffuseTexture2() {
        return this._shaderValues.getTexture(ExtendTerrainMaterial.DIFFUSETEXTURE2);
    }
    /**
     * 设置第二层贴图。
     * @param value 第二层贴图。
     */
    set diffuseTexture2(value) {
        this._shaderValues.setTexture(ExtendTerrainMaterial.DIFFUSETEXTURE2, value);
        this._setDetailNum(2);
    }
    /**
     * 获取第三层贴图。
     * @return 第三层贴图。
     */
    get diffuseTexture3() {
        return this._shaderValues.getTexture(ExtendTerrainMaterial.DIFFUSETEXTURE3);
    }
    /**
     * 设置第三层贴图。
     * @param value 第三层贴图。
     */
    set diffuseTexture3(value) {
        this._shaderValues.setTexture(ExtendTerrainMaterial.DIFFUSETEXTURE3, value);
        this._setDetailNum(3);
    }
    /**
     * 获取第四层贴图。
     * @return 第四层贴图。
     */
    get diffuseTexture4() {
        return this._shaderValues.getTexture(ExtendTerrainMaterial.DIFFUSETEXTURE4);
    }
    /**
     * 设置第四层贴图。
     * @param value 第四层贴图。
     */
    set diffuseTexture4(value) {
        this._shaderValues.setTexture(ExtendTerrainMaterial.DIFFUSETEXTURE4, value);
        this._setDetailNum(4);
    }
    /**
     * 获取第五层贴图。
     * @return 第五层贴图。
     */
    get diffuseTexture5() {
        return this._shaderValues.getTexture(ExtendTerrainMaterial.DIFFUSETEXTURE5);
    }
    /**
     * 设置第五层贴图。
     * @param value 第五层贴图。
     */
    set diffuseTexture5(value) {
        this._shaderValues.setTexture(ExtendTerrainMaterial.DIFFUSETEXTURE5, value);
        this._setDetailNum(5);
    }
    _setDetailNum(value) {
        switch (value) {
            case 1:
                this._shaderValues.addDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                break;
            case 2:
                this._shaderValues.addDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                break;
            case 3:
                this._shaderValues.addDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                break;
            case 4:
                this._shaderValues.addDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                break;
            case 5:
                this._shaderValues.addDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM5);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM1);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM2);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM3);
                this._shaderValues.removeDefine(ExtendTerrainMaterial.SHADERDEFINE_DETAIL_NUM4);
                break;
        }
    }
    set diffuseScaleOffset1(scaleOffset1) {
        this._shaderValues.setVector(ExtendTerrainMaterial.DIFFUSESCALEOFFSET1, scaleOffset1);
    }
    set diffuseScaleOffset2(scaleOffset2) {
        this._shaderValues.setVector(ExtendTerrainMaterial.DIFFUSESCALEOFFSET2, scaleOffset2);
    }
    set diffuseScaleOffset3(scaleOffset3) {
        this._shaderValues.setVector(ExtendTerrainMaterial.DIFFUSESCALEOFFSET3, scaleOffset3);
    }
    set diffuseScaleOffset4(scaleOffset4) {
        this._shaderValues.setVector(ExtendTerrainMaterial.DIFFUSESCALEOFFSET4, scaleOffset4);
    }
    set diffuseScaleOffset5(scaleOffset5) {
        this._shaderValues.setVector(ExtendTerrainMaterial.DIFFUSESCALEOFFSET5, scaleOffset5);
    }
    /**
     * 获取是否启用光照。
     * @return 是否启用光照。
     */
    get enableLighting() {
        return this._enableLighting;
    }
    /**
     * 设置是否启用光照。
     * @param value 是否启用光照。
     */
    set enableLighting(value) {
        if (this._enableLighting !== value) {
            if (value)
                this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
            else
                this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT | Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT);
            this._enableLighting = value;
        }
    }
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    set renderMode(value) {
        switch (value) {
            case ExtendTerrainMaterial.RENDERMODE_OPAQUE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case ExtendTerrainMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LEQUAL;
                break;
            default:
                throw new Error("ExtendTerrainMaterial:renderMode value error.");
        }
    }
    /**
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    set depthWrite(value) {
        this._shaderValues.setBool(ExtendTerrainMaterial.DEPTH_WRITE, value);
    }
    /**
     * 获取是否写入深度。
     * @return 是否写入深度。
     */
    get depthWrite() {
        return this._shaderValues.getBool(ExtendTerrainMaterial.DEPTH_WRITE);
    }
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    set cull(value) {
        this._shaderValues.setInt(ExtendTerrainMaterial.CULL, value);
    }
    /**
     * 获取剔除方式。
     * @return 剔除方式。
     */
    get cull() {
        return this._shaderValues.getInt(ExtendTerrainMaterial.CULL);
    }
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    set blend(value) {
        this._shaderValues.setInt(ExtendTerrainMaterial.BLEND, value);
    }
    /**
     * 获取混合方式。
     * @return 混合方式。
     */
    get blend() {
        return this._shaderValues.getInt(ExtendTerrainMaterial.BLEND);
    }
    /**
     * 设置混合源。
     * @param value 混合源
     */
    set blendSrc(value) {
        this._shaderValues.setInt(ExtendTerrainMaterial.BLEND_SRC, value);
    }
    /**
     * 获取混合源。
     * @return 混合源。
     */
    get blendSrc() {
        return this._shaderValues.getInt(ExtendTerrainMaterial.BLEND_SRC);
    }
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    set blendDst(value) {
        this._shaderValues.setInt(ExtendTerrainMaterial.BLEND_DST, value);
    }
    /**
     * 获取混合目标。
     * @return 混合目标。
     */
    get blendDst() {
        return this._shaderValues.getInt(ExtendTerrainMaterial.BLEND_DST);
    }
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    set depthTest(value) {
        this._shaderValues.setInt(ExtendTerrainMaterial.DEPTH_TEST, value);
    }
    /**
     * 获取深度测试方式。
     * @return 深度测试方式。
     */
    get depthTest() {
        return this._shaderValues.getInt(ExtendTerrainMaterial.DEPTH_TEST);
    }
    /**
* 克隆。
* @return	 克隆副本。
*/
    clone() {
        var dest = new ExtendTerrainMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
/**渲染状态_不透明。*/
ExtendTerrainMaterial.RENDERMODE_OPAQUE = 1;
/**渲染状态_透明混合。*/
ExtendTerrainMaterial.RENDERMODE_TRANSPARENT = 2;
/**渲染状态_透明混合。*/
ExtendTerrainMaterial.SPLATALPHATEXTURE = Shader3D.propertyNameToID("u_SplatAlphaTexture");
ExtendTerrainMaterial.DIFFUSETEXTURE1 = Shader3D.propertyNameToID("u_DiffuseTexture1");
ExtendTerrainMaterial.DIFFUSETEXTURE2 = Shader3D.propertyNameToID("u_DiffuseTexture2");
ExtendTerrainMaterial.DIFFUSETEXTURE3 = Shader3D.propertyNameToID("u_DiffuseTexture3");
ExtendTerrainMaterial.DIFFUSETEXTURE4 = Shader3D.propertyNameToID("u_DiffuseTexture4");
ExtendTerrainMaterial.DIFFUSETEXTURE5 = Shader3D.propertyNameToID("u_DiffuseTexture5");
ExtendTerrainMaterial.DIFFUSESCALEOFFSET1 = Shader3D.propertyNameToID("u_DiffuseScaleOffset1");
ExtendTerrainMaterial.DIFFUSESCALEOFFSET2 = Shader3D.propertyNameToID("u_DiffuseScaleOffset2");
ExtendTerrainMaterial.DIFFUSESCALEOFFSET3 = Shader3D.propertyNameToID("u_DiffuseScaleOffset3");
ExtendTerrainMaterial.DIFFUSESCALEOFFSET4 = Shader3D.propertyNameToID("u_DiffuseScaleOffset4");
ExtendTerrainMaterial.DIFFUSESCALEOFFSET5 = Shader3D.propertyNameToID("u_DiffuseScaleOffset5");
ExtendTerrainMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
ExtendTerrainMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
ExtendTerrainMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
ExtendTerrainMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
ExtendTerrainMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
ExtendTerrainMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
/**@private */
ExtendTerrainMaterial.shaderDefines = null;
