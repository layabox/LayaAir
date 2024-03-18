import { IPointLightData } from "../../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { Component } from "../../../components/Component";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { Light, LightType } from "./Light";


export class PointLightCom extends Light {

    declare _dataModule: IPointLightData;

    /** @internal */
    private _range: number;

    /**
     * 点光的范围。
     * @return 点光的范围。
     */
    get range(): number {
        return this._range;
    }

    set range(value: number) {
        this._range = value;
        this._dataModule.range = value;
    }

    /**
     * 创建一个 <code>PointLight</code> 实例。
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
    _parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);
        this.range = data.range;
    }
    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: PointLightCom): void {
        super._cloneTo(dest);
        var pointlight = dest as PointLightCom;
        pointlight.range = this.range;
        pointlight._lightType = LightType.Point;
    }

    /**
     * @internal
     */
    protected _create(): Component {
        return new PointLightCom();
    }

}