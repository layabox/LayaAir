import { Laya3D } from "../../../Laya3D";
import { IStaticCollider } from "../../Physics3D/interface/IStaticCollider";
import { EColliderCapable } from "../../Physics3D/physicsEnum/EColliderCapable";
import { EPhysicsCapable } from "../../Physics3D/physicsEnum/EPhycisCapable";
import { Scene3D } from "../core/scene/Scene3D";
import { PhysicsColliderComponent } from "./PhysicsColliderComponent";
import { Event } from "../../events/Event";

/**
 * @en PhysicsCollider is a class used to create physical collider.
 * @zh PhysicsCollider 类用于创建物理碰撞器。
 */
export class PhysicsCollider extends PhysicsColliderComponent {
    /** @internal */
    private _isTrigger: boolean = false;

    /** @internal */
    private _allowSleep: boolean = true;

    /**@override @internal */
    _collider: IStaticCollider;

    /**
     * @internal
     * @override
     */
    protected _initCollider() {
        this._physicsManager = ((<Scene3D>this.owner._scene))._physicsManager;
        if (Laya3D.enablePhysics && this._physicsManager && Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_StaticCollider)) {
            this._collider = Laya3D.PhysicsCreateUtil.createStaticCollider(this._physicsManager);
            this._collider.component = this;
        }
        else {
            console.error("PhysicsCollider:cant enable PhysicsCollider");
        }
    }
    /** @ignore */
    constructor() {
        super();
    }

    _onAdded(): void {
        super._onAdded();
        this.restitution = this._restitution;
        this.friction = this._friction;
        this.rollingFriction = this._rollingFriction;
        this.isTrigger = this._isTrigger;
        this.allowSleep = this._allowSleep;
    }

    /**
     * @en If this collider is a trigger. A trigger will trigger events but not produce actual physical blocking effects.
     * @zh 此碰撞器是否为触发器。触发器会触发事件但不会产生实际的物理阻挡效果。
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
     * @en Whether the collider allows sleep.
     * @zh 是否允许碰撞器睡眠。
     */
    get allowSleep(): boolean {
        return this._allowSleep;
    }

    set allowSleep(value: boolean) {
        this._allowSleep = value;
        if (this._collider && this._collider.getCapable(EColliderCapable.RigidBody_AllowSleep)) {
            this._collider.allowSleep(value);
        }
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


