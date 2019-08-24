import { Vector3 } from "../../math/Vector3";
import { Scene3D } from "../scene/Scene3D";
import { LightSprite } from "./LightSprite";

/**
 * <code>SpotLight</code> 类用于创建聚光。
 */
export class SpotLight extends LightSprite {
	/** @internal */
	private _spotAngle: number;
	/** @internal */
	private _range: number;

	/** @internal */
	public _direction: Vector3;

	/**
 	* 获取聚光灯的锥形角度。
 	* @return 聚光灯的锥形角度。
 	*/
	get spotAngle(): number {
		return this._spotAngle;
	}

	/**
	 * 设置聚光灯的锥形角度。
	 * @param value 聚光灯的锥形角度。
	 */
	set spotAngle(value: number) {
		this._spotAngle = Math.max(Math.min(value, 180), 0);
	}

	/**
	 * 获取聚光的范围。
	 * @return 聚光的范围值。
	 */
	get range(): number {
		return this._range;
	}

	/**
	 * 设置聚光的范围。
	 * @param value 聚光的范围值。
	 */
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
	}

	/**
	 * @internal
	 * @override
	 */
	protected _addToScene(): void {
		(<Scene3D>this._scene)._spotLights.add(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromScene(): void {
		(<Scene3D>this._scene)._spotLights.remove(this);
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
}


