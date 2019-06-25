import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "././BaseMaterial";
import { RenderState } from "././RenderState";
/**
 * <code>UnlitMaterial</code> 类用于实现不受光照影响的材质。
 */
export class UnlitMaterial extends BaseMaterial {
    constructor() {
        super();
        /**@private */
        this._albedoColor = new Vector4(1.0, 1.0, 1.0, 1.0);
        /**@private */
        this._albedoIntensity = 1.0;
        /**@private */
        this._enableVertexColor = false;
        this.setShaderName("Unlit");
        this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
        this.renderMode = UnlitMaterial.RENDERMODE_OPAQUE;
    }
    /**
     * @private
     */
    static __initDefine__() {
        UnlitMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE = UnlitMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
        UnlitMaterial.SHADERDEFINE_TILINGOFFSET = UnlitMaterial.shaderDefines.registerDefine("TILINGOFFSET");
        UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = UnlitMaterial.shaderDefines.registerDefine("ENABLEVERTEXCOLOR");
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
    /**@private */
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
    get _AlbedoIntensity() {
        return this._albedoIntensity;
    }
    /**
     * @private
     */
    set _AlbedoIntensity(value) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo = this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR);
            Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }
    /**
     * @private
     */
    get _MainTex_STX() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).x;
    }
    /**
     * @private
     */
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STY() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).y;
    }
    /**
     * @private
     */
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STZ() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).z;
    }
    /**
     * @private
     */
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STW() {
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET).w;
    }
    /**
     * @private
     */
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
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
        var finalAlbedo = this._shaderValues.getVector(UnlitMaterial.ALBEDOCOLOR);
        Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(UnlitMaterial.ALBEDOCOLOR, finalAlbedo);
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
     * 获取反照率贴图。
     * @return 反照率贴图。
     */
    get albedoTexture() {
        return this._shaderValues.getTexture(UnlitMaterial.ALBEDOTEXTURE);
    }
    /**
     * 设置反照率贴图。
     * @param value 反照率贴图。
     */
    set albedoTexture(value) {
        if (value)
            this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(UnlitMaterial.ALBEDOTEXTURE, value);
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
        return this._shaderValues.getVector(UnlitMaterial.TILINGOFFSET);
    }
    /**
     * 获取纹理平铺和偏移。
     * @param value 纹理平铺和偏移。
     */
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(UnlitMaterial.TILINGOFFSET, value);
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
            this._shaderValues.addDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(UnlitMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    set renderMode(value) {
        switch (value) {
            case UnlitMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case UnlitMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = RenderState.CULL_BACK;
                this.blend = RenderState.BLEND_DISABLE;
                this.depthTest = RenderState.DEPTHTEST_LESS;
                break;
            case UnlitMaterial.RENDERMODE_TRANSPARENT:
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
                throw new Error("UnlitMaterial : renderMode value error.");
        }
    }
    /**
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    set depthWrite(value) {
        this._shaderValues.setBool(UnlitMaterial.DEPTH_WRITE, value);
    }
    /**
     * 获取是否写入深度。
     * @return 是否写入深度。
     */
    get depthWrite() {
        return this._shaderValues.getBool(UnlitMaterial.DEPTH_WRITE);
    }
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    set cull(value) {
        this._shaderValues.setInt(UnlitMaterial.CULL, value);
    }
    /**
     * 获取剔除方式。
     * @return 剔除方式。
     */
    get cull() {
        return this._shaderValues.getInt(UnlitMaterial.CULL);
    }
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    set blend(value) {
        this._shaderValues.setInt(UnlitMaterial.BLEND, value);
    }
    /**
     * 获取混合方式。
     * @return 混合方式。
     */
    get blend() {
        return this._shaderValues.getInt(UnlitMaterial.BLEND);
    }
    /**
     * 设置混合源。
     * @param value 混合源
     */
    set blendSrc(value) {
        this._shaderValues.setInt(UnlitMaterial.BLEND_SRC, value);
    }
    /**
     * 获取混合源。
     * @return 混合源。
     */
    get blendSrc() {
        return this._shaderValues.getInt(UnlitMaterial.BLEND_SRC);
    }
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    set blendDst(value) {
        this._shaderValues.setInt(UnlitMaterial.BLEND_DST, value);
    }
    /**
     * 获取混合目标。
     * @return 混合目标。
     */
    get blendDst() {
        return this._shaderValues.getInt(UnlitMaterial.BLEND_DST);
    }
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    set depthTest(value) {
        this._shaderValues.setInt(UnlitMaterial.DEPTH_TEST, value);
    }
    /**
     * 获取深度测试方式。
     * @return 深度测试方式。
     */
    get depthTest() {
        return this._shaderValues.getInt(UnlitMaterial.DEPTH_TEST);
    }
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone() {
        var dest = new UnlitMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
/**渲染状态_不透明。*/
UnlitMaterial.RENDERMODE_OPAQUE = 0;
/**渲染状态_阿尔法测试。*/
UnlitMaterial.RENDERMODE_CUTOUT = 1;
/**渲染状态__透明混合。*/
UnlitMaterial.RENDERMODE_TRANSPARENT = 2;
/**渲染状态__加色法混合。*/
UnlitMaterial.RENDERMODE_ADDTIVE = 3;
UnlitMaterial.ALBEDOTEXTURE = Shader3D.propertyNameToID("u_AlbedoTexture");
UnlitMaterial.ALBEDOCOLOR = Shader3D.propertyNameToID("u_AlbedoColor");
UnlitMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
UnlitMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
UnlitMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
UnlitMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
UnlitMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
UnlitMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
UnlitMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
/**@private */
UnlitMaterial.shaderDefines = null;
