import { Vector3 } from "../../../maths/Vector3";
import { IBoxColliderShape } from "../../interface/Shape/IBoxColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";

/**
 * @en Represents a box collider shape in the PhysX physics engine.
 * @zh 表示 PhysX 物理引擎中的盒状碰撞器形状。
 */
export class pxBoxColliderShape extends pxColliderShape implements IBoxColliderShape {
    private static _tempHalfExtents = new Vector3();
    /** @interanl */
    private _size: Vector3;

    /**
     * @en Creates a new instance of pxBoxColliderShape.
     * @zh 创建 pxBoxColliderShape 的新实例。
     */
    constructor() {
        super();
        this._size = new Vector3(0.5, 0.5, 0.5);
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxBoxGeometry(
            this._size.x / 2,
            this._size.y / 2,
            this._size.z / 2
        );
        this._createShape();
    }

    /**
     * @en Sets the size of the box collider.
     * @param size The new size of the box collider.
     * @zh 设置盒状碰撞器的大小。
     * @param size 盒状碰撞器的新大小。
     */
    setSize(size: Vector3): void {
        const tempExtents = pxBoxColliderShape._tempHalfExtents;
        size.cloneTo(this._size);
        tempExtents.setValue(this._size.x * 0.5 * this._scale.x, this._size.y * 0.5 * this._scale.y, this._size.z * 0.5 * this._scale.z);
        this._pxGeometry.halfExtents = tempExtents;
        this._pxShape && this._pxShape.setGeometry(this._pxGeometry);
    }

    /**
     * @en Sets the offset of the box collider.
     * @param position The new offset position.
     * @zh 设置盒状碰撞器的偏移。
     * @param position 新的偏移位置。
     */
    setOffset(position: Vector3): void {
        super.setOffset(position);
        this.setSize(this._size);
    }

    /**
     * @en Destroys the box collider shape and releases resources.
     * @zh 销毁盒状碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        this._size = null;
    }

}