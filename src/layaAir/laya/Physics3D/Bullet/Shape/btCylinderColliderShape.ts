import { Vector3 } from "../../../maths/Vector3";
import { ICylinderColliderShape } from "../../interface/Shape/ICylinderColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";
/**
 * @en The `btCylinderColliderShape` class is used to create and manage cylinder collision shapes.
 * @zh `btCylinderColliderShape` 类用于创建和管理圆柱体碰撞形状。
 */
export class btCylinderColliderShape extends btColliderShape implements ICylinderColliderShape {
    private static _tempVector30: Vector3 = new Vector3();
    /**@internal */
    private _radius: number = 0.25;
    /**@internal */
    private _length: number = 1;
    /**@internal */
    private _orientation: number = btColliderShape.SHAPEORIENTATION_UPY;

    private _btSize: any;
    constructor() {
        super();
        let bt = btPhysicsCreateUtil._bt;
        this._btSize = bt.btVector3_create(0, 0, 0);
    }

    protected _createShape() {
        //TODO MIner
        let bt = btPhysicsCreateUtil._bt;
        if (this._btShape) {
            bt.btCollisionShape_destroy(this._btShape);
        }
        switch (this._orientation) {
            case btColliderShape.SHAPEORIENTATION_UPX:
                bt.btVector3_setValue(this._btSize, this._length / 2, this._radius, this._radius);
                this._btShape = bt.btCylinderShapeX_create(this._btSize);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                bt.btVector3_setValue(this._btSize, this._radius, this._length / 2, this._radius);
                this._btShape = bt.btCylinderShape_create(this._btSize);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                bt.btVector3_setValue(this._btSize, this._radius, this._radius, this._length / 2);
                this._btShape = bt.btCylinderShapeZ_create(this._btSize);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_CYLINDER;
    }

    /**
     * @en Sets the radius of the cylinder.
     * @param radius The radius of the cylinder.
     * @zh 设置圆柱体的半径。
     * @param radius 圆柱体的半径。
     */
    setRadius(radius: number): void {
        if (this._btShape && this._radius == radius)
            return;
        this._radius = radius;
        this._createShape();
    }

    /**
     * @en Sets the height of the cylinder.
     * @param height The height of the cylinder.
     * @zh 设置圆柱体的高度。
     * @param height 圆柱体的高度。
     */
    setHeight(height: number): void {
        if (this._btShape && this._length == height)
            return;
        this._length = height;
        this._createShape();
    }
    /**
     * @en Sets the up axis of the cylinder.
     * @param upAxis The up axis of the cylinder.
     * @zh 设置圆柱体的朝上轴。
     * @param upAxis 圆柱体的朝上轴。
     */
    setUpAxis(upAxis: number): void {
        if (this._btShape && this._orientation == upAxis)
            return;
        this._orientation = upAxis;
        this._createShape();
    }
    /**
     * @en Destroys the cylinder collider shape and releases resources.
     * @zh 销毁圆柱体碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        this._radius = null;
        this._length = null;
        this._orientation = null;
    }
}