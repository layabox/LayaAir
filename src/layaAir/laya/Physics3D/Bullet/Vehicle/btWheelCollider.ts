import { IPhysicsWheelCollider } from "../../interface/IVehicle/IPhysicsWheelCollider";
import { VehicleWheelDesc, VehicleWheelState } from "../../interface/IVehicle/IPhysicsVehicle";
import { Quaternion } from "../../../maths/Quaternion";
import { btCollider } from "../Collider/btCollider";
import { btStatics } from "../btStatics";

/** @internal Bullet wheel adapter backed by explicit C exports. */
export class btWheelCollider implements IPhysicsWheelCollider {
    /** Removes Bullet's internal (-X, +Y, -Z) wheel display basis. */
    private static readonly _nativeWheelBasisInverse: Quaternion = new Quaternion(0, -1, 0, 0);

    private _btWheelInfo: number = 0;
    private _maxSuspensionForce: number = 0;
    private _state: VehicleWheelState = new VehicleWheelState();

    constructor(private _btVehicle: number, private _wheelIndex: number) {
        this._refreshWheelInfo();
    }

    private _refreshWheelInfo(): number {
        if (!this._btVehicle)
            return 0;
        this._btWheelInfo = btStatics.bt.btRaycastVehicle_getWheelInfo(this._btVehicle, this._wheelIndex);
        return this._btWheelInfo;
    }

    applyConfig(desc: VehicleWheelDesc, chassisMass: number): void {
        if (!this._refreshWheelInfo())
            return;
        const bt = btStatics.bt;
        const mass = Math.max(chassisMass, 0.0001);
        this._maxSuspensionForce = desc.maxSuspensionForce;
        bt.btWheelInfo_setChassisConnectionPointCS(this._btWheelInfo, desc.centerX, desc.centerY, desc.centerZ);
        bt.btWheelInfo_setRadius(this._btWheelInfo, desc.radius);
        bt.btWheelInfo_setSuspensionRestLength(this._btWheelInfo, desc.suspensionRestLength);
        bt.btWheelInfo_setMaxSuspensionTravelCm(this._btWheelInfo, desc.maxSuspensionTravel * 100.0);
        bt.btWheelInfo_setSuspensionStiffness(this._btWheelInfo, desc.springStiffness / mass);
        bt.btWheelInfo_setWheelsDampingCompression(this._btWheelInfo, desc.compressionDamping / mass);
        bt.btWheelInfo_setWheelsDampingRelaxation(this._btWheelInfo, desc.reboundDamping / mass);
        bt.btWheelInfo_setMaxSuspensionForce(this._btWheelInfo, desc.maxSuspensionForce);
        // frictionSlip is the dimensionless suspension-force multiplier used by Bullet.
        bt.btWheelInfo_setFrictionSlip(this._btWheelInfo, desc.frictionStiffness);
    }

    /** Captures the completed physics step before display transforms clear native contact flags. */
    capturePhysicsState(fixedDeltaTime: number): void {
        const outState = this._state;
        if (!this._refreshWheelInfo()) {
            this._clearState(outState);
            return;
        }

        const bt = btStatics.bt;
        outState.isContact = !!bt.btWheelInfo_getIsInContact(this._btWheelInfo);
        outState.currentSuspensionLength = bt.btWheelInfo_getSuspensionLength(this._btWheelInfo);
        outState.suspensionForce = Math.min(
            this._maxSuspensionForce,
            bt.btWheelInfo_getSuspensionForce(this._btWheelInfo)
        );
        outState.skidInfo = bt.btWheelInfo_getSkidInfo(this._btWheelInfo);
        outState.rotation = bt.btWheelInfo_getRotation(this._btWheelInfo);
        outState.angularSpeed = bt.btWheelInfo_getAngularVelocity(this._btWheelInfo, fixedDeltaTime);
        outState.rpm = outState.angularSpeed * 60.0 / (2.0 * Math.PI);

        if (outState.isContact) {
            const point = bt.btWheelInfo_getContactPointWS(this._btWheelInfo);
            const normal = bt.btWheelInfo_getContactNormalWS(this._btWheelInfo);
            outState.contactPos.setValue(bt.btVector3_x(point), bt.btVector3_y(point), bt.btVector3_z(point));
            outState.contactNormal.setValue(bt.btVector3_x(normal), bt.btVector3_y(normal), bt.btVector3_z(normal));
            const groundObject = bt.btWheelInfo_getGroundObject(this._btWheelInfo);
            if (groundObject) {
                const userIndex = bt.btCollisionObject_getUserIndex(groundObject);
                outState.otherCollider = btCollider._physicObjectsMap[userIndex] || null;
            } else {
                outState.otherCollider = null;
            }
        } else {
            outState.otherCollider = null;
            outState.contactPos.setValue(0, 0, 0);
            outState.contactNormal.setValue(0, 1, 0);
        }
    }

    /** Updates the display pose without replacing the captured physics result. */
    updateWorldTransform(): void {
        if (!this._btWheelInfo)
            return;
        const bt = btStatics.bt;
        const outState = this._state;
        bt.btRaycastVehicle_updateWheelTransform(this._btVehicle, this._wheelIndex, true);
        const transform = bt.btWheelInfo_getWorldTransform(this._btWheelInfo);
        if (transform) {
            const origin = bt.btTransform_getOrigin(transform);
            const rotation = bt.btTransform_getRotation(transform);
            outState.worldPosition.setValue(bt.btVector3_x(origin), bt.btVector3_y(origin), bt.btVector3_z(origin));
            outState.worldRotation.setValue(
                bt.btQuaternion_x(rotation), bt.btQuaternion_y(rotation),
                bt.btQuaternion_z(rotation), bt.btQuaternion_w(rotation)
            );
            // Keep Bullet's physical axle unchanged and normalize only the public display basis.
            Quaternion.multiply(
                outState.worldRotation,
                btWheelCollider._nativeWheelBasisInverse,
                outState.worldRotation
            );
        }
    }

    readState(outState: VehicleWheelState, _fixedDeltaTime: number): void {
        const state = this._state;
        outState.isContact = state.isContact;
        outState.otherCollider = state.otherCollider;
        state.contactPos.cloneTo(outState.contactPos);
        state.contactNormal.cloneTo(outState.contactNormal);
        outState.currentSuspensionLength = state.currentSuspensionLength;
        outState.suspensionForce = state.suspensionForce;
        outState.skidInfo = state.skidInfo;
        outState.rotation = state.rotation;
        outState.angularSpeed = state.angularSpeed;
        outState.rpm = state.rpm;
        state.worldPosition.cloneTo(outState.worldPosition);
        state.worldRotation.cloneTo(outState.worldRotation);
    }

    resetState(): void {
        this._clearState(this._state);
    }

    private _clearState(outState: VehicleWheelState): void {
        outState.isContact = false;
        outState.otherCollider = null;
        outState.currentSuspensionLength = 0;
        outState.suspensionForce = 0;
        outState.skidInfo = 1;
        outState.rotation = 0;
        outState.angularSpeed = 0;
        outState.rpm = 0;
        outState.contactPos.setValue(0, 0, 0);
        outState.contactNormal.setValue(0, 1, 0);
        outState.worldPosition.setValue(0, 0, 0);
        outState.worldRotation.setValue(0, 0, 0, 1);
    }

    destroy(): void {
        this.resetState();
        this._btWheelInfo = 0;
        this._btVehicle = 0;
        this._wheelIndex = -1;
    }
}
