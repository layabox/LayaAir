import { Scene3D } from "../scene/Scene3D";
import { LightSprite } from "./LightSprite";

/**
 * <code>PointLight</code> 类用于创建点光。
 */
export class PointLight extends LightSprite {
	/** @internal */
	private _range: number;

	/**
	 * 点光的范围。
	 * @return 点光的范围。
	 */
	get range(): number {
		return this._range;
	}

	set range(value: number) {
		this._range = value;
	}

	/**
	 * 创建一个 <code>PointLight</code> 实例。
	 */
	constructor() {
		super();
		this._range = 6.0;
	}


	/**
	 * @internal
	 * @override
	 */
	protected _addToLightQueue(): void {
		(<Scene3D>this._scene)._pointLights.add(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromLightQueue(): void {
		(<Scene3D>this._scene)._pointLights.remove(this);
	}


	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		this.range = data.range;
	}
}

