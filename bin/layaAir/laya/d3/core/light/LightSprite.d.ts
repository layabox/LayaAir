import { Sprite3D } from "../Sprite3D";
import { Vector3 } from "../../math/Vector3";
import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap";
import { Node } from "laya/display/Node";
/**
 * <code>LightSprite</code> 类用于创建灯光的父类。
 */
export declare class LightSprite extends Sprite3D {
    /** 灯光烘培类型-实时。*/
    static LIGHTMAPBAKEDTYPE_REALTIME: number;
    /** 灯光烘培类型-混合。*/
    static LIGHTMAPBAKEDTYPE_MIXED: number;
    /** 灯光烘培类型-烘焙。*/
    static LIGHTMAPBAKEDTYPE_BAKED: number;
    /** @private */
    protected _intensityColor: Vector3;
    /** @private */
    protected _intensity: number;
    /** @private */
    protected _shadow: boolean;
    /** @private */
    protected _shadowFarPlane: number;
    /** @private */
    protected _shadowMapSize: number;
    /** @private */
    protected _shadowMapCount: number;
    /** @private */
    protected _shadowMapPCFType: number;
    /** @private */
    _parallelSplitShadowMap: ParallelSplitShadowMap;
    /** @private */
    _lightmapBakedType: number;
    /** 灯光颜色。 */
    color: Vector3;
    /**
     * 获取灯光强度。
     * @return 灯光强度
     */
    /**
    * 设置灯光强度。
    * @param value 灯光强度
    */
    intensity: number;
    /**
     * 获取是否产生阴影。
     * @return 是否产生阴影。
     */
    /**
    * 设置是否产生阴影。
    * @param value 是否产生阴影。
    */
    shadow: boolean;
    /**
     * 获取阴影最远范围。
     * @return 阴影最远范围。
     */
    /**
    * 设置阴影最远范围。
    * @param value 阴影最远范围。
    */
    shadowDistance: number;
    /**
     * 获取阴影贴图尺寸。
     * @return 阴影贴图尺寸。
     */
    /**
    * 设置阴影贴图尺寸。
    * @param value 阴影贴图尺寸。
    */
    shadowResolution: number;
    /**
     * 获取阴影分段数。
     * @return 阴影分段数。
     */
    /**
    * 设置阴影分段数。
    * @param value 阴影分段数。
    */
    shadowPSSMCount: number;
    /**
     * 获取阴影PCF类型。
     * @return PCF类型。
     */
    /**
    * 设置阴影PCF类型。
    * @param value PCF类型。
    */
    shadowPCFType: number;
    /**
     * 获取灯光烘培类型。
     */
    /**
    * 设置灯光烘培类型。
    */
    lightmapBakedType: number;
    /**
     * 创建一个 <code>LightSprite</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    _parse(data: any, spriteMap: any): void;
    /**
     * @inheritDoc
     */
    protected _onActive(): void;
    /**
     * @inheritDoc
     */
    protected _onInActive(): void;
    /**
     * 更新灯光相关渲染状态参数。
     * @param state 渲染状态参数。
     */
    _prepareToScene(): boolean;
    /**
     * @private
     */
    protected _create(): Node;
    /**
     * 获取灯光的漫反射颜色。
     * @return 灯光的漫反射颜色。
     */
    /**
    * 设置灯光的漫反射颜色。
    * @param value 灯光的漫反射颜色。
    */
    diffuseColor: Vector3;
}
