import { Component } from "../../../components/Component";
import { Light, LightType } from "./Light";


export class PointLightCom extends Light {
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
    }

    /**
     * 创建一个 <code>PointLight</code> 实例。
     */
    constructor() {
        super();
        this._range = 6.0;
        this._lightType = LightType.Point;
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