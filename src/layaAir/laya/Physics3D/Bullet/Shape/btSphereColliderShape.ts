import { ISphereColliderShape } from "../../interface/Shape/ISphereColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";
/**
 * @en The `btSphereColliderShape` class is used to create and manage spherical collision shapes.
 * @zh `btSphereColliderShape` 类用于创建和管理球形碰撞体形状。
 */
export class btSphereColliderShape extends btColliderShape implements ISphereColliderShape {
    /**@internal */
    private _radius: number = -1;
    /** @ignore */
    constructor() {
        super();
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_SPHERE;
    }

    protected _createShape() {
        let bt = btPhysicsCreateUtil._bt;
        if (this._btShape) {
            bt.btCollisionShape_destroy(this._btShape);
        }
        this._btShape = bt.btSphereShape_create(this._radius);
    }

    /**
     * @en Sets the radius of the sphere.
     * @param radius The radius to set.
     * @zh 设置球体的半径。
     * @param radius 要设置的半径。
     */
    setRadius(radius: number): void {
        if (this._btShape && this._radius == radius)
            return;
        this._radius = radius;
        this._createShape();
    }
    /**
     * @en Destroys the sphere collider shape and cleans up resources.
     * @zh 销毁球形碰撞体形状并清理资源。
     */
    destroy(): void {
        super.destroy();
        this._radius = null;
    }
}