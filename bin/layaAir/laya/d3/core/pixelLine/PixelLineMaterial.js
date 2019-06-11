import { Vector4 } from "../../math/Vector4";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "../material/BaseMaterial";
/**
 * ...
 * @author
 */
export class PixelLineMaterial extends BaseMaterial {
    constructor() {
        super();
        this.setShaderName("LineShader");
        this._shaderValues.setVector(PixelLineMaterial.COLOR, new Vector4(1.0, 1.0, 1.0, 1.0));
    }
    /**
    * @private
    */
    static __initDefine__() {
        PixelLineMaterial.shaderDefines = new ShaderDefines(BaseMaterial.shaderDefines);
    }
    /**
     * 获取颜色。
     * @return 颜色。
     */
    get color() {
        return this._shaderValues.getVector(PixelLineMaterial.COLOR);
    }
    /**
     * 设置颜色。
     * @param value 颜色。
     */
    set color(value) {
        this._shaderValues.setVector(PixelLineMaterial.COLOR, value);
    }
    /**
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    set depthWrite(value) {
        this._shaderValues.setBool(PixelLineMaterial.DEPTH_WRITE, value);
    }
    /**
     * 获取是否写入深度。
     * @return 是否写入深度。
     */
    get depthWrite() {
        return this._shaderValues.getBool(PixelLineMaterial.DEPTH_WRITE);
    }
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    set cull(value) {
        this._shaderValues.setInt(PixelLineMaterial.CULL, value);
    }
    /**
     * 获取剔除方式。
     * @return 剔除方式。
     */
    get cull() {
        return this._shaderValues.getInt(PixelLineMaterial.CULL);
    }
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    set blend(value) {
        this._shaderValues.setInt(PixelLineMaterial.BLEND, value);
    }
    /**
     * 获取混合方式。
     * @return 混合方式。
     */
    get blend() {
        return this._shaderValues.getInt(PixelLineMaterial.BLEND);
    }
    /**
     * 设置混合源。
     * @param value 混合源
     */
    set blendSrc(value) {
        this._shaderValues.setInt(PixelLineMaterial.BLEND_SRC, value);
    }
    /**
     * 获取混合源。
     * @return 混合源。
     */
    get blendSrc() {
        return this._shaderValues.getInt(PixelLineMaterial.BLEND_SRC);
    }
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    set blendDst(value) {
        this._shaderValues.setInt(PixelLineMaterial.BLEND_DST, value);
    }
    /**
     * 获取混合目标。
     * @return 混合目标。
     */
    get blendDst() {
        return this._shaderValues.getInt(PixelLineMaterial.BLEND_DST);
    }
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    set depthTest(value) {
        this._shaderValues.setInt(PixelLineMaterial.DEPTH_TEST, value);
    }
    /**
     * 获取深度测试方式。
     * @return 深度测试方式。
     */
    get depthTest() {
        return this._shaderValues.getInt(PixelLineMaterial.DEPTH_TEST);
    }
    /**
 * 克隆。
 * @return	 克隆副本。
 */
    clone() {
        var dest = new PixelLineMaterial();
        this.cloneTo(dest);
        return dest;
    }
}
PixelLineMaterial.COLOR = Shader3D.propertyNameToID("u_Color");
/**@private */
PixelLineMaterial.shaderDefines = null;
PixelLineMaterial.CULL = Shader3D.propertyNameToID("s_Cull");
PixelLineMaterial.BLEND = Shader3D.propertyNameToID("s_Blend");
PixelLineMaterial.BLEND_SRC = Shader3D.propertyNameToID("s_BlendSrc");
PixelLineMaterial.BLEND_DST = Shader3D.propertyNameToID("s_BlendDst");
PixelLineMaterial.DEPTH_TEST = Shader3D.propertyNameToID("s_DepthTest");
PixelLineMaterial.DEPTH_WRITE = Shader3D.propertyNameToID("s_DepthWrite");
