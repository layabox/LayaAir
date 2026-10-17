import {
    IPhysicsVehicle, VehicleApplyResult, VehicleChangeFlags, VehicleChanges,
    VehicleDesc, VehicleWheelDesc, VehicleWheelInput, VehicleWheelState
} from "../../interface/IVehicle/IPhysicsVehicle";
import { btRigidBodyCollider } from "../Collider/btRigidBodyCollider";
import { btStatics } from "../btStatics";
import type { btPhysicsManager } from "../btPhysicsManager";
import { btWheelCollider } from "./btWheelCollider";

/** Bullet implementation using native btRaycastVehicle. */
export class btVehicle implements IPhysicsVehicle {
    private _btVehicle: number = 0;
    private _btPhysicsWorld: number = 0;
    private _vehicleBody: btRigidBodyCollider;
    private _wheels: btWheelCollider[] = [];
    private _inputs: VehicleWheelInput[] = [];
    private _enabled: boolean = false;
    private _destroyed: boolean = false;
    private _wakeRequested: boolean = false;
    private _fixedDeltaTime: number = 1 / 60;

    constructor(private _physicsManager: btPhysicsManager, desc: VehicleDesc) {
        this._build(desc);
    }

    private _build(desc: VehicleDesc): void {
        const bt = btStatics.bt;
        this._vehicleBody = desc.chassis as btRigidBodyCollider;
        this._btPhysicsWorld = (this._physicsManager as any)._btDiscreteDynamicsWorld;
        const rigidBody = (this._vehicleBody as any)._btCollider as number;
        if (!this._btPhysicsWorld || !rigidBody)
            throw new Error("Bullet vehicle requires an active dynamics world and chassis rigid body.");

        this._btVehicle = bt.btRaycastVehicle_create(this._btPhysicsWorld, rigidBody);
        if (!this._btVehicle)
            throw new Error("Bullet failed to create btRaycastVehicle.");
        bt.btRaycastVehicle_setCoordinateSystem(this._btVehicle, 0, 1, 2);

        const mass = Math.max(desc.chassisMass, 0.0001);
        for (let i = 0; i < desc.wheels.length; i++) {
            const wheelDesc = desc.wheels[i];
            const wheelInfo = bt.btRaycastVehicle_addWheel(
                this._btVehicle,
                wheelDesc.centerX, wheelDesc.centerY, wheelDesc.centerZ,
                0, -1, 0,
                -1, 0, 0,
                wheelDesc.suspensionRestLength,
                wheelDesc.radius,
                wheelDesc.springStiffness / mass,
                wheelDesc.compressionDamping / mass,
                wheelDesc.reboundDamping / mass,
                wheelDesc.frictionStiffness,
                wheelDesc.maxSuspensionTravel * 100.0,
                wheelDesc.maxSuspensionForce,
                false
            );
            if (!wheelInfo) {
                this.destroy();
                throw new Error("Bullet failed to create vehicle wheel " + i + ".");
            }
            const wheel = new btWheelCollider(this._btVehicle, i);
            wheel.applyConfig(wheelDesc, desc.chassisMass);
            this._wheels.push(wheel);
            this._inputs.push({ motorForce: 0, brakeForce: 0, steerAngle: 0 });
        }
    }

    setEnabled(value: boolean): void {
        if (this._destroyed || this._enabled === value)
            return;
        const bt = btStatics.bt;
        if (value)
            bt.btDynamicsWorld_addAction(this._btPhysicsWorld, this._btVehicle);
        else
            bt.btDynamicsWorld_removeAction(this._btPhysicsWorld, this._btVehicle);
        this._enabled = value;
    }

    applyConfig(desc: VehicleDesc, changes: VehicleChanges): VehicleApplyResult {
        if (this._destroyed || desc.chassis !== this._vehicleBody)
            return VehicleApplyResult.Invalid;
        if (desc.wheels.length !== this._wheels.length)
            return VehicleApplyResult.RebuildRequired;
        if (!this._validateDesc(desc))
            return VehicleApplyResult.Invalid;

        if ((changes.flags & VehicleChangeFlags.ChassisMass) !== 0) {
            for (let i = 0; i < this._wheels.length; i++)
                this._wheels[i].applyConfig(desc.wheels[i], desc.chassisMass);
        } else {
            for (let i = 0; i < changes.changedWheelIndices.length; i++) {
                const index = changes.changedWheelIndices[i];
                this._wheels[index].applyConfig(desc.wheels[index], desc.chassisMass);
            }
        }
        return VehicleApplyResult.Applied;
    }

    private _validateDesc(desc: VehicleDesc): boolean {
        if (!(desc.chassisMass > 0) || !Number.isFinite(desc.chassisMass))
            return false;
        for (let i = 0; i < desc.wheels.length; i++) {
            const wheel = desc.wheels[i];
            if (!this._validateWheel(wheel))
                return false;
        }
        return true;
    }

