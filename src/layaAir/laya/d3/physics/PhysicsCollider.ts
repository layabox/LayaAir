import { Laya3D } from "../../../Laya3D";
import { IStaticCollider } from "../../Physics3D/interface/IStaticCollider";
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
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        this._collider = Laya3D.PhysicsCreateUtil.createStaticCollider(this._physicsManager);
    }

    /**
     * 创建一个 <code>PhysicsCollider</code> 实例。
     * @param collisionGroup 所属碰撞组。
     * @param canCollideWith 可产生碰撞的碰撞组。
     */
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


