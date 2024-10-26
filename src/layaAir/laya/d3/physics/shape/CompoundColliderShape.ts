import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { ILaya3D } from "../../../../ILaya3D";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";

/**
 * @deprecated
 * <code>CompoundColliderShape</code> 类用于创建组合碰撞器。
 */
export class CompoundColliderShape extends Physics3DColliderShape {
	/**@internal */
	private static _btVector3One: number;
	/**@internal */
	private static _btTransform: number;
	/**@internal */
	private static _btOffset: number;
	/**@internal */
	private static _btRotation: number;

	/**
	 * @internal
	 */
	static __init__(): void {
		//var bt: any = ILaya3D.Physics3D._bullet;
		// CompoundColliderShape._btVector3One = bt.btVector3_create(1, 1, 1);
		// CompoundColliderShape._btTransform = bt.btTransform_create();
		// CompoundColliderShape._btOffset = bt.btVector3_create(0, 0, 0);
		// CompoundColliderShape._btRotation = bt.btQuaternion_create(0, 0, 0, 1);
	}

	/**@internal */
	private _childColliderShapes: Physics3DColliderShape[] = [];

	/**
	 * 创建一个新的 <code>CompoundColliderShape</code> 实例。
	 */
	constructor() {
		super();
		// this._type = Physics3DColliderShape.;
		// this._btShape = ILaya3D.Physics3D._bullet.btCompoundShape_create();
	}

	/**
	 * @internal
	 */
	private _clearChildShape(shape: any): void {
		shape._attatched = false;
		shape._compoundParent = null;
		shape._indexInCompound = -1;
	}

	/**
	 * @internal
	 */
	_updateChildTransform(shape: any): void {
		// var bt: any = ILaya3D.Physics3D._bullet;
		// var offset: Vector3 = shape.localOffset;
		// var rotation: Quaternion = shape.localRotation;
		// var btOffset: number = ColliderShape._btVector30;
		// var btQuaternion: number = ColliderShape._btQuaternion0;
		// var btTransform: number = ColliderShape._btTransform0;
		// bt.btVector3_setValue(btOffset, offset.x, offset.y, offset.z);
		// bt.btQuaternion_setValue(btQuaternion, rotation.x, rotation.y, rotation.z, rotation.w);
		// bt.btTransform_setOrigin(btTransform, btOffset);
		// bt.btTransform_setRotation(btTransform, btQuaternion);
		// bt.btCompoundShape_updateChildTransform(this._btShape, shape._indexInCompound, btTransform, true);
	}


	/**
	 * 设置物理shape数组
	 * IDE
	 */
	public set shapes(value: any[]) {
		for (var i = this._childColliderShapes.length - 1; i >= 0; i--) {
			this.removeChildShape(this._childColliderShapes[i]);
		}

		for (var i = 0; i < value.length; i++) {
			this.addChildShape(value[i]);
		}
	}

	public get shapes(): any[] {
		return this._childColliderShapes;
	}

	/**
	 * 添加子碰撞器形状。
	 * @param	shape 子碰撞器形状。
	 */
	addChildShape(shape: any): void {
		// if (shape._attatched)
		// 	throw "CompoundColliderShape: this shape has attatched to other entity.";

		// shape._attatched = true;
		// shape._compoundParent = this;
		// shape._indexInCompound = this._childColliderShapes.length;
		// this._childColliderShapes.push(shape);
		// var offset: Vector3 = shape.localOffset;
		// var rotation: Quaternion = shape.localRotation;
		// var bt: any = ILaya3D.Physics3D._bullet;
		// bt.btVector3_setValue(CompoundColliderShape._btOffset, offset.x, offset.y, offset.z);
		// bt.btQuaternion_setValue(CompoundColliderShape._btRotation, rotation.x, rotation.y, rotation.z, rotation.w);
		// bt.btTransform_setOrigin(CompoundColliderShape._btTransform, CompoundColliderShape._btOffset);
		// bt.btTransform_setRotation(CompoundColliderShape._btTransform, CompoundColliderShape._btRotation);

		// var btScale: number = bt.btCollisionShape_getLocalScaling(this._btShape);
		// bt.btCollisionShape_setLocalScaling(this._btShape, CompoundColliderShape._btVector3One);
		// bt.btCompoundShape_addChildShape(this._btShape, CompoundColliderShape._btTransform, shape._btShape);
		// bt.btCollisionShape_setLocalScaling(this._btShape, btScale);

		// (this._attatchedCollisionObject) && (this._attatchedCollisionObject.colliderShape = this);//修改子Shape需要重新赋值父Shape以及将物理精灵重新加入物理世界等操作
	}

	/**
	 * 移除子碰撞器形状。
	 * @param	shape 子碰撞器形状。
	 */
	removeChildShape(shape:any): void {
		// if (shape._compoundParent === this) {
		// 	var index: number = shape._indexInCompound;
		// 	this._clearChildShape(shape);
		// 	var endShape: ColliderShape = this._childColliderShapes[this._childColliderShapes.length - 1];
		// 	endShape._indexInCompound = index;
		// 	this._childColliderShapes[index] = endShape;
		// 	this._childColliderShapes.pop();
		// 	ILaya3D.Physics3D._bullet.btCompoundShape_removeChildShapeByIndex(this._btShape, index);
		// }
	}

	/**
	 * 清空子碰撞器形状。
	 */
	clearChildShape(): void {
		// for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++) {
		// 	this._clearChildShape(this._childColliderShapes[i]);
		// 	ILaya3D.Physics3D._bullet.btCompoundShape_removeChildShapeByIndex(this._btShape, 0);
		// }
		// this._childColliderShapes.length = 0;
	}

	/**
	 * 获取子形状数量。
	 * @return
	 */
	getChildShapeCount(): number {
		return this._childColliderShapes.length;
	}

	/**
	 * 将数据克隆到目标节点
	 * @param 目标节点
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: CompoundColliderShape): void {
		destObject.clearChildShape();
		for (let i: number = 0, n: number = this._childColliderShapes.length; i < n; i++)
			destObject.addChildShape(this._childColliderShapes[i].clone());
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: CompoundColliderShape = new CompoundColliderShape();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(): void {
		// super.destroy();
		// for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++) {
		// 	var childShape: ColliderShape = this._childColliderShapes[i];
		// 	if (childShape._referenceCount === 0)
		// 		childShape.destroy();
		// }
	}

}


