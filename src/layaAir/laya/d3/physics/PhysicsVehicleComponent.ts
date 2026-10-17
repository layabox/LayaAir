import { Component } from "../../components/Component";
import { Node } from "../../display/Node";
import { IPhysicsManager, IPhysicsStepListener } from "../../Physics3D/interface/IPhysicsManager";
import {
    IPhysicsVehicle, VehicleApplyResult, VehicleChangeFlags, VehicleChanges,
    VehicleDesc, VehicleWheelDesc, VehicleWheelInput, VehicleWheelState
} from "../../Physics3D/interface/IVehicle/IPhysicsVehicle";
import { EPhysicsCapable } from "../../Physics3D/physicsEnum/EPhycisCapable";
import { IDynamicCollider } from "../../Physics3D/interface/IDynamicCollider";
import { Vector3 } from "../../maths/Vector3";
import { Sprite3D } from "../core/Sprite3D";
import { Laya3D } from "../../../Laya3D";
import { LayaEnv } from "../../../LayaEnv";
import { Rigidbody3D } from "./Rigidbody3D";
import { WheelCollider } from "./WheelCollider";
import { VehicleConfigResolver } from "./VehicleConfigResolver";

export enum VehicleLifecycleState {
    Uninitialized,
    WaitingForDependencies,
    Active,
    Disabled,
    Rebuilding,
    Error,
    Destroyed
}

enum VehicleConfigFailureKind {
    None,
    InvalidConfig,
    InvalidStructure
}

/** High-level vehicle aggregate built on one Rigidbody3D and multiple WheelColliders. */
export class PhysicsVehicleComponent extends Component {
    declare readonly owner: Sprite3D;

    private _vehicle: IPhysicsVehicle = null;
    private _vehicleBody: Rigidbody3D = null;
    private _wheels: WheelCollider[] = [];
    private _physicsManager: IPhysicsManager = null;
    private _requestedEnabled: boolean = false;
    private _listenerRegistered: boolean = false;
    private _autoDiscoverAttempted: boolean = false;
    private _forceReinitialize: boolean = false;
    private _resetPending: boolean = false;
    private _lastReportedError: string = null;
    private _state: VehicleLifecycleState = VehicleLifecycleState.Uninitialized;
    private _initializationError: string = null;
    private _captureFailureKind: VehicleConfigFailureKind = VehicleConfigFailureKind.None;
    private _tempWheelCenter: Vector3 = new Vector3();

    private _desiredDesc: VehicleDesc = { chassis: null, chassisMass: 0, wheels: [] };
    private _appliedDesc: VehicleDesc = { chassis: null, chassisMass: 0, wheels: [] };
    private _changes: VehicleChanges = { flags: VehicleChangeFlags.None, changedWheelIndices: [] };
    private _inputs: VehicleWheelInput[] = [];
    private _states: VehicleWheelState[] = [];
    private _stepListener: IPhysicsStepListener = {
        beforePhysicsStep: (fixedDeltaTime: number) => this._beforePhysicsStep(fixedDeltaTime),
        afterPhysicsStep: (fixedDeltaTime: number) => this._afterPhysicsStep(fixedDeltaTime)
    };

    get vehicleBody(): Rigidbody3D { return this._vehicleBody; }
    set vehicleBody(value: Rigidbody3D) {
        if (this._vehicleBody === value) return;
        this._vehicleBody = value;
    }

    /** Explicit, serialized wheel order. Direct array edits are detected by snapshot comparison. */
    get wheels(): WheelCollider[] { return this._wheels; }
    set wheels(value: WheelCollider[]) {
        this._wheels = value ? value.slice() : [];
        this._autoDiscoverAttempted = this._wheels.length > 0;
    }

    get isInitialized(): boolean { return this._vehicle !== null; }
    get lifecycleState(): VehicleLifecycleState { return this._state; }
    get initializationError(): string { return this._initializationError; }

