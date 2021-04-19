import { ColliderBase } from "./ColliderBase";
import { Physics } from "./Physics";
import { ClassUtils } from "../utils/ClassUtils";
/**
	 * 2D圆形碰撞体
	 */
export class CircleCollider extends ColliderBase {
    /**@private */
    private static _temp: any;
    /**相对节点的x轴偏移*/
    private _x: number = 0;
    /**相对节点的y轴偏移*/
    private _y: number = 0;
    /**圆形半径，必须为正数*/
    private _radius: number = 50;
    /**
     * @override
     */
    protected getDef(): any {
        if (!this._shape) {
            this._shape = new (<any>window).box2d.b2CircleShape();
            this._setShape(false);
        }
        this.label = (this.label || "CircleCollider");
        return super.getDef();
    }

    private _setShape(re: boolean = true): void {
        var scale: number = (this.owner as any)["scaleX"] || 1;
        this._shape.m_radius = this._radius / Physics.PIXEL_RATIO * scale;
        this._shape.m_p.Set((this._radius + this._x) / Physics.PIXEL_RATIO * scale, (this._radius + this._y) / Physics.PIXEL_RATIO * scale);
        if (re) this.refresh();
    }

    /**相对节点的x轴偏移*/
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        if (this._shape) this._setShape();
    }

    /**相对节点的y轴偏移*/
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        if (this._shape) this._setShape();
    }

    /**圆形半径，必须为正数*/
    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        if (value <= 0) throw "CircleCollider radius cannot be less than 0";
        this._radius = value;
        if (this._shape) this._setShape();
    }

    /**@private 重置形状
     * @override
    */
    resetShape(re: boolean = true): void {
        this._setShape();
    }
}

ClassUtils.regClass("laya.physics.CircleCollider", CircleCollider);
ClassUtils.regClass("Laya.CircleCollider", CircleCollider);