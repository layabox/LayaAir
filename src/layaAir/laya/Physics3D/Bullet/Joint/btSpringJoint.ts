import { Vector3 } from "../../../maths/Vector3";
import { ISpringJoint } from "../../interface/Joint/ISpringJoint";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";
/**
 * @en The `btSpringJoint` class is used to create and manage spring joints in the physics engine.
 * @zh 类`btSpringJoint`用于在物理引擎中创建和管理弹簧关节。
 */
export class btSpringJoint extends btJoint implements ISpringJoint {

    /**@internal */
    static LINEARSPRING_AXIS_X: number = 0;
    /**@internal */
    static LINEARSPRING_AXIS_Y: number = 1;
    /**@internal */
    static LINEARSPRING_AXIS_Z: number = 2;
    /**@internal */
    static ANGULARSPRING_AXIS_X: number = 3;
    /**@internal */
    static ANGULARSPRING_AXIS_Y: number = 4;
    /**@internal */
    static ANGULARSPRING_AXIS_Z: number = 5;

    /**@internal */
    _minDistance: number = 0;
    /**@internal */
    _maxDistance: number = Number.MAX_VALUE;

    protected _createJoint(): void {
        var bt = btPhysicsCreateUtil._bt;
        // last param 0 is R0.XYZ
        this._manager && this._manager.removeJoint(this);
        if (this._collider && this._connectCollider) {
            this._btJoint = bt.btGeneric6DofSpring2Constraint_create((this._collider as btRigidBodyCollider)._btCollider, this._btTempTrans0, (this._connectCollider as btRigidBodyCollider)._btCollider, this._btTempTrans1, 0);
            this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
            bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
            bt.btTypedConstraint_setEnabled(this._btJoint, true);
            this._initJointConstraintInfo();
            this._manager.addJoint(this);
        }
    }
    /**
     * @internal
     * @en Initializes the joint constraint information.
     * @zh 初始化关节约束信息。
     */
    _initJointConstraintInfo() {
        let bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_X, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_Y, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.ANGULARSPRING_AXIS_Z, 0, 0);

        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_X, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, 0, 0);
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Z, 0, 0);
    }
    /**
     * @ignore
     * @en Creates an instance of the `btSpringJoint` class.
     * @param manager The physics manager.
     * @zh 创建一个btSpringJoint类的实例。
     * @param manager 物理管理器。
     */
    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    /**
     * @en Sets the local position of the joint.
     * @param pos The local position.
     * @zh 设置关节的局部位置。
     * @param pos 局部位置。
     */
    setLocalPos(pos: Vector3): void {
        super.setLocalPos(pos);
        let bt = btPhysicsCreateUtil._bt;
        this._btJoint && bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    /**
     * @en Sets the connected local position of the joint.
     * @param pos The connected local position.
     * @zh 设置关节连接的局部位置。
     * @param pos 连接局部位置。
     */
    setConnectLocalPos(pos: Vector3): void {
        super.setConnectLocalPos(pos);
        let bt = btPhysicsCreateUtil._bt;
        this._btJoint && bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    /**
     * @en Sets the swing offset of the joint.
     * @param value The swing offset.
     * @zh 设置关节的摆动偏移量。
     * @param value 摆动偏移量。
     */
    setSwingOffset(value: Vector3): void {
        //TODO bullet
        throw new Error("Method not implemented.");
    }
    /**
     * @en Sets the minimum distance of the spring joint.
     * @param distance The minimum distance value.
     * @zh 设置弹簧关节的最小距离。
     * @param distance 最小距离值。
     */
    setMinDistance(distance: number): void {
        if (!this._btJoint)
            return;
        if (distance == this._minDistance) {
            return;
        }
        this._minDistance = distance;
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, this._minDistance, this._maxDistance);
    }
    /**
     * @en Sets the maximum distance of the spring joint.
     * @param distance The maximum distance value.
     * @zh 设置弹簧关节的最大距离。
     * @param distance 最大距离值。
     */
    setMaxDistance(distance: number): void {
        if (!this._btJoint)
            return;
        if (distance == this._maxDistance) {
            return;
        }
        this._maxDistance = distance;
        var bt = btPhysicsCreateUtil._bt;
        bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, this._minDistance, this._maxDistance);
    }
    /**
     * @ignore 
     */
    setTolerance(tolerance: number): void {
        // TODO
        // is bullet has this param?
        // throw new Error("Method not implemented.");
    }
    /**
     * @en Sets the stiffness of the spring joint.
     * @param stiffness The stiffness value.
     * @zh 设置弹簧关节的刚度。
     * @param stiffness 刚度值。
     */
    setStiffness(stiffness: number): void {
        var bt = btPhysicsCreateUtil._bt;
        var enableSpring: Boolean = stiffness > 0;
        // in btSpringJoint only Y-Axis default
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, enableSpring);
        if (enableSpring)
            bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, stiffness, true);
    }
    /**
     * @en Sets the damping of the spring joint.
     * @param damping The damping value.
     * @zh 设置弹簧关节的阻尼。
     * @param damping 阻尼值。
     */
    setDamping(damping: number): void {
        if (!this._btJoint)
            return;
        var bt = btPhysicsCreateUtil._bt;
        damping = damping <= 0 ? 0 : damping;
        bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, btSpringJoint.LINEARSPRING_AXIS_Y, damping, true);
    }

    /**
     * @en Destroy joint
     * @zh 销毁关节
     */
    destroy(): void {
        this._btJoint = null;
        this._btJointFeedBackObj = null;
        super.destroy();
    }
}