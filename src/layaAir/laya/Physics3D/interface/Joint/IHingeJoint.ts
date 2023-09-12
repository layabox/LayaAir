import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "./IJoint";

export interface IHingeJoint extends IJoint {
    /**
     * The anchor rotation.
     */
    setAxis(value: Vector3): void;

    /**
     * The current angle in degrees of the joint relative to its rest position.
     */
    getAngle(): number;

    /**
     * The angular velocity of the joint in degrees per second.
     */
    getVelocity(): Readonly<Vector3>;

    /**
     * set limitLower
     * @param lowerLimit 
     */
    setLowerLimit(lowerLimit: number): void;

    /**
     * @param value 
     */
    setUpLimit(value: number): void;

    /**
     * @param value 
     */
    setBounceness(value: number): void;

    /**
     * @param value 
     */
    setBouncenMinVelocity(value: number): void

    /**
     * @param value 
     */
    setContactDistance(value: number): void;

    /**
     * @param value 
     */
    enableLimit(value: boolean): void;

    /**
     * @param value 
     */
    enableDrive(value: boolean): void;

    /**
     * @param value 
     */
    enableFreeSpin(value: boolean): void;

    /**
     * set the target velocity for the drive model.
     * @param velocity the drive target velocity
     */
    setDriveVelocity(velocity: number): void;

    /**
     * sets the maximum torque the drive can exert.
     * @param limit the maximum torque
     */
    setDriveForceLimit(limit: number): void;
}