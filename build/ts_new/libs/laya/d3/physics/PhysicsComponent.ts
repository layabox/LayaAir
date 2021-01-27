
import { Component } from "../../components/Component";
import { Event } from "../../events/Event";
import { Loader } from "../../net/Loader";
import { Scene3D } from "../core/scene/Scene3D";
import { Sprite3D } from "../core/Sprite3D";
import { Transform3D } from "../core/Transform3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { PhysicsSimulation } from "./PhysicsSimulation";
import { BoxColliderShape } from "./shape/BoxColliderShape";
import { CapsuleColliderShape } from "./shape/CapsuleColliderShape";
import { ColliderShape } from "./shape/ColliderShape";
import { CompoundColliderShape } from "./shape/CompoundColliderShape";
import { ConeColliderShape } from "./shape/ConeColliderShape";
import { CylinderColliderShape } from "./shape/CylinderColliderShape";
import { MeshColliderShape } from "./shape/MeshColliderShape";
import { SphereColliderShape } from "./shape/SphereColliderShape";
import { ILaya3D } from "../../../ILaya3D";

/**
 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
 */
export class PhysicsComponent extends Component {
	/** @internal */
	static ACTIVATIONSTATE_ACTIVE_TAG: number = 1;
	/** @internal */
	static ACTIVATIONSTATE_ISLAND_SLEEPING: number = 2;
	/** @internal */
	static ACTIVATIONSTATE_WANTS_DEACTIVATION: number = 3;
	/** @internal */
	static ACTIVATIONSTATE_DISABLE_DEACTIVATION: number = 4;
	/** @internal */
	static ACTIVATIONSTATE_DISABLE_SIMULATION: number = 5;

	/** @internal */
	static COLLISIONFLAGS_STATIC_OBJECT: number = 1;
	/** @internal */
	static COLLISIONFLAGS_KINEMATIC_OBJECT: number = 2;
	/** @internal */
	static COLLISIONFLAGS_NO_CONTACT_RESPONSE: number = 4;
	/** @internal */
	static COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK: number = 8;//this allows per-triangle material (friction/restitution)
	/** @internal */
	static COLLISIONFLAGS_CHARACTER_OBJECT: number = 16;
	/** @internal */
	static COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT: number = 32;//disable debug drawing
	/** @internal */
	static COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING: number = 64;//disable parallel/SPU processing

	/** @internal */
	protected static _tempVector30: Vector3 = new Vector3();
	/** @internal */
	protected static _tempQuaternion0: Quaternion = new Quaternion();
	/** @internal */
	protected static _tempQuaternion1: Quaternion = new Quaternion();
	/** @internal */
	protected static _tempMatrix4x40: Matrix4x4 = new Matrix4x4();
	/** @internal */
	protected static _btVector30: number;
	/** @internal */
	protected static _btQuaternion0: number;

	/** @internal */
	static _physicObjectsMap: any = {};
	/** @internal */
	static _addUpdateList: boolean = true;

