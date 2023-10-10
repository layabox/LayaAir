import { Vector2 } from "../maths/Vector2"

export class Physics2DOption {
    allowSleeping: boolean;
    gravity: Vector2;
    customUpdate: boolean;
    velocityIterations: number;
    positionIterations: number;
    //单位 TODO
}