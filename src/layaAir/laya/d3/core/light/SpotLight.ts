import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { ShaderData } from "../../shader/ShaderData";
import { Scene3D } from "../scene/Scene3D";
import { Scene3DShaderDeclaration } from "../scene/Scene3DShaderDeclaration";
import { LightSprite } from "././LightSprite";
import { ILaya3D } from "../../../../ILaya3D";

/**
 * <code>SpotLight</code> 类用于创建聚光。
 */
export class SpotLight extends LightSprite {
	/** @private */
	private static _tempMatrix0: Matrix4x4 = new Matrix4x4();
	/** @private */
	private static _tempMatrix1: Matrix4x4 = new Matrix4x4();

	/** @private */
	private _direction: Vector3;
	/** @private */
	private _spotAngle: number;
	/** @private */
	private _range: number;

	/** @private */
	//private var _tempMatrix:Matrix4x4 = new Matrix4x4();

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
		 * @inheritDoc
		 */
		/*override*/ protected _onActive(): void {
		super._onActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this.scene))._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT));
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _onInActive(): void {
		super._onInActive();
		(this._lightmapBakedType !== LightSprite.LIGHTMAPBAKEDTYPE_BAKED) && (((<Scene3D>this.scene))._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT));
	}

		/**
		 * 更新聚光相关渲染状态参数。
		 * @param state 渲染状态参数。
		 */
		 /*override*/ _prepareToScene(): boolean {
		var scene: Scene3D = (<Scene3D>this._scene);
		if (scene.enableLight && this.activeInHierarchy) {
			var shaderValue: ShaderData = scene._shaderValues;
			Vector3.scale(this.color, this._intensity, this._intensityColor);
			shaderValue.setVector3(ILaya3D.Scene3D.SPOTLIGHTCOLOR, this._intensityColor);
			shaderValue.setVector3(ILaya3D.Scene3D.SPOTLIGHTPOS, this.transform.position);
			this.transform.worldMatrix.getForward(this._direction);
			Vector3.normalize(this._direction, this._direction);
			shaderValue.setVector3(ILaya3D.Scene3D.SPOTLIGHTDIRECTION, this._direction);
			shaderValue.setNumber(ILaya3D.Scene3D.SPOTLIGHTRANGE, this.range);
			shaderValue.setNumber(ILaya3D.Scene3D.SPOTLIGHTSPOTANGLE, this.spotAngle * Math.PI / 180);

			//----------------------------------To do SpotLight Attenuate----------------------------------
			//var tempMatrix:Matrix4x4 = _tempMatrix0;
			//var tempMatrixE:Float32Array = tempMatrix.elements;
			//tempMatrix.identity();
			//var halfRad:Number = (spotAngle / 2) * Math.PI / 180;
			//var cotanHalfSpotAngle:Number = 1 / Math.tan(halfRad);
			//tempMatrixE[14] = 2.0 / cotanHalfSpotAngle;
			//tempMatrixE[15] = 0.0;
			//
			//var lightMatrix:Matrix4x4 = _lightMatrix;
			//var lightMatrixE:Float32Array = lightMatrix.elements;
			//lightMatrix.identity();
			//lightMatrixE[0] = lightMatrixE[5] = lightMatrixE[10] = 1.0 / _range;
			//Matrix4x4.multiply(lightMatrix, tempMatrix, lightMatrix);
			//
			//var toLightMatrix:Matrix4x4 = _tempMatrix1;
			//transform.worldMatrix.invert(toLightMatrix);
			//Matrix4x4.multiply(lightMatrix, toLightMatrix, lightMatrix);
			//shaderValue.setMatrix4x4(Scene3D.SPOTLIGHTMATRIX, lightMatrix);
			//----------------------------------To do SpotLight Attenuate----------------------------------

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
		this.spotAngle = data.spotAngle;
	}
}


