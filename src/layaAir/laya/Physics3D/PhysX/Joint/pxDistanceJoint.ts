import { Vector3 } from "../../../maths/Vector3";
import { ISpringJoint } from "../../interface/Joint/ISpringJoint";
import { pxPhysicsCreateUtil } from "../pxPhysicsCreateUtil";
import { pxJoint } from "./pxJoint";

export class pxDistanceJoint extends pxJoint implements ISpringJoint {
    /**
     * create Joint
     */
    protected _createJoint() {
        const transform = pxJoint._tempTransform0;
        this._localPos.cloneTo(transform.translation);
        const transform1 = pxJoint._tempTransform1;
        this._connectlocalPos.cloneTo(transform1.translation);
        this._pxJoint = pxPhysicsCreateUtil._pxPhysics.createDistanceJoint(this._collider._pxActor, transform, this._connectCollider._pxActor, transform1)
        this._pxJoint.setUUID(this._id);
        this._pxJoint.setDistanceJointFlag(2, true); // enable max distance;
        this._pxJoint.setDistanceJointFlag(4, true); // enable min distance;
        this._pxJoint.setDistanceJointFlag(8, true); // enable spring;
    }

    /**
     * min distance
     * @param distance 
     */
    setMinDistance(distance: number): void {
        this._pxJoint && this._pxJoint.setMinDistance(distance);
    }

    /**
     * max distance
     * @param distance 
     */
    setMaxDistance(distance: number): void {
        this._pxJoint && this._pxJoint.setMaxDistance(distance);
    }

    /**
     * set connect Distance
     * @param distance 
     */
    setConnectDistance(distance: number): void {
        this._pxJoint && this._pxJoint.setConnectDistance(distance);
    }

    /**
     * 允许弹簧具有不同的静止长度。
     * @param tolerance 
     */
    setTolerance(tolerance: number): void {
        this._pxJoint && this._pxJoint.setTolerance(tolerance);
    }

    /**
     * 弹力
     * @param stiffness 
     */
    setStiffness(stiffness: number): void {
        this._pxJoint && this._pxJoint.setStiffness(stiffness);
    }

    /**
     * 弹簧阻尼
     * @param damping 
     */
    setDamping(damping: number): void {
        this._pxJoint && this._pxJoint.setDamping(damping);
    }

}