    addWheel(wheel: WheelCollider): boolean {
        if (!wheel || this._wheels.indexOf(wheel) !== -1)
            return false;
        this._wheels.push(wheel);
        this._autoDiscoverAttempted = true;
        return true;
    }

    removeWheel(wheel: WheelCollider): boolean {
        const index = this._wheels.indexOf(wheel);
        if (index === -1)
            return false;
        this._wheels.splice(index, 1);
        return true;
    }

    /** Explicitly initializes or reinitializes after structural dependency changes. */
    initVehicle(): void {
        if (!LayaEnv.isPlaying)
            return;
        this._forceReinitialize = true;
        this._autoDiscoverAttempted = false;
        if (!this._bindPhysicsManager())
            return;
        this._registerStepListener();
    }

    /** Clears wheel history and inputs on the next safe fixed step. */
    reset(): void {
        this._resetPending = true;
        for (let i = 0; i < this._wheels.length; i++) {
            this._wheels[i].motorForce = 0;
            this._wheels[i].brakeForce = 0;
            this._wheels[i].steerAngle = 0;
        }
    }

    /** @internal */
    _onWheelDestroyed(wheel: WheelCollider): void {
        const index = this._wheels.indexOf(wheel);
        if (index !== -1) {
            this._stopCurrentVehicle();
            this._wheels.splice(index, 1);
        }
    }

    protected _onEnable(): void {
        // Editor visualization is data-only. Never create/register a native vehicle while editing.
        if (!LayaEnv.isPlaying) {
            this._requestedEnabled = false;
            this._state = VehicleLifecycleState.Uninitialized;
            return;
        }
        this._requestedEnabled = true;
        if (!this._bindPhysicsManager())
            return;
        this._registerStepListener();
    }

    protected _onDisable(): void {
        this._requestedEnabled = false;
        this._state = this._vehicle ? VehicleLifecycleState.Disabled : VehicleLifecycleState.Uninitialized;
        const manager = this._physicsManager;
        const vehicle = this._vehicle;
        if (manager) {
            manager.deferPhysicsOperation(() => {
                if (vehicle)
                    vehicle.setEnabled(false);
                manager.removePhysicsStepListener(this._stepListener);
            });
        }
        this._listenerRegistered = false;
    }

    protected _onDestroy(): void {
        this._requestedEnabled = false;
        this._state = VehicleLifecycleState.Destroyed;
        const manager = this._physicsManager;
        const vehicle = this._vehicle;
        if (manager) {
            manager.deferPhysicsOperation(() => {
                manager.removePhysicsStepListener(this._stepListener);
                if (vehicle) {
                    vehicle.setEnabled(false);
                    vehicle.destroy();
                }
            });
        } else {
            this._deferDestroyVehicle(vehicle);
        }
        this._unbindAppliedWheels();
        this._vehicle = null;
        this._vehicleBody = null;
        this._physicsManager = null;
        this._wheels.length = 0;
        this._inputs.length = 0;
        this._states.length = 0;
    }

    private _bindPhysicsManager(): boolean {
        const scene = this.owner && this.owner._scene;
        const manager = scene && scene._physicsManager;
        if (!manager) {
            this._setError("Vehicle is waiting for a Scene3D physics manager.", VehicleLifecycleState.WaitingForDependencies);
            return false;
        }
        if (this._physicsManager && this._physicsManager !== manager) {
            const oldManager = this._physicsManager;
            const oldVehicle = this._vehicle;
            if (oldVehicle)
                oldVehicle.setEnabled(false);
            oldManager.deferPhysicsOperation(() => {
                oldManager.removePhysicsStepListener(this._stepListener);
                if (oldVehicle)
                    oldVehicle.destroy();
            });
            this._listenerRegistered = false;
            this._unbindAppliedWheels();
            this._vehicle = null;
            this._clearDesc(this._appliedDesc);
            this._forceReinitialize = true;
        }
        this._physicsManager = manager;
        return true;
    }

