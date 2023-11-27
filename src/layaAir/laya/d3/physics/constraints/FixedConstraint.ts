import { ConstraintComponent } from "./ConstraintComponent";
import { Laya3D } from "../../../../Laya3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

export class FixedConstraint extends ConstraintComponent {

    /**
     * 创建一个<code>FixedConstraint</code>实例
     */
    constructor() {
        super();
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    protected _initJoint() {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_FixedJoint)) {
            this._joint = Laya3D.PhysicsCreateUtil.createFixedJoint(this._physicsManager);
        } else {
            console.error("Rigidbody3D: cant enable Rigidbody3D");
        }
    }

    protected _onEnable(): void {
        if (this._joint)
            this._joint.isEnable(true);
    }

    protected _onDisable(): void {
        if (this._joint)
            this._joint.isEnable(false);
    }
}