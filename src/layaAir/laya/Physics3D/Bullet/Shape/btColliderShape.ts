import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "../../interface/Shape/IColliderShape";
import { btCollider } from "../Collider/btCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
/**
 * @en The `btColliderShape` class is the base class for defining and managing physics collision shapes.
 * @zh 类`btColliderShape` 用于定义和管理物理碰撞形状的基类。
 */
export class btColliderShape implements IColliderShape {

    /**
     * @en Shape orientation along positive X-axis
     * @zh 形状方向沿 X 轴正向
     */
    static SHAPEORIENTATION_UPX: number = 0;
    /**
     * @en Shape orientation along positive Y-axis
     * @zh 形状方向沿 Y 轴正向
     */
    static SHAPEORIENTATION_UPY: number = 1;
    /**
     * @en Shape orientation along positive Z-axis
     * @zh 形状方向沿 Z 轴正向
     */
    static SHAPEORIENTATION_UPZ: number = 2;

    /** @internal */
    static SHAPETYPES_BOX: number = 0;
    /** @internal */
    static SHAPETYPES_SPHERE: number = 1;
    /** @internal */
    static SHAPETYPES_CYLINDER: number = 2;
    /** @internal */
    static SHAPETYPES_CAPSULE: number = 3;
    /** @internal */
    static SHAPETYPES_CONVEXHULL: number = 4;
    /** @internal */
    static SHAPETYPES_COMPOUND: number = 5;
    /** @internal */
    static SHAPETYPES_STATICPLANE: number = 6;
    /** @internal */
    static SHAPETYPES_CONE: number = 7;
    /** @internal */
    static SHAPETYPES_HEIGHTFIELDTERRAIN: number = 8;

    _type: number;

    _btShape: any;

    _btScale: any;

    _localOffset: Vector3;

    _worldScale: Vector3;

    _btCollider: btCollider;//btActor

    _destroyed: boolean;

    constructor() {
        this._localOffset = new Vector3(0, 0, 0);
        let bt = btPhysicsCreateUtil._bt;
        this._btScale = bt.btVector3_create(1, 1, 1);
        this._worldScale = new Vector3(-1, -1, -1);
        this._destroyed = false;
    }

    /**
     * @override
     */
    protected _createShape() {
        throw "override this function"
    }

    /**
     * @override
     */
    protected _getType(): number {
        throw "override this function"
    }

    /**
     * @en Sets the local offset of the shape.
     * @param value The offset value.
     * @zh 设置形状的局部偏移。
     * @param value 偏移量。
     */
    setOffset(value: Vector3): void {
        value.cloneTo(this._localOffset);
    }

    /**
     * @en Sets the world scale of the shape.
     * @param scale The scale value.
     * @zh 设置形状的世界缩放。
     * @param scale 缩放比例。
     */
    setWorldScale(scale: Vector3): void {
        if (this._btShape && this._worldScale.equal(scale))
            return;
        scale.cloneTo(this._worldScale);
        let bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(this._btScale, this._worldScale.x, this._worldScale.y, this._worldScale.z);
        bt.btCollisionShape_setLocalScaling(this._btShape, this._btScale);
    }

    /**
     * @en Destroys the collider shape and releases resources.
     * @zh 销毁碰撞器形状并释放资源。
     */
    destroy(): void {
        if (this._btShape && !this._destroyed) {
            btPhysicsCreateUtil._bt.btCollisionShape_destroy(this._btShape);
            this._btShape = null;
            this._destroyed = true;
        }
    }

}