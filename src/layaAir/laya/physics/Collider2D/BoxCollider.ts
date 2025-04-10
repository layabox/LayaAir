import { Physics2D } from "../Physics2D";
import { EPhysics2DShape } from "../factory/IPhysics2DFactory";
import { StaticCollider } from "../StaticCollider";

/**
 * @deprecated
 * @en 2D rectangular collision body
 * @zh 2D矩形碰撞体
 */
export class BoxCollider extends StaticCollider {

    /**@internal 矩形宽度*/
    protected _width: number = 100;
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
        this._rigidbody && this.createShape(this._rigidbody);
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
        this._rigidbody && this.createShape(this._rigidbody);
    }

    /**
    * @en Constructor method
    * @zh 构造方法
    */
    constructor() {
        super();
        this._shapeDef.shapeType = EPhysics2DShape.BoxShape;
    }

    /**
     * @internal
     * @override
     * @param shape 
     */
    protected _setShapeData(shape: any): void {
        if (!shape) return;
        let helfW: number = this._width * 0.5;
        let helfH: number = this._height * 0.5;
        var center = {
            x: helfW + this.pivotoffx,
            y: helfH + this.pivotoffy
        }
        Physics2D.I._factory.set_collider_SetAsBox(shape, helfW, helfH, center, Math.abs(this.scaleX), Math.abs(this.scaleY));
    }



}
