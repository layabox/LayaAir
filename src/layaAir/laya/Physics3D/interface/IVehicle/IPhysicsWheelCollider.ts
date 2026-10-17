import { VehicleWheelDesc, VehicleWheelState } from "./IPhysicsVehicle";

/** @internal Backend wheel adapter; it is never exposed by WheelCollider. */
export interface IPhysicsWheelCollider {
    applyConfig(desc: VehicleWheelDesc, chassisMass: number): void;
    readState(outState: VehicleWheelState, fixedDeltaTime: number): void;
    destroy(): void;
}
