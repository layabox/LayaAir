import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
/**
 * <code>PBRSpecularMaterial</code> 类用于实现PBR(Specular)材质。
 */
export class PBRSpecularMaterial extends BaseMaterial {
    /**
     * 创建一个 <code>PBRSpecularMaterial</code> 实例。
     */
    constructor() {
        super();
        this.setShaderName("PBRSpecular");
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this._emissionColor = new Vector4(0.0, 0.0, 0.0, 0.0);
        this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
        this._specularColor = new Vector4(0.2, 0.2, 0.2, 0.2);
        this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, new Vector4(0.2, 0.2, 0.2, 0.2));
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, 0.5);
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, 1.0);
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSOURCE, 0);
        this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, 1.0);
        this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, 1.0);
        this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, 0.001);
        this._shaderValues.setBool(PBRSpecularMaterial.ENABLEEMISSION, false);
        this._shaderValues.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
        this.renderMode = PBRSpecularMaterial.RENDERMODE_OPAQUE;
    }
    /**
     * @internal
     */
    static __initDefine__() {
        PBRSpecularMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("SPECULARTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = PBRSpecularMaterial.shaderDefines.registerDefine("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
        PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("NORMALTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("PARALLAXTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("OCCLUSIONTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_EMISSION = PBRSpecularMaterial.shaderDefines.registerDefine("EMISSION");
        PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE = PBRSpecularMaterial.shaderDefines.registerDefine("EMISSIONTEXTURE");
        PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET = PBRSpecularMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY = PBRSpecularMaterial.shaderDefines.registerDefine("ALPHAPREMULTIPLY");
    }
    /**
     * @internal
     */
    get _ColorR() {
        return this._albedoColor.x;
    }
    /**
     * @internal
     */
    set _ColorR(value) {
        this._albedoColor.x = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @internal
     */
    get _ColorG() {
        return this._albedoColor.y;
    }
    /**
     * @internal
     */
    set _ColorG(value) {
        this._albedoColor.y = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @internal
     */
    get _ColorB() {
        return this._albedoColor.z;
    }
    /**
     * @internal
     */
    set _ColorB(value) {
        this._albedoColor.z = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @internal
     */
    get _ColorA() {
        return this._albedoColor.w;
    }
    /**
     * @internal
     */
    set _ColorA(value) {
        this._albedoColor.w = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @internal
     */
    get _SpecColorR() {
        return this._specularColor.x;
    }
    /**
     * @internal
     */
    set _SpecColorR(value) {
        this._specularColor.x = value;
        this.specularColor = this._specularColor;
    }
    /**
     * @internal
     */
    get _SpecColorG() {
        return this._specularColor.y;
    }
    /**
     * @internal
     */
    set _SpecColorG(value) {
        this._specularColor.y = value;
        this.specularColor = this._specularColor;
    }
    /**
     * @internal
     */
    get _SpecColorB() {
        return this._specularColor.z;
    }
    /**
     * @internal
     */
    set _SpecColorB(value) {
        this._specularColor.z = value;
        this.specularColor = this._specularColor;
    }
    /**
     * @internal
     */
    get _SpecColorA() {
        return this._specularColor.w;
    }
    /**
     * @internal
     */
    set _SpecColorA(value) {
        this._specularColor.w = value;
        this.specularColor = this._specularColor;
    }
    /**
     * @internal
     */
    get _Glossiness() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESS);
    }
    /**
     * @internal
     */
    set _Glossiness(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESS, value);
    }
    /**
     * @internal
     */
    get _GlossMapScale() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.SMOOTHNESSSCALE);
    }
    /**
     * @internal
     */
    set _GlossMapScale(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.SMOOTHNESSSCALE, value);
    }
    /**
     * @internal
     */
    get _BumpScale() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.NORMALSCALE);
    }
    /**
     * @internal
     */
    set _BumpScale(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.NORMALSCALE, value);
    }
    /**@internal */
    get _Parallax() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.PARALLAXSCALE);
    }
    /**
     * @internal
     */
    set _Parallax(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.PARALLAXSCALE, value);
    }
    /**@internal */
    get _OcclusionStrength() {
        return this._shaderValues.getNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH);
    }
    /**
     * @internal
     */
    set _OcclusionStrength(value) {
        this._shaderValues.setNumber(PBRSpecularMaterial.OCCLUSIONSTRENGTH, value);
    }
    /**
     * @internal
     */
    get _EmissionColorR() {
        return this._emissionColor.x;
    }
    /**
     * @internal
     */
    set _EmissionColorR(value) {
        this._emissionColor.x = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @internal
     */
    get _EmissionColorG() {
        return this._emissionColor.y;
    }
    /**
     * @internal
     */
    set _EmissionColorG(value) {
        this._emissionColor.y = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @internal
     */
    get _EmissionColorB() {
        return this._emissionColor.z;
    }
    /**
     * @internal
     */
    set _EmissionColorB(value) {
        this._emissionColor.z = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @internal
     */
    get _EmissionColorA() {
        return this._emissionColor.w;
    }
    /**
     * @internal
     */
    set _EmissionColorA(value) {
        this._emissionColor.w = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @internal
     */
    get _MainTex_STX() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).x;
    }
    /**
     * @internal
     */
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    /**
     * @internal
     */
    get _MainTex_STY() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).y;
    }
    /**
     * @internal
     */
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    /**
     * @internal
     */
    get _MainTex_STZ() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).z;
    }
    /**
     * @internal
     */
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    /**
     * @internal
     */
    get _MainTex_STW() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET).w;
    }
    /**
     * @internal
     */
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    /**
     * @internal
     */
    get _Cutoff() {
        return this.alphaTestValue;
    }
    /**
     * @internal
     */
    set _Cutoff(value) {
        this.alphaTestValue = value;
    }
    /**
     * 获取反射率颜色R分量。
     * @return 反射率颜色R分量。
     */
    get albedoColorR() {
        return this._ColorR;
    }
    /**
     * 设置反射率颜色R分量。
     * @param value 反射率颜色R分量。
     */
    set albedoColorR(value) {
        this._ColorR = value;
    }
    /**
     * 获取反射率颜色G分量。
     * @return 反射率颜色G分量。
     */
    get albedoColorG() {
        return this._ColorG;
    }
    /**
     * 设置反射率颜色G分量。
     * @param value 反射率颜色G分量。
     */
    set albedoColorG(value) {
        this._ColorG = value;
    }
    /**
     * 获取反射率颜色B分量。
     * @return 反射率颜色B分量。
     */
    get albedoColorB() {
        return this._ColorB;
    }
    /**
     * 设置反射率颜色B分量。
     * @param value 反射率颜色B分量。
     */
    set albedoColorB(value) {
        this._ColorB = value;
    }
    /**
     * 获取反射率颜色A分量。
     * @return 反射率颜色A分量。
     */
    get albedoColorA() {
        return this._ColorA;
    }
    /**
     * 设置反射率颜色A分量。
     * @param value 反射率颜色A分量。
     */
    set albedoColorA(value) {
        this._ColorA = value;
    }
    /**
     * 获取反射率颜色。
     * @return 反射率颜色。
     */
    get albedoColor() {
        return this._albedoColor;
    }
    /**
     * 设置反射率颜色。
     * @param value 反射率颜色。
     */
    set albedoColor(value) {
        this._albedoColor = value;
        this._shaderValues.setVector(PBRSpecularMaterial.ALBEDOCOLOR, value);
    }
    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get albedoTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.ALBEDOTEXTURE);
    }
    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set albedoTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.ALBEDOTEXTURE, value);
    }
    /**
     * 获取法线贴图。
     * @return 法线贴图。
     */
    get normalTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.NORMALTEXTURE);
    }
    /**
     * 设置法线贴图。
     * @param value 法线贴图。
     */
    set normalTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.NORMALTEXTURE, value);
    }
    /**
     * 获取法线贴图缩放系数。
     * @return 法线贴图缩放系数。
     */
    get normalTextureScale() {
        return this._BumpScale;
    }
    /**
     * 设置法线贴图缩放系数。
     * @param value 法线贴图缩放系数。
     */
    set normalTextureScale(value) {
        this._BumpScale = value;
    }
    /**
     * 获取视差贴图。
     * @return 视察贴图。
     */
    get parallaxTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.PARALLAXTEXTURE);
    }
    /**
     * 设置视差贴图。
     * @param value 视察贴图。
     */
    set parallaxTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.PARALLAXTEXTURE, value);
    }
    /**
     * 获取视差贴图缩放系数。
     * @return 视差缩放系数。
     */
    get parallaxTextureScale() {
        return this._Parallax;
    }
    /**
     * 设置视差贴图缩放系数。
     * @param value 视差缩放系数。
     */
    set parallaxTextureScale(value) {
        this._Parallax = Math.max(0.005, Math.min(0.08, value));
    }
    /**
     * 获取遮挡贴图。
     * @return 遮挡贴图。
     */
    get occlusionTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE);
    }
    /**
     * 设置遮挡贴图。
     * @param value 遮挡贴图。
     */
    set occlusionTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.OCCLUSIONTEXTURE, value);
    }
    /**
     * 获取遮挡贴图强度。
     * @return 遮挡贴图强度,范围为0到1。
     */
    get occlusionTextureStrength() {
        return this._OcclusionStrength;
    }
    /**
     * 设置遮挡贴图强度。
     * @param value 遮挡贴图强度,范围为0到1。
     */
    set occlusionTextureStrength(value) {
        this._OcclusionStrength = Math.max(0.0, Math.min(1.0, value));
    }
    /**
     * 获取高光贴图。
     * @return 高光贴图。
     */
    get specularTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.SPECULARTEXTURE);
    }
    /**
     * 设置高光贴图。
     * @param value 高光贴图。
     */
    set specularTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SPECULARTEXTURE);
        }
        this._shaderValues.setTexture(PBRSpecularMaterial.SPECULARTEXTURE, value);
    }
    /**
     * 获取高光颜色R分量。
     * @return 高光颜色R分量。
     */
    get specularColorR() {
        return this._SpecColorR;
    }
    /**
     * 设置高光颜色R分量。
     * @param value 高光颜色R分量。
     */
    set specularColorR(value) {
        this._SpecColorR = value;
    }
    /**
     * 获取高光颜色G分量。
     * @return 高光颜色G分量。
     */
    get specularColorG() {
        return this._SpecColorG;
    }
    /**
     * 设置高光颜色G分量。
     * @param value 高光颜色G分量。
     */
    set specularColorG(value) {
        this._SpecColorG = value;
    }
    /**
     * 获取高光颜色B分量。
     * @return 高光颜色B分量。
     */
    get specularColorB() {
        return this._SpecColorB;
    }
    /**
     * 设置高光颜色B分量。
     * @param value 高光颜色B分量。
     */
    set specularColorB(value) {
        this._SpecColorB = value;
    }
    /**
     * 获取高光颜色A分量。
     * @return 高光颜色A分量。
     */
    get specularColorA() {
        return this._SpecColorA;
    }
    /**
     * 设置高光颜色A分量。
     * @param value 高光颜色A分量。
     */
    set specularColorA(value) {
        this._SpecColorA = value;
    }
    /**
     * 获取高光颜色。
     * @return 高光颜色。
     */
    get specularColor() {
        return this._shaderValues.getVector(PBRSpecularMaterial.SPECULARCOLOR);
    }
    /**
     * 设置高光颜色。
     * @param value 高光颜色。
     */
    set specularColor(value) {
        this._shaderValues.setVector(PBRSpecularMaterial.SPECULARCOLOR, value);
    }
    /**
     * 获取光滑度。
     * @return 光滑度,范围为0到1。
     */
    get smoothness() {
        return this._Glossiness;
    }
    /**
     * 设置光滑度。
     * @param value 光滑度,范围为0到1。
     */
    set smoothness(value) {
        this._Glossiness = Math.max(0.0, Math.min(1.0, value));
    }
    /**
     * 获取光滑度缩放系数。
     * @return 光滑度缩放系数,范围为0到1。
     */
    get smoothnessTextureScale() {
        return this._GlossMapScale;
    }
    /**
     * 设置光滑度缩放系数。
     * @param value 光滑度缩放系数,范围为0到1。
     */
    set smoothnessTextureScale(value) {
        this._GlossMapScale = Math.max(0.0, Math.min(1.0, value));
    }
    /**
     * 获取光滑度数据源
     * @return 光滑滑度数据源,0或1。
     */
    get smoothnessSource() {
        return this._shaderValues.getInt(PBRSpecularMaterial.SMOOTHNESSSOURCE);
    }
    /**
     * 设置光滑度数据源。
     * @param value 光滑滑度数据源,0或1。
     */
    set smoothnessSource(value) {
        if (value) {
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRSpecularMaterial.SMOOTHNESSSOURCE, 1);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRSpecularMaterial.SMOOTHNESSSOURCE, 0);
        }
    }
    /**
     * 获取是否激活放射属性。
     * @return 是否激活放射属性。
     */
    get enableEmission() {
        return this._shaderValues.getBool(PBRSpecularMaterial.ENABLEEMISSION);
    }
    /**
     * 设置是否激活放射属性。
     * @param value 是否激活放射属性
     */
    set enableEmission(value) {
        if (value)
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSION);
        }
        this._shaderValues.setBool(PBRSpecularMaterial.ENABLEEMISSION, value);
    }
    /**
     * 获取放射颜色。
     * @return 放射颜色。
     */
    get emissionColor() {
        return this._shaderValues.getVector(PBRSpecularMaterial.EMISSIONCOLOR);
    }
    /**
     * 设置放射颜色。
     * @param value 放射颜色。
     */
    set emissionColor(value) {
        this._shaderValues.setVector(PBRSpecularMaterial.EMISSIONCOLOR, value);
    }
    /**
     * 获取放射贴图。
     * @return 放射贴图。
     */
    get emissionTexture() {
        return this._shaderValues.getTexture(PBRSpecularMaterial.EMISSIONTEXTURE);
    }
    /**
     * 设置放射贴图。
     * @param value 放射贴图。
     */
    set emissionTexture(value) {
        if (value)
            this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        else
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        this._shaderValues.setTexture(PBRSpecularMaterial.EMISSIONTEXTURE, value);
    }
    /**
     * 获取是否开启反射。
     * @return 是否开启反射。
     */
    get enableReflection() {
        return this._shaderValues.getBool(PBRSpecularMaterial.ENABLEREFLECT);
    }
    /**
     * 设置是否开启反射。
     * @param value 是否开启反射。
     */
    set enableReflection(value) {
        this._shaderValues.setBool(PBRSpecularMaterial.ENABLEREFLECT, true);
        if (value)
            this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        else
            this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
    }
    /**
     * 获取纹理平铺和偏移X分量。
     * @return 纹理平铺和偏移X分量。
     */
    get tilingOffsetX() {
        return this._MainTex_STX;
    }
    /**
     * 获取纹理平铺和偏移X分量。
     * @param x 纹理平铺和偏移X分量。
     */
    set tilingOffsetX(x) {
        this._MainTex_STX = x;
    }
    /**
     * 获取纹理平铺和偏移Y分量。
     * @return 纹理平铺和偏移Y分量。
     */
    get tilingOffsetY() {
        return this._MainTex_STY;
    }
    /**
     * 获取纹理平铺和偏移Y分量。
     * @param y 纹理平铺和偏移Y分量。
     */
    set tilingOffsetY(y) {
        this._MainTex_STY = y;
    }
    /**
     * 获取纹理平铺和偏移Z分量。
     * @return 纹理平铺和偏移Z分量。
     */
    get tilingOffsetZ() {
        return this._MainTex_STZ;
    }
    /**
     * 获取纹理平铺和偏移Z分量。
     * @param z 纹理平铺和偏移Z分量。
     */
    set tilingOffsetZ(z) {
        this._MainTex_STZ = z;
    }
    /**
     * 获取纹理平铺和偏移W分量。
     * @return 纹理平铺和偏移W分量。
     */
    get tilingOffsetW() {
        return this._MainTex_STW;
    }
    /**
     * 获取纹理平铺和偏移W分量。
     * @param w 纹理平铺和偏移W分量。
     */
    set tilingOffsetW(w) {
        this._MainTex_STW = w;
    }
    /**
     * 获取纹理平铺和偏移。
     * @return 纹理平铺和偏移。
     */
    get tilingOffset() {
        return this._shaderValues.getVector(PBRSpecularMaterial.TILINGOFFSET);
    }
    /**
     * 获取纹理平铺和偏移。
     * @param value 纹理平铺和偏移。
     */
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(PBRSpecularMaterial.TILINGOFFSET, value);
    }
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    set renderMode(value) {
        switch (value) {
            case PBRSpecularMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRSpecularMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRSpecularMaterial.RENDERMODE_FADE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRSpecularMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_ONE;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(PBRSpecularMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            default:
                throw new Error("PBRSpecularMaterial : renderMode value error.");
        }
    }
    /**
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    set depthWrite(value) {
        this._shaderValues.setBool(PBRSpecularMaterial.DEPTH_WRITE, value);
    }
    /**
     * 获取是否写入深度。
     * @return 是否写入深度。
     */
    get depthWrite() {
        return this._shaderValues.getBool(PBRSpecularMaterial.DEPTH_WRITE);
    }
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    set cull(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.CULL, value);
    }
    /**
     * 获取剔除方式。
     * @return 剔除方式。
     */
    get cull() {
        return this._shaderValues.getInt(PBRSpecularMaterial.CULL);
    }
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    set blend(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.BLEND, value);
    }
    /**
     * 获取混合方式。
     * @return 混合方式。
     */
    get blend() {
        return this._shaderValues.getInt(PBRSpecularMaterial.BLEND);
    }
    /**
     * 设置混合源。
     * @param value 混合源
     */
    set blendSrc(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.BLEND_SRC, value);
    }
    /**
     * 获取混合源。
     * @return 混合源。
     */
    get blendSrc() {
        return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_SRC);
    }
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    set blendDst(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.BLEND_DST, value);
    }
    /**
     * 获取混合目标。
     * @return 混合目标。
     */
    get blendDst() {
        return this._shaderValues.getInt(PBRSpecularMaterial.BLEND_DST);
    }
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    set depthTest(value) {
        this._shaderValues.setInt(PBRSpecularMaterial.DEPTH_TEST, value);
    }
    /**
     * 获取深度测试方式。
     * @return 深度测试方式。
     */
    get depthTest() {
        return this._shaderValues.getInt(PBRSpecularMaterial.DEPTH_TEST);
    }
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone() {
        var dest = new PBRSpecularMaterial();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * @inheritDoc
     */
    /*override*/ cloneTo(destObject) {
        super.cloneTo(destObject);
        var destMaterial = destObject;
        this._albedoColor.cloneTo(destMaterial._albedoColor);
        this._specularColor.cloneTo(destMaterial._specularColor);
        this._emissionColor.cloneTo(destMaterial._emissionColor);
    }
}
/**光滑度数据源_高光贴图的Alpha通道。*/
PBRSpecularMaterial.SmoothnessSource_SpecularTexture_Alpha = 0;
/**光滑度数据源_反射率贴图的Alpha通道。*/
PBRSpecularMaterial.SmoothnessSource_AlbedoTexture_Alpha = 1;
/**渲染状态_不透明。*/
PBRSpecularMaterial.RENDERMODE_OPAQUE = 0;
/**渲染状态_透明测试。*/
PBRSpecularMaterial.RENDERMODE_CUTOUT = 1;
/**渲染状态_透明混合_游戏中经常使用的透明。*/
PBRSpecularMaterial.RENDERMODE_FADE = 2;
/**渲染状态_透明混合_物理上看似合理的透明。*/
PBRSpecularMaterial.RENDERMODE_TRANSPARENT = 3;
PBRSpecularMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
PBRSpecularMaterial.SPECULARTEXTURE = Shader3D.propertyNameToID("u_SpecularTexture");
PBRSpecularMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
PBRSpecularMaterial.PARALLAXTEXTURE = Shader3D.propertyNameToID("u_ParallaxTexture");
PBRSpecularMaterial.OCCLUSIONTEXTURE = Shader3D.propertyNameToID("u_OcclusionTexture");
PBRSpecularMaterial.EMISSIONTEXTURE = Shader3D.propertyNameToID("u_EmissionTexture");
PBRSpecularMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
PBRSpecularMaterial.SPECULARCOLOR = Shader3D.propertyNameToID("u_SpecularColor");
PBRSpecularMaterial.EMISSIONCOLOR = Shader3D.propertyNameToID("u_EmissionColor");
PBRSpecularMaterial.SMOOTHNESS = Shader3D.propertyNameToID("u_smoothness");
PBRSpecularMaterial.SMOOTHNESSSCALE = Shader3D.propertyNameToID("u_smoothnessScale");
PBRSpecularMaterial.SMOOTHNESSSOURCE = -1; //TODO:
PBRSpecularMaterial.OCCLUSIONSTRENGTH = Shader3D.propertyNameToID("u_occlusionStrength");
PBRSpecularMaterial.NORMALSCALE = Shader3D.propertyNameToID("u_normalScale");
PBRSpecularMaterial.PARALLAXSCALE = Shader3D.propertyNameToID("u_parallaxScale");
PBRSpecularMaterial.ENABLEEMISSION = -1; //TODO:
PBRSpecularMaterial.ENABLEREFLECT = -1; //TODO:
PBRSpecularMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
PBRSpecularMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
PBRSpecularMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
PBRSpecularMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
PBRSpecularMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
PBRSpecularMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
PBRSpecularMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
/**@internal */
PBRSpecularMaterial.shaderDefines = null;
