import { Vector3 } from "../../math/Vector3";
import { ShaderData } from "../../shader/ShaderData";
import { Scene3D } from "../scene/Scene3D";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite, LightType } from "./LightSprite";
import { ShadowCascadesMode } from "./ShadowCascadesMode";
import { ShadowMode } from "./ShadowMode";

/**
 * <code>DirectionLight</code> 类用于创建平行光。
 */
export class DirectionLight extends LightSprite {
	/**@iternal */
	_direction: Vector3 = new Vector3();
	/** @internal */
	_shadowCascadesMode: ShadowCascadesMode;
	/** @internal */
	_shadowTwoCascadeSplits: number = 1.0 / 3.0;
	/** @internal */
	_shadowFourCascadeSplits: Vector3 = new Vector3(1.0 / 15, 2.0 / 15.0, 4.0 / 15.0);

	/**
	* @inheritDoc
	* @override
	*/
	get shadowMode(): ShadowMode {
		return this._shadowMode;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	set shadowMode(value: ShadowMode) {
		if (this._shadowMode !== value) {
			this._shadowMode = value;
			(this.scene) && (this._initShadow());
		}
	}

	/**
	 * 阴影级联数量。
	 */
	get shadowCascadesMode(): ShadowCascadesMode {
		return this._shadowCascadesMode;
	}

	set shadowCascadesMode(value: ShadowCascadesMode) {
		this._shadowCascadesMode = value;
		Scene3D._shadowCasterPass.shadowMapCount = value;
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
	 */
	private _initShadow(): void {
		if (this._shadowMode !== ShadowMode.None) {
			this.transform.worldMatrix.getForward(this._direction);
			Vector3.normalize(this._direction, this._direction);
			Scene3D._shadowCasterPass.setInfo(this.scene, this._shadowDistance, this._direction, this._shadowResolution, this._shadowCascadesMode, this._shadowMode);//TODO:
			Scene3D._shadowCasterPass._light = this;
		} else {
			var defineDatas: ShaderData = (<Scene3D>this._scene)._shaderValues;
			Scene3D._shadowCasterPass = null;
			defineDatas.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1);
			defineDatas.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2);
			defineDatas.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3);
		}
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

