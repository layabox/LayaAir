import { IDynamicCollider } from "../IDynamicCollider";
import { ICollider } from "../ICollider";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";

/** @internal Flat, immutable-for-one-step wheel configuration. */
export interface VehicleWheelDesc {
    /** Runtime identity used by the component; backends must not serialize it. */
    wheel: object;
    centerX: number;
    centerY: number;
    centerZ: number;
    radius: number;
    suspensionRestLength: number;
    maxSuspensionTravel: number;
    springStiffness: number;
    compressionDamping: number;
    reboundDamping: number;
    maxSuspensionForce: number;
    frictionStiffness: number;
}

/** @internal Complete vehicle configuration used for initial creation and updates. */
export interface VehicleDesc {
    chassis: IDynamicCollider;
    chassisMass: number;
    wheels: VehicleWheelDesc[];
}

/** @internal Per-wheel input consumed at the beginning of every fixed step. */
export interface VehicleWheelInput {
    motorForce: number;
    brakeForce: number;
    steerAngle: number;
}

/** Runtime wheel state. Instances are reused to avoid fixed-step allocations. */
export class VehicleWheelState {
    otherCollider: ICollider = null;
    contactPos: Vector3 = new Vector3();
    contactNormal: Vector3 = new Vector3(0, 1, 0);
    isContact: boolean = false;
    currentSuspensionLength: number = 0;
    suspensionForce: number = 0;
    skidInfo: number = 1;
    rotation: number = 0;
    angularSpeed: number = 0;
    rpm: number = 0;
    worldPosition: Vector3 = new Vector3();
    worldRotation: Quaternion = new Quaternion(0, 0, 0, 1);
}

export enum VehicleChangeFlags {
    None = 0,
    ChassisMass = 1,
    WheelConfig = 2
}

/** @internal Reused change list for an atomic configuration update. */
export interface VehicleChanges {
    flags: VehicleChangeFlags;
    changedWheelIndices: number[];
}

export enum VehicleApplyResult {
    Applied,
    RebuildRequired,
    Unsupported,
    Invalid
}

/** @internal Minimal backend vehicle contract. */
export interface IPhysicsVehicle {
    setEnabled(value: boolean): void;
    applyConfig(desc: VehicleDesc, changes: VehicleChanges): VehicleApplyResult;
    setInputs(inputs: readonly VehicleWheelInput[]): void;
    beforePhysicsStep(fixedDeltaTime: number): void;
    afterPhysicsStep(fixedDeltaTime: number): void;
    readStates(outStates: VehicleWheelState[]): void;
    reset(): void;
    destroy(): void;
}
