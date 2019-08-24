import { Scene3D } from "../scene/Scene3D";
import { LightSprite } from "./LightSprite";

/**
 * <code>PointLight</code> 类用于创建点光。
 */
export class PointLight extends LightSprite {
	/** @internal */
	private _range: number;

	/**
	 * 获取点光的范围。
	 * @return 点光的范围。
	 */
	get range(): number {
		return this._range;
	}

	/**
	 * 设置点光的范围。
	 * @param  value 点光的范围。
	 */
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
	protected _addToScene(): void {
		(<Scene3D>this._scene)._pointLights.add(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromScene(): void {
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

