import { ConstraintComponent } from "./ConstraintComponent";
import { Laya3D } from "../../../../Laya3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * @en Fixed constraint. Used to fix two rigidbodies together.
 * @zh 固定约束，用于将两个刚体固定在一起。
 */
export class FixedConstraint extends ConstraintComponent {

    /** @ignore */
    constructor() {
        super();
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    protected _initJoint() {
        this._physicsManager = this.owner._scene._physicsManager;
        if (Laya3D.enablePhysics && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_FixedJoint)) {
            this._joint = Laya3D.PhysicsCreateUtil.createFixedJoint(this._physicsManager);
        } else {
            console.error("Rigidbody3D: cant enable Rigidbody3D");
        }
    }

    protected _onEnable(): void {
        super._onEnable();
        if (this._joint)
            this._joint.isEnable(true);
    }

    protected _onDisable(): void {
        if (this._joint)
            this._joint.isEnable(false);
    }
}