import { Scene3D } from "../scene/Scene3D";
import { Light, LightType } from "./Light";
import { Component } from "../../../components/Component";
import { Vector3 } from "../../../maths/Vector3";
import { ISpotLightData } from "../../RenderDriverLayer/RenderModuleData/ISpotLightData";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";

/**
 * <code>SpotLight</code> 类用于创建聚光。
 */
export class SpotLightCom extends Light {
	/**@internal */
	protected _dataModule: ISpotLightData;

	/** @internal */
	private _direction: Vector3;

	/**
	 * 直射光方向
	 */
	set direction(value: Vector3) {
		value.cloneTo(this.direction);
		this._dataModule.setDirection(this._direction);
	};

	get direction(): Vector3 {
		return this._direction;
	}

	/**
	  * 聚光灯的锥形角度。
	  */
	get spotAngle(): number {
		return this._dataModule.spotAngle;
	}

	set spotAngle(value: number) {
		this._dataModule.spotAngle = Math.max(Math.min(value, 179), 0);
	}

	/**
	 * 聚光的范围。
	 */
	get range(): number {
		return this._dataModule.spotRange;
	}

	set range(value: number) {
		this._dataModule.spotRange = value;
	}

	/**
	 * 创建一个 <code>SpotLight</code> 实例。
	 */
	constructor() {
		super();
		this.spotAngle = 30.0;
		this.range = 10.0;
		this._direction = new Vector3();
		this._lightType = LightType.Spot;
	}

	protected _creatModuleData() {
		this._dataModule = Laya3DRender.renderOBJCreate.createSpotLight();
	}

	/**
	 * @internal
	 * @override
	 */
	protected _addToLightQueue(): void {
		(<Scene3D>this.owner.scene)._spotLights.add(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromLightQueue(): void {
		(<Scene3D>this.owner.scene)._spotLights.remove(this);
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
	_cloneTo(dest: Component): void {
		super._cloneTo(dest);
		var spotLight = <SpotLightCom>dest;
		spotLight.range = this.range;
		spotLight.spotAngle = this.spotAngle;
	}


	/**
	 * @internal
	 */
	protected _create(): Component {
		return new SpotLightCom();
	}

}


