import { Laya3D } from "../../../../Laya3D";
import { ISpringJoint } from "../../../Physics3D/interface/Joint/ISpringJoint";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { Scene3D } from "../../core/scene/Scene3D";
import { ConstraintComponent } from "./ConstraintComponent";

/**
 * @en The `SpringConstraint` class represents a type of constraint that simulates spring behavior in a physics simulation.
 * @zh `SpringConstraint` 类表示一种在物理模拟中模拟弹簧行为的约束类型。
 */
export class SpringConstraint extends ConstraintComponent {
    /**@internal */
    _joint: ISpringJoint;
    /**@internal */
    private _minDistance: number = 0;
    /**@internal */
    private _damping: number = 0.2;
    /**@internal */
    private _maxDistance: number = Number.MAX_VALUE;
    /**@internal */
    private _tolerance: number = 0.025;
    /**@internal */
    private _stiffness: number = 10;

    /**
     * @internal
     */
    protected _initJoint(): void {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_SpringJoint)) {
            this._joint = Laya3D.PhysicsCreateUtil.createSpringJoint(this._physicsManager);
        } else {
            console.error("SpringConstraint: cant enable SpringConstraint");
        }
    }

    /**
     * @internal
     * @protected
     */
    protected _onAdded(): void {
        super._onAdded();
    }

    /**
     * @en the minimum distance at which a spring constraint begins to exert a separating force when the distance between objects reaches or falls below this value.
     * If the objects get closer than this, the spring applies a separating force to push them apart to a safe distance. When the distance is at or above the set value, the spring doesn't exert any stretching force.
     * @zh 弹簧关节在物体间距达到或小于此值时开始施加分离力的最小距离。
     * 如果物体间距小于这个值，弹簧会施加分离力将它们推开到安全距离。而当距离达到或超过设定值时，弹簧不会施加任何拉伸力。
     */
    get minDistance() {
        return this._minDistance;
    }

    set minDistance(value: number) {
        this._minDistance = value;
        this._joint && this._joint.setMinDistance(value);
    }

    /**
     * @en the maximum distance in a spring constraint, where the spring starts pulling the objects together if they exceed this distance.
     * @zh 两个物体之间的最大允许距离。当物体间距超过这个值时，弹簧会施加拉力使物体靠近。
     */
    get maxDistance() {
        return this._maxDistance;
    }

    set maxDistance(value: number) {
        this._maxDistance = value;
        this._joint && this._joint.setMaxDistance(value);
    }

    /**
     * @en refers to the allowable margin of error in a physics engine, used to handle contact or constraints between objects, ensuring the system has a certain degree of tolerance in calculations.
     * @zh 弹簧的误差容限。
     * 用于处理物体之间的接触或约束时，确保系统在计算中具有一定的容忍度，以避免由于数值计算精度问题导致的不稳定或错误行为。
     */
    get tolerance() {
        return this._tolerance;
    }

    set tolerance(value: number) {
        this._tolerance = value;
        this._joint && this._joint.setTolerance(value);
    }

    /**
     * @en used to set the stiffness of a spring or constraint, adjusting the strength of the force or constraint between objects.
     * @zh 弹簧的刚度，以控制物体之间的弹力或约束强度。
     */
    get spring() {
        return this._stiffness;
    }

    set spring(value: number) {
        this._stiffness = value;
        this._joint && this._joint.setStiffness(value);
    }

    /**
     * @en The damping of the spring.
     * @zh 弹簧的阻尼值。
     */
    get damping() {
        return this._damping;
    }
    
    set damping(value: number) {
        this._damping = value;
        this._joint && this._joint.setDamping(value);
    }



}