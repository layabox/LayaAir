import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { IJoint } from "./IJoint";
export enum D6MotionType {
    eX = 0,	//!< motion along the X axis
    eY = 1,	//!< motion along the Y axis
    eZ = 2,	//!< motion along the Z axis
    eTWIST = 3,	//!< motion around the X axis
    eSWING1 = 4,	//!< motion around the Y axis
    eSWING2 = 5,	//!< motion around the Z axis
}

export enum D6Axis {
    eLOCKED,	//!< The DOF is locked, it does not allow relative motion.
    eLIMITED,	//!< The DOF is limited, it only allows motion within a specific range.
    eFREE	//!< The DOF is free and has its full range of motion.
}

export enum D6Drive {
    eX = 0,	//!< drive along the X-axis
    eY = 1,	//!< drive along the Y-axis
    eZ = 2,	//!< drive along the Z-axis
    eSWING = 3,	//!< drive of displacement from the X-axis
    eTWIST = 4,	//!< drive of the displacement around the X-axis
    eSLERP = 5,	//!< drive of all three angular degrees along a SLERP-path
}

export interface ID6Joint extends IJoint {
    setAxis(axis: Vector3, secendary: Vector3): void;
    //Set the motion type around the specified axis.
    setMotion(axis: D6Axis, motionType: D6MotionType): void;
    //Set Distance limit Params
    setDistanceLimit(limit: number, bounceness: number, bounceThreshold: number, spring: number, damp: number): void;
    //x,y,z linear Limit
    setLinearLimit(linearAxis: D6MotionType, upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void;
    //The twist limit controls the range of motion around the twist axis. 
    setTwistLimit(upper: number, lower: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void;
    //锥型摆动
    setSwingLimit(yAngle: number, zAngle: number, bounceness: number, bounceThreshold: number, spring: number, damping: number): void;
    //setDrive
    setDrive(index: D6Drive, stiffness: number, damping: number, forceLimit: number): void;
    //drive Position 
    setDriveTransform(position: Vector3, rotate: Quaternion): void;
    //
    setDriveVelocity(position: Vector3, angular: Vector3): void;
    //get the twist angle of the joint, in the range (-2*Pi, 2*Pi]
    getTwistAngle(): number
    //get the swing angle of the joint from the Y axis
    getSwingYAngle(): number;
    //get the swing angle of the joint from the Z axis
    getSwingZAngle(): number;
}