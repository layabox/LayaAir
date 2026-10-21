import type { Rigidbody3D } from "../../../d3/physics/Rigidbody3D";
import { PhysicsForceMode } from "../../../d3/physics/PhysicsColliderComponent";
import { Matrix3x3 } from "../../../maths/Matrix3x3";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { NotImplementedError } from "../../../utils/Error";
import { D6Axis, D6Drive, D6MotionType, ID6Joint } from "../../interface/Joint/ID6Joint";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btPhysicsManager } from "../btPhysicsManager";
import { btStatics } from "../btStatics";
import { btJoint } from "./btJoint";
/**
 * @en The `btCustomJoint` class is used for detailed control of joints.
 * @zh 类`btCustomJoint`用于实现关节的详细控制。
 */
export class btCustomJoint extends btJoint implements ID6Joint {
    private _linearDrives = Array.from({ length: 3 }, () => ({ stiffness: 0, damping: 0, forceLimit: 0 }));
    private _drivePosition = new Vector3();
    private _driveVelocity = new Vector3();
    private _drivesEnabled = true;
    private _driveRegistered = false;
    private _driveScratch: Vector3[];
    private static readonly _driveKeys = ["x", "y", "z"] as const;
    private _driveStep = { beforePhysicsStep: (dt: number) => this._applyLinearDrives(dt), afterPhysicsStep: (_dt: number) => {} };

    isEnable(value: boolean): void {
        this._drivesEnabled = value;
        super.isEnable(value);
    }

    private _applyLinearDrives(deltaTime: number): void {
        const a = this._collider as btRigidBodyCollider;
        const b = this._connectCollider as btRigidBodyCollider;
        if (!this._drivesEnabled || !this._btJoint || !a || !b || a._destroyed || b._destroyed) return;
        const scratch = this._driveScratch;
        const pa = scratch[0], pb = scratch[1], ra = scratch[2], rb = scratch[3];
        Vector3.transformCoordinate(this._anchor, a.owner.transform.worldMatrix, pa);
        Vector3.transformCoordinate(this._connectAnchor, b.owner.transform.worldMatrix, pb);
        Vector3.subtract(pa, a.owner.transform.position, ra);
        Vector3.subtract(pb, b.owner.transform.position, rb);
        const aDynamic = a instanceof btRigidBodyCollider, bDynamic = b instanceof btRigidBodyCollider;
        const va = scratch[4], vb = scratch[5], spin = scratch[6];
        if (aDynamic) a.getLinearVelocity().cloneTo(va); else va.setValue(0, 0, 0);
        if (bDynamic) b.getLinearVelocity().cloneTo(vb); else vb.setValue(0, 0, 0);
        if (aDynamic) { Vector3.cross(a.getAngularVelocity(), ra, spin); Vector3.add(va, spin, va); }
        if (bDynamic) { Vector3.cross(b.getAngularVelocity(), rb, spin); Vector3.add(vb, spin, vb); }
        const delta = scratch[7], velocity = scratch[8];
        Vector3.subtract(pb, pa, delta); Vector3.subtract(vb, va, velocity);
        const x = scratch[9], y = scratch[10], z = scratch[11];
        this._axis.cloneTo(x);
        x.normalize(); Vector3.cross(x, this._secondAxis, z); z.normalize(); Vector3.cross(z, x, y);
        const keys = btCustomJoint._driveKeys;
        const inverseMass = (aDynamic && !(a.component as Rigidbody3D).isKinematic ? 1 / Math.max((a.component as Rigidbody3D).mass, 1e-7) : 0)
            + (bDynamic && !(b.component as Rigidbody3D).isKinematic ? 1 / Math.max((b.component as Rigidbody3D).mass, 1e-7) : 0);
        const force = scratch[12];
        force.setValue(0, 0, 0);
        for (let i = 0; i < 3; i++) {
            const drive = this._linearDrives[i];
            const motion = i === 0 ? this._linearXMotion : i === 1 ? this._linearYMotion : this._linearZMotion;
            if (motion === D6Axis.eLOCKED || !(drive.forceLimit > 0)) continue;
            const axis = scratch[9 + i]; Vector3.transformQuat(axis, a.owner.transform.rotation, axis);
            const error = this._drivePosition[keys[i]] - Vector3.dot(delta, axis);
            const speed = Vector3.dot(velocity, axis);
            const speedError = this._driveVelocity[keys[i]] - speed;
            // Backward Euler PD avoids an explicit spring becoming unstable for
            // light bodies or high stiffness at the configured fixed step.
            const denominator = 1 + inverseMass * deltaTime * (drive.damping + drive.stiffness * deltaTime);
            const requestedForce = (drive.stiffness * (error - deltaTime * speed) + drive.damping * speedError) / denominator;
            const amount = Math.max(-drive.forceLimit, Math.min(drive.forceLimit, requestedForce));
            force.x += axis.x * amount; force.y += axis.y * amount; force.z += axis.z * amount;
        }
        if (force.lengthSquared() < 1e-12) return;
        if (bDynamic && !(b.component as Rigidbody3D).isKinematic) b.addForce(force, PhysicsForceMode.Force, rb);
        if (aDynamic && !(a.component as Rigidbody3D).isKinematic) { Vector3.scale(force, -1, force); a.addForce(force, PhysicsForceMode.Force, ra); }
    }


