import {
    IPhysicsVehicle, VehicleApplyResult, VehicleChangeFlags, VehicleChanges,
    VehicleDesc, VehicleWheelDesc, VehicleWheelInput, VehicleWheelState
} from "../../interface/IVehicle/IPhysicsVehicle";
import { pxCollider } from "../Collider/pxCollider";
import { EColliderCapable } from "../../physicsEnum/EColliderCapable";
import type { Rigidbody3D } from "../../../d3/physics/Rigidbody3D";
import type { pxDynamicCollider } from "../Collider/pxDynamicCollider";
import type { pxPhysicsManager } from "../pxPhysicsManager";
import { pxWheelCollider } from "./pxWheelCollider";

function rotateVec3(
    qx: number, qy: number, qz: number, qw: number,
    vx: number, vy: number, vz: number,
    out: { x: number; y: number; z: number }
): void {
    const tx = 2 * (qy * vz - qz * vy);
    const ty = 2 * (qz * vx - qx * vz);
    const tz = 2 * (qx * vy - qy * vx);
    out.x = vx + qw * tx + (qy * tz - qz * ty);
    out.y = vy + qw * ty + (qz * tx - qx * tz);
    out.z = vz + qw * tz + (qx * ty - qy * tx);
}

function quatMul(
    aw: number, ax: number, ay: number, az: number,
    bw: number, bx: number, by: number, bz: number,
    out: { w: number; x: number; y: number; z: number }
): void {
    out.w = aw * bw - ax * bx - ay * by - az * bz;
    out.x = aw * bx + ax * bw + ay * bz - az * by;
    out.y = aw * by - ax * bz + ay * bw + az * bx;
    out.z = aw * bz + ax * by - ay * bx + az * bw;
}

function quatFromAxisAngle(ax: number, ay: number, az: number, angle: number, out: { w: number; x: number; y: number; z: number }): void {
    const half = angle * 0.5;
    const sine = Math.sin(half);
    out.w = Math.cos(half);
    out.x = ax * sine;
    out.y = ay * sine;
    out.z = az * sine;
}

const _qA = { w: 1, x: 0, y: 0, z: 0 };
const _qB = { w: 1, x: 0, y: 0, z: 0 };
const _qC = { w: 1, x: 0, y: 0, z: 0 };
const _vA = { x: 0, y: 0, z: 0 };
const _vB = { x: 0, y: 0, z: 0 };

// Match the existing Bullet suspension-angle guard and default lateral roll influence.
const MIN_SUSPENSION_CONTACT_DOT = 0.1;
const DEFAULT_ROLL_INFLUENCE = 0.1;
const IDLE_SPEED_SQUARED = 0.02 * 0.02;
const IDLE_SLEEP_DELAY = 1;

/** PhysX raycast vehicle implemented in TypeScript. */
export class pxVehicle implements IPhysicsVehicle {
    private _vehicleBody: pxDynamicCollider;
    private _wheels: pxWheelCollider[] = [];
    private _enabled: boolean = false;
    private _destroyed: boolean = false;
    private _wakeRequested: boolean = false;
    private _idleTime: number = 0;
    private _chassisActorID: number = -1;
    private _chassisMass: number = 1;
    private _fixedDeltaTime: number = 1 / 60;
    private _rayOrigin = { x: 0, y: 0, z: 0 };
    private _rayDirection = { x: 0, y: -1, z: 0 };
    private _force = { x: 0, y: 0, z: 0 };
    private _localPosition = { x: 0, y: 0, z: 0 };
    private _torque = { x: 0, y: 0, z: 0 };

    constructor(private _physicsManager: pxPhysicsManager, desc: VehicleDesc) {
        this._vehicleBody = desc.chassis as pxDynamicCollider;
        this._chassisActorID = (this._vehicleBody as any)._id;
        this._chassisMass = desc.chassisMass;
        for (let i = 0; i < desc.wheels.length; i++) {
            const wheel = new pxWheelCollider();
            wheel.applyConfig(desc.wheels[i], desc.chassisMass);
            this._wheels.push(wheel);
        }
    }

