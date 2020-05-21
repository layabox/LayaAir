import { CannonPhysicsTriggerComponent } from "./CannonPhysicsTriggerComponent";

/**
 * <code>PhysicsCollider</code> 类用于创建物理碰撞器。
 */
export class CannonPhysicsCollider extends CannonPhysicsTriggerComponent {

	/**
	 * 创建一个 <code>PhysicsCollider</code> 实例。
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(collisionGroup: number = -1, canCollideWith: number = -1) {
		super(collisionGroup, canCollideWith);
		this._enableProcessCollisions = false;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addToSimulation(): void {
		this._simulation._addPhysicsCollider(this);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_removeFromSimulation(): void {
		this._simulation._removePhysicsCollider(this);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any): void {
		//TODO:
		(data.friction != null) && (this.friction = data.friction);
		//(data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
		(data.restitution != null) && (this.restitution = data.restitution);
		(data.isTrigger != null) && (this.isTrigger = data.isTrigger);
		super._parse(data);
		this._parseShape(data.shapes);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		this._btColliderObject = new CANNON.Body();
		this._btColliderObject.material = new CANNON.Material();
		this._btColliderObject.layaID = this._id;
		this._btColliderObject.type = CANNON.Body.STATIC;
		this._btColliderObject.collisionFilterGroup = this._collisionGroup;
		this._btColliderObject.collisionFilterMask = this._canCollideWith;
		super._onAdded();
	}
}


