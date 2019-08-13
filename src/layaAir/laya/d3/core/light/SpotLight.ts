import { Vector3 } from "../../math/Vector3";
import { Scene3D } from "../scene/Scene3D";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite } from "./LightSprite";

/**
 * <code>SpotLight</code> 类用于创建聚光。
 */
export class SpotLight extends LightSprite {
	public _direction: Vector3;
	private _spotAngle: number;
	private _range: number;

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
		(<Scene3D>this._scene)._spotLights.push(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromScene(): void {
		var lights = (<Scene3D>this._scene)._spotLights;
		lights.splice(lights.indexOf(this), 1);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this.scene))._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT));
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onInActive(): void {
		super._onInActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this.scene))._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT));
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


