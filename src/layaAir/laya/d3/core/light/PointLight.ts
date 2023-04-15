import { Node } from "../../../display/Node"
import { PointLightCom } from "./PointLightCom";
import { LightSprite } from "./LightSprite";
import { Sprite3D } from "../Sprite3D";
/**
 * @deprecated
 * <code>PointLight</code> 类用于创建点光。
 */
export class PointLight extends LightSprite {

	/**@internal */
	_light: PointLightCom;

	/**
	 * 点光的范围。
	 * @return 点光的范围。
	 */
	get range(): number {
		return this._light.range;
	}

	set range(value: number) {
		this._light.range = value;
	}

	/**
	 * 创建一个 <code>PointLight</code> 实例。
	 */
	constructor() {
		super();
		this._light = this.addComponent(PointLightCom);
		this._light.range = 6.0;
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

