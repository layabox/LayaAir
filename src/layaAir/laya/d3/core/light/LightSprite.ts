import { Config3D } from "../../../../Config3D";
import { Node } from "../../../display/Node";
import { Vector3 } from "../../math/Vector3";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { ShadowMode } from "./ShadowMode";
import { Matrix4x4 } from "../../math/Matrix4x4";

/**
 * @internal
 */
export enum LightType {
	Directional,
	Spot,
	Point
}

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
	protected _shadowMode: ShadowMode = ShadowMode.None;

	/** @internal */
	_isAlternate: boolean = false;
	/** @internal */
	_intensityColor: Vector3;
	/** @internal */
	_intensity: number;
	/** @internal */
	_shadowResolution: number = 2048;
	/** @internal */
	_shadowDistance: number = 50.0;
	/** @internal */
	_shadowDepthBias: number = 1.0;
	/** @internal */
	_shadowNormalBias: number = 1.0;
	/** @internal */
	_shadowNearPlane: number = 0.1;
	/** @internal */
	_shadowStrength: number = 1.0;
	/** @internal */
	_lightmapBakedType: number;
	/** @internal */
	_lightType: LightType;
	/** @internal 因为scale会影响裁剪阴影*/
	_lightWoldMatrix:Matrix4x4 = new Matrix4x4();

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
	 * 阴影模式。
	 */
	get shadowMode(): ShadowMode {
		return this._shadowMode;
	}

	set shadowMode(value: ShadowMode) {
		this._shadowMode = value
	}

	/**
	 * 最大阴影距离。
	 */
	get shadowDistance(): number {
		return this._shadowDistance;
	}

	set shadowDistance(value: number) {
		this._shadowDistance = value;
	}

	/**
	 * 阴影贴图分辨率。
	 */
	get shadowResolution(): number {
		return this._shadowResolution;
	}

	set shadowResolution(value: number) {
		this._shadowResolution = value;
	}

	/**
	 * 阴影深度偏差。
	 */
	get shadowDepthBias(): number {
		return this._shadowDepthBias;
	}

	set shadowDepthBias(value: number) {
		this._shadowDepthBias = value;
	}

	/**
	 * 阴影法线偏差。
	 */
	get shadowNormalBias(): number {
		return this._shadowNormalBias;
	}

	set shadowNormalBias(value: number) {
		this._shadowNormalBias = value;
	}

	/**
	 * 阴影强度。
	 */
	get shadowStrength(): number {
		return this._shadowStrength;
	}

	set shadowStrength(value: number) {
		this._shadowStrength = value;
	}

	/**
	 * 阴影视锥的近裁面。
	 */
	get shadowNearPlane(): number {
		return this._shadowNearPlane;
	}

	set shadowNearPlane(value: number) {
		this._shadowNearPlane = value;
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

	get lightWorldMatrix():Matrix4x4{
		var position = this.transform.position;
		var quaterian = this.transform.rotation;
		Matrix4x4.createAffineTransformation(position,quaterian,Vector3._ONE,this._lightWoldMatrix);
		return this._lightWoldMatrix;
	}

	/**
	 * 创建一个 <code>LightSprite</code> 实例。
	 */
	constructor() {
		super();
		this._intensity = 1.0;
		this._intensityColor = new Vector3();
		this.color = new Vector3(1.0, 1.0, 1.0);
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
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(destObject: any, rootSprite: Node, dstSprite: Node){
		super._cloneTo(destObject, rootSprite, dstSprite);
		var spriteLight = <LightSprite>destObject;
		spriteLight.color = this.color.clone();
		spriteLight.intensity = this.intensity;
		spriteLight.lightmapBakedType = this.lightmapBakedType;
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
				var alternateLight = scene._alternateLights.shift();
				alternateLight!._addToLightQueue();
				alternateLight!._isAlternate = false;
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
	 * @deprecated
	 * please use color property instead.
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

