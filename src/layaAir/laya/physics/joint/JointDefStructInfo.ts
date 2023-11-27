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
    isLocalAnchor: boolean
}

export class physics2D_GearJointDef {
    bodyA: any;
    bodyB: any;
    joint1: any;
    joint2: any;
    ratio: number;
    collideConnected: boolean;
}


export class physics2D_MotorJointDef {
    bodyA: any;
    bodyB: any;
    linearOffset: Vector2 = new Vector2();
    angularOffset: number;
    maxForce: number;
    maxTorque: number;
    correctionFactor: number;
    collideConnected: boolean;
}

export class physics2D_MouseJointJointDef {
    bodyA: any;
    bodyB: any;
    maxForce: number;
    frequency: number;
    dampingRatio: number;
    target: Vector2 = new Vector2();
}

export class physics2D_PrismaticJointDef {
    bodyA: any;
    bodyB: any;
    anchor: Vector2 = new Vector2();
    axis: Vector2 = new Vector2();
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorForce: number;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
    collideConnected: boolean;
}

export class physics2D_PulleyJointDef {
    bodyA: any;
    bodyB: any;
    groundAnchorA: Vector2 = new Vector2();
    groundAnchorB: Vector2 = new Vector2();
    localAnchorA: Vector2 = new Vector2();
    localAnchorB: Vector2 = new Vector2();
    ratio: number;
    collideConnected: boolean;
}

export class physics2D_RevoluteJointDef {
    bodyA: any;
    bodyB: any;
    anchor: Vector2 = new Vector2();
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
    enableLimit: boolean;
    lowerAngle: number;
    upperAngle: number;
    collideConnected: boolean;
}

export class physics2D_WeldJointDef {
    bodyA: any;
    bodyB: any;
    anchor: Vector2 = new Vector2();
    frequency: number;
    dampingRatio: number;
    collideConnected: boolean;
}

export class physics2D_WheelJointDef {
    bodyA: any;
    bodyB: any;
    anchor: Vector2 = new Vector2();
    axis: Vector2 = new Vector2();
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
    frequency: number;
    dampingRatio: number;
    collideConnected: boolean;
}

