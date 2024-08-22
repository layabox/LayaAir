import { Vector3 } from "../../../maths/Vector3";
import { IBoxColliderShape } from "../../interface/Shape/IBoxColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";
/**
 * @en The `btBoxColliderShape` class is used to create and manage box collision shapes for the physics engine.
 * @zh 类`btBoxColliderShape` 用于创建和管理物理引擎的盒子碰撞形状。
 */
export class btBoxColliderShape extends btColliderShape implements IBoxColliderShape {
    /** @internal */
    private _btSize: number;
    /** @interanl */
    private _size: Vector3;

    constructor() {
        super();
        let bt = btPhysicsCreateUtil._bt;
        this._size = new Vector3(0.5, 0.5, 0.5);
        this._btSize = bt.btVector3_create(0, 0, 0);
    }

    private changeBoxShape() {
        let bt = btPhysicsCreateUtil._bt;
        if (this._btShape) {
            bt.btCollisionShape_destroy(this._btShape);
        }
        this._createShape();
    }

    protected _createShape() {
        let bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(this._btSize, this._size.x / 2, this._size.y / 2, this._size.z / 2);
        this._btShape = bt.btBoxShape_create(this._btSize);
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_BOX;
    }

    /**
     * @en Sets the size of the box collider shape.
     * @param size The new size of the box.
     * @zh 设置盒子碰撞器形状的大小。
     * @param size 盒子的新大小。
     */
    setSize(size: Vector3): void {
        if (this._btShape && size.equal(this._size)) {
            return;
        }
        this._size.setValue(size.x, size.y, size.z);
        this.changeBoxShape();
    }

    /**
     * @en Destroys the box collider shape and releases resources.
     * @zh 销毁盒子碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        //destroy _btsize
        this._size = null;
        this._btSize = null;
    }

}