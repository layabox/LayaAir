import { Vector3 } from "../../../maths/Vector3";
import { ISphereColliderShape } from "../../interface/Shape/ISphereColliderShape";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxColliderShape } from "./pxColliderShape";

/**
 * @en Represents a sphere collider shape in the physics engine.
 * @zh 表示物理引擎中的球体碰撞器形状。
 */
export class pxSphereColliderShape extends pxColliderShape implements ISphereColliderShape {
    /**@internal */
    private _radius: number = 0.5;



    /**
     * @en Creates a new instance of pxSphereColliderShape.
     * @zh 创建一个新的 pxSphereColliderShape 实例。
     */
    constructor() {
        super();
        this._pxGeometry = new pxPhysicsCreateUtil._physX.PxSphereGeometry(this._radius);
        this._createShape();
    }

    /**
     * @en Sets the radius of the sphere collider.
     * @param radius The new radius value.
     * @zh 设置球体碰撞器的半径。
     * @param radius 新的半径值。
     */
    setRadius(radius: number): void {
        this._radius = radius;
        var maxScale = Math.max(this._scale.x, Math.max(this._scale.y, this._scale.z));
        this._pxGeometry.radius = this._radius * maxScale;
        this._pxShape.setGeometry(this._pxGeometry);
    }

    /**
     * @en Sets the offset position of the sphere collider.
     * @param position The new offset position.
     * @zh 设置球体碰撞器的偏移位置。
     * @param position 新的偏移位置。
     */
    setOffset(position: Vector3): void {
        super.setOffset(position);
        this.setRadius(this._radius);
    }

    /**
     * @en Destroys the sphere collider shape and releases resources.
     * @zh 销毁球体碰撞器形状并释放资源。
     */
    destroy(): void {
        super.destroy();
        this._radius = null;
    }
}