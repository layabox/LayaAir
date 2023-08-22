import { Vector3 } from "../../../maths/Vector3";
import { ISpringJoint } from "../../interface/Joint/ISpringJoint";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";

export class btSpringJoint extends btJoint implements ISpringJoint {

    constructor(manager: btPhysicsManager) {
        super(manager);
    }

    setSwingOffset(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    setMinDistance(distance: number): void {
        throw new Error("Method not implemented.");
    }
    setMaxDistance(distance: number): void {
        throw new Error("Method not implemented.");
    }
    setTolerance(tolerance: number): void {
        throw new Error("Method not implemented.");
    }
    setStiffness(stiffness: number): void {
        throw new Error("Method not implemented.");
    }
    setDamping(damping: number): void {
        throw new Error("Method not implemented.");
    }

}