    /**
     * @internal
     * @en Minimum angular limit for X-axis rotation
     * @zh X轴旋转的最小角度限制
     */
    _minAngularXLimit: number = 0;
    /**
     * @internal
     * @en Maximum angular limit for X-axis rotation
     * @zh X轴旋转的最大角度限制
     */
    _maxAngularXLimit: number = 0;
    /**
     * @internal
     * @en Minimum angular limit for Y-axis rotation
     * @zh Y轴旋转的最小角度限制
     */
    _minAngularYLimit: number = 0;
    /**
     * @internal
     * @en Maximum angular limit for Y-axis rotation
     * @zh Y轴旋转的最大角度限制
     */
    _maxAngularYLimit: number = 0;
    /**
     * @internal
     * @en Minimum angular limit for Z-axis rotation
     * @zh Z轴旋转的最小角度限制
     */
    _minAngularZLimit: number = 0;
    /**
     * @internal
     * @en Maximum angular limit for Z-axis rotation
     * @zh Z轴旋转的最大角度限制
     */
    _maxAngularZLimit: number = 0;
    /**
     * @internal
     * @en Minimum distance limit
     * @zh 最小距离限制
     */
    _minLinearLimit: number = 0;
    /**
     * @internal
     * @en Maximum distance limit
     * @zh 最大距离限制
     */
    _maxLinearLimit: number = 0;
    /**
     * @internal
     * @en Linear motion along X-axis
     * @zh X轴方向的线性运动
     */
    _linearXMotion: D6Axis = D6Axis.eFREE;
    /**
     * @internal
     * @en Linear motion along Y-axis
     * @zh Y轴方向的线性运动
     */
    _linearYMotion: D6Axis = D6Axis.eFREE;
    /**
     * @internal
     * @en Linear motion along Z-axis
     * @zh Z轴方向的线性运动
     */
    _linearZMotion: D6Axis = D6Axis.eFREE;
    /**
     * @internal
     * @en Angular motion around X-axis
     * @zh 绕X轴的角运动
     */
    _angularXMotion: D6Axis = D6Axis.eFREE;
    /**
     * @internal
     * @en Angular motion around Y-axis
     * @zh 绕Y轴的角运动
     */
    _angularYMotion: D6Axis = D6Axis.eFREE;
    /**
     * @internal
     * @en Angular motion around Z-axis
     * @zh 绕Z轴的角运动
     */
    _angularZMotion: D6Axis = D6Axis.eFREE;

    /**
     * @internal
     * @en axis constraint
     * @zh 轴限制
     */
    _axis: Vector3 = new Vector3(1, 0, 0);
    /**
     * @internal
     * @en Secondary axis constraint
     * @zh 副轴限制
     */
    _secondAxis: Vector3 = new Vector3(0, 1, 0);

    /**
     * @internal
     * @en Bullet physics primary axis representation
     * @zh Bullet物理引擎的轴表示
     */
    _btAxis: number;
    /**
     * @internal
     * @en Bullet physics secondary axis representation
     * @zh Bullet物理引擎的副轴表示
     */
    _btsceondAxis: number;

