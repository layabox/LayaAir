import { Component } from "../../components/Component";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { VehicleWheelState } from "../../Physics3D/interface/IVehicle/IPhysicsVehicle";
import { WheelCastInfo } from "../../Physics3D/interface/IVehicle/WheelCastInfo";
import { Sprite3D } from "../core/Sprite3D";
import type { PhysicsVehicleComponent } from "./PhysicsVehicleComponent";

export enum WheelCenterMode {
    OwnerLocalPosition,
    Explicit
}

/** Vehicle wheel configuration, input and read-only runtime state. */
export class WheelCollider extends Component {
    declare readonly owner: Sprite3D;

    /** @internal */
    _vehicleComponent: PhysicsVehicleComponent = null;
    /** @internal */
    _runtimeState: VehicleWheelState = new VehicleWheelState();

    private _centerMode: WheelCenterMode = WheelCenterMode.OwnerLocalPosition;
    private _center: Vector3 = new Vector3();
    private _radius: number = 0.4;
    private _suspensionRestLength: number = 0.6;
    private _maxSuspensionTravel: number = 0.5;
    private _springStiffness: number = 20000;
    private _compressionDamping: number = 3500;
    private _reboundDamping: number = 4500;
    private _maxSuspensionForce: number = 10000;
    private _frictionStiffness: number = 1;
    private _motorForce: number = 0;
    private _brakeForce: number = 0;
    private _steerAngle: number = 0;

    get centerMode(): WheelCenterMode { return this._centerMode; }
    set centerMode(value: WheelCenterMode) {
        if (this._centerMode === value) return;
        this._centerMode = value;
    }

    /** Explicit chassis-local suspension connection point. */
    get center(): Vector3 { return this._center; }
    set center(value: Vector3) {
        if (!value) return;
        value.cloneTo(this._center);
    }

    get radius(): number { return this._radius; }
    set radius(value: number) {
        if (this._radius === value) return;
        this._radius = value;
    }

    get suspensionRestLength(): number { return this._suspensionRestLength; }
    set suspensionRestLength(value: number) {
        if (this._suspensionRestLength === value) return;
        this._suspensionRestLength = value;
    }

    get maxSuspensionTravel(): number { return this._maxSuspensionTravel; }
    set maxSuspensionTravel(value: number) {
        if (this._maxSuspensionTravel === value) return;
        this._maxSuspensionTravel = value;
    }

    get springStiffness(): number { return this._springStiffness; }
    set springStiffness(value: number) {
        if (this._springStiffness === value) return;
        this._springStiffness = value;
    }

    get compressionDamping(): number { return this._compressionDamping; }
    set compressionDamping(value: number) {
        if (this._compressionDamping === value) return;
        this._compressionDamping = value;
    }

    get reboundDamping(): number { return this._reboundDamping; }
    set reboundDamping(value: number) {
        if (this._reboundDamping === value) return;
        this._reboundDamping = value;
    }

    get maxSuspensionForce(): number { return this._maxSuspensionForce; }
    set maxSuspensionForce(value: number) {
        if (this._maxSuspensionForce === value) return;
        this._maxSuspensionForce = value;
    }

    get frictionStiffness(): number { return this._frictionStiffness; }
    set frictionStiffness(value: number) {
        if (this._frictionStiffness === value) return;
        this._frictionStiffness = value;
    }

    /** Per-step linear drive force in newtons. */
    get motorForce(): number { return this._motorForce; }
    set motorForce(value: number) { this._motorForce = Number.isFinite(value) ? value : 0; }

    /**
     * Per-step longitudinal brake force in newtons.
     * Same numeric value is not guaranteed to feel identical on Bullet vs PhysX;
     * tune against the active physics backend.
     */
    get brakeForce(): number { return this._brakeForce; }
    set brakeForce(value: number) { this._brakeForce = Number.isFinite(value) ? Math.max(0, value) : 0; }

    /** Per-step steering angle in degrees. */
    get steerAngle(): number { return this._steerAngle; }
    set steerAngle(value: number) { this._steerAngle = Number.isFinite(value) ? value : 0; }

    get isGrounded(): boolean { return this._runtimeState.isContact; }
    get angularSpeed(): number { return this._runtimeState.angularSpeed; }
    get rpm(): number { return this._runtimeState.rpm; }
    get suspensionForce(): number { return this._runtimeState.suspensionForce; }
    get skidInfo(): number { return this._runtimeState.skidInfo; }

    getGroundHit(): WheelCastInfo {
        return this._runtimeState;
    }

    getWorldTransform(outPosition: Vector3, outRotation: Quaternion): void {
        this._runtimeState.worldPosition.cloneTo(outPosition);
        this._runtimeState.worldRotation.cloneTo(outRotation);
    }

    /** @internal */
    _setRuntimeState(value: VehicleWheelState): void {
        this._runtimeState = value || new VehicleWheelState();
    }

    protected _onDestroy(): void {
        const vehicle = this._vehicleComponent;
        this._vehicleComponent = null;
        if (vehicle)
            vehicle._onWheelDestroyed(this);
    }

    /** @internal */
    _cloneTo(dest: WheelCollider): void {
        dest.centerMode = this._centerMode;
        dest.center = this._center;
        dest.radius = this._radius;
        dest.suspensionRestLength = this._suspensionRestLength;
        dest.maxSuspensionTravel = this._maxSuspensionTravel;
        dest.springStiffness = this._springStiffness;
        dest.compressionDamping = this._compressionDamping;
        dest.reboundDamping = this._reboundDamping;
        dest.maxSuspensionForce = this._maxSuspensionForce;
        dest.frictionStiffness = this._frictionStiffness;
        dest.motorForce = 0;
        dest.brakeForce = 0;
        dest.steerAngle = 0;
        dest.enabled = this.enabled;
    }
}