    private _registerStepListener(): void {
        if (this._listenerRegistered || !this._physicsManager)
            return;
        this._physicsManager.addPhysicsStepListener(this._stepListener);
        this._listenerRegistered = true;
    }

    private _beforePhysicsStep(fixedDeltaTime: number): void {
        if (!this._requestedEnabled || this.destroyed)
            return;
        this._synchronizeConfig();
        if (!this._vehicle)
            return;
        this._captureInputs();
        this._vehicle.setInputs(this._inputs);
        if (this._resetPending) {
            this._vehicle.reset();
            this._resetPending = false;
        }
        this._vehicle.beforePhysicsStep(fixedDeltaTime);
    }

    private _afterPhysicsStep(fixedDeltaTime: number): void {
        if (!this._requestedEnabled || !this._vehicle || this.destroyed)
            return;
        this._vehicle.afterPhysicsStep(fixedDeltaTime);
        this._ensureRuntimeArrays(this._appliedDesc.wheels.length);
        this._vehicle.readStates(this._states);
        for (let i = 0; i < this._appliedDesc.wheels.length; i++) {
            const wheel = this._appliedDesc.wheels[i].wheel as WheelCollider;
            if (wheel && !wheel.destroyed)
                wheel._setRuntimeState(this._states[i]);
        }
    }

    private _synchronizeConfig(): void {
        const error = this._captureDesiredDesc();
        if (error) {
            if (this._captureFailureKind === VehicleConfigFailureKind.InvalidStructure) {
                this._stopCurrentVehicle();
                this._setError(error, VehicleLifecycleState.WaitingForDependencies);
            } else {
                // Keep last-good vehicle running; lifecycle stays Active when possible.
                this._setError(error, this._vehicle ? VehicleLifecycleState.Active : VehicleLifecycleState.Uninitialized);
            }
            return;
        }

        if (this._vehicle && this._appliedDesc.chassis !== this._desiredDesc.chassis) {
            if (!this._forceReinitialize) {
                this._vehicle.setEnabled(false);
                this._setError("vehicleBody changed at runtime; call initVehicle() to explicitly reinitialize.", VehicleLifecycleState.Error);
                return;
            }
            this._rebuildVehicle();
            return;
        }

        const topologyChanged = this._hasTopologyChanged();
        if (!this._vehicle || topologyChanged || this._forceReinitialize) {
            this._rebuildVehicle();
            return;
        }

        this._collectChanges();
        if (this._changes.flags !== VehicleChangeFlags.None) {
            const result = this._vehicle.applyConfig(this._desiredDesc, this._changes);
            if (result === VehicleApplyResult.RebuildRequired) {
                this._rebuildVehicle();
                return;
            }
            if (result !== VehicleApplyResult.Applied) {
                this._setError("Backend rejected an atomic vehicle configuration update: " + VehicleApplyResult[result], VehicleLifecycleState.Error);
                return;
            }
            this._copyDesc(this._desiredDesc, this._appliedDesc);
        }

        this._vehicle.setEnabled(true);
        this._state = VehicleLifecycleState.Active;
        this._forceReinitialize = false;
        this._clearError();
    }

