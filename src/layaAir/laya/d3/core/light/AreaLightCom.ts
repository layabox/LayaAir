import { Component } from "../../../components/Component";
import { Vector2 } from "../../../maths/Vector2";
import { Light, LightMode, LightType } from "./Light";
export enum AreaShape {
    rectangle,
    ellipse,
}
/**
 * <code>LightSprite</code> 类用于创建灯光的父类。
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
     * 创建一个 <code>AreaLightCoponent</code> 实例。
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

    /**
      * 灯光烘培类型。
      */
    get lightmapBakedType(): LightMode {
        return LightMode.bakeOnly;
    }

    set lightmapBakedType(value: LightMode) {
        this._lightmapBakedType = LightMode.bakeOnly;
    }


    /**
     * 面光类型
     */
    get shape(): AreaShape {
        return this._areaShape;
    }

    set shape(value: AreaShape) {
        this._areaShape = value;
    }

    /**
     * 光照强度
     */
    set power(value: number) {
        this._power = value;
    }

    get power() {
        return this._power;
    }

    /**
     * 面光大小
     */
    set size(value: Vector2) {
        value && value.cloneTo(this._size);
    }

    get size() {
        return this._size;
    }

    /**
     * 面光辐射角度
     */
    set spread(value: number) {
        this._spread = Math.min((Math.max(0, value)), 180);
    }

    get spread(): number {
        return this._spread;
    }

    /**
     * 最大反弹数
     */
    set maxBounces(value: number) {
        this._maxBounces = value;
    }

    get maxBounces() {
        return this._maxBounces;
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

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any, spriteMap: any): void {
        super._parse(data, spriteMap);
        //this.range = data.range;
    }
    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _cloneTo(dest: AreaLightCom): void {
        super._cloneTo(dest);
    }

    /**
     * @internal
     */
    protected _create(): Component {
        return new AreaLightCom();
    }
}

