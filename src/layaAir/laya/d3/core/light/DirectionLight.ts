import { ShadowCascadesMode } from "./ShadowCascadesMode";
import { Node } from "../../../display/Node";
import { DirectionLightCom } from "./DirectionLightCom";
import { LightSprite } from "./LightSprite";
import { Sprite3D } from "../Sprite3D";
import { Vector3 } from "../../../maths/Vector3";

/**
 * <code>DirectionLight</code> 类用于创建平行光。
 */
export class DirectionLight extends LightSprite {

	/** @internal */
	_light: DirectionLightCom;

	/**
	 * 阴影级联数量。
	 */
	get shadowCascadesMode(): ShadowCascadesMode {
		return this._light._shadowCascadesMode;
	}

	set shadowCascadesMode(value: ShadowCascadesMode) {
		this._light._shadowCascadesMode = value;
	}

	/**
	 * 二级级联阴影分割比例。
	 */
	get shadowTwoCascadeSplits(): number {
		return this._light._shadowTwoCascadeSplits;
	}

	set shadowTwoCascadeSplits(value: number) {
		this._light._shadowTwoCascadeSplits = value;
	}

	/**
	 * 四级级联阴影分割比例,X、Y、Z依次为其分割比例,Z必须大于Y,Y必须大于X。
	 */
	get shadowFourCascadeSplits(): Vector3 {
		return this._light._shadowFourCascadeSplits;
	}

	set shadowFourCascadeSplits(value: Vector3) {
		if (value.x > value.y || value.y > value.z || value.z > 1.0)
			throw "DiretionLight:Invalid value.";
		value.cloneTo(this._light._shadowFourCascadeSplits);
	}

	/**
	 * 创建一个 <code>DirectionLight</code> 实例。
	 */
	constructor() {
		super();
		this._light = this.addComponent(DirectionLightCom);
	}


	/**
	 * @internal
	 */
	protected _create(): Node {
		return new Sprite3D();
	}
}

