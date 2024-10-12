import { ISpringJoint } from "../../interface/Joint/ISpringJoint";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxJoint } from "./pxJoint";

/**
 * @en The pxDistanceJoint class represents a distance joint in the PhysX physics engine.
 * @zh pxDistanceJoint 类表示 PhysX 物理引擎中的距离关节。
 */
export class pxDistanceJoint extends pxJoint implements ISpringJoint {
    /**
     * create Joint
     */
    protected _createJoint() {
        const transform = pxJoint._tempTransform0;
        this._localPos.cloneTo(transform.translation);
        const transform1 = pxJoint._tempTransform1;
        this._connectlocalPos.cloneTo(transform1.translation);
        this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createDistanceJoint(this._collider._pxActor, transform.translation, transform.rotation, this._connectCollider._pxActor, transform1.translation, transform1.rotation);
        this._pxJoint.setUUID(this._id);
        this._pxJoint.setDistanceJointFlag(2, true); // enable max distance;
        this._pxJoint.setDistanceJointFlag(4, true); // enable min distance;
        this._pxJoint.setDistanceJointFlag(8, true); // enable spring;
    }

    /**
     * @en Sets the minimum distance for the joint.
     * @param distance The minimum distance value.
     * @zh 设置关节的最小距离。
     * @param distance 最小距离值。
     */
    setMinDistance(distance: number): void {
        this._pxJoint && this._pxJoint.setMinDistance(distance);
    }

    /**
     * @en Sets the maximum distance for the joint.
     * @param distance The maximum distance value.
     * @zh 设置关节的最大距离。
     * @param distance 最大距离值。
     */
    setMaxDistance(distance: number): void {
        this._pxJoint && this._pxJoint.setMaxDistance(distance);
    }

    /**
     * @en Sets the connect distance for the joint.
     * @param distance The connect distance value.
     * @zh 设置关节的连接距离。
     * @param distance 连接距离值。
     */
    setConnectDistance(distance: number): void {
        this._pxJoint && this._pxJoint.setConnectDistance(distance);
    }

    /**
     * @en Allows the spring to have a different rest length.
     * @param tolerance The tolerance value for the spring rest length.
     * @zh 允许弹簧具有不同的静止长度。
     * @param tolerance 弹簧静止长度的容差值。
     */
    setTolerance(tolerance: number): void {
        this._pxJoint && this._pxJoint.setTolerance(tolerance);
    }

    /**
     * @en Sets the stiffness of the joint spring.
     * @param stiffness The stiffness value.
     * @zh 设置关节弹簧的刚度。
     * @param stiffness 刚度值。
     */
    setStiffness(stiffness: number): void {
        this._pxJoint && this._pxJoint.setStiffness(stiffness);
    }

    /**
     * @en Sets the damping of the joint spring.
     * @param damping The damping value.
     * @zh 设置关节弹簧的阻尼。
     * @param damping 阻尼值。
     */
    setDamping(damping: number): void {
        this._pxJoint && this._pxJoint.setDamping(damping);
    }

    /**
     * @en Destroy joint
     * @zh 销毁关节
     */
    destroy(): void {
        this._pxJoint && this._pxJoint.release();
        super.destroy();
    }

}