    private _rebuildVehicle(): void {
        const createUtil = Laya3D.PhysicsCreateUtil;
        if (!createUtil || !createUtil.createVehicle || !createUtil.getPhysicsCapable(EPhysicsCapable.Physics_VehicleSystem)) {
            this._setError("The selected physics backend does not support vehicles.", VehicleLifecycleState.Error);
            return;
        }

        this._state = VehicleLifecycleState.Rebuilding;
        const oldVehicle = this._vehicle;
        let replacement: IPhysicsVehicle = null;
        try {
            replacement = createUtil.createVehicle(this._physicsManager, this._desiredDesc);
            if (!replacement)
                throw new Error("Backend returned no vehicle instance.");
            this._ensureRuntimeArrays(this._desiredDesc.wheels.length);
            this._captureInputsFromDesc(this._desiredDesc);
            replacement.setInputs(this._inputs);
            if (oldVehicle) {
                oldVehicle.setEnabled(false);
                this._deferDestroyVehicle(oldVehicle);
            }
            replacement.setEnabled(true);
            this._vehicle = replacement;
            this._unbindAppliedWheels();
            this._copyDesc(this._desiredDesc, this._appliedDesc);
            this._bindAppliedWheels();
            this._state = VehicleLifecycleState.Active;
            this._forceReinitialize = false;
            this._clearError();
        } catch (error) {
            if (replacement) {
                replacement.setEnabled(false);
                this._deferDestroyVehicle(replacement);
            }
            this._vehicle = oldVehicle;
            if (oldVehicle)
                oldVehicle.setEnabled(true);
            const message = error instanceof Error ? error.message : String(error);
            this._setError("Vehicle rebuild failed: " + message, VehicleLifecycleState.Error);
        }
    }

    private _deferDestroyVehicle(vehicle: IPhysicsVehicle): void {
        if (!vehicle)
            return;
        if (this._physicsManager)
            this._physicsManager.deferPhysicsOperation(() => vehicle.destroy());
        else
            vehicle.destroy();
    }

    private _captureDesiredDesc(): string {
        this._captureFailureKind = VehicleConfigFailureKind.None;
        if (!this._vehicleBody || this._vehicleBody.destroyed) {
            const ownerBody = this.owner.getComponent(Rigidbody3D);
            if (ownerBody)
                this._vehicleBody = ownerBody;
        }
        if (!this._vehicleBody)
            return this._structureError("Vehicle requires a Rigidbody3D chassis on its owner or vehicleBody.");
        if (this._vehicleBody.owner !== this.owner)
            return this._structureError("vehicleBody must be the Rigidbody3D attached to the vehicle owner.");
        if (this._vehicleBody.destroyed || !this._vehicleBody.collider || !this._vehicleBody.colliderShape)
            return this._structureError("Vehicle chassis collider or collider shape has not been created or was destroyed.");
        if (!this._vehicleBody.enabled || !this._vehicleBody.owner.activeInHierarchy)
            return this._structureError("Vehicle chassis Rigidbody3D must be enabled and active in the Scene3D.");
        if (this._vehicleBody.isKinematic)
            return this._structureError("Vehicle chassis must be a dynamic, non-kinematic Rigidbody3D.");
        if (this._vehicleBody.owner._scene !== this.owner._scene)
            return this._structureError("Vehicle chassis and vehicle component must belong to the same Scene3D.");

        const scale = this.owner.transform.getWorldLossyScale();
        if (!Number.isFinite(scale.x) || !Number.isFinite(scale.y) || !Number.isFinite(scale.z)
            || scale.x <= 0 || scale.y <= 0 || scale.z <= 0)
            return this._structureError("Vehicle chassis world scale must contain finite values greater than zero.");
        const uniformScale = scale.x;
        const scaleTolerance = 0.0001 * Math.max(1, uniformScale);
        if (Math.abs(scale.x - scale.y) > scaleTolerance || Math.abs(scale.x - scale.z) > scaleTolerance)
            return this._structureError("Vehicle chassis does not support non-uniform world scale.");

        if (this._wheels.length === 0 && !this._autoDiscoverAttempted) {
            this._autoDiscoverAttempted = true;
            this._collectWheelColliders(this.owner);
        }
        if (this._wheels.length === 0)
            return this._configError("Vehicle requires at least one WheelCollider.");

        this._desiredDesc.chassis = this._vehicleBody.collider as IDynamicCollider;
        this._desiredDesc.chassisMass = this._vehicleBody.mass;
        const scene = this.owner._scene;
        for (let i = 0; i < this._wheels.length; i++) {
            const wheel = this._wheels[i];
            if (!wheel || wheel.destroyed || !wheel.owner || wheel.owner.destroyed)
                return this._structureError("Vehicle wheel " + i + " is null or destroyed.");
            for (let previous = 0; previous < i; previous++) {
                if (this._wheels[previous] === wheel)
                    return this._configError("Vehicle contains the same WheelCollider more than once.");
            }
            if (wheel._vehicleComponent && wheel._vehicleComponent !== this)
                return this._structureError("WheelCollider " + wheel.owner.name + " is already owned by another vehicle.");
            if (wheel.owner._scene !== scene)
                return this._structureError("All vehicle wheels must belong to the chassis Scene3D.");
            if (wheel.owner === this.owner || !this.owner.contains(wheel.owner))
                return this._structureError("Every WheelCollider must be attached to a descendant of the vehicle chassis.");
            if (!wheel.enabled || !wheel.owner.activeInHierarchy)
                return this._structureError("Every WheelCollider must be enabled and active in the Scene3D.");
            let target = this._desiredDesc.wheels[i];
            if (!target) {
                target = this._createEmptyWheelDesc();
                this._desiredDesc.wheels[i] = target;
            }
            VehicleConfigResolver.captureWheelDesc(this.owner, wheel, uniformScale, target, this._tempWheelCenter);
            const wheelError = this._validateWheelDesc(target, i);
            if (wheelError)
                return this._configError(wheelError);
        }
        this._desiredDesc.wheels.length = this._wheels.length;
        if (!Number.isFinite(this._desiredDesc.chassisMass) || this._desiredDesc.chassisMass <= 0)
            return this._configError("Vehicle chassis mass must be finite and greater than zero.");
        return null;
    }