    private _validateWheel(wheel: VehicleWheelDesc): boolean {
        return Number.isFinite(wheel.centerX) && Number.isFinite(wheel.centerY) && Number.isFinite(wheel.centerZ)
            && Number.isFinite(wheel.radius) && wheel.radius > 0
            && Number.isFinite(wheel.suspensionRestLength) && wheel.suspensionRestLength >= 0
            && Number.isFinite(wheel.maxSuspensionTravel) && wheel.maxSuspensionTravel >= 0
            && Number.isFinite(wheel.springStiffness) && wheel.springStiffness >= 0
            && Number.isFinite(wheel.compressionDamping) && wheel.compressionDamping >= 0
            && Number.isFinite(wheel.reboundDamping) && wheel.reboundDamping >= 0
            && Number.isFinite(wheel.maxSuspensionForce) && wheel.maxSuspensionForce >= 0
            && Number.isFinite(wheel.frictionStiffness) && wheel.frictionStiffness >= 0;
    }

    setInputs(inputs: readonly VehicleWheelInput[]): void {
        if (this._destroyed)
            return;
        const count = Math.min(inputs.length, this._wheels.length);
        for (let i = 0; i < count; i++) {
            if (this._inputs[i].steerAngle !== inputs[i].steerAngle)
                this._wakeRequested = true;
            this._inputs[i].motorForce = inputs[i].motorForce;
            this._inputs[i].brakeForce = inputs[i].brakeForce;
            this._inputs[i].steerAngle = inputs[i].steerAngle;
        }
        for (let i = count; i < this._inputs.length; i++) {
            if (this._inputs[i].steerAngle !== 0)
                this._wakeRequested = true;
            this._inputs[i].motorForce = 0;
            this._inputs[i].brakeForce = 0;
            this._inputs[i].steerAngle = 0;
        }
    }

    beforePhysicsStep(fixedDeltaTime: number): void {
        if (!this._enabled || this._destroyed)
            return;
        this._fixedDeltaTime = fixedDeltaTime;
        const bt = btStatics.bt;
        let shouldWake = this._wakeRequested;
        this._wakeRequested = false;
        for (let i = 0; i < this._inputs.length; i++) {
            const input = this._inputs[i];
            shouldWake ||= input.motorForce !== 0 || input.brakeForce !== 0;
            bt.btRaycastVehicle_applyEngineForce(this._btVehicle, input.motorForce, i);
            // Bullet expects a maximum braking impulse; the public API is force in newtons.
            bt.btRaycastVehicle_setBrake(this._btVehicle, input.brakeForce * fixedDeltaTime, i);
            bt.btRaycastVehicle_setSteeringValue(this._btVehicle, input.steerAngle, i);
        }
        if (shouldWake)
            this._vehicleBody.wakeUp();
    }

    afterPhysicsStep(fixedDeltaTime: number): void {
        if (!this._enabled || this._destroyed)
            return;
        this._fixedDeltaTime = fixedDeltaTime;
        for (let i = 0; i < this._wheels.length; i++)
            this._wheels[i].capturePhysicsState(fixedDeltaTime);
        for (let i = 0; i < this._wheels.length; i++)
            this._wheels[i].updateWorldTransform();
    }

    readStates(outStates: VehicleWheelState[]): void {
        const count = Math.min(outStates.length, this._wheels.length);
        for (let i = 0; i < count; i++)
            this._wheels[i].readState(outStates[i], this._fixedDeltaTime);
    }

    reset(): void {
        if (this._destroyed)
            return;
        btStatics.bt.btRaycastVehicle_resetSuspension(this._btVehicle);
        for (let i = 0; i < this._wheels.length; i++) {
            this._wheels[i].resetState();
            this._inputs[i].motorForce = 0;
            this._inputs[i].brakeForce = 0;
            this._inputs[i].steerAngle = 0;
            btStatics.bt.btRaycastVehicle_applyEngineForce(this._btVehicle, 0, i);
            btStatics.bt.btRaycastVehicle_setBrake(this._btVehicle, 0, i);
            btStatics.bt.btRaycastVehicle_setSteeringValue(this._btVehicle, 0, i);
        }
        this._vehicleBody.wakeUp();
    }

    destroy(): void {
        if (this._destroyed)
            return;
        this.setEnabled(false);
        for (let i = 0; i < this._wheels.length; i++)
            this._wheels[i].destroy();
        this._wheels.length = 0;
        this._inputs.length = 0;
        if (this._btVehicle)
            btStatics.bt.btRaycastVehicle_destroy(this._btVehicle);
        this._btVehicle = 0;
        this._btPhysicsWorld = 0;
        this._vehicleBody = null;
        this._physicsManager = null;
        this._destroyed = true;
    }
}