    setEnabled(value: boolean): void {
        if (!this._destroyed) {
            this._enabled = value;
            if (!value)
                this._idleTime = 0;
        }
    }

    applyConfig(desc: VehicleDesc, changes: VehicleChanges): VehicleApplyResult {
        if (this._destroyed || desc.chassis !== this._vehicleBody)
            return VehicleApplyResult.Invalid;
        if (desc.wheels.length !== this._wheels.length)
            return VehicleApplyResult.RebuildRequired;
        if (!this._validateDesc(desc))
            return VehicleApplyResult.Invalid;

        this._chassisMass = desc.chassisMass;
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
        const count = Math.min(inputs.length, this._wheels.length);
        for (let i = 0; i < count; i++) {
            const input = inputs[i];
            const wheel = this._wheels[i];
            if (wheel._steerAngle !== input.steerAngle)
                this._wakeRequested = true;
            wheel._motorForce = input.motorForce;
            wheel._brakeForce = input.brakeForce;
            wheel._steerAngle = input.steerAngle;
        }
    }

    beforePhysicsStep(fixedDeltaTime: number): void {
        if (!this._enabled || this._destroyed || !this._vehicleBody)
            return;
        this._fixedDeltaTime = fixedDeltaTime;
        let shouldWake = this._wakeRequested;
        this._wakeRequested = false;
        for (let i = 0; i < this._wheels.length; i++) {
            const wheel = this._wheels[i];
            shouldWake ||= wheel._motorForce !== 0 || wheel._brakeForce !== 0;
        }
        if (shouldWake) {
            this._idleTime = 0;
            this._vehicleBody.wakeUp();
        }
        else if (this._vehicleBody.isSleeping()) {
            // Static-ground vehicles can remain asleep; moving support needs fresh suspension forces.
            if (this._hasStaticGroundSupport())
                return;
            this._idleTime = 0;
            this._vehicleBody.wakeUp();
        }
        this._solve(fixedDeltaTime);
    }

    afterPhysicsStep(fixedDeltaTime: number): void {
        if (!this._enabled || this._destroyed || !this._vehicleBody)
            return;
        this._fixedDeltaTime = fixedDeltaTime;
        this._updateWheelTransforms();
        this._sleepIfIdle(fixedDeltaTime);
    }

    private _hasStaticGroundSupport(): boolean {
        if (this._wheels.length === 0)
            return false;
        for (let i = 0; i < this._wheels.length; i++) {
            const wheel = this._wheels[i];
            if (!wheel._isGrounded || !wheel._otherCollider
                || wheel._otherCollider.getCapable(EColliderCapable.RigidBody_Mass))
                return false;
        }
        return true;
    }

    private _sleepIfIdle(dt: number): void {
        if (this._vehicleBody.isSleeping()) {
            this._idleTime = 0;
            return;
        }
        const chassis = this._vehicleBody.component as Rigidbody3D;
        if (!chassis?.allowSleep || chassis.sleepThreshold <= 0 || !this._hasStaticGroundSupport()) {
            this._idleTime = 0;
            return;
        }
        for (let i = 0; i < this._wheels.length; i++) {
            if (this._wheels[i]._motorForce !== 0 || this._wheels[i]._brakeForce !== 0) {
                this._idleTime = 0;
                return;
            }
        }
        const actor = this._vehicleBody._pxActor;
        const linear = actor.getLinearVelocity();
        const angular = actor.getAngularVelocity();
        const linearSpeedSquared = linear.x * linear.x + linear.y * linear.y + linear.z * linear.z;
        const angularSpeedSquared = angular.x * angular.x + angular.y * angular.y + angular.z * angular.z;
        if (linearSpeedSquared >= IDLE_SPEED_SQUARED || angularSpeedSquared >= IDLE_SPEED_SQUARED) {
            this._idleTime = 0;
            return;
        }
        // Suspension forces are applied every step and otherwise keep the native actor awake.
        this._idleTime += dt;
        if (this._idleTime >= IDLE_SLEEP_DELAY) {
            this._vehicleBody.sleep();
            this._idleTime = 0;
        }
    }

