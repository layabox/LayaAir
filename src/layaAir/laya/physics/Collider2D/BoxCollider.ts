import { ColliderBase } from "./ColliderBase";
import { Physics2D } from "../Physics2D";
import { PhysicsShape } from "./ColliderStructInfo";


/**
 * @en 2D rectangular collision body
 * @zh 2D矩形碰撞体
 */
export class BoxCollider extends ColliderBase {

    /**@internal 矩形宽度*/
    private _width: number = 100;
    /**@internal 矩形高度*/
    private _height: number = 100;

    /** 
     * @en Rectangle width of collision body
     * @zh 碰撞体矩形宽度
     */
    get width(): number {
        return this._width;
    }

    set width(value: number) {
        if (value <= 0) throw "BoxCollider size cannot be less than 0";
        if (this._width == value) return;
        this._width = value;
        this._needupdataShapeAttribute();
    }

    /** 
     * @en Rectangle height of collision body
     * @zh 碰撞体矩形高度
     */
    get height(): number {
        return this._height;
    }

    set height(value: number) {
        if (value <= 0) throw "BoxCollider size cannot be less than 0";
        if (this._height == value) return;
        this._height = value;
        this._needupdataShapeAttribute();
    }

    /**
    * @en Constructor method
    * @zh 构造方法
    */
    constructor() {
        super();
        this._physicShape = PhysicsShape.BoxShape;
    }

    /**
     * @internal
     * @override
     * @param shape 
     */
    protected _setShapeData(shape: any): void {
        let helfW: number = this._width * 0.5;
        let helfH: number = this._height * 0.5;
        var center = {
            x: helfW + this.pivotoffx,
            y: helfH + this.pivotoffy
        }
        Physics2D.I._factory.set_collider_SetAsBox(shape, helfW, helfH, center, Math.abs(this.scaleX), Math.abs(this.scaleY));
    }



}
