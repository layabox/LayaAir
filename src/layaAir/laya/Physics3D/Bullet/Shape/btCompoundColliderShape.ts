import { PhysicsColliderComponent } from "../../../d3/physics/PhysicsColliderComponent";
import { Physics3DColliderShape } from "../../../d3/physics/shape/Physics3DColliderShape";
import { Vector3 } from "../../../maths/Vector3";
import { ICompoundColliderShape } from "../../interface/Shape/ICompoundColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";

/**
 * @en use to create compound collider.
 * @zh 用于创建组合碰撞器。
 */
export class btCompoundColliderShape extends btColliderShape implements ICompoundColliderShape {
	/**@internal */
	private _physicsComponent: PhysicsColliderComponent;
	/**@internal */
	private _btVector3One: any;
	/**@internal */
	private _btTransform: any;
	/**@internal */
	private _btOffset: any;
	/**@internal */
	private _btRotation: any;

	/**@internal */
	private _childColliderShapes: Physics3DColliderShape[] = [];

	/**
	 * @en create a new instance of btCompoundColliderShape.
	 * @zh 创建一个新的组合碰撞形状实例。
	 */
	constructor() {
		super();
		let bt = btPhysicsCreateUtil._bt;
		this._btVector3One = bt.btVector3_create(1, 1, 1);
		this._btTransform = bt.btTransform_create();
		this._btOffset = bt.btVector3_create(0, 0, 0);
		this._btRotation = bt.btQuaternion_create(0, 0, 0, 1);
		this._btShape = bt.btCompoundShape_create();
	}

	clearChildShape(): void {
		throw new Error("Method not implemented.");
	}

	protected _getType(): number {
		return this._type = btColliderShape.SHAPETYPES_COMPOUND;
	}

	addChildShape(shape: btColliderShape): void {
		var offset: Vector3 = shape.getOffset();
		var bt: any = btPhysicsCreateUtil._bt;
		bt.btVector3_setValue(this._btOffset, offset.x, offset.y, offset.z);
		// 这里没有设置形状的旋转，默认为不旋转了
		bt.btQuaternion_setValue(this._btRotation, 0, 0, 0, 1);
		bt.btTransform_setOrigin(this._btTransform, this._btOffset);
		bt.btTransform_setRotation(this._btTransform, this._btRotation);

		var btScale: number = bt.btCollisionShape_getLocalScaling(this._btShape);
		bt.btCollisionShape_setLocalScaling(this._btShape, this._btVector3One);
		let childShape = shape.getPhysicsShape();
		childShape && bt.btCompoundShape_addChildShape(this._btShape, this._btTransform, childShape);
		bt.btCollisionShape_setLocalScaling(this._btShape, btScale);

	}

	removeChildShape(shape: btColliderShape, index: number): void {
		let bt = btPhysicsCreateUtil._bt;
		bt.btCompoundShape_removeChildShapeByIndex(this._btShape, index);
	}

	setShapeData(component: PhysicsColliderComponent): void {
		this._physicsComponent = component;
	}

	getChildShapeCount(): number {
		return this._childColliderShapes.length;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(): void {
		super.destroy();
		this._btRotation = null;
		this._btTransform = null;
		this._btVector3One = null;
		this._btOffset = null;
	}

}


