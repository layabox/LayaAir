import { Vector2 } from "../../maths/Vector2";

/**
 * Box2D distance Joint def Struct
 */
export class physics2D_DistancJointDef {
    bodyA: any;
    bodyB: any;
    localAnchorA: Vector2 = new Vector2();
    localAnchorB: Vector2 = new Vector2();
    frequency: number;
    dampingRatio: number;
    collideConnected: boolean;
    length: number;
    maxLength: number;
    minLength: number;
}

class physics2D_GearJointDef {
    //TODO
}

class physics2D_MotorJointDef {
    //TODO
}

class physics2D_MouseJointJointDef {
    //TODO
}

class physics2D_PrismaticJointDef {
    //TODO
}

class physics2D_PulleyJointDef {
    //TODO
}

class physics2D_RevoluteJointDef {
    //TODO
}

class physics2D_WeldJointDef {
    //TODO
}

class physics2D_WheelJointDef {
    //TODO
}

