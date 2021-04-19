import { Component } from "../../components/Component"
import { CannonPhysicsComponent } from "./CannonPhysicsComponent"

/**
 * <code>PhysicsTriggerComponent</code> 类用于创建物理触发器组件。
 */
export class CannonPhysicsTriggerComponent extends CannonPhysicsComponent {
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
		if (this._btColliderObject) {
			this._btColliderObject.isTrigger = value;
			if (value) {
				var flag = this._btColliderObject.type;
				//TODO:可能要改
				this._btColliderObject.collisionResponse = false;
				if((flag&CANNON.Body.STATIC)===0)
				this._btColliderObject.type |= CANNON.Body.STATIC;
			} else {
				//TODO：可能要改
				this._btColliderObject.collisionResponse = true;
				if((flag &CANNON.Body.STATIC) !== 0)
				this._btColliderObject.type ^= CANNON.Body.STATIC;
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
		(<CannonPhysicsTriggerComponent>dest).isTrigger = this._isTrigger;
	}
}

