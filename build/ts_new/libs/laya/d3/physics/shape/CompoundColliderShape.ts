import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";

/**
 * <code>CompoundColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class CompoundColliderShape extends ColliderShape {
	/**@internal */
	private static _nativeVector3One: any;
	/**@internal */
	private static _nativeTransform: any;
	/**@internal */
	private static _nativeOffset: any;
	/**@internal */
	private static _nativRotation: any;

	/**
	 * @internal
	 */
	static __init__(): void {
		CompoundColliderShape._nativeVector3One = new Physics3D._physics3D.btVector3(1, 1, 1);
		CompoundColliderShape._nativeTransform = new Physics3D._physics3D.btTransform();
		CompoundColliderShape._nativeOffset = new Physics3D._physics3D.btVector3(0, 0, 0);
		CompoundColliderShape._nativRotation = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
	}

	/**@internal */
	private _childColliderShapes: ColliderShape[] = [];

	/**
	 * 创建一个新的 <code>CompoundColliderShape</code> 实例。
	 */
	constructor() {
		super();
		this._type = ColliderShape.SHAPETYPES_COMPOUND;
		this._nativeShape = new Physics3D._physics3D.btCompoundShape();
	}

	/**
	 * @internal
	 */
	private _clearChildShape(shape: ColliderShape): void {
		shape._attatched = false;
		shape._compoundParent = null;
		shape._indexInCompound = -1;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addReference(): void {
		//TODO:
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_removeReference(): void {
		//TODO:
	}

	/**
	 * @internal
	 */
	_updateChildTransform(shape: ColliderShape): void {
		var offset: Vector3 = shape.localOffset;
		var rotation: Quaternion = shape.localRotation;
		var nativeOffset: any = ColliderShape._nativeVector30;
		var nativeQuaternion: any = ColliderShape._nativQuaternion0;
		var nativeTransform: any = ColliderShape._nativeTransform0;
		nativeOffset.setValue(-offset.x, offset.y, offset.z);
		nativeQuaternion.setValue(-rotation.x, rotation.y, rotation.z, -rotation.w);
		nativeTransform.setOrigin(nativeOffset);
		nativeTransform.setRotation(nativeQuaternion);
		this._nativeShape.updateChildTransform(shape._indexInCompound, nativeTransform, true);
	}

	/**
	 * 添加子碰撞器形状。
	 * @param	shape 子碰撞器形状。
	 */
	addChildShape(shape: ColliderShape): void {
		if (shape._attatched)
			throw "CompoundColliderShape: this shape has attatched to other entity.";

		shape._attatched = true;
		shape._compoundParent = this;
		shape._indexInCompound = this._childColliderShapes.length;
		this._childColliderShapes.push(shape);
		var offset: Vector3 = shape.localOffset;
		var rotation: Quaternion = shape.localRotation;
		CompoundColliderShape._nativeOffset.setValue(-offset.x, offset.y, offset.z);
		CompoundColliderShape._nativRotation.setValue(-rotation.x, rotation.y, rotation.z, -rotation.w);
		CompoundColliderShape._nativeTransform.setOrigin(CompoundColliderShape._nativeOffset);
		CompoundColliderShape._nativeTransform.setRotation(CompoundColliderShape._nativRotation);

		var nativeScale: any = this._nativeShape.getLocalScaling();
		this._nativeShape.setLocalScaling(CompoundColliderShape._nativeVector3One);
		this._nativeShape.addChildShape(CompoundColliderShape._nativeTransform, shape._nativeShape);
		this._nativeShape.setLocalScaling(nativeScale);

		(this._attatchedCollisionObject) && (this._attatchedCollisionObject.colliderShape = this);//修改子Shape需要重新赋值父Shape以及将物理精灵重新加入物理世界等操作
	}

	/**
	 * 移除子碰撞器形状。
	 * @param	shape 子碰撞器形状。
	 */
	removeChildShape(shape: ColliderShape): void {
		if (shape._compoundParent === this) {
			var index: number = shape._indexInCompound;
			this._clearChildShape(shape);
			var endShape: ColliderShape = this._childColliderShapes[this._childColliderShapes.length - 1];
			endShape._indexInCompound = index;
			this._childColliderShapes[index] = endShape;
			this._childColliderShapes.pop();
			this._nativeShape.removeChildShapeByIndex(index);
		}
	}

	/**
	 * 清空子碰撞器形状。
	 */
	clearChildShape(): void {
		for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++) {
			this._clearChildShape(this._childColliderShapes[i]);
			this._nativeShape.removeChildShapeByIndex(0);
		}
		this._childColliderShapes.length = 0;
	}

	/**
	 * 获取子形状数量。
	 * @return
	 */
	getChildShapeCount(): number {
		return this._childColliderShapes.length;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		var destCompoundColliderShape: CompoundColliderShape = (<CompoundColliderShape>destObject);
		destCompoundColliderShape.clearChildShape();
		for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++)
			destCompoundColliderShape.addChildShape(this._childColliderShapes[i].clone());
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
		super.destroy();
		for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++) {
			var childShape: ColliderShape = this._childColliderShapes[i];
			if (childShape._referenceCount === 0)
				childShape.destroy();
		}
	}

}


