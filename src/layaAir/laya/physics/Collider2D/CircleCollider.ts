import { Physics2D } from "../Physics2D";
import { StaticCollider } from "../StaticCollider";
import { EPhysics2DShape } from "../Factory/IPhysics2DFactory";

/**
 * @deprecated
 * @en 2D CircleCollider
 * @zh 2D圆形碰撞体
 */
export class CircleCollider extends StaticCollider {

    /**@internal 圆形半径，必须为正数*/
    private _radius: number = 50;

    /**
     * @en Circular radius, must be a positive number
     * @zh 圆形半径，必须为正数
     */
    get radius(): number {
        return this._radius;
    }

    set radius(value: number) {
        if (value <= 0) throw "CircleCollider radius cannot be less than 0";
        if (this._radius == value) return;
        this._radius = value;
        this._rigidbody && this.createShape(this._rigidbody);
    }

    constructor() {
        super();
        this._shapeDef.shapeType = EPhysics2DShape.CircleShape;
    }

    /**
     * @internal 设置碰撞体数据
     * @param shape 
     */
    protected _setShapeData(shape: any): void {
        if (!shape) return;
        var scale: number = Math.max(Math.abs(this.scaleX), Math.abs(this.scaleY));
        let radius = this.radius;
        Physics2D.I._factory.set_CircleShape_radius(shape, radius, scale);
        Physics2D.I._factory.set_CircleShape_pos(shape, this.x, this.y, scale);
    }

}