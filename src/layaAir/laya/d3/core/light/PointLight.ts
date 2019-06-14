import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { ShaderData } from "../../shader/ShaderData";
import { Scene3D } from "../scene/Scene3D";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite } from "././LightSprite";
import { ILaya3D } from "../../../../ILaya3D";

/**
 * <code>PointLight</code> 类用于创建点光。
 */
export class PointLight extends LightSprite {
	/** @private */
	private static _tempMatrix0: Matrix4x4 = new Matrix4x4();

	/** @private */
	private _range: number;
	/** @private */
	private _lightMatrix: Matrix4x4 = new Matrix4x4();

	/**
	 * 创建一个 <code>PointLight</code> 实例。
	 */
	constructor() {
		super();
		this._range = 6.0;
	}

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
		 * @inheritDoc
		 */
		/*override*/ protected _onActive(): void {
		super._onActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this._scene))._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT));
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _onInActive(): void {
		super._onInActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this._scene))._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT));
	}

		/**
		 * 更新点光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 */
		 /*override*/ _prepareToScene(): boolean {
		var scene: Scene3D = (<Scene3D>this._scene);
		if (scene.enableLight && this.activeInHierarchy) {
			var shaderValue: ShaderData = scene._shaderValues;
			Vector3.scale(this.color, this._intensity, this._intensityColor);
			shaderValue.setVector3(ILaya3D.Scene3D.POINTLIGHTCOLOR, this._intensityColor);
			shaderValue.setVector3(ILaya3D.Scene3D.POINTLIGHTPOS, this.transform.position);
			shaderValue.setNumber(ILaya3D.Scene3D.POINTLIGHTRANGE, this.range);

			var lightMatrix: Matrix4x4 = this._lightMatrix;
			var lightMatrixE: Float32Array = lightMatrix.elements;
			lightMatrix.identity();
			lightMatrixE[0] = lightMatrixE[5] = lightMatrixE[10] = 1.0 / this._range;
			var toLightMatrix: Matrix4x4 = PointLight._tempMatrix0;
			this.transform.worldMatrix.invert(toLightMatrix);
			Matrix4x4.multiply(lightMatrix, toLightMatrix, lightMatrix);
			shaderValue.setMatrix4x4(ILaya3D.Scene3D.POINTLIGHTMATRIX, lightMatrix);
			return true;
		} else {
			return false;
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _parse(data: any, spriteMap: any): void {
		super._parse(data, spriteMap);
		this.range = data.range;
	}
}

