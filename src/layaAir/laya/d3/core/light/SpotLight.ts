import { Node } from "../../../display/Node";
import { Sprite3D } from "../Sprite3D";
import { LightSprite } from "./LightSprite";
import { SpotLightCom } from "./SpotLightCom";

/**
 * @deprecated
 * <code>SpotLight</code> 类用于创建聚光。
 */
export class SpotLight extends LightSprite {
	/**@internal */
	_light: SpotLightCom;

	/**
	  * 聚光灯的锥形角度。
	  */
	get spotAngle(): number {
		return this._light.spotAngle;
	}

	set spotAngle(value: number) {
		this._light.spotAngle = Math.max(Math.min(value, 179), 0);
	}

	/**
	 * 聚光的范围。
	 */
	get range(): number {
		return this._light.range;
	}

	set range(value: number) {
		this._light.range = value;
	}

	/**
	 * 创建一个 <code>SpotLight</code> 实例。
	 */
	constructor() {
		super();
		this._light = this.addComponent(SpotLightCom);
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
	_cloneTo(destObject: any, rootSprite: Node, dstSprite: Node) {
		super._cloneTo(destObject, rootSprite, dstSprite);
	}


	/**
	 * @internal
	 */
	protected _create(): Node {
		return new Sprite3D();
	}

}