	/**
	* @internal
	*/
	static __init__(): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		PhysicsComponent._btVector30 = bt.btVector3_create(0, 0, 0);
		PhysicsComponent._btQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
	}

	/**
	 * @internal
	 */
	private static _createAffineTransformationArray(tranX: number, tranY: number, tranZ: number, rotX: number, rotY: number, rotZ: number, rotW: number, scale: Float32Array, outE: Float32Array): void {

		var x2: number = rotX + rotX, y2: number = rotY + rotY, z2: number = rotZ + rotZ;
		var xx: number = rotX * x2, xy: number = rotX * y2, xz: number = rotX * z2, yy: number = rotY * y2, yz: number = rotY * z2, zz: number = rotZ * z2;
		var wx: number = rotW * x2, wy: number = rotW * y2, wz: number = rotW * z2, sx: number = scale[0], sy: number = scale[1], sz: number = scale[2];

		outE[0] = (1 - (yy + zz)) * sx;
		outE[1] = (xy + wz) * sx;
		outE[2] = (xz - wy) * sx;
		outE[3] = 0;
		outE[4] = (xy - wz) * sy;
		outE[5] = (1 - (xx + zz)) * sy;
		outE[6] = (yz + wx) * sy;
		outE[7] = 0;
		outE[8] = (xz + wy) * sz;
		outE[9] = (yz - wx) * sz;
		outE[10] = (1 - (xx + yy)) * sz;
		outE[11] = 0;
		outE[12] = tranX;
		outE[13] = tranY;
		outE[14] = tranZ;
		outE[15] = 1;
	}

	/**
	 * @internal
	 */
	static _creatShape(shapeData: any): ColliderShape {
		var colliderShape: ColliderShape;
		switch (shapeData.type) {
			case "BoxColliderShape":
				var sizeData: any[] = shapeData.size;
				colliderShape = sizeData ? new BoxColliderShape(sizeData[0], sizeData[1], sizeData[2]) : new BoxColliderShape();
				break;
			case "SphereColliderShape":
				colliderShape = new SphereColliderShape(shapeData.radius);
				break;
			case "CapsuleColliderShape":
				colliderShape = new CapsuleColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
				break;
			case "MeshColliderShape":
				var meshCollider: MeshColliderShape = new MeshColliderShape();
				shapeData.mesh && (meshCollider.mesh = Loader.getRes(shapeData.mesh));
				colliderShape = meshCollider;
				break;
			case "ConeColliderShape":
				colliderShape = new ConeColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
				break;
			case "CylinderColliderShape":
				colliderShape = new CylinderColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
				break;
			default:
				throw "unknown shape type.";
		}

		if (shapeData.center) {
			var localOffset: Vector3 = colliderShape.localOffset;
			localOffset.fromArray(shapeData.center);
			colliderShape.localOffset = localOffset;
		}
		return colliderShape;
	}

	/**
	 * @internal
	 */
	private static physicVector3TransformQuat(source: Vector3, qx: number, qy: number, qz: number, qw: number, out: Vector3): void {
		var x: number = source.x, y: number = source.y, z: number = source.z, ix: number = qw * x + qy * z - qz * y, iy: number = qw * y + qz * x - qx * z, iz: number = qw * z + qx * y - qy * x, iw: number = -qx * x - qy * y - qz * z;
		out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	}

	/**
	 * @internal
	 */
	private static physicQuaternionMultiply(lx: number, ly: number, lz: number, lw: number, right: Quaternion, out: Quaternion): void {
		var rx: number = right.x;
		var ry: number = right.y;
		var rz: number = right.z;
		var rw: number = right.w;
		var a: number = (ly * rz - lz * ry);
		var b: number = (lz * rx - lx * rz);
		var c: number = (lx * ry - ly * rx);
		var d: number = (lx * rx + ly * ry + lz * rz);
		out.x = (lx * rw + rx * lw) + a;
		out.y = (ly * rw + ry * lw) + b;
		out.z = (lz * rw + rz * lw) + c;
		out.w = lw * rw - d;
	}

	/** @internal */
	private _restitution: number = 0.0;
	/** @internal */
	private _friction: number = 0.5;
	/** @internal */
	private _rollingFriction: number = 0.0;
	/** @internal */
	private _ccdMotionThreshold: number = 0.0;
	/** @internal */
	private _ccdSweptSphereRadius: number = 0.0;

	/** @internal */
	protected _collisionGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER;
	/** @internal */
	protected _canCollideWith: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER;
	/** @internal */
	protected _colliderShape: ColliderShape = null;
	/** @internal */
	protected _transformFlag: number = 2147483647 /*int.MAX_VALUE*/;
	/** @internal */
	protected _controlBySimulation: boolean = false;

	/** @internal */
	_btColliderObject: number;//TODO:不用声明,TODO:删除相关判断
	/** @internal */
	_simulation: PhysicsSimulation;
	/** @internal */
	_enableProcessCollisions: boolean = true;
	/** @internal */
	_inPhysicUpdateListIndex: number = -1;

	/** 是否可以缩放Shape。 */
	canScaleShape: boolean = true;

	/**
	 * 弹力。
	 */
	get restitution(): number {
		return this._restitution;
	}

	set restitution(value: number) {
		this._restitution = value;
		this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setRestitution(this._btColliderObject, value);
	}

	/**
	 * 摩擦力。
	 */
	get friction(): number {
		return this._friction;
	}

	set friction(value: number) {
		this._friction = value;
		this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setFriction(this._btColliderObject, value);
	}

	/**
	 * 滚动摩擦力。
	 */
	get rollingFriction(): number {
		return this._rollingFriction;
	}

	set rollingFriction(value: number) {
		this._rollingFriction = value;
		this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setRollingFriction(this._btColliderObject, value);
	}

	/**
	 * 用于连续碰撞检测(CCD)的速度阈值,当物体移动速度小于该值时不进行CCD检测,防止快速移动物体(例如:子弹)错误的穿过其它物体,0表示禁止。
	 */
	get ccdMotionThreshold(): number {
		return this._ccdMotionThreshold;
	}

	set ccdMotionThreshold(value: number) {
		this._ccdMotionThreshold = value;
		this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setCcdMotionThreshold(this._btColliderObject, value);
	}

	/**
	 * 获取用于进入连续碰撞检测(CCD)范围的球半径。
	 */
	get ccdSweptSphereRadius(): number {
		return this._ccdSweptSphereRadius;
	}

	set ccdSweptSphereRadius(value: number) {
		this._ccdSweptSphereRadius = value;
		this._btColliderObject && ILaya3D.Physics3D._bullet.btCollisionObject_setCcdSweptSphereRadius(this._btColliderObject, value);
	}

	/**
	 * 获取是否激活。
	 */
	get isActive(): boolean {
		return this._btColliderObject ? ILaya3D.Physics3D._bullet.btCollisionObject_isActive(this._btColliderObject) : false;
	}

	/**
	 * 碰撞形状。
	 */
	get colliderShape(): ColliderShape {
		return this._colliderShape;
	}

	set colliderShape(value: ColliderShape) {
		var lastColliderShape: ColliderShape = this._colliderShape;
		if (lastColliderShape) {
			lastColliderShape._attatched = false;
			lastColliderShape._attatchedCollisionObject = null;
		}

		this._colliderShape = value;
		if (value) {
			if (value._attatched) {
				throw "PhysicsComponent: this shape has attatched to other entity.";
			} else {
				value._attatched = true;
				value._attatchedCollisionObject = this;
			}

			if (this._btColliderObject) {
				ILaya3D.Physics3D._bullet.btCollisionObject_setCollisionShape(this._btColliderObject, value._btShape);
				var canInSimulation: boolean = this._simulation && this._enabled;
				(canInSimulation && lastColliderShape) && (this._removeFromSimulation());//修改shape必须把Collison从物理世界中移除再重新添加
				this._onShapeChange(value);//修改shape会计算惯性
				if (canInSimulation) {
					this._derivePhysicsTransformation(true);
					this._addToSimulation();
				}
			}
		} else {
			if (this._simulation && this._enabled)
				lastColliderShape && this._removeFromSimulation();
		}
	}

	/**
	 * 模拟器。
	 */
	get simulation(): PhysicsSimulation {
		return this._simulation;
	}

	/**
	 * 所属碰撞组。
	 */
	get collisionGroup(): number {
		return this._collisionGroup;
	}

	set collisionGroup(value: number) {
		if (this._collisionGroup !== value) {
			this._collisionGroup = value;
			if (this._simulation && this._colliderShape && this._enabled) {
				this._removeFromSimulation();
				this._addToSimulation();
			}
		}
	}

	/**
	 * 可碰撞的碰撞组,基于位运算。
	 */
	get canCollideWith(): number {
		return this._canCollideWith;
	}

	set canCollideWith(value: number) {
		if (this._canCollideWith !== value) {
			this._canCollideWith = value;
			if (this._simulation && this._colliderShape && this._enabled) {
				this._removeFromSimulation();
				this._addToSimulation();
			}
		}
	}

	/**
	 * 创建一个 <code>PhysicsComponent</code> 实例。
	 * @param collisionGroup 所属碰撞组。
	 * @param canCollideWith 可产生碰撞的碰撞组。
	 */
	constructor(collisionGroup: number, canCollideWith: number) {
		super();
		this._collisionGroup = collisionGroup;
		this._canCollideWith = canCollideWith;
		PhysicsComponent._physicObjectsMap[this.id] = this;
	}

	/**
	 * @internal
	 */
	protected _parseShape(shapesData: any[]): void {
		var shapeCount: number = shapesData.length;
		if (shapeCount === 1) {
			var shape: ColliderShape = PhysicsComponent._creatShape(shapesData[0]);
			this.colliderShape = shape;
		} else {
			var compoundShape: CompoundColliderShape = new CompoundColliderShape();
			for (var i: number = 0; i < shapeCount; i++) {
				shape = PhysicsComponent._creatShape(shapesData[i]);
				compoundShape.addChildShape(shape);
			}
			this.colliderShape = compoundShape;
		}
	}

	/**
	 * @internal
	 */
	protected _onScaleChange(scale: Vector3): void {
		this._colliderShape._setScale(scale);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onEnable(): void {
		this._simulation = ((<Scene3D>this.owner._scene)).physicsSimulation;
		ILaya3D.Physics3D._bullet.btCollisionObject_setContactProcessingThreshold(this._btColliderObject, 0);
		if (this._colliderShape) {
			this._derivePhysicsTransformation(true);
			this._addToSimulation();
		}
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDisable(): void {
		if (this._colliderShape) {
			this._removeFromSimulation();
			(this._inPhysicUpdateListIndex !== -1) && (this._simulation._physicsUpdateList.remove(this));//销毁前一定会调用 _onDisable()
		}
		this._simulation = null;
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		delete PhysicsComponent._physicObjectsMap[this.id];
		ILaya3D.Physics3D._bullet.btCollisionObject_destroy(this._btColliderObject);
		this._colliderShape.destroy();
		super._onDestroy();
		this._btColliderObject = null;
		this._colliderShape = null;
		this._simulation = null;
		(<Sprite3D>this.owner).transform.off(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
	}

	/**
	 * @internal
	 */
	_isValid(): boolean {
		return this._simulation && this._colliderShape && this._enabled;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_parse(data: any): void {
		(data.collisionGroup != null) && (this.collisionGroup = data.collisionGroup);
		(data.canCollideWith != null) && (this.canCollideWith = data.canCollideWith);
		(data.ccdMotionThreshold != null) && (this.ccdMotionThreshold = data.ccdMotionThreshold);
		(data.ccdSweptSphereRadius != null) && (this.ccdSweptSphereRadius = data.ccdSweptSphereRadius);
	}

	/**
	 * @internal
	 */
	_setTransformFlag(type: number, value: boolean): void {
		if (value)
			this._transformFlag |= type;
		else
			this._transformFlag &= ~type;
	}

	/**
	 * @internal
	 */
	_getTransformFlag(type: number): boolean {
		return (this._transformFlag & type) != 0;
	}

	/**
	 * @internal
	 */
	_addToSimulation(): void {
	}

	/**
	 * @internal
	 */
	_removeFromSimulation(): void {

	}

	/**
	 * 	@internal
	 */
	_derivePhysicsTransformation(force: boolean): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		var btColliderObject: number = this._btColliderObject;
		var btTransform: number = bt.btCollisionObject_getWorldTransform(btColliderObject);
		this._innerDerivePhysicsTransformation(btTransform, force);
		bt.btCollisionObject_setWorldTransform(btColliderObject, btTransform);
	}

	/**
	 * 	@internal
	 *	通过渲染矩阵更新物理矩阵。
	 */
	_innerDerivePhysicsTransformation(physicTransformOut: number, force: boolean): void {
		var bt: any = ILaya3D.Physics3D._bullet;
		var transform: Transform3D = ((<Sprite3D>this.owner))._transform;

		if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
			var shapeOffset: Vector3 = this._colliderShape.localOffset;
			var position: Vector3 = transform.position;
			var btPosition: any = PhysicsComponent._btVector30;
			if (shapeOffset.x !== 0 || shapeOffset.y !== 0 || shapeOffset.z !== 0) {
				var physicPosition: Vector3 = PhysicsComponent._tempVector30;
				var worldMat: Matrix4x4 = transform.worldMatrix;
				Vector3.transformCoordinate(shapeOffset, worldMat, physicPosition);
				bt.btVector3_setValue(btPosition, -physicPosition.x, physicPosition.y, physicPosition.z);
			} else {
				bt.btVector3_setValue(btPosition, -position.x, position.y, position.z);
			}
			bt.btTransform_setOrigin(physicTransformOut, btPosition);
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
		}

		if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
			var shapeRotation: Quaternion = this._colliderShape.localRotation;
			var btRotation: any = PhysicsComponent._btQuaternion0;
			var rotation: Quaternion = transform.rotation;
			if (shapeRotation.x !== 0 || shapeRotation.y !== 0 || shapeRotation.z !== 0 || shapeRotation.w !== 1) {
				var physicRotation: Quaternion = PhysicsComponent._tempQuaternion0;
				PhysicsComponent.physicQuaternionMultiply(rotation.x, rotation.y, rotation.z, rotation.w, shapeRotation, physicRotation);
				bt.btQuaternion_setValue(btRotation, -physicRotation.x, physicRotation.y, physicRotation.z, -physicRotation.w);
			} else {
				bt.btQuaternion_setValue(btRotation, -rotation.x, rotation.y, rotation.z, -rotation.w);
			}
			bt.btTransform_setRotation(physicTransformOut, btRotation);
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION, false);
		}

		if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDSCALE)) {
			this._onScaleChange(transform.getWorldLossyScale());
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDSCALE, false);
		}
	}

	/**
	 * @internal
	 * 通过物理矩阵更新渲染矩阵。
	 */
	_updateTransformComponent(physicsTransform: number): void {
		//TODO:Need Test!!! because _innerDerivePhysicsTransformation update position use worldMatrix,not(position rotation WorldLossyScale),maybe the center is no different.
		var bt: any = ILaya3D.Physics3D._bullet;
		var colliderShape: ColliderShape = this._colliderShape;
		var localOffset: Vector3 = colliderShape.localOffset;
		var localRotation: Quaternion = colliderShape.localRotation;

		var transform: Transform3D = (<Sprite3D>this.owner)._transform;
		var position: Vector3 = transform.position;
		var rotation: Quaternion = transform.rotation;

		var btPosition: number = bt.btTransform_getOrigin(physicsTransform);
		var btRotation: number = bt.btTransform_getRotation(physicsTransform);

		var btRotX: number = -bt.btQuaternion_x(btRotation);
		var btRotY: number = bt.btQuaternion_y(btRotation);
		var btRotZ: number = bt.btQuaternion_z(btRotation);
		var btRotW: number = -bt.btQuaternion_w(btRotation);

		if (localRotation.x !== 0 || localRotation.y !== 0 || localRotation.z !== 0 || localRotation.w !== 1) {
			var invertShapeRotaion: Quaternion = PhysicsComponent._tempQuaternion0;
			localRotation.invert(invertShapeRotaion);
			PhysicsComponent.physicQuaternionMultiply(btRotX, btRotY, btRotZ, btRotW, invertShapeRotaion, rotation);
		} else {
			rotation.x = btRotX;
			rotation.y = btRotY;
			rotation.z = btRotZ;
			rotation.w = btRotW;
		}
		transform.rotation = rotation;

		if (localOffset.x !== 0 || localOffset.y !== 0 || localOffset.z !== 0) {
			var btScale: number = bt.btCollisionShape_getLocalScaling(colliderShape._btShape);
			var rotShapePosition: Vector3 = PhysicsComponent._tempVector30;
			rotShapePosition.x = localOffset.x * bt.btVector3_x(btScale);
			rotShapePosition.y = localOffset.y * bt.btVector3_y(btScale);
			rotShapePosition.z = localOffset.z * bt.btVector3_z(btScale);
			Vector3.transformQuat(rotShapePosition, rotation, rotShapePosition);
			position.x = -bt.btVector3_x(btPosition) - rotShapePosition.x;
			position.y = bt.btVector3_y(btPosition) - rotShapePosition.y;
			position.z = bt.btVector3_z(btPosition) - rotShapePosition.z;
		} else {
			position.x = -bt.btVector3_x(btPosition);
			position.y = bt.btVector3_y(btPosition);
			position.z = bt.btVector3_z(btPosition);
		}
		transform.position = position;
	}



	/**
	 * @internal
	 */
	_onShapeChange(colShape: ColliderShape): void {
		var btColObj: any = this._btColliderObject;
		var bt: any = ILaya3D.Physics3D._bullet;
		var flags: number = bt.btCollisionObject_getCollisionFlags(btColObj);
		if (colShape.needsCustomCollisionCallback) {
			if ((flags & PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) === 0)
				bt.btCollisionObject_setCollisionFlags(btColObj, flags | PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
		} else {
			if ((flags & PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) > 0)
				bt.btCollisionObject_setCollisionFlags(btColObj, flags ^ PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		this.enabled = this._enabled;
		this.restitution = this._restitution;
		this.friction = this._friction;
		this.rollingFriction = this._rollingFriction;
		this.ccdMotionThreshold = this._ccdMotionThreshold;
		this.ccdSweptSphereRadius = this._ccdSweptSphereRadius;
		(<Sprite3D>this.owner).transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
	}

	/**
	 * @internal
	 */
	_onTransformChanged(flag: number): void {
		if (PhysicsComponent._addUpdateList || !this._controlBySimulation) {//PhysicsComponent._addUpdateList = false is the stage of physic simulation.
			flag &= Transform3D.TRANSFORM_WORLDPOSITION | Transform3D.TRANSFORM_WORLDQUATERNION | Transform3D.TRANSFORM_WORLDSCALE;//过滤有用TRANSFORM标记
			if (flag) {
				this._transformFlag |= flag;
				if (this._isValid() && this._inPhysicUpdateListIndex === -1)//_isValid()表示可使用
					this._simulation._physicsUpdateList.add(this);
			}
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(dest: Component): void {
		var destPhysicsComponent: PhysicsComponent = <PhysicsComponent>dest;
		destPhysicsComponent.restitution = this._restitution;
		destPhysicsComponent.friction = this._friction;
		destPhysicsComponent.rollingFriction = this._rollingFriction;
		destPhysicsComponent.ccdMotionThreshold = this._ccdMotionThreshold;
		destPhysicsComponent.ccdSweptSphereRadius = this._ccdSweptSphereRadius;
		destPhysicsComponent.collisionGroup = this._collisionGroup;
		destPhysicsComponent.canCollideWith = this._canCollideWith;
		destPhysicsComponent.canScaleShape = this.canScaleShape;
		(this._colliderShape) && (destPhysicsComponent.colliderShape = this._colliderShape.clone());
	}
}