    /**
     * @en Initializes the joint.
     * @zh 初始化关节。
     */
    initJoint() {
        super.initJoint();
        this._btAxis = btStatics.bt.btVector3_create(-1.0, 0.0, 0.0);
        this._btsceondAxis = btStatics.bt.btVector3_create(0.0, 1.0, 0.0);
    }

    protected _createJoint(): void {
        let bt = btStatics.bt;
        this._btJoint && this._manager && this._manager.removeJoint(this);
        if ((this._collider as btRigidBodyCollider)?._btCollider && (this._connectCollider as btRigidBodyCollider)?._btCollider) {
            this._btJoint = bt.btGeneric6DofSpring2Constraint_create((this._collider as btRigidBodyCollider)._btCollider, this._btTempTrans0, (this._connectCollider as btRigidBodyCollider)._btCollider, this._btTempTrans1, 0);
            this._btJointFeedBackObj = bt.btJointFeedback_create(this._btJoint);
            bt.btTypedConstraint_setJointFeedback(this._btJoint, this._btJointFeedBackObj);
            bt.btTypedConstraint_setEnabled(this._btJoint, true);
            this._initAllConstraintInfo();
            this._manager && this._manager.addJoint(this);
        }
    }

    /**
     * @en Initializes all constraint information for the joint.
     * @zh 初始化关节的所有约束信息。
     */
    _initAllConstraintInfo(): void {
        //MotionMode
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eX);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eY);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eZ);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eTWIST);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eSWING1);
        this.setMotion(D6Axis.eLOCKED, D6MotionType.eSWING2);
    }

    /**
     * @ignore
     * @en Creates an instance of btCustomJoint.
     * @param manager The Bullet physics manager instance used to handle physics simulations.
     * @zh 创建一个btCustomJoint的实例。
     * @param manager 用于处理物理模拟的Bullet物理管理器实例。
     */
    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    /**
     * TODO
     * @internal
     * @en Sets the equilibrium point for a specific axis of the constraint.
     * @param axis The axis index to set the equilibrium point for.
     * @param equilibriumPoint The equilibrium point value to set.
     * @zh 为约束的特定轴设置平衡点。
     * @param axis 要设置平衡点的轴索引。
     * @param equilibriumPoint 要设置的平衡点值。
     */
    setEquilibriumPoint(axis: number, equilibriumPoint: number): void {
        btStatics.bt.btGeneric6DofSpring2Constraint_setEquilibriumPoint(this._btJoint, axis, equilibriumPoint);
    }

    /**
     * @en Sets the local position of the joint.
     * @param pos The new local position vector.
     * @zh 设置关节的局部位置。
     * @param pos 新的局部位置向量。
     */
    setLocalPos(pos: Vector3): void {
        super.setLocalPos(pos);
        this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    /**
     * @en Sets the connected local position of the joint.
     * @param pos The new connected local position vector.
     * @zh 设置关节的连接局部位置。
     * @param pos 新的连接局部位置向量。
     */
    setConnectLocalPos(pos: Vector3): void {
        super.setConnectLocalPos(pos);
        this._btJoint && btStatics.bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    /**
     * @en Sets the primary and secondary axes for the joint.
     * @param axis The primary axis vector.
     * @param secendary The secondary axis vector.
     * @zh 设置关节的主轴和次轴。
     * @param axis 主轴向量。
     * @param secendary 次轴向量。
     */
    setAxis(axis: Vector3, secendary: Vector3): void {
        var bt = btStatics.bt;
        // Bullet's setAxis rebuilds the frames around the world origin and loses
        // local anchors. Build both local bases explicitly instead.
        const x = new Vector3(axis.x, axis.y, axis.z);
        const y = new Vector3(secendary.x, secendary.y, secendary.z);
        const z = new Vector3();
        x.normalize();
        Vector3.cross(x, y, z);
        const crossLength = z.lengthSquared();
        if (!(crossLength >= 1e-12) || !Number.isFinite(crossLength)) return;
        z.normalize();
        Vector3.cross(z, x, y);
        this._axis.setValue(axis.x, axis.y, axis.z);
        this._secondAxis.setValue(secendary.x, secendary.y, secendary.z);
        bt.btVector3_setValue(this._btAxis, -axis.x, axis.y, axis.z);
        bt.btVector3_setValue(this._btsceondAxis, -secendary.x, secendary.y, secendary.z);
        const matrix = new Matrix3x3();
        matrix.elements.set([x.x, x.y, x.z, y.x, y.y, y.z, z.x, z.y, z.z]);
        const rotation = new Quaternion();
        Quaternion.rotationMatrix(matrix, rotation);
        const nativeRotation = bt.btQuaternion_create(rotation.x, rotation.y, rotation.z, rotation.w);
        bt.btTransform_setRotation(this._btTempTrans0, nativeRotation);
        bt.btTransform_setRotation(this._btTempTrans1, nativeRotation);
        bt.btQuaternion_delete(nativeRotation);
        bt.btGeneric6DofSpring2Constraint_setFrames(this._btJoint, this._btTempTrans0, this._btTempTrans1);
    }

    /**
     * @internal
     * @en Sets the limit values for each axis.
     * @param axis The constraint type.
     * @param motionType The motion type.
     * @param low The lower limit (optional).
     * @param high The upper limit (optional).
     * @zh 设置各个轴限制值。
     * @param axis 限制类型。
     * @param motionType 运动类型。
     * @param low 下限（可选）。
     * @param high 上限（可选）。
     */
    _setLimit(axis: D6Axis, motionType: D6MotionType, low?: number, high?: number): void {
        let lowLimit = 0;
        let maxLimit = 0;
        if (motionType == D6MotionType.eX || motionType == D6MotionType.eY || motionType == D6MotionType.eZ) {
            // linear motion
            lowLimit = this._minLinearLimit;
            maxLimit = this._maxLinearLimit;
        } else {
            if (motionType == D6MotionType.eTWIST) {
                // angular motion
                lowLimit = this._minAngularXLimit;
                maxLimit = this._maxAngularXLimit;
            } else if (motionType == D6MotionType.eSWING1) {
                // angular motion
                lowLimit = this._minAngularYLimit;
                maxLimit = this._maxAngularYLimit;
            } else if (motionType == D6MotionType.eSWING2) {
                // angular motion
                lowLimit = this._minAngularZLimit;
                maxLimit = this._maxAngularZLimit;
            }
        }
        let bt = btStatics.bt;
        if (axis == D6Axis.eFREE) {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, 1, 0);
        } else if (axis == D6Axis.eLIMITED) {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, lowLimit, maxLimit);
        } else if (axis == D6Axis.eLOCKED) {
            bt.btGeneric6DofSpring2Constraint_setLimit(this._btJoint, motionType, 0, 0);
        }
    }

    /**
     * @internal
     * @en Sets the spring properties for each axis.
     * @param axis The constraint type.
     * @param motionType The motion type.
     * @param springValue The spring stiffness value.
     * @param limitIfNeeded Whether to set the limit if needed (default: true).
     * @zh 设置各个轴的弹簧属性值。
     * @param axis 约束类型。
     * @param motionType 运动类型。
     * @param springValue 弹簧刚度值。
     * @param limitIfNeeded 是否在需要时设置限制（默认：true）。
     */
    _setSpring(axis: D6Axis, motionType: D6MotionType, springValue: number, limitIfNeeded: boolean = true): void {
        let bt = btStatics.bt;
        var enableSpring: Boolean = springValue > 0 && axis == D6Axis.eLIMITED;
        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btJoint, motionType, enableSpring);
        if (enableSpring)
            bt.btGeneric6DofSpring2Constraint_setStiffness(this._btJoint, motionType, springValue, limitIfNeeded);
    }

    /**
     * @internal
     * @en Sets the bounce value for each axis.
     * @param axis The constraint type.
     * @param motionType The motion type.
     * @param bounce The bounce value.
     * @zh 设置各个轴的弹力值。
     * @param axis 约束类型。
     * @param motionType 运动类型。
     * @param bounce 弹力值。
     */
    _setBounce(axis: D6Axis, motionType: D6MotionType, bounce: number): void {
        if (axis == D6Axis.eLIMITED) {
            bounce = bounce <= 0 ? 0 : bounce;
            btStatics.bt.btGeneric6DofSpring2Constraint_setBounce(this._btJoint, motionType, bounce);
        }
    }

    /**
     * @internal
     * @en Sets the damping value for each axis of the constraint.
     * @param axis The constraint type.
     * @param motionType The motion type.
     * @param damp The damping value.
     * @param limitIfNeeded Whether to set the limit if needed (default: true).
     * @zh 设置各个轴的阻尼值。
     * @param axis 约束类型。
     * @param motionType 运动类型。
     * @param damp 阻尼值。
     * @param limitIfNeeded 是否在需要时设置限制（默认：true）。
     */
    _setDamp(axis: D6Axis, motionType: D6MotionType, damp: number, limitIfNeeded: boolean = true): void {
        if (axis == D6Axis.eLIMITED) {
            damp = damp <= 0 ? 0 : damp;
            btStatics.bt.btGeneric6DofSpring2Constraint_setDamping(this._btJoint, motionType, damp, limitIfNeeded);
        }
    }

    /**
     * @en Sets the motion type for a specific axis of the constraint.
     * @param axis The constraint type to set.
     * @param motionType The motion type to apply.
     * @zh 设置约束特定轴的运动类型。
     * @param axis 要设置的约束类型。
     * @param motionType 要应用的运动类型。
     */
    setMotion(axis: D6Axis, motionType: D6MotionType): void {
        switch (motionType) {
            case D6MotionType.eX:
                this._linearXMotion = axis;
                break;
            case D6MotionType.eY:
                this._linearYMotion = axis;
                break;
            case D6MotionType.eZ:
                this._linearZMotion = axis;
                break;
            case D6MotionType.eTWIST:
                this._angularXMotion = axis;
                break;
            case D6MotionType.eSWING1:
                this._angularYMotion = axis;
                break;
            case D6MotionType.eSWING2:
                this._angularZMotion = axis;
                break;
            default:
                break;
        }
        this._setLimit(axis, motionType);
    }

    /**
     * @en Sets the distance limit for the constraint.
     * @param limit The distance limit.
     * @param bounceness The bounciness of the constraint.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring stiffness.
     * @param damp The damping value.
     * @zh 设置约束的距离限制。
     * @param limit 距离限制。
     * @param bounceness 约束的弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧刚度。
     * @param damp 阻尼值。
     */
    setDistanceLimit(limit: number, bounceness: number, bounceThreshold: number, spring: number, damp: number): void {
        this._minLinearLimit = -limit;
        this._maxLinearLimit = limit;
        // linear limit
        this._setLimit(this._linearXMotion, D6MotionType.eX);
        this._setLimit(this._linearYMotion, D6MotionType.eY);
        this._setLimit(this._linearZMotion, D6MotionType.eZ);
        // linear spring
        this._setSpring(this._linearXMotion, D6MotionType.eX, spring);
        this._setSpring(this._linearYMotion, D6MotionType.eX, spring);
        this._setSpring(this._linearZMotion, D6MotionType.eX, spring);
        // bounce
        this._setBounce(this._linearXMotion, D6MotionType.eX, bounceness);
        this._setBounce(this._linearYMotion, D6MotionType.eY, bounceness);
        this._setBounce(this._linearZMotion, D6MotionType.eZ, bounceness);
        // damp
        this._setDamp(this._linearXMotion, D6MotionType.eX, damp);
        this._setDamp(this._linearYMotion, D6MotionType.eY, damp);
        this._setDamp(this._linearZMotion, D6MotionType.eZ, damp);

    }

    /**
     * @en Sets the linear limit for a specific axis of the constraint.
     * @param linearAxis The linear axis to set the limit for.
     * @param upper The upper limit.
     * @param lower The lower limit.
     * @param bounceness The bounciness of the constraint.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring stiffness.
     * @param damping The damping value.
     * @zh 设置约束特定轴的线性限制。
     * @param linearAxis 要设置限制的线性轴。
     * @param upper 上限。
     * @param lower 下限。
     * @param bounceness 约束的弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧刚度。
     * @param damping 阻尼值。
     */
    setLinearLimit(linearAxis: D6MotionType, upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._minLinearLimit = lower;
        this._maxLinearLimit = upper;
        // linear limit
        this._setLimit(this._linearXMotion, linearAxis);
        this._setLimit(this._linearYMotion, linearAxis);
        this._setLimit(this._linearZMotion, linearAxis);
        // linear spring
        this._setSpring(this._linearXMotion, linearAxis, spring);
        this._setSpring(this._linearYMotion, linearAxis, spring);
        this._setSpring(this._linearZMotion, linearAxis, spring);
        // bounce
        this._setBounce(this._linearXMotion, linearAxis, bounceness);
        this._setBounce(this._linearYMotion, linearAxis, bounceness);
        this._setBounce(this._linearZMotion, linearAxis, bounceness);
        // damp
        this._setDamp(this._linearXMotion, linearAxis, damping);
        this._setDamp(this._linearYMotion, linearAxis, damping);
        this._setDamp(this._linearZMotion, linearAxis, damping);
    }

    /**
     * @en Sets the twist limit for the constraint.
     * @param upper The upper twist limit (in radians).
     * @param lower The lower twist limit (in radians).
     * @param bounceness The bounciness of the constraint.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring stiffness.
     * @param damping The damping value.
     * @zh 设置约束的扭转限制。
     * @param upper 上扭转限制（弧度）。
     * @param lower 下扭转限制（弧度）。
     * @param bounceness 约束的弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧刚度。
     * @param damping 阻尼值。
     */
    setTwistLimit(upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        this._minAngularYLimit = lower / Math.PI * 180;
        this._maxAngularYLimit = upper / Math.PI * 180;
        // angular limit
        this._setLimit(this._angularXMotion, D6MotionType.eTWIST);
        this._setLimit(this._angularYMotion, D6MotionType.eSWING1);
        this._setLimit(this._angularZMotion, D6MotionType.eSWING2);
        // angular spring
        this._setSpring(this._angularXMotion, D6MotionType.eTWIST, spring);
        this._setSpring(this._angularYMotion, D6MotionType.eSWING1, spring);
        this._setSpring(this._angularZMotion, D6MotionType.eSWING2, spring);
        // bounce
        this._setBounce(this._angularXMotion, D6MotionType.eTWIST, bounceness);
        this._setBounce(this._angularYMotion, D6MotionType.eSWING1, bounceness);
        this._setBounce(this._angularZMotion, D6MotionType.eSWING2, bounceness);
        // damp
        this._setDamp(this._angularXMotion, D6MotionType.eTWIST, damping);
        this._setDamp(this._angularYMotion, D6MotionType.eSWING1, damping);
        this._setDamp(this._angularZMotion, D6MotionType.eSWING2, damping);
    }

    /**
     * @en Sets the swing limit for the constraint.
     * @param yAngle The Y-axis swing limit (in radians).
     * @param zAngle The Z-axis swing limit (in radians).
     * @param bounceness The bounciness of the constraint.
     * @param bounceThreshold The bounce threshold.
     * @param spring The spring stiffness.
     * @param damping The damping value.
     * @zh 设置约束的摆动限制。
     * @param yAngle Y轴摆动限制（弧度）。
     * @param zAngle Z轴摆动限制（弧度）。
     * @param bounceness 约束的弹性。
     * @param bounceThreshold 弹跳阈值。
     * @param spring 弹簧刚度。
     * @param damping 阻尼值。
     */
    setSwingLimit(yAngle: number, zAngle: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void {
        // swing angualr limit
        this._minAngularYLimit = -yAngle / Math.PI * 180;
        this._maxAngularYLimit = yAngle / Math.PI * 180;
        this._minAngularZLimit = -zAngle / Math.PI * 180;
        this._maxAngularZLimit = zAngle / Math.PI * 180;
        // linear limit
        this._setLimit(this._angularXMotion, D6MotionType.eTWIST);
        this._setLimit(this._angularYMotion, D6MotionType.eSWING1);
        this._setLimit(this._angularZMotion, D6MotionType.eSWING2);
        // linear spring
        this._setSpring(this._angularXMotion, D6MotionType.eTWIST, spring);
        this._setSpring(this._angularYMotion, D6MotionType.eSWING1, spring);
        this._setSpring(this._angularZMotion, D6MotionType.eSWING2, spring);
        // bounce
        this._setBounce(this._angularXMotion, D6MotionType.eTWIST, bounceness);
        this._setBounce(this._angularYMotion, D6MotionType.eSWING1, bounceness);
        this._setBounce(this._angularZMotion, D6MotionType.eSWING2, bounceness);
        // damp
        this._setDamp(this._angularXMotion, D6MotionType.eTWIST, damping);
        this._setDamp(this._angularYMotion, D6MotionType.eSWING1, damping);
        this._setDamp(this._angularZMotion, D6MotionType.eSWING2, damping);
    }

    /**
     * @en Sets the drive parameters for a specific axis of the constraint.
     * @param index The drive axis index.
     * @param stiffness The drive stiffness.
     * @param damping The drive damping.
     * @param forceLimit The force limit for the drive.
     * @zh 设置约束特定轴的驱动参数。
     * @param index 驱动轴索引。
     * @param stiffness 驱动刚度。
     * @param damping 驱动阻尼。
     * @param forceLimit 驱动力限制。
     */
    setDrive(index: D6Drive, stiffness: number, damping: number, forceLimit: number): void {
        if (index <= D6Drive.eZ) {
            const drive = this._linearDrives[index];
            drive.stiffness = Math.max(0, stiffness);
            drive.damping = Math.max(0, damping);
            drive.forceLimit = Math.max(0, forceLimit);
            // Spring2's native servo has no separate stiffness/damping/force-cap
            // model. Apply the PD force per fixed step while native D6 limits
            // continue to solve the constrained degrees of freedom.
            btStatics.bt.btGeneric6DofSpring2Constraint_enableMotor(this._btJoint, index, false);
            const active = this._linearDrives.some(d => d.forceLimit > 0 && (d.stiffness > 0 || d.damping > 0));
            if (active && !this._driveScratch) this._driveScratch = Array.from({ length: 13 }, () => new Vector3());
            if (active && !this._driveRegistered) this._manager.addPhysicsStepListener(this._driveStep);
            else if (!active && this._driveRegistered) this._manager.removePhysicsStepListener(this._driveStep);
            this._driveRegistered = active;
        } else {
            btStatics.bt.btGeneric6DofSpring2Constraint_enableMotor(this._btJoint, index, stiffness > 0 || damping > 0);
        }
    }

    /**
     * @en Sets the drive transform for the constraint.
     * @param position The target position.
     * @param rotate The target rotation.
     * @zh 设置约束的驱动变换。
     * @param position 目标位置。
     * @param rotate 目标旋转。
     */
    setDriveTransform(position: Vector3, rotate: Quaternion): void {
        position.cloneTo(this._drivePosition);
        // Angular target drives retain their existing backend behavior.
    }

    /**
     * @en Sets the drive velocity for the constraint.
     * @param position The target linear velocity.
     * @param angular The target angular velocity.
     * @zh 设置约束的驱动速度。
     * @param position 目标线性速度。
     * @param angular 目标角速度。
     */
    setDriveVelocity(position: Vector3, angular: Vector3): void {
        position.cloneTo(this._driveVelocity);
        let bt = btStatics.bt;
        let axis: number = D6Drive.eX;
        // position
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.x);
        axis = D6Drive.eY;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.y);
        axis = D6Drive.eZ;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, position.z);
        // angular
        axis = D6MotionType.eTWIST;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.x);
        axis = D6MotionType.eSWING1;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.y);
        axis = D6MotionType.eSWING2;
        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btJoint, axis, angular.z);
    }

    /**
     * @en Gets the current twist angle of the constraint.
     * @zh 获取约束当前的扭转角度。
     */
    getTwistAngle(): number {
        throw new NotImplementedError();
    }

    /**
     * @en Gets the current swing Y angle of the constraint.
     * @returns The current swing Y angle.
     * @zh 获取约束当前的Y轴摆动角度。
     * @returns 当前Y轴摆动角度。
     */
    getSwingYAngle(): number {
        throw new NotImplementedError();
    }

    /**
     * @en Gets the current swing Z angle of the constraint.
     * @returns The current swing Z angle.
     * @zh 获取约束当前的Z轴摆动角度。
     * @returns 当前Z轴摆动角度。
     */
    getSwingZAngle(): number {
        throw new NotImplementedError();
    }

    /**
     * @en Destroy joint
     * @zh 销毁关节
     */
    destroy(): void {
        if (this._driveRegistered) this._manager.removePhysicsStepListener(this._driveStep);
        this._driveRegistered = false;
        super.destroy();
        this._btJoint = null;
        this._btJointFeedBackObj = null;
    }
}