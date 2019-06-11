import { Rand } from "../../../../math/Rand";
import { Vector2 } from "../../../../math/Vector2";
import { Vector3 } from "../../../../math/Vector3";
/**
 * ...
 * @author ...
 */
export declare class ShapeUtils {
    static _randomPointUnitArcCircle(arc: number, out: Vector2, rand?: Rand): void;
    static _randomPointInsideUnitArcCircle(arc: number, out: Vector2, rand?: Rand): void;
    static _randomPointUnitCircle(out: Vector2, rand?: Rand): void;
    static _randomPointInsideUnitCircle(out: Vector2, rand?: Rand): void;
    static _randomPointUnitSphere(out: Vector3, rand?: Rand): void;
    static _randomPointInsideUnitSphere(out: Vector3, rand?: Rand): void;
    static _randomPointInsideHalfUnitBox(out: Vector3, rand?: Rand): void;
    constructor();
}
