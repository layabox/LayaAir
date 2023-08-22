import { ICustomJoint } from "../../interface/Joint/ICustomJoint";
import { btPhysicsManager } from "../btPhysicsManager";
import { btJoint } from "./btJoint";

export class btCustomJoint extends btJoint implements ICustomJoint{
    constructor(manager: btPhysicsManager){
        super(manager);
    }
}