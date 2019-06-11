import { BaseMaterial } from "../material/BaseMaterial";
import { RenderState } from "../material/RenderState";
import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
/**
 * <code>ShurikenParticleMaterial</code> 类用于实现粒子材质。
 */
export class ShurikenParticleMaterial extends BaseMaterial {
    constructor() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        this.setShaderName("PARTICLESHURIKEN");
        this._color = new Vector4(1.0, 1.0, 1.0, 1.0);
        this.renderMode = ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED; //默认加色法会自动加上雾化宏定义，导致非加色法从材质读取完后未移除宏定义。
    }
    /**
     * @private
     */
    static __initDefine__() {
        ShurikenParticleMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
        ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP = ShurikenParticleMaterial.shaderDefines.registerDefine("DIFFUSEMAP");
        ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR = ShurikenParticleMaterial.shaderDefines.registerDefine("TINTCOLOR");
        ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG = ShurikenParticleMaterial.shaderDefines.registerDefine("ADDTIVEFOG");
        ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET = ShurikenParticleMaterial.shaderDefines.registerDefine("TILINGOFFSET");
    }
    /**
     * @private
     */
    get _TintColorR() {
        return this._color.x;
    }
    /**
     * @private
     */
    set _TintColorR(value) {
        this._color.x = value;
        this.color = this._color;
    }
    /**
     * @private
     */
    get _TintColorG() {
        return this._color.y;
    }
    /**
     * @private
     */
    set _TintColorG(value) {
        this._color.y = value;
        this.color = this._color;
    }
    /**
     * @private
     */
    get _TintColorB() {
        return this._color.z;
    }
    /**
     * @private
     */
    set _TintColorB(value) {
        this._color.z = value;
        this.color = this._color;
    }
    /**@private */
    get _TintColorA() {
        return this._color.w;
    }
    /**
     * @private
     */
    set _TintColorA(value) {
        this._color.w = value;
        this.color = this._color;
    }
    /**
     * @private
     */
    get _MainTex_STX() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).x;
    }
    /**
     * @private
     */
    set _MainTex_STX(x) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STY() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).y;
    }
    /**
     * @private
     */
    set _MainTex_STY(y) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STZ() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).z;
    }
    /**
     * @private
     */
    set _MainTex_STZ(z) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }
    /**
     * @private
     */
    get _MainTex_STW() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET).w;
    }
    /**
     * @private
     */
    set _MainTex_STW(w) {
        var tilOff = this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    set renderMode(value) {
        switch (value) {
            case ShurikenParticleMaterial.RENDERMODE_ADDTIVE:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.depthWrite = false;
                this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE;
                this.alphaTest = false;
                this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            case ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED:
                this.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.depthWrite = false;
                this.cull = RenderState.CULL_NONE;
                this.blend = RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.alphaTest = false;
                this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            default:
                throw new Error("ShurikenParticleMaterial : renderMode value error.");
        }
    }
    /**
     * 获取颜色R分量。
     * @return 颜色R分量。
     */
    get colorR() {
        return this._TintColorR;
    }
    /**
     * 设置颜色R分量。
     * @param value 颜色R分量。
     */
    set colorR(value) {
        this._TintColorR = value;
    }
    /**
     * 获取颜色G分量。
     * @return 颜色G分量。
     */
    get colorG() {
        return this._TintColorG;
    }
    /**
     * 设置颜色G分量。
     * @param value 颜色G分量。
     */
    set colorG(value) {
        this._TintColorG = value;
    }
    /**
     * 获取颜色B分量。
     * @return 颜色B分量。
     */
    get colorB() {
        return this._TintColorB;
    }
    /**
     * 设置颜色B分量。
     * @param value 颜色B分量。
     */
    set colorB(value) {
        this._TintColorB = value;
    }
    /**
     * 获取颜色Z分量。
     * @return 颜色Z分量。
     */
    get colorA() {
        return this._TintColorA;
    }
    /**
     * 设置颜色alpha分量。
     * @param value 颜色alpha分量。
     */
    set colorA(value) {
        this._TintColorA = value;
    }
    /**
     * 获取颜色。
     * @return  颜色。
     */
    get color() {
        return this._shaderValues.getVector(ShurikenParticleMaterial.TINTCOLOR);
    }
    /**
     * 设置颜色。
     * @param value 颜色。
     */
    set color(value) {
        if (value)
            this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);
        else
            this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TINTCOLOR);
        this._shaderValues.setVector(ShurikenParticleMaterial.TINTCOLOR, value);
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
        return this._shaderValues.getVector(ShurikenParticleMaterial.TILINGOFFSET);
    }
    /**
     * 获取纹理平铺和偏移。
     * @param value 纹理平铺和偏移。
     */
    set tilingOffset(value) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        else {
            this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(ShurikenParticleMaterial.TILINGOFFSET, value);
    }
    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get texture() {
        return this._shaderValues.getTexture(ShurikenParticleMaterial.DIFFUSETEXTURE);
    }
    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set texture(value) {
        if (value)
            this._shaderValues.addDefine(ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP);
        else
            this._shaderValues.removeDefine(ShurikenParticleMaterial.SHADERDEFINE_DIFFUSEMAP);
        this._shaderValues.setTexture(ShurikenParticleMaterial.DIFFUSETEXTURE, value);
    }
    /**
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    set depthWrite(value) {
        this._shaderValues.setBool(ShurikenParticleMaterial.DEPTH_WRITE, value);
    }
    /**
     * 获取是否写入深度。
     * @return 是否写入深度。
     */
    get depthWrite() {
        return this._shaderValues.getBool(ShurikenParticleMaterial.DEPTH_WRITE);
    }
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    set cull(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.CULL, value);
    }
    /**
     * 获取剔除方式。
     * @return 剔除方式。
     */
    get cull() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.CULL);
    }
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    set blend(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.BLEND, value);
    }
    /**
     * 获取混合方式。
     * @return 混合方式。
     */
    get blend() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.BLEND);
    }
    /**
     * 设置混合源。
     * @param value 混合源
     */
    set blendSrc(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.BLEND_SRC, value);
    }
    /**
     * 获取混合源。
     * @return 混合源。
     */
    get blendSrc() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.BLEND_SRC);
    }
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    set blendDst(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.BLEND_DST, value);
    }
    /**
     * 获取混合目标。
     * @return 混合目标。
     */
    get blendDst() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.BLEND_DST);
    }
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    set depthTest(value) {
        this._shaderValues.setInt(ShurikenParticleMaterial.DEPTH_TEST, value);
    }
    /**
     * 获取深度测试方式。
     * @return 深度测试方式。
     */
    get depthTest() {
        return this._shaderValues.getInt(ShurikenParticleMaterial.DEPTH_TEST);
    }
    /**
* 克隆。
* @return	 克隆副本。
*/
    clone() {
        var dest = new ShurikenParticleMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
/**渲染状态_透明混合。*/
ShurikenParticleMaterial.RENDERMODE_ALPHABLENDED = 0;
/**渲染状态_加色法混合。*/
ShurikenParticleMaterial.RENDERMODE_ADDTIVE = 1;
ShurikenParticleMaterial.DIFFUSETEXTURE = Shader3D.propertyNameToID("u_texture");
ShurikenParticleMaterial.TINTCOLOR = Shader3D.propertyNameToID("u_Tintcolor");
ShurikenParticleMaterial.TILINGOFFSET = Shader3D.propertyNameToID("u_TilingOffset");
ShurikenParticleMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
ShurikenParticleMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
ShurikenParticleMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
ShurikenParticleMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
ShurikenParticleMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
ShurikenParticleMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
/**@private */
ShurikenParticleMaterial.shaderDefines = null;
