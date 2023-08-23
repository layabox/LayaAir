import { Laya3D } from "../../../Laya3D";
import { IStaticCollider } from "../../Physics3D/interface/IStaticCollider";
import { EColliderCapable } from "../../Physics3D/physicsEnum/EColliderCapable";
import { Scene3D } from "../core/scene/Scene3D";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";

/**
 * <code>PhysicsCollider</code> 类用于创建物理碰撞器。
 */
export class PhysicsCollider extends PhysicsColliderComponent {
    /** @internal */
    private _isTrigger: boolean = false;

    /**
     * @override
     * @interanl
     */
    _collider: IStaticCollider;

    /**
     * @override
     * @interanl
     */
    protected _initCollider() {
        if (Laya3D.enablePhysics) {
            this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
            this._collider = Laya3D.PhysicsCreateUtil.createStaticCollider(this._physicsManager);
        }
    }

    constructor() {
        super();
    }

    /**
     * 是否为触发器。
     */
    get isTrigger(): boolean {
        return this._isTrigger;
    }

    set isTrigger(value: boolean) {
        this._isTrigger = value;
        if(this._collider.getCapable(EColliderCapable.Collider_AllowTrigger)){
            this._collider.setTrigger && this._collider.setTrigger(value);
        }
    }

    /**
     * @deprecated
     * @inheritDoc
     * @override
     * @internal
     */
    _parse(data: any): void {
        (data.friction != null) && (this.friction = data.friction);
        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
        (data.restitution != null) && (this.restitution = data.restitution);
        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
        super._parse(data);
        this._parseShape(data.shapes);
    }
}


