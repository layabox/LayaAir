import { ILaya3D } from "../../../ILaya3D";
import { Vector3 } from "../../maths/Vector3";
import { RaycastWheel } from "./RaycastWheel";
export class btVehicleTuning {
    suspensionStiffness = 15.88;
    suspensionCompression = 0.83;
    suspensionDamping = 0.88;
    maxSuspensionTravelCm = 500;
    frictionSlip = 10.5;
    maxSuspensionForce = 6000;
}

/**
 * @internal
 */
export class btWheelInfo {
    btPointer: number;
}

export class RaycastVehicle {
    userdata: any;
    btVehiclePtr: number;
    //tuning
    tuing = new btVehicleTuning();
    private wheels:RaycastWheel[]=[];

    constructor(btObj: number) {
        this.btVehiclePtr = btObj;
    }

    addWheel(connectionPointCS0: Vector3, wheelDirectionCS0: Vector3, wheelAxleCS: Vector3, wheelRadius: number,
        suspensionRestLength: number,
        suspensionMaxTravel:number,
        suspensionStiffness:number,
        suspensionDamping:number,
        frictionSlip:number,
        isFrontWheel: boolean) {
            
        let bt: any = ILaya3D.Physics3D._bullet;
        let tuing = this.tuing;

        let id = this.getNumWheels();
        let wheelinfo = bt.btRaycastVehicle_addWheel(this.btVehiclePtr, connectionPointCS0.x, connectionPointCS0.y, connectionPointCS0.z,
            wheelDirectionCS0.x, wheelDirectionCS0.y, wheelDirectionCS0.z,
            wheelAxleCS.x, wheelAxleCS.y, wheelAxleCS.z,
            suspensionRestLength,
            wheelRadius,
            suspensionStiffness || tuing.suspensionStiffness,
            tuing.suspensionCompression,
            suspensionDamping   || tuing.suspensionDamping,
            frictionSlip        || tuing.frictionSlip,
            (suspensionMaxTravel?suspensionMaxTravel*100:tuing.maxSuspensionTravelCm),
            tuing.maxSuspensionForce,
            isFrontWheel
        )

        let wheel =  new RaycastWheel(wheelinfo);
        this.wheels.push(wheel);
        // 更新每个wheel的指针。 因为前面返回的指针在这次push之后会失效
        for(let i=0,n=this.wheels.length; i<n; i++){
            let cwheel = this.wheels[i];
            cwheel.btWheelPtr = this.getWheelInfo(i);
        }
        return wheel;
    }

    getNumWheels() {
        let bt: any = ILaya3D.Physics3D._bullet;
        return bt.btRaycastVehicle_getNumWheels(this.btVehiclePtr);
    }

    getWheelInfo(i: number) {
        let bt: any = ILaya3D.Physics3D._bullet;
        return bt.btRaycastVehicle_getWheelInfo(this.btVehiclePtr, i);
    }
}