import { Vector3 } from "../../math/Vector3";
import { Scene3D } from "../scene/Scene3D";
import { LightSprite, LightType } from "./LightSprite";
import { ShadowCascadesMode } from "./ShadowCascadesMode";

/**
 * <code>DirectionLight</code> 类用于创建平行光。
 */
export class DirectionLight extends LightSprite {
	/**@iternal */
	_direction: Vector3 = new Vector3();
	/** @internal */
	_shadowCascadesMode: ShadowCascadesMode = ShadowCascadesMode.NoCascades;
	/** @internal */
	_shadowTwoCascadeSplits: number = 1.0 / 3.0;
	/** @internal */
	_shadowFourCascadeSplits: Vector3 = new Vector3(1.0 / 15, 2.0 / 15.0, 4.0 / 15.0);

	/**
	 * 阴影级联数量。
	 */
	get shadowCascadesMode(): ShadowCascadesMode {
		return this._shadowCascadesMode;
	}

	set shadowCascadesMode(value: ShadowCascadesMode) {
		this._shadowCascadesMode = value;
	}

	/**
	 * 二级级联阴影分割比例。
	 */
	get shadowTwoCascadeSplits(): number {
		return this._shadowTwoCascadeSplits;
	}

	set shadowTwoCascadeSplits(value: number) {
		this._shadowTwoCascadeSplits = value;
	}

	/**
	 * 四级级联阴影分割比例。
	 */
	get shadowFourCascadeSplits(): Vector3 {
		return this._shadowFourCascadeSplits;
	}

	set shadowFourCascadeSplits(value: Vector3) {
		value.cloneTo(this._shadowFourCascadeSplits);
	}

	/**
	 * 创建一个 <code>DirectionLight</code> 实例。
	 */
	constructor() {
		super();
		this._lightType = LightType.Directional;
	}

	/**
	 * @internal
	 * @override
	 */
	protected _addToLightQueue(): void {
		(<Scene3D>this._scene)._directionLights.add(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromLightQueue(): void {
		(<Scene3D>this._scene)._directionLights.remove(this);
	}
}

