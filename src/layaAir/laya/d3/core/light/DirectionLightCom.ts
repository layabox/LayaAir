import { Scene3D } from "../scene/Scene3D";
import { ShadowCascadesMode } from "./ShadowCascadesMode";
import { Light, LightType } from "./Light";
import { Vector3 } from "../../../maths/Vector3";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { IDirectLightData } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";


/**
 * @en DirectionLight used to create parallel light.
 * @zh DirectionLight 类用于创建方向光。
 */
export class DirectionLightCom extends Light {
	/**@internal */
	_dataModule: IDirectLightData;
	/** @internal */
	private _direction: Vector3 = new Vector3();


	/** @internal */
	_shadowTwoCascadeSplits: number = 1.0 / 3.0;
	/** @internal */
	_shadowFourCascadeSplits: Vector3 = new Vector3();

    /**
     * @en The direction of the directional light.
     * @zh 方向光的方向。
     */
	get direction(): Vector3 {
		return this._direction;
	}

	set direction(value: Vector3) {
		value.cloneTo(this.direction);
		this._dataModule.setDirection(this._direction);
	};

    /**
     * @en The number of shadow cascades.
     * @zh 阴影级联数量。
     */
	get shadowCascadesMode(): ShadowCascadesMode {
		return this._dataModule.shadowCascadesMode;
	}

	set shadowCascadesMode(value: ShadowCascadesMode) {
		this._dataModule.shadowCascadesMode = value;
	}

    /**
     * @en The split ratio for two cascade shadows.
     * @zh 二级级联阴影分割比例。
     */
	get shadowTwoCascadeSplits(): number {
		return this._dataModule.shadowTwoCascadeSplits;
	}

	set shadowTwoCascadeSplits(value: number) {
		this._dataModule.shadowTwoCascadeSplits = value;
	}

    /**
     * @en The split ratios for four cascade shadows. X, Y, Z represent the split ratios in order. Z must be greater than Y, and Y must be greater than X.
     * @zh 四级级联阴影分割比例。X、Y、Z依次为其分割比例，Z必须大于Y，Y必须大于X。
     */
	get shadowFourCascadeSplits(): Vector3 {
		return this._shadowFourCascadeSplits;
	}

	set shadowFourCascadeSplits(value: Vector3) {
		if (value.x > value.y || value.y > value.z || value.z > 1.0)
			throw "DiretionLight:Invalid value.";
		value.cloneTo(this._shadowFourCascadeSplits);
		this._dataModule.setShadowFourCascadeSplits(this._shadowFourCascadeSplits);
	}

	/**
	 * @ignore
	 * @en Creates an instance of DirectionLight.
	 * @zh 创建一个 DirectionLight 的实例。
	 */
	constructor() {
		super();
		this._lightType = LightType.Directional;
		this.shadowCascadesMode = ShadowCascadesMode.NoCascades;
		this.shadowFourCascadeSplits = new Vector3(1.0 / 15, 3.0 / 15.0, 7.0 / 15.0);
		this.shadowTwoCascadeSplits = 1.0 / 3.0;
	}

	protected _creatModuleData() {
		this._dataModule = Laya3DRender.Render3DModuleDataFactory.createDirectLight();
	}

	/**
	 * @internal
	 * @override
	 */
	protected _addToLightQueue(): void {
		(<Scene3D>this.owner.scene)._directionLights.add(this);
	}

	/**
	 * @internal
	 * @override
	 */
	protected _removeFromLightQueue(): void {
		(<Scene3D>this.owner.scene)._directionLights.remove(this);
	}
}

