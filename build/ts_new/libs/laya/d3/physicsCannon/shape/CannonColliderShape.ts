//@ts-nocheck
import { IClone } from "../../core/IClone";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Quaternion } from "../../math/Quaternion";
import { Vector3 } from "../../math/Vector3";
import { CannonPhysicsComponent } from "../CannonPhysicsComponent";

/**
 * <code>ColliderShape</code> 类用于创建形状碰撞器的父类，该类为抽象类。
 */
export class CannonColliderShape implements IClone {
	/** 形状方向_X轴正向 */
	static SHAPEORIENTATION_UPX: number = 0;
	/** 形状方向_Y轴正向 */
	static SHAPEORIENTATION_UPY: number = 1;
	/** 形状方向_Z轴正向 */
	static SHAPEORIENTATION_UPZ: number = 2;

	/** @internal */
	static SHAPETYPES_BOX: number = 0;
	/** @internal */
	static SHAPETYPES_SPHERE: number = 1;
	/** @internal */
	static SHAPETYPES_CYLINDER: number = 2;
	/** @internal */
	static SHAPETYPES_CAPSULE: number = 3;
	/** @internal */
	static SHAPETYPES_CONVEXHULL: number = 4;
	/** @internal */
	static SHAPETYPES_COMPOUND: number = 5;
	/** @internal */
	static SHAPETYPES_STATICPLANE: number = 6;
	/** @internal */
	static SHAPETYPES_CONE: number = 7;

	/** @internal */
	static _tempVector30: Vector3 = new Vector3();
	/** @internal */
	protected static _btScale: CANNON.Vec3;
	/**@internal */
	protected static _btVector30: CANNON.Vec3;
	/**@internal */
	protected static _btQuaternion0: CANNON.Quaternion;

	/**
	 * @internal
	 */
	static __init__(): void {
		CannonColliderShape._btScale = new CANNON.Vec3();
		CannonColliderShape._btVector30 = new CANNON.Vec3();
		CannonColliderShape._btQuaternion0 = new CANNON.Quaternion();
	}

	/**
	 * @internal
	 */
	static _createAffineTransformation(trans: Vector3, rot: Quaternion, outE: Float32Array): void {

		var x: number = rot.x, y: number = rot.y, z: number = rot.z, w: number = rot.w, x2: number = x + x, y2: number = y + y, z2: number = z + z;
		var xx: number = x * x2, xy: number = x * y2, xz: number = x * z2, yy: number = y * y2, yz: number = y * z2, zz: number = z * z2;
		var wx: number = w * x2, wy: number = w * y2, wz: number = w * z2;

		outE[0] = (1 - (yy + zz));
		outE[1] = (xy + wz);
		outE[2] = (xz - wy);
		outE[3] = 0;
		outE[4] = (xy - wz);
		outE[5] = (1 - (xx + zz));
		outE[6] = (yz + wx);
		outE[7] = 0;
		outE[8] = (xz + wy);
		outE[9] = (yz - wx);
		outE[10] = (1 - (xx + yy));
		outE[11] = 0;
		outE[12] = trans.x;
		outE[13] = trans.y;
		outE[14] = trans.z;
		outE[15] = 1;
	}

	/**@internal */
	 _scale: Vector3 = new Vector3(1, 1, 1);

	/**@internal */
	_btShape: CANNON.Shape;
	/**@internal */
	_type: number;//TODO:可以删掉
	/**@internal */
	_centerMatrix: Matrix4x4 = new Matrix4x4();

	/**@internal */
	_attatched: boolean = false;
	/**@internal */
	_indexInCompound: number = -1;
	/**@internal */
	_compoundParent: any = null;
	/**@internal */
	_attatchedCollisionObject: CannonPhysicsComponent = null;

	/**@internal */
	_referenceCount: number = 0;

	/**@internal */
	private _localOffset: Vector3 = new Vector3(0, 0, 0);
	/**@internal */
	private _localRotation: Quaternion = new Quaternion(0, 0, 0, 1);

	needsCustomCollisionCallback: boolean = false;//TODO:默认值,TODO:::::::::::::::::::::::::::::::

	/**
	 * 碰撞类型。
	 */
	get type(): number {
		return this._type;
	}

	/**
	 * Shape的本地偏移。
	 */
	get localOffset(): Vector3 {
		return this._localOffset;
	}

	set localOffset(value: Vector3) {
		value.cloneTo(this._localOffset); 
	}

	/**
	 * Shape的本地旋转。
	 */
	get localRotation(): Quaternion {
		return this._localRotation;
	}

	set localRotation(value: Quaternion) {
		this._localRotation = value;
		if (this._compoundParent)
			this._compoundParent._updateChildTransform(this);
	}

	/**
	 * 创建一个新的 <code>ColliderShape</code> 实例。
	 */
	constructor() {

	}

	/**
	 * @internal
	 */
	_setScale(value: Vector3): void {
		//TODO:
	}

	/**
	 * @internal
	 */
	_addReference(): void {
		this._referenceCount++;
	}

	/**
	 * @internal
	 */
	_removeReference(): void {
		this._referenceCount--;
	}

	/**
	 * 更新本地偏移,如果修改LocalOffset或LocalRotation需要调用。
	 */
	updateLocalTransformations(): void {//TODO:是否需要优化
		if (this._compoundParent) {
			var offset: Vector3 = CannonColliderShape._tempVector30;
			Vector3.multiply(this.localOffset, this._scale, offset);
			CannonColliderShape._createAffineTransformation(offset, this.localRotation, this._centerMatrix.elements);
		} else {
			CannonColliderShape._createAffineTransformation(this.localOffset, this.localRotation, this._centerMatrix.elements);
		}
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {
		var destColliderShape: CannonColliderShape = (<CannonColliderShape>destObject);
		this._localOffset.cloneTo(destColliderShape.localOffset);
		this._localRotation.cloneTo(destColliderShape.localRotation);
		destColliderShape.localOffset = destColliderShape.localOffset;
		destColliderShape.localRotation = destColliderShape.localRotation;
	}

	/**
	 * 克隆。
	 * @return 克隆副本。
	 */
	clone(): any {
		return null;
	}

	/**
	 * 销毁。
	 */
	destroy(): void {
		if (this._btShape) {
			this._btShape = null;
		}
	}

}


