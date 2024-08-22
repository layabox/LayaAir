import { Vector3 } from "../../../maths/Vector3";
import { IConeColliderShape } from "../../interface/Shape/IConeColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";
/**
 * @en The `btConeColliderShape` class creates a cone shape, which is a cylinder with a conical top.
 * @zh 类 `btConeColliderShape` 用于创建和管理物理引擎中圆锥碰撞器形状。
 */
export class btConeColliderShape extends btColliderShape implements IConeColliderShape {
    private static _tempVector30: Vector3 = new Vector3();
    /**@internal */
    private _radius: number = 0.25;
    /**@internal */
    private _length: number = 1;
    /**@internal */
    private _orientation: number = btColliderShape.SHAPEORIENTATION_UPY;
    constructor() {
        super();
    }

    protected _createShape() {
        //TODO MIner
        let bt = btPhysicsCreateUtil._bt;
        if (this._btShape) {
            bt.btCollisionShape_destroy(this._btShape);
        }
        switch (this._orientation) {
            case btColliderShape.SHAPEORIENTATION_UPX:
                this._btShape = bt.btConeShapeX_create(this._radius, this._length);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                this._btShape = bt.btConeShape_create(this._radius, this._length);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                this._btShape = bt.btConeShapeZ_create(this._radius, this._length);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_CONE;
    }

    /**
     * @en Sets the radius of the cone.
     * @param radius The radius to set.
     * @zh 设置圆锥的半径。
     * @param radius 圆锥的半径。
     */
    setRadius(radius: number): void {
        if (this._btShape && this._radius == radius)
            return;
        this._radius = radius;
        this._createShape();
    }

    /**
     * @en Sets the height of the cone.
     * @param height The height to set.
     * @zh 设置圆锥的高度。
     * @param height 圆锥的高度。
     */
    setHeight(height: number): void {
        if (this._btShape && this._length == height)
            return;
        this._length = height;
        this._createShape();
    }

    /**
     * @en Sets the up axis of the cone.
     * @param upAxis The up axis to set.
     * @zh 设置圆锥的朝向轴。
     * @param upAxis 圆锥的朝向轴。
     */
    setUpAxis(upAxis: number): void {
        if (this._btShape && this._orientation == upAxis)
            return;
        this._orientation = upAxis;
        this._createShape();
    }

    /**
     * @en Destroys the cone collider shape and releases resources.
     * @zh 销毁圆锥碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        this._radius = null;
        this._length = null;
        this._orientation = null;
    }
}