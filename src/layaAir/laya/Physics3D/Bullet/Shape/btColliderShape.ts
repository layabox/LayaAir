import { Vector3 } from "../../../maths/Vector3";
import { IColliderShape } from "../../interface/Shape/IColliderShape";
import { btCollider } from "../Collider/btCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";

export class btColliderShape implements IColliderShape {

    /** 形状方向_X轴正向 */
    static SHAPEORIENTATION_UPX: number = 0;
    /** 形状方向_Y轴正向 */
    static SHAPEORIENTATION_UPY: number = 1;
    /** 形状方向_Z轴正向 */
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

    setOffset(value: Vector3): void {
        value.cloneTo(this._localOffset);
    }

    setWorldScale(scale: Vector3): void {
        if (this._btShape && this._worldScale.equal(scale))
            return;
        scale.cloneTo(this._worldScale);
        let bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(this._btScale, this._worldScale.x, this._worldScale.y, this._worldScale.z);
        bt.btCollisionShape_setLocalScaling(this._btShape, this._btScale);
    }

    destroy(): void {
        if (this._btShape && !this._destroyed) {
            btPhysicsCreateUtil._bt.btCollisionShape_destroy(this._btShape);
            this._btShape = null;
            this._destroyed = true;
        }
    }

}