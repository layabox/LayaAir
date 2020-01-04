import { Config3D } from "../../../../Config3D";
import { Node } from "../../../display/Node";
import { Vector3 } from "../../math/Vector3";
import { ParallelSplitShadowMap } from "../../shadowMap/ParallelSplitShadowMap";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";

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
	_isAlternate: boolean = false;
	/** @internal */
	_intensityColor: Vector3;

	/** @internal */
	_intensity: number;
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
	 * 灯光强度。
	 */
	get intensity(): number {
		return this._intensity;
	}

	set intensity(value: number) {
		this._intensity = value;
	}

	/**
	 * 是否产生阴影。
	 */
	get shadow(): boolean {
		return this._shadow;
	}

	set shadow(value: boolean) {
		throw new Error("LightSprite: must override it.");
	}

	/**
	 * 阴影最远范围。
	 */
	get shadowDistance(): number {
		return this._shadowFarPlane;
	}

	set shadowDistance(value: number) {
		this._shadowFarPlane = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setFarDistance(value));
	}

	/**
	 * 阴影贴图尺寸。
	 */
	get shadowResolution(): number {
		return this._shadowMapSize;
	}

	set shadowResolution(value: number) {
		this._shadowMapSize = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setShadowMapTextureSize(value));
	}

	/**
	 * 阴影分段数。
	 */
	get shadowPSSMCount(): number {
		return this._shadowMapCount;
	}

	set shadowPSSMCount(value: number) {
		this._shadowMapCount = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.shadowMapCount = value);
	}

	/**
	 * 阴影PCF类型。
	 */
	get shadowPCFType(): number {
		return this._shadowMapPCFType;
	}

	set shadowPCFType(value: number) {
		this._shadowMapPCFType = value;
		(this._parallelSplitShadowMap) && (this._parallelSplitShadowMap.setPCFType(value));
	}

	/**
	 * 灯光烘培类型。
	 */
	get lightmapBakedType(): number {
		return this._lightmapBakedType;
	}

	set lightmapBakedType(value: number) {
		if (this._lightmapBakedType !== value) {
			this._lightmapBakedType = value;
			if (this.activeInHierarchy) {
				if (value !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED)
					this._addToScene();
				else
					this._removeFromScene();
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
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		var colorData: any[] = data.color;
		this.color.fromArray(colorData);
		this.intensity = data.intensity;
		this.lightmapBakedType = data.lightmapBakedType;
	}

	/**
	 * @internal
	 */
	private _addToScene(): void {
		var scene: Scene3D = <Scene3D>this._scene;
		var maxLightCount: number = Config3D._config.maxLightCount;
		if (scene._lightCount < maxLightCount) {
			scene._lightCount++;
			this._addToLightQueue();
			this._isAlternate = false;
		}
		else {
			scene._alternateLights.add(this);
			this._isAlternate = true;
			console.warn("LightSprite:light count has large than maxLightCount,the latest added light will be ignore.");
		}
	}

	/**
	 * @internal
	 */
	private _removeFromScene(): void {
		var scene: Scene3D = <Scene3D>this._scene;
		if (this._isAlternate) {
			scene._alternateLights.remove(this);
		}
		else {
			scene._lightCount--;
			this._removeFromLightQueue();
			if (scene._alternateLights._length > 0) {
				var alternateLight: LightSprite = scene._alternateLights.shift();
				alternateLight._addToLightQueue();
				alternateLight._isAlternate = false;
				scene._lightCount++;
			}
		}
	}

	/**
	 * @internal
	 */
	protected _addToLightQueue(): void {
	}

	/**
	 * @internal
	 */
	protected _removeFromLightQueue(): void {
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
		(this.lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._addToScene());
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onInActive(): void {
		super._onInActive();
		(this.lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (this._removeFromScene());
	}

	/**
	 * @internal
	 */
	protected _create(): Node {
		return new LightSprite();
	}

	/**
	 * 灯光的漫反射颜色。
	 * @return 灯光的漫反射颜色。
	 */
	get diffuseColor(): Vector3 {
		console.log("LightSprite: discard property,please use color property instead.");
		return this.color;
	}

	set diffuseColor(value: Vector3) {
		console.log("LightSprite: discard property,please use color property instead.");
		this.color = value;
	}
}

