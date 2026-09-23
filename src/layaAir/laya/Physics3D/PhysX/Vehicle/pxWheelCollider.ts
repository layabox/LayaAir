import { IPhysicsWheelCollider } from "../../interface/IVehicle/IPhysicsWheelCollider";
import { VehicleWheelDesc, VehicleWheelState } from "../../interface/IVehicle/IPhysicsVehicle";
import { ICollider } from "../../interface/ICollider";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";

/** @internal Runtime/config storage for the TypeScript PhysX raycast solver. */
export class pxWheelCollider implements IPhysicsWheelCollider {
    _centerX: number = 0;
    _centerY: number = 0;
    _centerZ: number = 0;
    _radius: number = 0.4;
    _suspensionRestLength: number = 0.6;
    _maxSuspensionTravel: number = 0.5;
    _springStiffness: number = 20000;
    _compressionDamping: number = 3500;
    _reboundDamping: number = 4500;
    _maxSuspensionForce: number = 10000;
    _frictionStiffness: number = 1;

    _motorForce: number = 0;
    _brakeForce: number = 0;
    _steerAngle: number = 0;

    _isGrounded: boolean = false;
    _otherCollider: ICollider = null;
    _contactPos: Vector3 = new Vector3();
    _contactNormal: Vector3 = new Vector3(0, 1, 0);
    _currentSuspensionLength: number = 0.6;
    _suspensionForce: number = 0;
    _skidInfo: number = 1;
    _rotation: number = 0;
    _angularSpeed: number = 0;
    _worldPosition: Vector3 = new Vector3();
    _worldRotation: Quaternion = new Quaternion(0, 0, 0, 1);

    applyConfig(desc: VehicleWheelDesc, _chassisMass: number): void {
        this._centerX = desc.centerX;
        this._centerY = desc.centerY;
        this._centerZ = desc.centerZ;
        this._radius = desc.radius;
        this._suspensionRestLength = desc.suspensionRestLength;
        this._maxSuspensionTravel = desc.maxSuspensionTravel;
        this._springStiffness = desc.springStiffness;
        this._compressionDamping = desc.compressionDamping;
        this._reboundDamping = desc.reboundDamping;
        this._maxSuspensionForce = desc.maxSuspensionForce;
        this._frictionStiffness = desc.frictionStiffness;
        if (!this._isGrounded) {
            this._currentSuspensionLength = desc.suspensionRestLength;
        }
    }

    readState(outState: VehicleWheelState, _fixedDeltaTime: number): void {
        outState.isContact = this._isGrounded;
        outState.otherCollider = this._otherCollider;
        this._contactPos.cloneTo(outState.contactPos);
        this._contactNormal.cloneTo(outState.contactNormal);
        outState.currentSuspensionLength = this._currentSuspensionLength;
        outState.suspensionForce = this._suspensionForce;
        outState.skidInfo = this._skidInfo;
        outState.rotation = this._rotation;
        outState.angularSpeed = this._angularSpeed;
        outState.rpm = this._angularSpeed * 60.0 / (2.0 * Math.PI);
        this._worldPosition.cloneTo(outState.worldPosition);
        this._worldRotation.cloneTo(outState.worldRotation);
    }

    resetRuntimeState(): void {
        this._isGrounded = false;
        this._otherCollider = null;
        this._contactPos.setValue(0, 0, 0);
        this._contactNormal.setValue(0, 1, 0);
        this._currentSuspensionLength = this._suspensionRestLength;
        this._suspensionForce = 0;
        this._skidInfo = 1;
        this._rotation = 0;
        this._angularSpeed = 0;
    }

    destroy(): void {
        this._otherCollider = null;
    }
}
