import { Component } from "../../components/Component"
import { PhysicsComponent } from "./PhysicsComponent"
import { Physics3D } from "./Physics3D";

/**
 * <code>PhysicsTriggerComponent</code> 类用于创建物理触发器组件。
 */
export class PhysicsTriggerComponent extends PhysicsComponent {
	/** @internal */
	private _isTrigger: boolean = false;

	/**
	 * 获取是否为触发器。
	 * @return 是否为触发器。
	 */
	get isTrigger(): boolean {
		return this._isTrigger;
	}

	/**
	 * 设置是否为触发器。
	 * @param value 是否为触发器。
	 */
	set isTrigger(value: boolean) {
		this._isTrigger = value;
		var physics3D: any = Physics3D._bullet;
		if (this._nativeColliderObject) {
			var flags: number = physics3D.btCollisionObject_getCollisionFlags(this._nativeColliderObject);
			if (value) {
				if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
					physics3D.btCollisionObject_setCollisionFlags(this._nativeColliderObject, flags | PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
			} else {
				if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
					physics3D.btCollisionObject_setCollisionFlags(this._nativeColliderObject, flags ^ PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
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
		((<PhysicsTriggerComponent>dest)).isTrigger = this._isTrigger;
	}
}