    private _solve(dt: number): void {
        const actor: any = this._vehicleBody._pxActor;
        const pose = actor.getGlobalPose();
        const cx = pose.translation.x, cy = pose.translation.y, cz = pose.translation.z;
        const qx = pose.rotation.x, qy = pose.rotation.y, qz = pose.rotation.z, qw = pose.rotation.w;
        const linearVelocity = actor.getLinearVelocity();
        const angularVelocity = actor.getAngularVelocity();
        const lvx = linearVelocity.x, lvy = linearVelocity.y, lvz = linearVelocity.z;
        const avx = angularVelocity.x, avy = angularVelocity.y, avz = angularVelocity.z;

        this._vehicleBody._getLocalCenterOfMass(_vA);
        rotateVec3(qx, qy, qz, qw, _vA.x, _vA.y, _vA.z, _vB);
        const massCenterX = cx + _vB.x;
        const massCenterY = cy + _vB.y;
        const massCenterZ = cz + _vB.z;

        rotateVec3(qx, qy, qz, qw, 0, 1, 0, _vA);
        const upX = _vA.x, upY = _vA.y, upZ = _vA.z;
        this._rayDirection.x = -upX;
        this._rayDirection.y = -upY;
        this._rayDirection.z = -upZ;

        const scene: any = (this._physicsManager as any)._pxScene;
        const queryGroup = (this._vehicleBody as any)._collisionGroup;
        const queryMask = (this._vehicleBody as any)._canCollisionWith;

        for (let wheelIndex = 0; wheelIndex < this._wheels.length; wheelIndex++) {
            const wheel = this._wheels[wheelIndex];
            rotateVec3(qx, qy, qz, qw, wheel._centerX, wheel._centerY, wheel._centerZ, _vB);
            const connectionX = cx + _vB.x;
            const connectionY = cy + _vB.y;
            const connectionZ = cz + _vB.z;
            this._rayOrigin.x = connectionX;
            this._rayOrigin.y = connectionY;
            this._rayOrigin.z = connectionZ;

            const maxDistance = wheel._suspensionRestLength + wheel._maxSuspensionTravel + wheel._radius;
            const results = scene.raycastAllHitsFiltered(
                this._rayOrigin, this._rayDirection, maxDistance,
                queryGroup, queryMask, this._chassisActorID, true
            );

            let hitDistance = -1;
            let hitX = 0, hitY = 0, hitZ = 0;
            let hitNormalX = upX, hitNormalY = upY, hitNormalZ = upZ;
            let hitActorID = -1;
            const hitCount = results && typeof results.size === "function" ? results.size() : 0;
            for (let i = 0; i < hitCount; i++) {
                const result = results.get(i);
                if (!result || !result.position)
                    continue;
                let distance = result.distance;
                if (!Number.isFinite(distance)) {
                    const dx = result.position.x - connectionX;
                    const dy = result.position.y - connectionY;
                    const dz = result.position.z - connectionZ;
                    distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                }
                if (hitDistance < 0 || distance < hitDistance) {
                    hitDistance = distance;
                    hitX = result.position.x;
                    hitY = result.position.y;
                    hitZ = result.position.z;
                    hitNormalX = result.normal.x;
                    hitNormalY = result.normal.y;
                    hitNormalZ = result.normal.z;
                    hitActorID = result.ActorUUID;
                }
            }
            if (results && typeof results.delete === "function")
                results.delete();

            let normalLength = Math.sqrt(hitNormalX * hitNormalX + hitNormalY * hitNormalY + hitNormalZ * hitNormalZ);
            if (!Number.isFinite(normalLength) || normalLength < 0.000001) {
                hitNormalX = upX;
                hitNormalY = upY;
                hitNormalZ = upZ;
            } else {
                hitNormalX /= normalLength;
                hitNormalY /= normalLength;
                hitNormalZ /= normalLength;
                if (hitNormalX * upX + hitNormalY * upY + hitNormalZ * upZ < 0) {
                    hitNormalX = -hitNormalX;
                    hitNormalY = -hitNormalY;
                    hitNormalZ = -hitNormalZ;
                }
            }

            wheel._isGrounded = hitDistance >= 0;
            if (!wheel._isGrounded) {
                wheel._otherCollider = null;
                wheel._currentSuspensionLength = wheel._suspensionRestLength;
                wheel._suspensionForce = 0;
                wheel._skidInfo = 1;
                wheel._angularSpeed *= Math.max(0, 1 - dt * 0.25);
                wheel._rotation += wheel._angularSpeed * dt;
                continue;
            }

            const rawLength = hitDistance - wheel._radius;
            const minimumLength = Math.max(0, wheel._suspensionRestLength - wheel._maxSuspensionTravel);
            const maximumLength = wheel._suspensionRestLength + wheel._maxSuspensionTravel;
            const currentLength = Math.max(minimumLength, Math.min(rawLength, maximumLength));
            const contactRX = hitX - massCenterX, contactRY = hitY - massCenterY, contactRZ = hitZ - massCenterZ;
            const contactVelocityX = lvx + (avy * contactRZ - avz * contactRY);
            const contactVelocityY = lvy + (avz * contactRX - avx * contactRZ);
            const contactVelocityZ = lvz + (avx * contactRY - avy * contactRX);
            const contactDotSuspension = hitNormalX * upX + hitNormalY * upY + hitNormalZ * upZ;
            const inverseContactDot = 1 / Math.max(MIN_SUSPENSION_CONTACT_DOT, contactDotSuspension);
            // Positive velocity means compression. Do not derive damping from clamped lengths:
            // contact changes and travel limits must not inject artificial velocity into the spring.
            const relativeVelocity = contactDotSuspension > MIN_SUSPENSION_CONTACT_DOT
                ? -(contactVelocityX * hitNormalX + contactVelocityY * hitNormalY + contactVelocityZ * hitNormalZ) * inverseContactDot
                : 0;

            const compression = wheel._suspensionRestLength - currentLength;
            const damping = relativeVelocity > 0 ? wheel._compressionDamping : wheel._reboundDamping;
            const suspensionForce = Math.max(0, Math.min(
                wheel._maxSuspensionForce,
                wheel._springStiffness * compression * inverseContactDot + damping * relativeVelocity
            ));

            wheel._otherCollider = pxCollider._ActorPool.get(hitActorID) || null;
            wheel._contactPos.setValue(hitX, hitY, hitZ);
            wheel._contactNormal.setValue(hitNormalX, hitNormalY, hitNormalZ);
            wheel._currentSuspensionLength = currentLength;
            wheel._suspensionForce = suspensionForce;

            // The native force-at-local-position path and the force/torque fallback must use
            // the same contact point, with torque arms measured from the world center of mass.
            rotateVec3(-qx, -qy, -qz, qw, hitX - cx, hitY - cy, hitZ - cz, _vB);
            const localContactX = _vB.x, localContactY = _vB.y, localContactZ = _vB.z;
            this._applyForceAtLocalPosition(
                actor, hitNormalX * suspensionForce, hitNormalY * suspensionForce, hitNormalZ * suspensionForce,
                localContactX, localContactY, localContactZ,
                contactRX, contactRY, contactRZ
            );

            const sine = Math.sin(wheel._steerAngle), cosine = Math.cos(wheel._steerAngle);
            rotateVec3(qx, qy, qz, qw, sine, 0, cosine, _vA);
            const forwardNormalDot = _vA.x * hitNormalX + _vA.y * hitNormalY + _vA.z * hitNormalZ;
            let forwardX = _vA.x - hitNormalX * forwardNormalDot;
            let forwardY = _vA.y - hitNormalY * forwardNormalDot;
            let forwardZ = _vA.z - hitNormalZ * forwardNormalDot;
            let forwardLength = Math.sqrt(forwardX * forwardX + forwardY * forwardY + forwardZ * forwardZ);
            if (forwardLength < 0.000001) {
                rotateVec3(qx, qy, qz, qw, cosine, 0, -sine, _vB);
                const rightNormalDot = _vB.x * hitNormalX + _vB.y * hitNormalY + _vB.z * hitNormalZ;
                let fallbackRightX = _vB.x - hitNormalX * rightNormalDot;
                let fallbackRightY = _vB.y - hitNormalY * rightNormalDot;
                let fallbackRightZ = _vB.z - hitNormalZ * rightNormalDot;
                const fallbackLength = Math.max(0.000001, Math.sqrt(
                    fallbackRightX * fallbackRightX + fallbackRightY * fallbackRightY + fallbackRightZ * fallbackRightZ
                ));
                fallbackRightX /= fallbackLength;
                fallbackRightY /= fallbackLength;
                fallbackRightZ /= fallbackLength;
                forwardX = fallbackRightY * hitNormalZ - fallbackRightZ * hitNormalY;
                forwardY = fallbackRightZ * hitNormalX - fallbackRightX * hitNormalZ;
                forwardZ = fallbackRightX * hitNormalY - fallbackRightY * hitNormalX;
            } else {
                forwardX /= forwardLength;
                forwardY /= forwardLength;
                forwardZ /= forwardLength;
            }
            const rightX = hitNormalY * forwardZ - hitNormalZ * forwardY;
            const rightY = hitNormalZ * forwardX - hitNormalX * forwardZ;
            const rightZ = hitNormalX * forwardY - hitNormalY * forwardX;
            const forwardSpeed = contactVelocityX * forwardX + contactVelocityY * forwardY + contactVelocityZ * forwardZ;
            const lateralSpeed = contactVelocityX * rightX + contactVelocityY * rightY + contactVelocityZ * rightZ;
            const maximumFriction = suspensionForce * wheel._frictionStiffness;

            let requestedForwardForce = wheel._motorForce;
            const effectiveMass = this._chassisMass / Math.max(1, this._wheels.length);
            const gravity = this._physicsManager._gravity;
            const gravityForwardForce = effectiveMass * (gravity.x * forwardX + gravity.y * forwardY + gravity.z * forwardZ);
            if (wheel._brakeForce > 0) {
                const stopForce = -forwardSpeed * effectiveMass / dt;
                const brakeCorrection = stopForce - requestedForwardForce - gravityForwardForce;
                requestedForwardForce += Math.max(-wheel._brakeForce, Math.min(wheel._brakeForce, brakeCorrection));
            }

            const gravityLateralForce = effectiveMass * (gravity.x * rightX + gravity.y * rightY + gravity.z * rightZ);
            const requestedLateralForce = -lateralSpeed * effectiveMass / dt - gravityLateralForce;
            const requestedMagnitude = Math.sqrt(
                requestedForwardForce * requestedForwardForce + requestedLateralForce * requestedLateralForce
            );
            const frictionScale = requestedMagnitude > maximumFriction && requestedMagnitude > 0
                ? maximumFriction / requestedMagnitude : 1;
            const forwardForce = requestedForwardForce * frictionScale;
            const lateralForce = requestedLateralForce * frictionScale;
            wheel._skidInfo = frictionScale;

            // Keep longitudinal traction at the real contact point. Roll influence changes
            // only the lateral torque arm, not the tire force or the PhysX friction solver.
            this._applyForceAtLocalPosition(
                actor, forwardX * forwardForce, forwardY * forwardForce, forwardZ * forwardForce,
                localContactX, localContactY, localContactZ,
                contactRX, contactRY, contactRZ
            );
            const rollReduction = (contactRX * upX + contactRY * upY + contactRZ * upZ) * (1 - DEFAULT_ROLL_INFLUENCE);
            this._applyForceAtLocalPosition(
                actor, rightX * lateralForce, rightY * lateralForce, rightZ * lateralForce,
                localContactX, localContactY - rollReduction, localContactZ,
                contactRX - upX * rollReduction,
                contactRY - upY * rollReduction,
                contactRZ - upZ * rollReduction
            );

            wheel._angularSpeed = forwardSpeed / Math.max(wheel._radius, 0.001);
            wheel._rotation += wheel._angularSpeed * dt;
        }
    }

