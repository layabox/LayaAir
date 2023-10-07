import { Laya3D } from "../../../Laya3D";
import { IStaticCollider } from "../../Physics3D/interface/IStaticCollider";
import { EColliderCapable } from "../../Physics3D/physicsEnum/EColliderCapable";
import { EPhysicsCapable } from "../../Physics3D/physicsEnum/EPhycisCapable";
import { Scene3D } from "../core/scene/Scene3D";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";
import { Event } from "../../events/Event";

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
        if (Laya3D.enablePhysics && this._physicsManager && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_StaticCollider)) {
            this._collider = Laya3D.PhysicsCreateUtil.createStaticCollider(this._physicsManager);
        }
        else {
            throw "PhysicsCollider:cant enable PhysicsCollider";
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
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_AllowTrigger)) {
            this._collider.setTrigger(value);
            this._setEventFilter();
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

    /**
     * @internal
     */
    protected _setEventFilter() {
        if (this._collider && this._collider.getCapable(EColliderCapable.Collider_EventFilter)) {
            this._eventsArray = [];
            // event 
            if (this.isTrigger && this.owner.hasListener(Event.TRIGGER_ENTER)) {
                this._eventsArray.push(Event.TRIGGER_ENTER);
            }
            if (this.isTrigger && this.owner.hasListener(Event.TRIGGER_STAY)) {
                this._eventsArray.push(Event.TRIGGER_STAY);
            }
            if (this.isTrigger && this.owner.hasListener(Event.TRIGGER_EXIT)) {
                this._eventsArray.push(Event.TRIGGER_EXIT);
            }
            if (this.owner.hasListener(Event.COLLISION_ENTER)) {
                this._eventsArray.push(Event.COLLISION_ENTER);
            }
            if (this.owner.hasListener(Event.COLLISION_STAY)) {
                this._eventsArray.push(Event.COLLISION_STAY);
            }
            if (this.owner.hasListener(Event.COLLISION_EXIT)) {
                this._eventsArray.push(Event.COLLISION_EXIT);
            }
            this._collider.setEventFilter(this._eventsArray);
        }
    }
}


