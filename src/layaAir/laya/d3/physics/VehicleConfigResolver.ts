import { Vector3 } from "../../maths/Vector3";
import { VehicleWheelDesc } from "../../Physics3D/interface/IVehicle/IPhysicsVehicle";
import { Sprite3D } from "../core/Sprite3D";
import { WheelCenterMode, WheelCollider } from "./WheelCollider";

/**
 * Pure vehicle configuration resolver shared by runtime backends and editor previews.
 * The output uses the public vehicle SI contract: metres, newtons, N/m and N*s/m.
 */
export class VehicleConfigResolver {
    /**
     * Captures one wheel into the canonical backend descriptor without creating native state.
     * `uniformScale` must be the already validated positive uniform chassis world scale.
     */
    static captureWheelDesc(
        chassis: Sprite3D,
        wheel: WheelCollider,
        uniformScale: number,
        out: VehicleWheelDesc,
        tempCenter: Vector3
    ): void {
        let center: Vector3;
        if (wheel.centerMode === WheelCenterMode.OwnerLocalPosition) {
            chassis.transform.globalToLocal(wheel.owner.transform.position, tempCenter);
            center = tempCenter;
        }
        else {
            center = wheel.center;
        }

        out.wheel = wheel;
        out.centerX = center.x * uniformScale;
        out.centerY = center.y * uniformScale;
        out.centerZ = center.z * uniformScale;
        out.radius = wheel.radius * uniformScale;
        out.suspensionRestLength = wheel.suspensionRestLength * uniformScale;
        out.maxSuspensionTravel = wheel.maxSuspensionTravel * uniformScale;
        out.springStiffness = wheel.springStiffness;
        out.compressionDamping = wheel.compressionDamping;
        out.reboundDamping = wheel.reboundDamping;
        out.maxSuspensionForce = wheel.maxSuspensionForce;
        out.frictionStiffness = wheel.frictionStiffness;
    }
}

