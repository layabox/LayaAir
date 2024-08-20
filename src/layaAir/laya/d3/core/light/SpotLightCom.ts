import { Scene3D } from "../scene/Scene3D";
import { Light, LightType } from "./Light";
import { Component } from "../../../components/Component";
import { Vector3 } from "../../../maths/Vector3";

import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { ISpotLightData } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";

/**
 * @en The `SpotLightCom` class is used to create a spotlight.
 * @zh `SpotLightCom` 类用于创建聚光。
 */
export class SpotLightCom extends Light {

	/**
	 * @en Declares the data module for the spotlight.
	 * @zh 声明聚光灯的数据模块。
	 */
	declare _dataModule: ISpotLightData;

	/** @internal */
	private _direction: Vector3;

	/**
	 * @en The direction of the spotlight.
	 * @zh 聚光的方向。
	 */
	get direction(): Vector3 {
		return this._direction;
	}

	set direction(value: Vector3) {
		value.cloneTo(this.direction);
		this._dataModule.setDirection(this._direction);
	};


    /**
     * @en The cone angle of the spotlight.
     * @zh 聚光灯的锥形角度。
     */
	get spotAngle(): number {
		return this._dataModule.spotAngle;
	}

	set spotAngle(value: number) {
		this._dataModule.spotAngle = Math.max(Math.min(value, 179), 0);
	}

    /**
     * @en The range of the spotlight.
     * @zh 聚光灯的范围。
     */
	get range(): number {
		return this._dataModule.spotRange;
	}

	set range(value: number) {
		this._dataModule.spotRange = value;
	}

	/**
	 * @ignore
	 * @en Creats an instance of SpotLightCom.
	 * @zh 创建一个 SpotLightCom 的实例。
	 */
	constructor() {
		super();
		this.spotAngle = 30.0;
		this.range = 10.0;
		this._direction = new Vector3();
		this._lightType = LightType.Spot;
	}

	protected _creatModuleData() {
		this._dataModule = Laya3DRender.Render3DModuleDataFactory.createSpotLight();
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