    private _structureError(message: string): string {
        this._captureFailureKind = VehicleConfigFailureKind.InvalidStructure;
        return message;
    }

    private _configError(message: string): string {
        this._captureFailureKind = VehicleConfigFailureKind.InvalidConfig;
        return message;
    }

    private _stopCurrentVehicle(): void {
        const vehicle = this._vehicle;
        if (!vehicle)
            return;
        vehicle.setEnabled(false);
        this._vehicle = null;
        this._unbindAppliedWheels();
        this._clearDesc(this._appliedDesc);
        this._deferDestroyVehicle(vehicle);
    }

    private _validateWheelDesc(wheel: VehicleWheelDesc, index: number): string {
        const prefix = "Wheel " + index + ": ";
        if (!Number.isFinite(wheel.centerX) || !Number.isFinite(wheel.centerY) || !Number.isFinite(wheel.centerZ))
            return prefix + "center must contain finite values.";
        if (!Number.isFinite(wheel.radius) || wheel.radius <= 0)
            return prefix + "radius must be greater than zero.";
        if (!Number.isFinite(wheel.suspensionRestLength) || wheel.suspensionRestLength < 0)
            return prefix + "suspensionRestLength must be non-negative.";
        if (!Number.isFinite(wheel.maxSuspensionTravel) || wheel.maxSuspensionTravel < 0)
            return prefix + "maxSuspensionTravel must be non-negative.";
        if (!Number.isFinite(wheel.springStiffness) || wheel.springStiffness < 0)
            return prefix + "springStiffness must be non-negative.";
        if (!Number.isFinite(wheel.compressionDamping) || wheel.compressionDamping < 0
            || !Number.isFinite(wheel.reboundDamping) || wheel.reboundDamping < 0)
            return prefix + "suspension damping must be non-negative.";
        if (!Number.isFinite(wheel.maxSuspensionForce) || wheel.maxSuspensionForce < 0)
            return prefix + "maxSuspensionForce must be non-negative.";
        if (!Number.isFinite(wheel.frictionStiffness) || wheel.frictionStiffness < 0)
            return prefix + "frictionStiffness must be non-negative.";
        return null;
    }

