import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { BaseMaterial } from "./BaseMaterial";
import { RenderState } from "./RenderState";
/**
 * <code>BlinnPhongMaterial</code> 类用于实现Blinn-Phong材质。
 */
export class BlinnPhongMaterial extends BaseMaterial {
    /**
     * 创建一个 <code>BlinnPhongMaterial</code> 实例。
     */
    constructor() {
        super();
        this._enableVertexColor = false;
        this.setShaderName("BLINNPHONG");
        this._albedoIntensity = 1.0;
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        var sv = this._shaderValues;
        sv.setVector(BlinnPhongMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setVector(BlinnPhongMaterial.MATERIALSPECULAR, new Vector4(1.0, 1.0, 1.0, 1.0));
        sv.setNumber(BlinnPhongMaterial.SHININESS, 0.078125);
        sv.setNumber(BaseMaterial.ALPHATESTVALUE, 0.5);
        sv.setVector(BlinnPhongMaterial.TILINGOFFSET, new Vector4(1.0, 1.0, 0.0, 0.0));
        this._enableLighting = true;
        this.renderMode = BlinnPhongMaterial.RENDERMODE_OPAQUE;
    }
    /**
     * @internal
     */
    static __initDefine__() {
        BlinnPhongMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP = BlinnPhongMaterial.shaderDefines.registerDefine("DIFFUSEMAP");
        BlinnPhongMaterial.SHADERDEFINE_NORMALMAP = BlinnPhongMaterial.shaderDefines.registerDefine("NORMALMAP");
        BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP = BlinnPhongMaterial.shaderDefines.registerDefine("SPECULARMAP");
        BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET = BlinnPhongMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = BlinnPhongMaterial.shaderDefines.registerDefine("ENABLEVERTEXCOLOR");
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
    /**@internal */
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
        return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x;
    }
    /**
     * @internal
     */
    set _SpecColorR(value) {
        this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).x = value;
    }
    /**
     * @internal
     */
    get _SpecColorG() {
        return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y;
    }
    /**
     * @internal
     */
    set _SpecColorG(value) {
        this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).y = value;
    }
    /**
     * @internal
     */
    get _SpecColorB() {
        return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z;
    }
    /**
     * @internal
     */
    set _SpecColorB(value) {
        this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).z = value;
    }
    /**
     * @internal
     */
    get _SpecColorA() {
        return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w;
    }
    /**
     * @internal
     */
    set _SpecColorA(value) {
        this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR).w = value;
    }
    /**
     * @internal
     */
    get _AlbedoIntensity() {
        return this._albedoIntensity;
    }
    /**
     * @internal
     */
    set _AlbedoIntensity(value) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo = this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR);
            Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, finalAlbedo); //修改值后必须调用此接口,否则NATIVE不生效
        }
    }
    /**
     * @internal
     */
    get _Shininess() {
        return this._shaderValues.getNumber(BlinnPhongMaterial.SHININESS);
    }
    /**
     * @internal
     */
    set _Shininess(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(BlinnPhongMaterial.SHININESS, value);
    }
    /**
     * @internal
     */
    get _MainTex_STX() {
        return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).x;
    }
    /**
     * @internal
     */
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    /**
     * @internal
     */
    get _MainTex_STY() {
        return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).y;
    }
    /**
     * @internal
     */
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    /**
     * @internal
     */
    get _MainTex_STZ() {
        return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).z;
    }
    /**
     * @internal
     */
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    /**
     * @internal
     */
    get _MainTex_STW() {
        return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET).w;
    }
    /**
     * @internal
     */
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET);
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
     * 设置渲染模式。
     * @return 渲染模式。
     */
    set renderMode(value) {
        switch (value) {
            case BlinnPhongMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case BlinnPhongMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case BlinnPhongMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            default:
                throw new Error("Material:renderMode value error.");
        }
    }
    /**
     * 获取是否支持顶点色。
     * @return  是否支持顶点色。
     */
    get enableVertexColor() {
        return this._enableVertexColor;
    }
    /**
     * 设置是否支持顶点色。
     * @param value  是否支持顶点色。
     */
    set enableVertexColor(value) {
        this._enableVertexColor = value;
        if (value)
            this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
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
        return this._shaderValues.getVector(BlinnPhongMaterial.TILINGOFFSET);
    }
    /**
     * 获取纹理平铺和偏移。
     * @param value 纹理平铺和偏移。
     */
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(BlinnPhongMaterial.TILINGOFFSET, value);
    }
    /**
     * 获取反照率颜色R分量。
     * @return 反照率颜色R分量。
     */
    get albedoColorR() {
        return this._ColorR;
    }
    /**
     * 设置反照率颜色R分量。
     * @param value 反照率颜色R分量。
     */
    set albedoColorR(value) {
        this._ColorR = value;
    }
    /**
     * 获取反照率颜色G分量。
     * @return 反照率颜色G分量。
     */
    get albedoColorG() {
        return this._ColorG;
    }
    /**
     * 设置反照率颜色G分量。
     * @param value 反照率颜色G分量。
     */
    set albedoColorG(value) {
        this._ColorG = value;
    }
    /**
     * 获取反照率颜色B分量。
     * @return 反照率颜色B分量。
     */
    get albedoColorB() {
        return this._ColorB;
    }
    /**
     * 设置反照率颜色B分量。
     * @param value 反照率颜色B分量。
     */
    set albedoColorB(value) {
        this._ColorB = value;
    }
    /**
     * 获取反照率颜色Z分量。
     * @return 反照率颜色Z分量。
     */
    get albedoColorA() {
        return this._ColorA;
    }
    /**
     * 设置反照率颜色alpha分量。
     * @param value 反照率颜色alpha分量。
     */
    set albedoColorA(value) {
        this._ColorA = value;
    }
    /**
     * 获取反照率颜色。
     * @return 反照率颜色。
     */
    get albedoColor() {
        return this._albedoColor;
    }
    /**
     * 设置反照率颜色。
     * @param value 反照率颜色。
     */
    set albedoColor(value) {
        var finalAlbedo = this._shaderValues.getVector(BlinnPhongMaterial.ALBEDOCOLOR);
        Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(BlinnPhongMaterial.ALBEDOCOLOR, finalAlbedo); //修改值后必须调用此接口,否则NATIVE不生效
    }
    /**
     * 获取反照率强度。
     * @return 反照率强度。
     */
    get albedoIntensity() {
        return this._albedoIntensity;
    }
    /**
     * 设置反照率强度。
     * @param value 反照率强度。
     */
    set albedoIntensity(value) {
        this._AlbedoIntensity = value;
    }
    /**
     * 获取高光颜色R轴分量。
     * @return 高光颜色R轴分量。
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
        return this._shaderValues.getVector(BlinnPhongMaterial.MATERIALSPECULAR);
    }
    /**
     * 设置高光颜色。
     * @param value 高光颜色。
     */
    set specularColor(value) {
        this._shaderValues.setVector(BlinnPhongMaterial.MATERIALSPECULAR, value);
    }
    /**
     * 获取高光强度,范围为0到1。
     * @return 高光强度。
     */
    get shininess() {
        return this._Shininess;
    }
    /**
     * 设置高光强度,范围为0到1。
     * @param value 高光强度。
     */
    set shininess(value) {
        this._Shininess = value;
    }
    /**
     * 获取反照率贴图。
     * @return 反照率贴图。
     */
    get albedoTexture() {
        return this._shaderValues.getTexture(BlinnPhongMaterial.ALBEDOTEXTURE);
    }
    /**
     * 设置反照率贴图。
     * @param value 反照率贴图。
     */
    set albedoTexture(value) {
        if (value)
            this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
        else
            this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_DIFFUSEMAP);
        this._shaderValues.setTexture(BlinnPhongMaterial.ALBEDOTEXTURE, value);
    }
    /**
     * 获取法线贴图。
     * @return 法线贴图。
     */
    get normalTexture() {
        return this._shaderValues.getTexture(BlinnPhongMaterial.NORMALTEXTURE);
    }
    /**
     * 设置法线贴图。
     * @param value 法线贴图。
     */
    set normalTexture(value) {
        if (value)
            this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
        else
            this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_NORMALMAP);
        this._shaderValues.setTexture(BlinnPhongMaterial.NORMALTEXTURE, value);
    }
    /**
     * 获取高光贴图。
     * @return 高光贴图。
     */
    get specularTexture() {
        return this._shaderValues.getTexture(BlinnPhongMaterial.SPECULARTEXTURE);
    }
    /**
     * 设置高光贴图，高光强度则从该贴图RGB值中获取,如果该值为空则从漫反射贴图的Alpha通道获取。
     * @param value  高光贴图。
     */
    set specularTexture(value) {
        if (value)
            this._shaderValues.addDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
        else
            this._shaderValues.removeDefine(BlinnPhongMaterial.SHADERDEFINE_SPECULARMAP);
        this._shaderValues.setTexture(BlinnPhongMaterial.SPECULARTEXTURE, value);
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
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    set depthWrite(value) {
        this._shaderValues.setBool(BlinnPhongMaterial.DEPTH_WRITE, value);
    }
    /**
     * 获取是否写入深度。
     * @return 是否写入深度。
     */
    get depthWrite() {
        return this._shaderValues.getBool(BlinnPhongMaterial.DEPTH_WRITE);
    }
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    set cull(value) {
        this._shaderValues.setInt(BlinnPhongMaterial.CULL, value);
    }
    /**
     * 获取剔除方式。
     * @return 剔除方式。
     */
    get cull() {
        return this._shaderValues.getInt(BlinnPhongMaterial.CULL);
    }
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    set blend(value) {
        this._shaderValues.setInt(BlinnPhongMaterial.BLEND, value);
    }
    /**
     * 获取混合方式。
     * @return 混合方式。
     */
    get blend() {
        return this._shaderValues.getInt(BlinnPhongMaterial.BLEND);
    }
    /**
     * 设置混合源。
     * @param value 混合源
     */
    set blendSrc(value) {
        this._shaderValues.setInt(BlinnPhongMaterial.BLEND_SRC, value);
    }
    /**
     * 获取混合源。
     * @return 混合源。
     */
    get blendSrc() {
        return this._shaderValues.getInt(BlinnPhongMaterial.BLEND_SRC);
    }
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    set blendDst(value) {
        this._shaderValues.setInt(BlinnPhongMaterial.BLEND_DST, value);
    }
    /**
     * 获取混合目标。
     * @return 混合目标。
     */
    get blendDst() {
        return this._shaderValues.getInt(BlinnPhongMaterial.BLEND_DST);
    }
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    set depthTest(value) {
        this._shaderValues.setInt(BlinnPhongMaterial.DEPTH_TEST, value);
    }
    /**
     * 获取深度测试方式。
     * @return 深度测试方式。
     */
    get depthTest() {
        return this._shaderValues.getInt(BlinnPhongMaterial.DEPTH_TEST);
    }
    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone() {
        var dest = new BlinnPhongMaterial();
        this.cloneTo(dest);
        return dest;
    }
    /**
     * @inheritDoc
     */
    cloneTo(destObject) {
        super.cloneTo(destObject);
        var destMaterial = destObject;
        destMaterial._enableLighting = this._enableLighting;
        destMaterial._albedoIntensity = this._albedoIntensity;
        destMaterial._enableVertexColor = this._enableVertexColor;
        this._albedoColor.cloneTo(destMaterial._albedoColor);
    }
}
/**渲染状态_不透明。*/
BlinnPhongMaterial.RENDERMODE_OPAQUE = 0;
/**渲染状态_阿尔法测试。*/
BlinnPhongMaterial.RENDERMODE_CUTOUT = 1;
/**渲染状态_透明混合。*/
BlinnPhongMaterial.RENDERMODE_TRANSPARENT = 2;
BlinnPhongMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_DiffuseTexture");
BlinnPhongMaterial.NORMALTEXTURE = Shader3D.propertyNameToID("u_NormalTexture");
BlinnPhongMaterial.SPECULARTEXTURE = Shader3D.propertyNameToID("u_SpecularTexture");
BlinnPhongMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_DiffuseColor");
BlinnPhongMaterial.MATERIALSPECULAR = Shader3D.propertyNameToID("u_MaterialSpecular");
BlinnPhongMaterial.SHININESS = Shader3D.propertyNameToID("u_Shininess");
BlinnPhongMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
BlinnPhongMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
BlinnPhongMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
BlinnPhongMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
BlinnPhongMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
BlinnPhongMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
BlinnPhongMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
/**@internal */
BlinnPhongMaterial.shaderDefines = null;
