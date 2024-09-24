import { Vector3 } from "../../../maths/Vector3";
import { ICapsuleColliderShape } from "../../interface/Shape/ICapsuleColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";
/**
 * @en The `btCapsuleColliderShape` class is used to create and manage capsule-shaped colliders.
 * @zh 类 `btCapsuleColliderShape` 用于创建和管理胶囊形状的碰撞体。
 */
export class btCapsuleColliderShape extends btColliderShape implements ICapsuleColliderShape {
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
                this._btShape = bt.btCapsuleShapeX_create(this._radius, this._length - this._radius * 2);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                this._btShape = bt.btCapsuleShape_create(this._radius, this._length - this._radius * 2);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                this._btShape = bt.btCapsuleShapeZ_create(this._radius, this._length - this._radius * 2);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_CAPSULE;
    }

    /**
     * @en Sets the radius of the capsule.
     * @param radius The radius of the capsule.
     * @zh 设置胶囊体的半径。
     * @param radius 胶囊体的半径。
     */
    setRadius(radius: number): void {
        if (this._btShape && this._radius == radius)
            return;
        this._radius = radius;
        this._createShape();
    }

    /**
     * @en Sets the height of the capsule.
     * @param height The height of the capsule.
     * @zh 设置胶囊体的高度。
     * @param height 胶囊体的高度。
     */
    setHeight(height: number): void {
        if (this._btShape && this._length == height)
            return;
        this._length = height;
        this._createShape();
    }

    /**
     * @en Sets the up axis of the capsule.
     * @param upAxis The up axis of the capsule.
     * @zh 设置胶囊体的朝向轴。
     * @param upAxis 胶囊体的朝向轴。
     */
    setUpAxis(upAxis: number): void {
        if (this._btShape && this._orientation == upAxis)
            return;
        this._orientation = upAxis;
        this._createShape();
    }

    /**
     * @en Sets the world scale of the capsule collider shape.
     * @param scale The scale of the capsule collider shape.
     * @zh 设置胶囊碰撞器形状的世界缩放。
     * @param scale 缩放比例。
     */
    setWorldScale(scale: Vector3): void {
        var fixScale: Vector3 = btCapsuleColliderShape._tempVector30;
        switch (this._orientation) {
            case btColliderShape.SHAPEORIENTATION_UPX:
                fixScale.x = scale.x;
                fixScale.y = fixScale.z = Math.max(scale.y, scale.z);
                break;
            case btColliderShape.SHAPEORIENTATION_UPY:
                fixScale.y = scale.y;
                fixScale.x = fixScale.z = Math.max(scale.x, scale.z);
                break;
            case btColliderShape.SHAPEORIENTATION_UPZ:
                fixScale.z = scale.z;
                fixScale.x = fixScale.y = Math.max(scale.x, scale.y);
                break;
            default:
                throw "CapsuleColliderShape:unknown orientation.";
        }
        super.setWorldScale(fixScale);
    }

    /**
     * @en Destroys the capsule collider shape and releases resources.
     * @zh 销毁胶囊碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        this._radius = null;
        this._length = null;
        this._orientation = null;
    }

}