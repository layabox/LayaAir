import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
/**
 * <code>PBRStandardMaterial</code> 类用于实现PBR(Standard)材质。
 */
export class PBRStandardMaterial extends BaseMaterial {
    /**
     * 创建一个 <code>PBRStandardMaterial</code> 实例。
     */
    constructor() {
        super();
        this.setShaderName("PBRStandard");
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        this._shaderValues.setVector(PBRStandardMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this._emissionColor = new Vector4(0.0, 0.0, 0.0, 0.0);
        this._shaderValues.setVector(PBRStandardMaterial.EMISSIONCOLOR, new Vector4(0.0, 0.0, 0.0, 0.0));
        this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, 0.0);
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESS, 0.5);
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSCALE, 1.0);
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSOURCE, 0);
        this._shaderValues.setNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH, 1.0);
        this._shaderValues.setNumber(PBRStandardMaterial.NORMALSCALE, 1.0);
        this._shaderValues.setNumber(PBRStandardMaterial.PARALLAXSCALE, 0.001);
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEEMISSION, false);
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEREFLECT, true);
        this._shaderValues.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
        this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        this.renderMode = PBRStandardMaterial.RENDERMODE_OPAQUE;
    }
    /**
     * @private
     */
    static __initDefine__() {
        PBRStandardMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("METALLICGLOSSTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA = PBRStandardMaterial.shaderDefines.registerDefine("SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA");
        PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("NORMALTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("PARALLAXTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("OCCLUSIONTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_EMISSION = PBRStandardMaterial.shaderDefines.registerDefine("EMISSION");
        PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE = PBRStandardMaterial.shaderDefines.registerDefine("EMISSIONTEXTURE");
        PBRStandardMaterial.SHADERDEFINE_REFLECTMAP = PBRStandardMaterial.shaderDefines.registerDefine("REFLECTMAP");
        PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET = PBRStandardMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY = PBRStandardMaterial.shaderDefines.registerDefine("ALPHAPREMULTIPLY");
    }
    /**
     * @private
     */
    get _ColorR() {
        return this._albedoColor.x;
    }
    /**
     * @private
     */
    set _ColorR(value) {
        this._albedoColor.x = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @private
     */
    get _ColorG() {
        return this._albedoColor.y;
    }
    /**
     * @private
     */
    set _ColorG(value) {
        this._albedoColor.y = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @private
     */
    get _ColorB() {
        return this._albedoColor.z;
    }
    /**
     * @private
     */
    set _ColorB(value) {
        this._albedoColor.z = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @private
     */
    get _ColorA() {
        return this._albedoColor.w;
    }
    /**
     * @private
     */
    set _ColorA(value) {
        this._albedoColor.w = value;
        this.albedoColor = this._albedoColor;
    }
    /**
     * @private
     */
    get _Metallic() {
        return this._shaderValues.getNumber(PBRStandardMaterial.METALLIC);
    }
    /**
     * @private
     */
    set _Metallic(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.METALLIC, value);
    }
    /**
     * @private
     */
    get _Glossiness() {
        return this._shaderValues.getNumber(PBRStandardMaterial.SMOOTHNESS);
    }
    /**
     * @private
     */
    set _Glossiness(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESS, value);
    }
    /**
     * @private
     */
    get _GlossMapScale() {
        return this._shaderValues.getNumber(PBRStandardMaterial.SMOOTHNESSSCALE);
    }
    /**
     * @private
     */
    set _GlossMapScale(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.SMOOTHNESSSCALE, value);
    }
    /**
     * @private
     */
    get _BumpScale() {
        return this._shaderValues.getNumber(PBRStandardMaterial.NORMALSCALE);
    }
    /**
     * @private
     */
    set _BumpScale(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.NORMALSCALE, value);
    }
    /**@private */
    get _Parallax() {
        return this._shaderValues.getNumber(PBRStandardMaterial.PARALLAXSCALE);
    }
    /**
     * @private
     */
    set _Parallax(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.PARALLAXSCALE, value);
    }
    /**@private */
    get _OcclusionStrength() {
        return this._shaderValues.getNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH);
    }
    /**
     * @private
     */
    set _OcclusionStrength(value) {
        this._shaderValues.setNumber(PBRStandardMaterial.OCCLUSIONSTRENGTH, value);
    }
    /**
     * @private
     */
    get _EmissionColorR() {
        return this._emissionColor.x;
    }
    /**
     * @private
     */
    set _EmissionColorR(value) {
        this._emissionColor.x = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @private
     */
    get _EmissionColorG() {
        return this._emissionColor.y;
    }
    /**
     * @private
     */
    set _EmissionColorG(value) {
        this._emissionColor.y = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @private
     */
    get _EmissionColorB() {
        return this._emissionColor.z;
    }
    /**
     * @private
     */
    set _EmissionColorB(value) {
        this._emissionColor.z = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @private
     */
    get _EmissionColorA() {
        return this._emissionColor.w;
    }
    /**
     * @private
     */
    set _EmissionColorA(value) {
        this._emissionColor.w = value;
        this.emissionColor = this._emissionColor;
    }
    /**
     * @private
     */
    get _MainTex_STX() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).x;
    }
    /**
     * @private
     */
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STY() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).y;
    }
    /**
     * @private
     */
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STZ() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).z;
    }
    /**
     * @private
     */
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STW() {
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET).w;
    }
    /**
     * @private
     */
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _Cutoff() {
        return this.alphaTestValue;
    }
    /**
     * @private
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
     * 获取反射率颜色Z分量。
     * @return 反射率颜色Z分量。
     */
    get albedoColorA() {
        return this._ColorA;
    }
    /**
     * 设置反射率颜色alpha分量。
     * @param value 反射率颜色alpha分量。
     */
    set albedoColorA(value) {
        this._ColorA = value;
    }
    /**
     * 获取漫反射颜色。
     * @return 漫反射颜色。
     */
    get albedoColor() {
        return this._albedoColor;
    }
    /**
     * 设置漫反射颜色。
     * @param value 漫反射颜色。
     */
    set albedoColor(value) {
        this._albedoColor = value;
        this._shaderValues.setVector(PBRStandardMaterial.ALBEDOCOLOR, value);
    }
    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get albedoTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.ALBEDOTEXTURE);
    }
    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set albedoTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.ALBEDOTEXTURE, value);
    }
    /**
     * 获取法线贴图。
     * @return 法线贴图。
     */
    get normalTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.NORMALTEXTURE);
    }
    /**
     * 设置法线贴图。
     * @param value 法线贴图。
     */
    set normalTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_NORMALTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.NORMALTEXTURE, value);
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
        return this._shaderValues.getTexture(PBRStandardMaterial.PARALLAXTEXTURE);
    }
    /**
     * 设置视差贴图。
     * @param value 视察贴图。
     */
    set parallaxTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_PARALLAXTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.PARALLAXTEXTURE, value);
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
        return this._shaderValues.getTexture(PBRStandardMaterial.OCCLUSIONTEXTURE);
    }
    /**
     * 设置遮挡贴图。
     * @param value 遮挡贴图。
     */
    set occlusionTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_OCCLUSIONTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.OCCLUSIONTEXTURE, value);
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
     * 获取金属光滑度贴图。
     * @return 金属光滑度贴图。
     */
    get metallicGlossTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE);
    }
    /**
     * 设置金属光滑度贴图。
     * @param value 金属光滑度贴图。
     */
    set metallicGlossTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_METALLICGLOSSTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.METALLICGLOSSTEXTURE, value);
    }
    /**
     * 获取金属度。
     * @return 金属度,范围为0到1。
     */
    get metallic() {
        return this._Metallic;
    }
    /**
     * 设置金属度。
     * @param value 金属度,范围为0到1。
     */
    set metallic(value) {
        this._Metallic = Math.max(0.0, Math.min(1.0, value));
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
        return this._shaderValues.getInt(PBRStandardMaterial.SMOOTHNESSSOURCE);
    }
    /**
     * 设置光滑度数据源。
     * @param value 光滑滑度数据源,0或1。
     */
    set smoothnessSource(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRStandardMaterial.SMOOTHNESSSOURCE, 1);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA);
            this._shaderValues.setInt(PBRStandardMaterial.SMOOTHNESSSOURCE, 0);
        }
    }
    /**
     * 获取是否激活放射属性。
     * @return 是否激活放射属性。
     */
    get enableEmission() {
        return this._shaderValues.getBool(PBRStandardMaterial.ENABLEEMISSION);
    }
    /**
     * 设置是否激活放射属性。
     * @param value 是否激活放射属性
     */
    set enableEmission(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_EMISSION);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_EMISSION);
        }
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEEMISSION, value);
    }
    /**
     * 获取放射颜色R分量。
     * @return 放射颜色R分量。
     */
    get emissionColorR() {
        return this._EmissionColorR;
    }
    /**
     * 设置放射颜色R分量。
     * @param value 放射颜色R分量。
     */
    set emissionColorR(value) {
        this._EmissionColorR = value;
    }
    /**
     * 获取放射颜色G分量。
     * @return 放射颜色G分量。
     */
    get emissionColorG() {
        return this._EmissionColorG;
    }
    /**
     * 设置放射颜色G分量。
     * @param value 放射颜色G分量。
     */
    set emissionColorG(value) {
        this._EmissionColorG = value;
    }
    /**
     * 获取放射颜色B分量。
     * @return 放射颜色B分量。
     */
    get emissionColorB() {
        return this._EmissionColorB;
    }
    /**
     * 设置放射颜色B分量。
     * @param value 放射颜色B分量。
     */
    set emissionColorB(value) {
        this._EmissionColorB = value;
    }
    /**
     * 获取放射颜色A分量。
     * @return 放射颜色A分量。
     */
    get emissionColorA() {
        return this._EmissionColorA;
    }
    /**
     * 设置放射颜色A分量。
     * @param value 放射颜色A分量。
     */
    set emissionColorA(value) {
        this._EmissionColorA = value;
    }
    /**
     * 获取放射颜色。
     * @return 放射颜色。
     */
    get emissionColor() {
        return this._shaderValues.getVector(PBRStandardMaterial.EMISSIONCOLOR);
    }
    /**
     * 设置放射颜色。
     * @param value 放射颜色。
     */
    set emissionColor(value) {
        this._shaderValues.setVector(PBRStandardMaterial.EMISSIONCOLOR, value);
    }
    /**
     * 获取放射贴图。
     * @return 放射贴图。
     */
    get emissionTexture() {
        return this._shaderValues.getTexture(PBRStandardMaterial.EMISSIONTEXTURE);
    }
    /**
     * 设置放射贴图。
     * @param value 放射贴图。
     */
    set emissionTexture(value) {
        if (value) {
            this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_EMISSIONTEXTURE);
        }
        this._shaderValues.setTexture(PBRStandardMaterial.EMISSIONTEXTURE, value);
    }
    /**
     * 获取是否开启反射。
     * @return 是否开启反射。
     */
    get enableReflection() {
        return this._shaderValues.getBool(PBRStandardMaterial.ENABLEREFLECT);
    }
    /**
     * 设置是否开启反射。
     * @param value 是否开启反射。
     */
    set enableReflection(value) {
        this._shaderValues.setBool(PBRStandardMaterial.ENABLEREFLECT, true);
        if (value) {
            this._disablePublicDefineDatas.remove(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        }
        else {
            this._disablePublicDefineDatas.add(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        }
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
        return this._shaderValues.getVector(PBRStandardMaterial.TILINGOFFSET);
    }
    /**
     * 获取纹理平铺和偏移。
     * @param value 纹理平铺和偏移。
     */
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0) {
                this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
            }
            else {
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
            }
        }
        else {
            this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(PBRStandardMaterial.TILINGOFFSET, value);
    }
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    set renderMode(value) {
        switch (value) {
            case PBRStandardMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRStandardMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
            case PBRStandardMaterial.RENDERMODE_FADE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
                break;
                break;
            case PBRStandardMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_ONE;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(PBRStandardMaterial.SHADERDEFINE_ALPHAPREMULTIPLY);
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
        this._shaderValues.setBool(PBRStandardMaterial.DEPTH_WRITE, value);
    }
    /**
     * 获取是否写入深度。
     * @return 是否写入深度。
     */
    get depthWrite() {
        return this._shaderValues.getBool(PBRStandardMaterial.DEPTH_WRITE);
    }
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    set cull(value) {
        this._shaderValues.setInt(PBRStandardMaterial.CULL, value);
    }
    /**
     * 获取剔除方式。
     * @return 剔除方式。
     */
    get cull() {
        return this._shaderValues.getInt(PBRStandardMaterial.CULL);
    }
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    set blend(value) {
        this._shaderValues.setInt(PBRStandardMaterial.BLEND, value);
    }
    /**
     * 获取混合方式。
     * @return 混合方式。
     */
    get blend() {
        return this._shaderValues.getInt(PBRStandardMaterial.BLEND);
    }
    /**
     * 设置混合源。
     * @param value 混合源
     */
    set blendSrc(value) {
        this._shaderValues.setInt(PBRStandardMaterial.BLEND_SRC, value);
    }
    /**
     * 获取混合源。
     * @return 混合源。
     */
    get blendSrc() {
        return this._shaderValues.getInt(PBRStandardMaterial.BLEND_SRC);
    }
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    set blendDst(value) {
        this._shaderValues.setInt(PBRStandardMaterial.BLEND_DST, value);
    }
    /**
     * 获取混合目标。
     * @return 混合目标。
     */
    get blendDst() {
        return this._shaderValues.getInt(PBRStandardMaterial.BLEND_DST);
    }
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    set depthTest(value) {
        this._shaderValues.setInt(PBRStandardMaterial.DEPTH_TEST, value);
    }
    /**
     * 获取深度测试方式。
     * @return 深度测试方式。
     */
    get depthTest() {
        return this._shaderValues.getInt(PBRStandardMaterial.DEPTH_TEST);
    }
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone() {
        var dest = new PBRStandardMaterial();
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
        this._emissionColor.cloneTo(destMaterial._emissionColor);
    }
}
/**光滑度数据源_金属度贴图的Alpha通道。*/
PBRStandardMaterial.SmoothnessSource_MetallicGlossTexture_Alpha = 0;
/**光滑度数据源_反射率贴图的Alpha通道。*/
PBRStandardMaterial.SmoothnessSource_AlbedoTexture_Alpha = 1;
/**渲染状态_不透明。*/
PBRStandardMaterial.RENDERMODE_OPAQUE = 0;
/**渲染状态_透明测试。*/
PBRStandardMaterial.RENDERMODE_CUTOUT = 1;
/**渲染状态_透明混合_游戏中经常使用的透明。*/
PBRStandardMaterial.RENDERMODE_FADE = 2;
/**渲染状态_透明混合_物理上看似合理的透明。*/
PBRStandardMaterial.RENDERMODE_TRANSPARENT = 3;
PBRStandardMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
PBRStandardMaterial.METALLICGLOSSTEXTURE = Shader3D.propertyNameToID("u_MetallicGlossTexture");
PBRStandardMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
PBRStandardMaterial.PARALLAXTEXTURE = Shader3D.propertyNameToID("u_ParallaxTexture");
PBRStandardMaterial.OCCLUSIONTEXTURE = Shader3D.propertyNameToID("u_OcclusionTexture");
PBRStandardMaterial.EMISSIONTEXTURE = Shader3D.propertyNameToID("u_EmissionTexture");
PBRStandardMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
PBRStandardMaterial.EMISSIONCOLOR = Shader3D.propertyNameToID("u_EmissionColor");
PBRStandardMaterial.METALLIC = Shader3D.propertyNameToID("u_metallic");
PBRStandardMaterial.SMOOTHNESS = Shader3D.propertyNameToID("u_smoothness");
PBRStandardMaterial.SMOOTHNESSSCALE = Shader3D.propertyNameToID("u_smoothnessScale");
PBRStandardMaterial.SMOOTHNESSSOURCE = -1; //TODO:
PBRStandardMaterial.OCCLUSIONSTRENGTH = Shader3D.propertyNameToID("u_occlusionStrength");
PBRStandardMaterial.NORMALSCALE = Shader3D.propertyNameToID("u_normalScale");
PBRStandardMaterial.PARALLAXSCALE = Shader3D.propertyNameToID("u_parallaxScale");
PBRStandardMaterial.ENABLEEMISSION = -1; //TODO:
PBRStandardMaterial.ENABLEREFLECT = -1; //TODO:
PBRStandardMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
PBRStandardMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
PBRStandardMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
PBRStandardMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
PBRStandardMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
PBRStandardMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
PBRStandardMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
/**@private */
PBRStandardMaterial.shaderDefines = null;
