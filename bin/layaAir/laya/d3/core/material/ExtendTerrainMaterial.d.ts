import { BaseTexture } from "laya/resource/BaseTexture";
import { Vector4 } from "../../math/Vector4";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { BaseMaterial } from "./BaseMaterial";
/**
 * ...
 * @author ...
 */
export declare class ExtendTerrainMaterial extends BaseMaterial {
    /**渲染状态_不透明。*/
    static RENDERMODE_OPAQUE: number;
    /**渲染状态_透明混合。*/
    static RENDERMODE_TRANSPARENT: number;
    /**渲染状态_透明混合。*/
    static SPLATALPHATEXTURE: number;
    static DIFFUSETEXTURE1: number;
    static DIFFUSETEXTURE2: number;
    static DIFFUSETEXTURE3: number;
    static DIFFUSETEXTURE4: number;
    static DIFFUSETEXTURE5: number;
    static DIFFUSESCALEOFFSET1: number;
    static DIFFUSESCALEOFFSET2: number;
    static DIFFUSESCALEOFFSET3: number;
    static DIFFUSESCALEOFFSET4: number;
    static DIFFUSESCALEOFFSET5: number;
    static CULL: number;
    static BLEND: number;
    static BLEND_SRC: number;
    static BLEND_DST: number;
    static DEPTH_TEST: number;
    static DEPTH_WRITE: number;
    /**地形细节宏定义。*/
    static SHADERDEFINE_DETAIL_NUM1: number;
    static SHADERDEFINE_DETAIL_NUM2: number;
    static SHADERDEFINE_DETAIL_NUM3: number;
    static SHADERDEFINE_DETAIL_NUM4: number;
    static SHADERDEFINE_DETAIL_NUM5: number;
    /**@private */
    static shaderDefines: ShaderDefines;
    /**
     * @private
     */
    static __initDefine__(): void;
    /**@private */
    private _enableLighting;
    /**
     * 获取splatAlpha贴图。
     * @return splatAlpha贴图。
     */
    /**
    * 设置splatAlpha贴图。
    * @param value splatAlpha贴图。
    */
    splatAlphaTexture: BaseTexture;
    /**
     * 设置第一层贴图。
     * @param value 第一层贴图。
     */
    diffuseTexture1: BaseTexture;
    /**
     * 获取第二层贴图。
     * @return 第二层贴图。
     */
    /**
    * 设置第二层贴图。
    * @param value 第二层贴图。
    */
    diffuseTexture2: BaseTexture;
    /**
     * 获取第三层贴图。
     * @return 第三层贴图。
     */
    /**
    * 设置第三层贴图。
    * @param value 第三层贴图。
    */
    diffuseTexture3: BaseTexture;
    /**
     * 获取第四层贴图。
     * @return 第四层贴图。
     */
    /**
    * 设置第四层贴图。
    * @param value 第四层贴图。
    */
    diffuseTexture4: BaseTexture;
    /**
     * 获取第五层贴图。
     * @return 第五层贴图。
     */
    /**
    * 设置第五层贴图。
    * @param value 第五层贴图。
    */
    diffuseTexture5: BaseTexture;
    private _setDetailNum;
    diffuseScaleOffset1: Vector4;
    diffuseScaleOffset2: Vector4;
    diffuseScaleOffset3: Vector4;
    diffuseScaleOffset4: Vector4;
    diffuseScaleOffset5: Vector4;
    /**
     * 获取是否启用光照。
     * @return 是否启用光照。
     */
    /**
    * 设置是否启用光照。
    * @param value 是否启用光照。
    */
    enableLighting: boolean;
    /**
     * 设置渲染模式。
     * @return 渲染模式。
     */
    renderMode: number;
    /**
     * 设置是否写入深度。
     * @param value 是否写入深度。
     */
    /**
    * 获取是否写入深度。
    * @return 是否写入深度。
    */
    depthWrite: boolean;
    /**
     * 设置剔除方式。
     * @param value 剔除方式。
     */
    /**
    * 获取剔除方式。
    * @return 剔除方式。
    */
    cull: number;
    /**
     * 设置混合方式。
     * @param value 混合方式。
     */
    /**
    * 获取混合方式。
    * @return 混合方式。
    */
    blend: number;
    /**
     * 设置混合源。
     * @param value 混合源
     */
    /**
    * 获取混合源。
    * @return 混合源。
    */
    blendSrc: number;
    /**
     * 设置混合目标。
     * @param value 混合目标
     */
    /**
    * 获取混合目标。
    * @return 混合目标。
    */
    blendDst: number;
    /**
     * 设置深度测试方式。
     * @param value 深度测试方式
     */
    /**
    * 获取深度测试方式。
    * @return 深度测试方式。
    */
    depthTest: number;
    constructor();
    /**
* 克隆。
* @return	 克隆副本。
*/
    clone(): any;
}
