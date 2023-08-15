import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "../../interface/Joint/IJoint";
import { EJointCapable } from "../../physicsEnum/EJointCapable";
import { btCollider } from "../Collider/btCollider";
import { btPhysicsManager } from "../btPhysicsManager";

export class btJoint implements IJoint {
    /** @internal TODO*/
    static CONSTRAINT_POINT2POINT_CONSTRAINT_TYPE = 3;
    /** @internal TODO*/
    static CONSTRAINT_HINGE_CONSTRAINT_TYPE = 4;
    /** @internal TODO*/
    static CONSTRAINT_CONETWIST_CONSTRAINT_TYPE = 5;
    /** @internal TODO*/
    static CONSTRAINT_D6_CONSTRAINT_TYPE = 6;
    /** @internal TODO*/
    static CONSTRAINT_SLIDER_CONSTRAINT_TYPE = 7;
    /** @internal TODO*/
    static CONSTRAINT_CONTACT_CONSTRAINT_TYPE = 8;
    /** @internal TODO*/
    static CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE = 9;
    /** @internal TODO*/
    static CONSTRAINT_GEAR_CONSTRAINT_TYPE = 10;
    /** @internal */
    static CONSTRAINT_FIXED_CONSTRAINT_TYPE = 11;
    /** @internal TODO*/
    static CONSTRAINT_MAX_CONSTRAINT_TYPE = 12;
    /** @internal error reduction parameter (ERP)*/
    static CONSTRAINT_CONSTRAINT_ERP = 1;
    /** @internal*/
    static CONSTRAINT_CONSTRAINT_STOP_ERP = 2;
    /** @internal constraint force mixing（CFM）*/
    static CONSTRAINT_CONSTRAINT_CFM = 3;
    /** @internal*/
    static CONSTRAINT_CONSTRAINT_STOP_CFM = 4;

    /**@internal */
    _connectedBody: btCollider;
    /**@internal */
    _ownBody: btCollider;


    /**@internal */
    _id: number;
    /**@internal */
    _btJoint: any;
    /**@internal 回调参数*/
    _btJointFeedBackObj: number;
    /**@internal */
    _constraintType: number;
    _manager: btPhysicsManager;
    _connectBody: btCollider;
    /** 连接的两个物体是否进行碰撞检测 */
    _disableCollisionsBetweenLinkedBodies = false;

    _isBreakConstrained() {
        // this._getJointFeedBack = false;
        // if (this.breakForce == -1 && this.breakTorque == -1)
        //     return false;
        // this._getFeedBackInfo();
        // var isBreakForce: Boolean = this._breakForce != -1 && (Vector3.scalarLength(this._currentForce) > this._breakForce);
        // var isBreakTorque: Boolean = this._breakTorque != -1 && (Vector3.scalarLength(this._currentTorque) > this._breakTorque);
        // if (isBreakForce || isBreakTorque) {
        //     this._breakConstrained();
        //     return true;
        // }
         return false;
    }

    initJointCapable(): void {
        throw new Error("Method not implemented.");
    }

    getJointCapable(value: EJointCapable): boolean {
        return null;
    }

    setConnectedCollider(value: btCollider): void {
        throw new Error("Method not implemented.");
    }
    setConnectedAnchor(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    setConnectedMassScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setConnectedInertiaScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setMassScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setInertiaScale(value: number): void {
        throw new Error("Method not implemented.");
    }
    setBreakForce(value: number): void {
        throw new Error("Method not implemented.");
    }
    setBreakTorque(value: number): void {
        throw new Error("Method not implemented.");
    }

}