    private _hasTopologyChanged(): boolean {
        if (!this._vehicle || this._desiredDesc.wheels.length !== this._appliedDesc.wheels.length)
            return true;
        for (let i = 0; i < this._desiredDesc.wheels.length; i++) {
            if (this._desiredDesc.wheels[i].wheel !== this._appliedDesc.wheels[i].wheel)
                return true;
        }
        return false;
    }

    private _collectChanges(): void {
        this._changes.flags = VehicleChangeFlags.None;
        this._changes.changedWheelIndices.length = 0;
        if (!this._nearlyEqual(this._desiredDesc.chassisMass, this._appliedDesc.chassisMass))
            this._changes.flags |= VehicleChangeFlags.ChassisMass;
        for (let i = 0; i < this._desiredDesc.wheels.length; i++) {
            if (!this._wheelDescEquals(this._desiredDesc.wheels[i], this._appliedDesc.wheels[i])) {
                this._changes.flags |= VehicleChangeFlags.WheelConfig;
                this._changes.changedWheelIndices.push(i);
            }
        }
    }

    private _wheelDescEquals(a: VehicleWheelDesc, b: VehicleWheelDesc): boolean {
        return a.wheel === b.wheel
            && this._nearlyEqual(a.centerX, b.centerX)
            && this._nearlyEqual(a.centerY, b.centerY)
            && this._nearlyEqual(a.centerZ, b.centerZ)
            && this._nearlyEqual(a.radius, b.radius)
            && this._nearlyEqual(a.suspensionRestLength, b.suspensionRestLength)
            && this._nearlyEqual(a.maxSuspensionTravel, b.maxSuspensionTravel)
            && this._nearlyEqual(a.springStiffness, b.springStiffness)
            && this._nearlyEqual(a.compressionDamping, b.compressionDamping)
            && this._nearlyEqual(a.reboundDamping, b.reboundDamping)
            && this._nearlyEqual(a.maxSuspensionForce, b.maxSuspensionForce)
            && this._nearlyEqual(a.frictionStiffness, b.frictionStiffness);
    }

    private _nearlyEqual(a: number, b: number): boolean {
        return Math.abs(a - b) <= 0.000001 * Math.max(1, Math.abs(a), Math.abs(b));
    }

    private _copyDesc(source: VehicleDesc, target: VehicleDesc): void {
        target.chassis = source.chassis;
        target.chassisMass = source.chassisMass;
        for (let i = 0; i < source.wheels.length; i++) {
            let destination = target.wheels[i];
            if (!destination) {
                destination = this._createEmptyWheelDesc();
                target.wheels[i] = destination;
            }
            const wheel = source.wheels[i];
            destination.wheel = wheel.wheel;
            destination.centerX = wheel.centerX;
            destination.centerY = wheel.centerY;
            destination.centerZ = wheel.centerZ;
            destination.radius = wheel.radius;
            destination.suspensionRestLength = wheel.suspensionRestLength;
            destination.maxSuspensionTravel = wheel.maxSuspensionTravel;
            destination.springStiffness = wheel.springStiffness;
            destination.compressionDamping = wheel.compressionDamping;
            destination.reboundDamping = wheel.reboundDamping;
            destination.maxSuspensionForce = wheel.maxSuspensionForce;
            destination.frictionStiffness = wheel.frictionStiffness;
        }
        target.wheels.length = source.wheels.length;
    }

    private _clearDesc(desc: VehicleDesc): void {
        desc.chassis = null;
        desc.chassisMass = 0;
        desc.wheels.length = 0;
    }

    private _createEmptyWheelDesc(): VehicleWheelDesc {
        return {
            wheel: null, centerX: 0, centerY: 0, centerZ: 0, radius: 0,
            suspensionRestLength: 0, maxSuspensionTravel: 0, springStiffness: 0,
            compressionDamping: 0, reboundDamping: 0, maxSuspensionForce: 0,
            frictionStiffness: 0
        };
    }

