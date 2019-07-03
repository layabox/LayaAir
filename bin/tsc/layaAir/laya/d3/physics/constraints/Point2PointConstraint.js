import { Vector3 } from "../../math/Vector3";
/**
 * <code>Point2PointConstraint</code> 类用于创建物理组件的父类。
 */
export class Point2PointConstraint {
    /**
     * 创建一个 <code>Point2PointConstraint</code> 实例。
     */
    constructor() {
        /**@internal */
        this._pivotInA = new Vector3();
        /**@internal */
        this._pivotInB = new Vector3();
    }
    get pivotInA() {
        return this._pivotInA;
    }
    set pivotInA(value) {
        this._pivotInA = value;
    }
    get pivotInB() {
        return this._pivotInB;
    }
    set pivotInB(value) {
        this._pivotInB = value;
    }
    get damping() {
        return this._damping;
    }
    set damping(value) {
        this._damping = value;
    }
    get impulseClamp() {
        return this._impulseClamp;
    }
    set impulseClamp(value) {
        this._impulseClamp = value;
    }
    get tau() {
        return this._tau;
    }
    set tau(value) {
        this._tau = value;
    }
}
