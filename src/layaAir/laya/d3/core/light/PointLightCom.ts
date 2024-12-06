import { IPointLightData } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { Component } from "../../../components/Component";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { Light, LightType } from "./Light";


/**
 * @en The `PointLightCom` class represents a point light source in the scene.
 * @zh `PointLightCom` 类表示场景中的点光源。
 */
export class PointLightCom extends Light {

    /**
     * @en Declares the data module for point light.
     * @zh 声明点光源的数据模块。
     */
    declare _dataModule: IPointLightData;

    /** @internal */
    private _range: number;

    /**
     * @en The range of the point light.
     * @zh 点光的范围。
     */
    get range(): number {
        return this._range;
    }

    set range(value: number) {
        this._range = value;
        this._dataModule.range = value;
    }

    /**
     * @ignore
     * @en Creates an instance of PointLightCom.
     * @zh 创建一个 PointLightCom 的实例。
     */
    constructor() {
        super();
        this._lightType = LightType.Point;

        this.range = 6.0;
    }

    protected _creatModuleData(): void {
        this._dataModule = Laya3DRender.Render3DModuleDataFactory.createPointLight();
    }

    /**
     * @internal
     * @override
     */
    protected _addToLightQueue(): void {
        this.owner.scene._pointLights.add(this);
    }

    /**
     * @internal
     * @override
     */
    protected _removeFromLightQueue(): void {
        this.owner.scene._pointLights.remove(this);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: PointLightCom): void {
        super._cloneTo(dest);
        dest.range = this.range;
        dest._lightType = LightType.Point;
    }
}