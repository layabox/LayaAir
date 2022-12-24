import { Scene3D } from "../scene/Scene3D";
import { Light, LightType } from "./Light";
import { Component } from "../../../components/Component";
import { Vector3 } from "../../../maths/Vector3";

/**
 * <code>SpotLight</code> 类用于创建聚光。
 */
export class SpotLightCom extends Light {
	/** @internal */
	private _spotAngle: number;
	/** @internal */
	private _range: number;

	/** @internal */
	public _direction: Vector3;

	/**
	  * 聚光灯的锥形角度。
	  */
	get spotAngle(): number {
		return this._spotAngle;
	}

	set spotAngle(value: number) {
		this._spotAngle = Math.max(Math.min(value, 179), 0);
	}

	/**
	 * 聚光的范围。
	 */
	get range(): number {
		return this._range;
	}

	set range(value: number) {
		this._range = value;
	}

	/**
	 * 创建一个 <code>SpotLight</code> 实例。
	 */
	constructor() {
		super();
		this._spotAngle = 30.0;
		this._range = 10.0;
		this._direction = new Vector3();
		this._lightType = LightType.Spot;
	}

	/**
	 * @internal
	 * @override
	 */
	protected _addToLightQueue(): void {
		(<Scene3D>this.owner.scene)._spotLights.add(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromLightQueue(): void {
		(<Scene3D>this.owner.scene)._spotLights.remove(this);
	}


	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		this.range = data.range;
		this.spotAngle = data.spotAngle;
	}
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(dest: Component): void {
		super._cloneTo(dest);
		var spotLight = <SpotLightCom>dest;
		spotLight.range = this.range;
		spotLight.spotAngle = this.spotAngle;
	}


	/**
	 * @internal
	 */
	protected _create(): Component {
		return new SpotLightCom();
	}

}


