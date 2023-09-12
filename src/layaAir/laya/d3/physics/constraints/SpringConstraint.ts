import { ISpringJoint } from "../../../Physics3D/interface/Joint/ISpringJoint";
import { ConstraintComponent } from "./ConstraintComponent";

export class SpringConstraint extends ConstraintComponent {
    /**@internal */
    _joint: ISpringJoint;
    /**@internal */
    private _minDistance: number = 0;
    /**@internal */
    private _damping: number = 0;
    /**@internal */
    private _maxDistance: number = Number.MAX_VALUE;
    /**@internal */
    private _tolerance: number;
    /**@internal */
    private _stiffness: number;

    /**
     * set spring min Distance
     */
    set minDistance(value: number) {
        this._minDistance = value;
        this._joint && this._joint.setMinDistance(value);
    }

    get minDistance() {
        return this._minDistance;
    }

    /**
     * set spring max Distance
     */
    set maxDistance(value: number) {
        this._maxDistance = value;
        this._joint && this._joint.setMaxDistance(value);
    }

    get maxDistance() {
        return this._maxDistance;
    }

    /**
     * set sprint default length
     * Set the error tolerance of the joint.
     */
    set tolerance(value: number) {
        this._tolerance = value;
        this._joint && this._joint.setTolerance(value);
    }

    get tolerance() {
        return this._tolerance;
    }

    /**
     * set spring stifness
     */
    set spring(value: number) {
        this._stiffness = value;
        this._joint && this._joint.setStiffness(value);
    }

    get spring() {
        return this._stiffness;
    }

    /**
     * set damping in spring
     */
    set damping(value: number) {
        this._damping = value;
        this._joint && this._joint.setDamping(value);
    }

    get damping() {
        return this._damping;
    }

    

}