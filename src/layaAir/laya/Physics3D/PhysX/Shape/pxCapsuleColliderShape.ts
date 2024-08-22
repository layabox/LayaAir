import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { ICapsuleColliderShape } from "../../interface/Shape/ICapsuleColliderShape";
import { pxCollider } from "../Collider/pxCollider";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";
/**
 * The up axis of the collider shape.
 */
enum ColliderShapeUpAxis {
    /** Up axis is X. */
    X,
    /** Up axis is Y. */
    Y,
    /** Up axis is Z. */
    Z
}

/**
 * @en Represents a capsule collider shape in the PhysX physics engine.
 * @zh 表示 PhysX 物理引擎中的胶囊碰撞器形状。
 */
export class pxCapsuleColliderShape extends pxColliderShape implements ICapsuleColliderShape {
    /** @internal */
    _radius: number = 0.25;
    /** @internal */
    _halfHeight: number = 0.5;

    /**@internal in Physx capsule's height is X Axis, need to rotate*/
    _rotation: Quaternion = new Quaternion(0, 0, 0.7071068, 0.7071068);

    private _upAxis: ColliderShapeUpAxis = ColliderShapeUpAxis.Y;

    /**
     * @en Creates a new instance of pxCapsuleColliderShape.
     * @zh 创建 pxCapsuleColliderShape 的新实例。
     */
    constructor() {
        super();
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxCapsuleGeometry(this._radius, this._halfHeight);
        this._createShape();
    }

    /**
     * @internal
     * rotate capusle in physx, physx capsule heigth is X axis
     */
    _setCapsuleRotation() {
        pxColliderShape.transform.rotation.setValue(this._rotation.x, this._rotation.y, this._rotation.z, this._rotation.w)
        this._pxShape.setLocalPose(pxColliderShape.transform);
    }

    /**
     * @en Adds the shape to a collider.
     * @param collider The collider to add the shape to.
     * @zh 将形状添加到碰撞器。
     * @param collider 要添加形状的碰撞器。
     */
    addToActor(collider: pxCollider): void {
        super.addToActor(collider);
        this._setCapsuleRotation();
    }

    /**
     * @en Sets the radius of the capsule.
     * @param radius The new radius value.
     * @zh 设置胶囊体的半径。
     * @param radius 新的半径值。
     */
    setRadius(radius: number): void {
        this._radius = radius;
        switch (this._upAxis) {
            case ColliderShapeUpAxis.X:
                this._pxGeometry.radius = this._radius * Math.max(this._scale.y, this._scale.z);
                break;
            case ColliderShapeUpAxis.Y:
                this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.z);
                break;
            case ColliderShapeUpAxis.Z:
                this._pxGeometry.radius = this._radius * Math.max(this._scale.x, this._scale.y);
                break;
        }
        this._pxShape.setGeometry(this._pxGeometry);
    }

    /**
     * @en Sets the height of the capsule.
     * @param height The new height value.
     * @zh 设置胶囊体的高度。
     * @param height 新的高度值。
     */
    setHeight(height: number): void {
        this._halfHeight = height * 0.5;
        switch (this._upAxis) {
            case ColliderShapeUpAxis.X:
                this._pxGeometry.halfHeight = this._halfHeight * this._scale.x;
                break;
            case ColliderShapeUpAxis.Y:
                this._pxGeometry.halfHeight = this._halfHeight * this._scale.y;
                break;
            case ColliderShapeUpAxis.Z:
                this._pxGeometry.halfHeight = this._halfHeight * this._scale.z;
                break;
        }
        this._pxShape.setGeometry(this._pxGeometry);
    }

    /**
     * @en Sets the up axis of the capsule.
     * @param upAxis The new up axis value.
     * @zh 设置胶囊体的向上轴。
     * @param upAxis 新的向上轴值。
     */
    setUpAxis(upAxis: number): void {
        if (this._pxShape && this._upAxis == upAxis)
            return;
        this._upAxis = upAxis;
        this.setHeight(this._halfHeight);
        this.setRadius(this._radius);
    }

    /**
     * @en Sets the offset of the capsule collider.
     * @param position The new offset position.
     * @zh 设置胶囊碰撞器的偏移。
     * @param position 新的偏移位置。
     */
    setOffset(position: Vector3): void {
        super.setOffset(position);
        this.setHeight(this._halfHeight);
        this.setRadius(this._radius);
    }

    /**
     * @en Destroys the capsule collider shape and releases resources.
     * @zh 销毁胶囊碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        this._radius = null;
        this._halfHeight = null;
        this._upAxis = null;
    }
}