    private _captureInputs(): void {
        this._captureInputsFromDesc(this._appliedDesc);
    }

    private _captureInputsFromDesc(desc: VehicleDesc): void {
        this._ensureRuntimeArrays(desc.wheels.length);
        for (let i = 0; i < desc.wheels.length; i++) {
            const wheel = desc.wheels[i].wheel as WheelCollider;
            const input = this._inputs[i];
            input.motorForce = wheel && !wheel.destroyed ? wheel.motorForce : 0;
            input.brakeForce = wheel && !wheel.destroyed ? wheel.brakeForce : 0;
            input.steerAngle = wheel && !wheel.destroyed ? wheel.steerAngle * Math.PI / 180.0 : 0;
        }
    }

    private _ensureRuntimeArrays(count: number): void {
        while (this._inputs.length < count)
            this._inputs.push({ motorForce: 0, brakeForce: 0, steerAngle: 0 });
        while (this._states.length < count)
            this._states.push(new VehicleWheelState());
        this._inputs.length = count;
        this._states.length = count;
    }

    private _bindAppliedWheels(): void {
        for (let i = 0; i < this._appliedDesc.wheels.length; i++) {
            const wheel = this._appliedDesc.wheels[i].wheel as WheelCollider;
            wheel._vehicleComponent = this;
            wheel._setRuntimeState(this._states[i]);
        }
    }

    private _unbindAppliedWheels(): void {
        for (let i = 0; i < this._appliedDesc.wheels.length; i++) {
            const wheel = this._appliedDesc.wheels[i].wheel as WheelCollider;
            if (wheel && wheel._vehicleComponent === this) {
                wheel._vehicleComponent = null;
                wheel._setRuntimeState(null);
            }
        }
    }

    private _collectWheelColliders(node: Node): void {
        for (let i = 0; i < node.numChildren; i++) {
            const child = node.getChildAt(i);
            const wheel = child.getComponent(WheelCollider);
            if (wheel && this._wheels.indexOf(wheel) === -1)
                this._wheels.push(wheel);
            if (child.numChildren > 0)
                this._collectWheelColliders(child);
        }
    }

    /** @internal */
    _cloneTo(dest: PhysicsVehicleComponent): void {
        dest._vehicleBody = null;
        dest._wheels.length = 0;
        for (let i = 0; i < this._wheels.length; i++) {
            const clonedWheel = this._findClonedWheel(this._wheels[i], dest.owner);
            if (clonedWheel)
                dest._wheels.push(clonedWheel);
        }
        dest._autoDiscoverAttempted = dest._wheels.length > 0;
        dest.enabled = this.enabled;
    }

    private _findClonedWheel(sourceWheel: WheelCollider, destinationRoot: Sprite3D): WheelCollider {
        if (!sourceWheel || !sourceWheel.owner || !this.owner.contains(sourceWheel.owner))
            return null;
        const path: number[] = [];
        let node: Node = sourceWheel.owner;
        while (node && node !== this.owner) {
            const parent = node.parent;
            if (!parent)
                return null;
            path.push(parent.getChildIndex(node));
            node = parent;
        }
        let destination: Node = destinationRoot;
        for (let i = path.length - 1; i >= 0; i--) {
            const index = path[i];
            if (index < 0 || index >= destination.numChildren)
                return null;
            destination = destination.getChildAt(index);
        }
        return destination.getComponent(WheelCollider);
    }

    private _setError(message: string, state: VehicleLifecycleState): void {
        this._state = state;
        this._initializationError = message;
        if (message !== this._lastReportedError) {
            this._lastReportedError = message;
            // Active + error means degraded (last-good config still running).
            if (state === VehicleLifecycleState.Active)
                console.warn("[PhysicsVehicle] " + message);
            else
                console.error("[PhysicsVehicle] " + message);
        }
    }

    private _clearError(): void {
        this._initializationError = null;
        this._lastReportedError = null;
    }
}
