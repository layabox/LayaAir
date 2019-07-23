import { Sprite3D } from "../Sprite3D"
import { Scene3D } from "../scene/Scene3D"
import { Vector3 } from "../../math/Vector3"
import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap"
import { Node } from "../../../display/Node"

/**
 * <code>LightSprite</code> 类用于创建灯光的父类。
 */
export class LightSprite extends Sprite3D {
	/** 灯光烘培类型-实时。*/
	static LIGHTMAPBAKEDTYPE_REALTIME: number = 0;
	/** 灯光烘培类型-混合。*/
	static LIGHTMAPBAKEDTYPE_MIXED: number = 1;
	/** 灯光烘培类型-烘焙。*/
	static LIGHTMAPBAKEDTYPE_BAKED: number = 2;

	/** @internal */
	protected _intensityColor: Vector3;

	/** @internal */
	protected _intensity: number;
	/** @internal */
	protected _shadow: boolean;
	/** @internal */
	protected _shadowFarPlane: number;
	/** @internal */
	protected _shadowMapSize: number;
	/** @internal */
	protected _shadowMapCount: number;
	/** @internal */
	protected _shadowMapPCFType: number;
	/** @internal */
	_parallelSplitShadowMap: ParallelSplitShadowMap;
	/** @internal */
	_lightmapBakedType: number;

	/** 灯光颜色。 */
	color: Vector3;

	/**
	 * 获取灯光强度。
	 * @return 灯光强度
	 */
	get intensity(): number {
		return this._intensity;
	}

	/**
	 * 设置灯光强度。
	 * @param value 灯光强度
	 */
	set intensity(value: number) {
		this._intensity = value;
	}

	/**
	 * 获取是否产生阴影。
	 * @return 是否产生阴影。
	 */
	get shadow(): boolean {
		return this._shadow;
	}

	/**
	 * 设置是否产生阴影。
	 * @param value 是否产生阴影。
	 */
	set shadow(value: boolean) {
		throw new Error("LightSprite: must override it.");

	}

	/**
	 * 获取阴影最远范围。
	 * @return 阴影最远范围。
	 */
	get shadowDistance(): number {
		return this._shadowFarPlane;
	}

	/**
	 * 设置阴影最远范围。
	 * @param value 阴影最远范围。
	 */
	set shadowDistance(value: number) {
		this._shadowFarPlane = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setFarDistance(value));
	}

	/**
	 * 获取阴影贴图尺寸。
	 * @return 阴影贴图尺寸。
	 */
	get shadowResolution(): number {
		return this._shadowMapSize;
	}

	/**
	 * 设置阴影贴图尺寸。
	 * @param value 阴影贴图尺寸。
	 */
	set shadowResolution(value: number) {
		this._shadowMapSize = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setShadowMapTextureSize(value));
	}

	/**
	 * 获取阴影分段数。
	 * @return 阴影分段数。
	 */
	get shadowPSSMCount(): number {
		return this._shadowMapCount;
	}

	/**
	 * 设置阴影分段数。
	 * @param value 阴影分段数。
	 */
	set shadowPSSMCount(value: number) {
		this._shadowMapCount = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.shadowMapCount = value);
	}

	/**
	 * 获取阴影PCF类型。
	 * @return PCF类型。
	 */
	get shadowPCFType(): number {
		return this._shadowMapPCFType;
	}

	/**
	 * 设置阴影PCF类型。
	 * @param value PCF类型。
	 */
	set shadowPCFType(value: number) {
		this._shadowMapPCFType = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setPCFType(value));
	}

	/**
	 * 获取灯光烘培类型。
	 */
	get lightmapBakedType(): number {
		return this._lightmapBakedType;
	}

	/**
	 * 设置灯光烘培类型。
	 */
	set lightmapBakedType(value: number) {
		if (this._lightmapBakedType !== value) {
			this._lightmapBakedType = value;
			if (this.activeInHierarchy) {
				if (value !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED)
					((<Scene3D>this._scene))._addLight(this);
				else
					((<Scene3D>this._scene))._removeLight(this);
			}
		}
	}

	/**
	 * 创建一个 <code>LightSprite</code> 实例。
	 */
	constructor() {
		super();
		this._intensity = 1.0;
		this._intensityColor = new Vector3();
		this.color = new Vector3(1.0, 1.0, 1.0);
		this._shadow = false;
		this._shadowFarPlane = 8;
		this._shadowMapSize = 512;
		this._shadowMapCount = 1;
		this._shadowMapPCFType = 0;
		this._lightmapBakedType = LightSprite.LIGHTMAPBAKEDTYPE_REALTIME;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		var colorData: any[] = data.color;
		this.color.fromArray(colorData);
		this.intensity = data.intensity;
		this.lightmapBakedType = data.lightmapBakedType;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
		(this.lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this._scene))._addLight(this));
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onInActive(): void {
		super._onInActive();
		(this.lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this._scene))._removeLight(this));
	}

	/**
	 * 更新灯光相关渲染状态参数。
	 * @param state 渲染状态参数。
	 */
	_prepareToScene(): boolean {
		return false;
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new LightSprite();
	}

	/**
	 * 获取灯光的漫反射颜色。
	 * @return 灯光的漫反射颜色。
	 */
	get diffuseColor(): Vector3 {
		console.log("LightSprite: discard property,please use color property instead.");
		return this.color;
	}

	/**
	 * 设置灯光的漫反射颜色。
	 * @param value 灯光的漫反射颜色。
	 */
	set diffuseColor(value: Vector3) {
		console.log("LightSprite: discard property,please use color property instead.");
		this.color = value;
	}
}

