import { Component } from "../../components/Component"
import { PhysicsComponent } from "./PhysicsComponent"
import { ILaya3D } from "../../../ILaya3D";

/**
 * <code>PhysicsTriggerComponent</code> 类用于创建物理触发器组件。
 */
export class PhysicsTriggerComponent extends PhysicsComponent {
	/** @internal */
	private _isTrigger: boolean = false;

	/**
	 * 是否为触发器。
	 */
	get isTrigger(): boolean {
		return this._isTrigger;
	}

	set isTrigger(value: boolean) {
		this._isTrigger = value;
		var bt: any = ILaya3D.Physics3D._bullet;
		if (this._btColliderObject) {
			var flags: number = bt.btCollisionObject_getCollisionFlags(this._btColliderObject);
			if (value) {
				if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
					bt.btCollisionObject_setCollisionFlags(this._btColliderObject, flags | PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
			} else {
				if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
					bt.btCollisionObject_setCollisionFlags(this._btColliderObject, flags ^ PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
			}
		}
	}

	/**
	 * 创建一个 <code>PhysicsTriggerComponent</code> 实例。
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(collisionGroup: number, canCollideWith: number) {
		super(collisionGroup, canCollideWith);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		super._onAdded();
		this.isTrigger = this._isTrigger;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(dest: Component): void {
		super._cloneTo(dest);
		(<PhysicsTriggerComponent>dest).isTrigger = this._isTrigger;
	}
}

