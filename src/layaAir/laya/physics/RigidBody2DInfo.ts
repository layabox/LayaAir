import { Vector2 } from "../maths/Vector2";

export class RigidBody2DInfo {
    position: Vector2 = new Vector2()
    angle: number;
    allowSleep: boolean
    angularDamping: number;
    angularVelocity: number;
    bullet: boolean;
    fixedRotation: boolean;
    gravityScale: number;
    linearDamping: number;
    linearVelocity: Vector2 = new Vector2();
    type: string;
    group: number;
}