import { ColliderBase } from "./ColliderBase";
import { Physics } from "./Physics";
import { ClassUtils } from "../utils/ClassUtils";
/**
	 * 2D矩形碰撞体
	 */
export class BoxCollider extends ColliderBase {
    /**相对节点的x轴偏移*/
    private _x: number = 0;
    /**相对节点的y轴偏移*/
    private _y: number = 0;
    /**矩形宽度*/
    private _width: number = 100;
    /**矩形高度*/
    private _height: number = 100;

    /**
     * @override
     */
    protected getDef(): any {
        if (!this._shape) {
            this._shape = new (<any>window).box2d.b2PolygonShape();
            this._setShape(false);
        }
        this.label = (this.label || "BoxCollider");
        return super.getDef();
    }

    private _setShape(re: boolean = true): void {
        var scaleX: number = ((this.owner as any)["scaleX"] || 1);
        var scaleY: number = ((this.owner as any)["scaleY"] || 1);
        this._shape.SetAsBox(this._width / 2 / Physics.PIXEL_RATIO * scaleX, this._height / 2 / Physics.PIXEL_RATIO * scaleY, new (<any>window).box2d.b2Vec2((this._width / 2 + this._x) / Physics.PIXEL_RATIO * scaleX, (this._height / 2 + this._y) / Physics.PIXEL_RATIO * scaleY));
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

    /**矩形宽度*/
    get width(): number {
        return this._width;
    }

    set width(value: number) {
        if (value <= 0) throw "BoxCollider size cannot be less than 0";
        this._width = value;
        if (this._shape) this._setShape();
    }

    /**矩形高度*/
    get height(): number {
        return this._height;
    }

    set height(value: number) {
        if (value <= 0) throw "BoxCollider size cannot be less than 0";
        this._height = value;
        if (this._shape) this._setShape();
    }

    /**@private 重置形状
     * @override
    */
    resetShape(re: boolean = true): void {
        this._setShape();
    }
}

ClassUtils.regClass("laya.physics.BoxCollider", BoxCollider);
ClassUtils.regClass("Laya.BoxCollider", BoxCollider);
