import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { ShaderData } from "../../shader/ShaderData";
import { Scene3D } from "../scene/Scene3D";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite } from "./LightSprite";
import { ILaya3D } from "../../../../ILaya3D";

/**
 * <code>PointLight</code> 类用于创建点光。
 */
export class PointLight extends LightSprite {
	private static _tempMatrix0: Matrix4x4 = new Matrix4x4();

	private _range: number;
	private _lightMatrix: Matrix4x4 = new Matrix4x4();

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
		(<Scene3D>this._scene)._pointLights.push(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromScene(): void {
		var lights = (<Scene3D>this._scene)._pointLights;
		lights.splice(lights.indexOf(this), 1);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onActive(): void {
		super._onActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this._scene))._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT));
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _onInActive(): void {
		super._onInActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this._scene))._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT));
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