    private _applyForceAtLocalPosition(
        actor: any, forceX: number, forceY: number, forceZ: number,
        localX: number, localY: number, localZ: number,
        worldRX: number, worldRY: number, worldRZ: number
    ): void {
        if (forceX === 0 && forceY === 0 && forceZ === 0)
            return;
        this._force.x = forceX;
        this._force.y = forceY;
        this._force.z = forceZ;
        this._localPosition.x = localX;
        this._localPosition.y = localY;
        this._localPosition.z = localZ;
        if (typeof actor.addForceAtLocalPosWithMode === "function") {
            actor.addForceAtLocalPosWithMode(this._force, this._localPosition, 0);
            return;
        }
        actor.addForce(this._force);
        this._torque.x = worldRY * forceZ - worldRZ * forceY;
        this._torque.y = worldRZ * forceX - worldRX * forceZ;
        this._torque.z = worldRX * forceY - worldRY * forceX;
        actor.addTorque(this._torque);
    }

    private _updateWheelTransforms(): void {
        const pose = this._vehicleBody._pxActor.getGlobalPose();
        const cx = pose.translation.x, cy = pose.translation.y, cz = pose.translation.z;
        const qx = pose.rotation.x, qy = pose.rotation.y, qz = pose.rotation.z, qw = pose.rotation.w;
        rotateVec3(qx, qy, qz, qw, 0, 1, 0, _vA);
        const upX = _vA.x, upY = _vA.y, upZ = _vA.z;

        for (let i = 0; i < this._wheels.length; i++) {
            const wheel = this._wheels[i];
            rotateVec3(qx, qy, qz, qw, wheel._centerX, wheel._centerY, wheel._centerZ, _vB);
            wheel._worldPosition.setValue(
                cx + _vB.x - upX * wheel._currentSuspensionLength,
                cy + _vB.y - upY * wheel._currentSuspensionLength,
                cz + _vB.z - upZ * wheel._currentSuspensionLength
            );
            quatFromAxisAngle(0, 1, 0, wheel._steerAngle, _qA);
            quatMul(qw, qx, qy, qz, _qA.w, _qA.x, _qA.y, _qA.z, _qB);
            quatFromAxisAngle(1, 0, 0, wheel._rotation, _qA);
            quatMul(_qB.w, _qB.x, _qB.y, _qB.z, _qA.w, _qA.x, _qA.y, _qA.z, _qC);
            wheel._worldRotation.setValue(_qC.x, _qC.y, _qC.z, _qC.w);
        }
    }

    readStates(outStates: VehicleWheelState[]): void {
        const count = Math.min(outStates.length, this._wheels.length);
        for (let i = 0; i < count; i++)
            this._wheels[i].readState(outStates[i], this._fixedDeltaTime);
    }

    reset(): void {
        this._idleTime = 0;
        for (let i = 0; i < this._wheels.length; i++) {
            const wheel = this._wheels[i];
            wheel._motorForce = 0;
            wheel._brakeForce = 0;
            wheel._steerAngle = 0;
            wheel.resetRuntimeState();
        }
        if (this._vehicleBody)
            this._vehicleBody.wakeUp();
    }

    destroy(): void {
        if (this._destroyed)
            return;
        this._enabled = false;
        for (let i = 0; i < this._wheels.length; i++)
            this._wheels[i].destroy();
        this._wheels.length = 0;
        this._vehicleBody = null;
        this._physicsManager = null;
        this._destroyed = true;
    }
}
