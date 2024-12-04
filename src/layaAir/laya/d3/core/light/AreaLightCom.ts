import { Component } from "../../../components/Component";
import { Vector2 } from "../../../maths/Vector2";
import { Light, LightMode, LightType } from "./Light";
export enum AreaShape {
    rectangle,
    ellipse,
}
/**
 * @en The AreaLightCom class is used to create area lights.
 * @zh AreaLightCom 类用于创建区域光。
 */
export class AreaLightCom extends Light {
    /**@internal */
    private _areaShape: AreaShape;

    /**@internal */
    private _power: number;

    /**@internal */
    private _size: Vector2;

    /**@internal */
    private _spread: number;

    /**@internal */
    private _maxBounces: number;
    /**
     * @ignore
     * @en Creates an instance of AreaLightCom.
     * @zh 创建一个 AreaLightCom 的实例。
     */
    constructor() {
        super();
        this._lightType = LightType.Area;
        this._lightmapBakedType = LightMode.bakeOnly;
        this._spread = 90;
        this._maxBounces = 1024;
        this._size = new Vector2(1, 1);
        this._areaShape = AreaShape.rectangle;
        this._power = 100;
    }

    protected _creatModuleData() {
        this._dataModule = {
            transform:null,
            range:0,
            shadowResolution:1,
            shadowDistance:1,
            shadowMode:null,
            shadowStrength:1,
            shadowDepthBias:1,
            shadowNormalBias:1,
            shadowNearPlane:1
        }
	}


    /**
     * @en The lightmap baked type.
     * @zh 灯光烘焙类型。
     */
    get lightmapBakedType(): LightMode {
        return LightMode.bakeOnly;
    }

    set lightmapBakedType(value: LightMode) {
        this._lightmapBakedType = LightMode.bakeOnly;
    }


    /**
     * @en The area light shape.
     * @zh 区域光的形状。
     */
    get shape(): AreaShape {
        return this._areaShape;
    }

    set shape(value: AreaShape) {
        this._areaShape = value;
    }

    /**
     * @en The light intensity.
     * @zh 光照强度。
     */
    get power() {
        return this._power;
    }

    set power(value: number) {
        this._power = value;
    }

    /**
     * @en The size of the area light.
     * @zh 区域光大小。
     */
    get size() {
        return this._size;
    }

    set size(value: Vector2) {
        value && value.cloneTo(this._size);
    }

    /**
     * @en The spread angle of the area light.
     * @zh 区域光的辐射角度。
     */
    get spread(): number {
        return this._spread;
    }

    set spread(value: number) {
        this._spread = Math.min((Math.max(0, value)), 180);
    }

    /**
     * @en The maximum number of light bounces.
     * @zh 区域光的最大反弹次数。
     */
    get maxBounces() {
        return this._maxBounces;
    }

    set maxBounces(value: number) {
        this._maxBounces = value;
    }


    /**
     * @internal
     * @override
     */
    protected _addToLightQueue(): void {
    }

    /**
     * @internal
     * @override
     */
    protected _removeFromLightQueue(): void {
    }
}

