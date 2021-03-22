
import { Component } from "../../components/Component";
import { Event } from "../../events/Event";
import { Scene3D } from "../core/scene/Scene3D";
import { Sprite3D } from "../core/Sprite3D";
import { Transform3D } from "../core/Transform3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { CannonPhysicsSimulation } from "./CannonPhysicsSimulation";
import { CannonBoxColliderShape } from "./shape/CannonBoxColliderShape";
import { CannonColliderShape } from "./shape/CannonColliderShape";
import { CannonSphereColliderShape } from "./shape/CannonSphereColliderShape";
import { CannonCompoundColliderShape } from "./shape/CannonCompoundColliderShape";
/**
 * <code>PhysicsComponent</code> 类用于创建物理组件的父类。
 */
export class CannonPhysicsComponent extends Component {
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
	protected static _btVector30: CANNON.Vec3;
	/** @internal */
	protected static _btQuaternion0: CANNON.Quaternion;

	/** @internal */
	static _physicObjectsMap: any = {};
	/** @internal */
	static _addUpdateList: boolean = true;

	/**
	* @internal
	*/
	static __init__(): void {
		CannonPhysicsComponent._btVector30 =new CANNON.Vec3(0,0,0);
		CannonPhysicsComponent._btQuaternion0 = new CANNON.Quaternion(0,0,0,1);
	}

	// /**
	//  * @internal
	//  */
	// private static _createAffineTransformationArray(tranX: number, tranY: number, tranZ: number, rotX: number, rotY: number, rotZ: number, rotW: number, scale: Float32Array, outE: Float32Array): void {

	// 	var x2: number = rotX + rotX, y2: number = rotY + rotY, z2: number = rotZ + rotZ;
	// 	var xx: number = rotX * x2, xy: number = rotX * y2, xz: number = rotX * z2, yy: number = rotY * y2, yz: number = rotY * z2, zz: number = rotZ * z2;
	// 	var wx: number = rotW * x2, wy: number = rotW * y2, wz: number = rotW * z2, sx: number = scale[0], sy: number = scale[1], sz: number = scale[2];

	// 	outE[0] = (1 - (yy + zz)) * sx;
	// 	outE[1] = (xy + wz) * sx;
	// 	outE[2] = (xz - wy) * sx;
	// 	outE[3] = 0;
	// 	outE[4] = (xy - wz) * sy;
	// 	outE[5] = (1 - (xx + zz)) * sy;
	// 	outE[6] = (yz + wx) * sy;
	// 	outE[7] = 0;
	// 	outE[8] = (xz + wy) * sz;
	// 	outE[9] = (yz - wx) * sz;
	// 	outE[10] = (1 - (xx + yy)) * sz;
	// 	outE[11] = 0;
	// 	outE[12] = tranX;
	// 	outE[13] = tranY;
	// 	outE[14] = tranZ;
	// 	outE[15] = 1;
	// }

	/**
	 * @internal
	 */
	static _creatShape(shapeData: any): CannonColliderShape {
		var colliderShape: CannonColliderShape;
		switch (shapeData.type) {
			case "BoxColliderShape":
				var sizeData: any[] = shapeData.size;
				colliderShape = sizeData ? new CannonBoxColliderShape(sizeData[0], sizeData[1], sizeData[2]) : new CannonBoxColliderShape();
				break;
			case "SphereColliderShape":
				colliderShape = new CannonSphereColliderShape(shapeData.radius);
				break;
			// case "CapsuleColliderShape":
			// 	colliderShape = new CapsuleColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
			// 	break;
			// case "MeshColliderShape":
			// 	var meshCollider: MeshColliderShape = new MeshColliderShape();
			// 	shapeData.mesh && (meshCollider.mesh = Loader.getRes(shapeData.mesh));
			// 	colliderShape = meshCollider;
			// 	break;
			// case "ConeColliderShape":
			// 	colliderShape = new ConeColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
			// 	break;
			// case "CylinderColliderShape":
			// 	colliderShape = new CylinderColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
			// 	break;
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

	// /**
	//  * @internal
	//  */
	// private static physicVector3TransformQuat(source: Vector3, qx: number, qy: number, qz: number, qw: number, out: Vector3): void {
	// 	var x: number = source.x, y: number = source.y, z: number = source.z, ix: number = qw * x + qy * z - qz * y, iy: number = qw * y + qz * x - qx * z, iz: number = qw * z + qx * y - qy * x, iw: number = -qx * x - qy * y - qz * z;
	// 	out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	// 	out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	// 	out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
	// }

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
	protected _collisionGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER;
	/** @internal */
	protected _canCollideWith: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER;
	/** @internal */
	protected _colliderShape: CannonColliderShape = null;
	/** @internal */
	protected _transformFlag: number = 2147483647 /*int.MAX_VALUE*/;
	/** @internal */
	protected _controlBySimulation: boolean = false;

	/** @internal */
	_btColliderObject: CANNON.Body;//TODO:不用声明,TODO:删除相关判断
	/** @internal */
	_simulation: CannonPhysicsSimulation;
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
		this._btColliderObject && (this._btColliderObject.material.restitution = value);
	}

	/**
	 * 摩擦力。
	 */
	get friction(): number {
		return this._friction;
	}

	set friction(value: number) {
		this._friction = value;
		this._btColliderObject && (this._btColliderObject.material.friction = value);
	}

	/**
	 * 碰撞形状。
	 */
	get colliderShape(): CannonColliderShape {
		return this._colliderShape;
	}

	set colliderShape(value: CannonColliderShape) {
		var lastColliderShape: CannonColliderShape = this._colliderShape;
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
				if(value.type!=CannonColliderShape.SHAPETYPES_COMPOUND){
					this._btColliderObject.shapes.length = 0;
					this._btColliderObject.shapeOffsets.length = 0;
					this._btColliderObject.shapeOrientations.length = 0;
					var localOffset = value.localOffset;
					var scale = value._scale;
					var vecs:CANNON.Vec3 =new CANNON.Vec3(localOffset.x*scale.x,localOffset.y*scale.y,localOffset.z*scale.z);
					this._btColliderObject.addShape(this._colliderShape._btShape,vecs);
					this._btColliderObject.updateBoundingRadius();
				}
				else
				{
					(<CannonCompoundColliderShape>value).bindRigidBody(this);
				}
				var canInSimulation: boolean = this._simulation && this._enabled;
				(canInSimulation && lastColliderShape) && (this._removeFromSimulation());//修改shape必须把Collison从物理世界中移除再重新添加
				this._onShapeChange(value);//
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
	get simulation(): CannonPhysicsSimulation {
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
			this._btColliderObject.collisionFilterGroup = value; 
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
			this._btColliderObject.collisionFilterMask = value; 
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
		CannonPhysicsComponent._physicObjectsMap[this.id] = this;
	}

	/**
	 * @internal
	 */
	protected _parseShape(shapesData: any[]): void {
		var shapeCount: number = shapesData.length;
		if (shapeCount === 1) {
			var shape: CannonColliderShape = CannonPhysicsComponent._creatShape(shapesData[0]);
			this.colliderShape = shape;
		} else {
			//TODO:
			// var compoundShape: CompoundColliderShape = new CompoundColliderShape();
			// for (var i: number = 0; i < shapeCount; i++) {
			// 	shape = PhysicsComponent._creatShape(shapesData[i]);
			// 	compoundShape.addChildShape(shape);
			// }
			// this.colliderShape = compoundShape;
		}
	}

	/**
	 * @internal
	 */
	protected _onScaleChange(scale: Vector3): void {
		this._colliderShape._setScale(scale);
		this._btColliderObject.updateBoundingRadius();
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onEnable(): void {
		//@ts-ignorets  minerTODO：
		this._simulation = ((<Scene3D>this.owner._scene))._cannonPhysicsSimulation;
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
		delete CannonPhysicsComponent._physicObjectsMap[this.id];
		this._btColliderObject = null;
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
		var btColliderObject: CANNON.Body = this._btColliderObject;
		this._innerDerivePhysicsTransformation(btColliderObject, force);
	}

	/**
	 * 	@internal
	 *	通过渲染矩阵更新物理矩阵。
	 */
	_innerDerivePhysicsTransformation(physicTransformOut: CANNON.Body, force: boolean): void {
		var transform: Transform3D = ((<Sprite3D>this.owner))._transform;

		if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION)) {
			var shapeOffset: Vector3 = this._colliderShape.localOffset;
			var position: Vector3 = transform.position;
			var btPosition: CANNON.Vec3 = CannonPhysicsComponent._btVector30;
			if (shapeOffset.x !== 0 || shapeOffset.y !== 0 || shapeOffset.z !== 0) {
				var physicPosition: Vector3 = CannonPhysicsComponent._tempVector30;
				var worldMat: Matrix4x4 = transform.worldMatrix;
				Vector3.transformCoordinate(shapeOffset, worldMat, physicPosition);
				btPosition.set(physicPosition.x,physicPosition.y,physicPosition.z);
			} else {
				btPosition.set(position.x,position.y,position.z);
			}
			physicTransformOut.position.set(btPosition.x,btPosition.y,btPosition.z);
			this._setTransformFlag(Transform3D.TRANSFORM_WORLDPOSITION, false);
		}

		if (force || this._getTransformFlag(Transform3D.TRANSFORM_WORLDQUATERNION)) {
			var shapeRotation: Quaternion = this._colliderShape.localRotation;
			var btRotation: CANNON.Quaternion= CannonPhysicsComponent._btQuaternion0;
			var rotation: Quaternion = transform.rotation;
			if (shapeRotation.x !== 0 || shapeRotation.y !== 0 || shapeRotation.z !== 0 || shapeRotation.w !== 1) {
				var physicRotation: Quaternion = CannonPhysicsComponent._tempQuaternion0;
				CannonPhysicsComponent.physicQuaternionMultiply(rotation.x, rotation.y, rotation.z, rotation.w, shapeRotation, physicRotation);
				btRotation.set(physicRotation.x,physicRotation.y,physicRotation.z,physicRotation.w)
			} else {
				btRotation.set(rotation.x,rotation.y,rotation.z,rotation.w)
			}
			physicTransformOut.quaternion.set(btRotation.x,btRotation.y,btRotation.z,btRotation.w); 
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
	_updateTransformComponent(physicsTransform: CANNON.Body): void {
		var colliderShape: CannonColliderShape = this._colliderShape;
		var localOffset: Vector3 = colliderShape.localOffset;
		var localRotation: Quaternion = colliderShape.localRotation;

		var transform: Transform3D = (<Sprite3D>this.owner)._transform;
		var position: Vector3 = transform.position;
		var rotation: Quaternion = transform.rotation;

		var btPosition:CANNON.Vec3 = physicsTransform.position;
		var btRotation:CANNON.Quaternion = physicsTransform.quaternion;

		var btRotX: number = btRotation.x;
		var btRotY: number = btRotation.y;
		var btRotZ: number = btRotation.z;
		var btRotW: number = btRotation.w;

		if (localRotation.x !== 0 || localRotation.y !== 0 || localRotation.z !== 0 || localRotation.w !== 1) {
			var invertShapeRotaion: Quaternion = CannonPhysicsComponent._tempQuaternion0;
			localRotation.invert(invertShapeRotaion);
			CannonPhysicsComponent.physicQuaternionMultiply(btRotX, btRotY, btRotZ, btRotW, invertShapeRotaion, rotation);
		} else {
			rotation.x = btRotX;
			rotation.y = btRotY;
			rotation.z = btRotZ;
			rotation.w = btRotW;
		}
		transform.rotation = rotation;

		if (localOffset.x !== 0 || localOffset.y !== 0 || localOffset.z !== 0) {
			var rotShapePosition: Vector3 = CannonPhysicsComponent._tempVector30;

			rotShapePosition.x = localOffset.x;
			rotShapePosition.y = localOffset.y;
			rotShapePosition.z = localOffset.z;
			Vector3.transformQuat(rotShapePosition, rotation, rotShapePosition);

			position.x = btPosition.x-rotShapePosition.x;
			position.y = btPosition.y-rotShapePosition.z;
			position.z = btPosition.z-rotShapePosition.y;
		} else {
			position.x =  btPosition.x;
			position.y = btPosition.y;
			position.z = btPosition.z;

		}
		transform.position = position;
	}



	/**
	 * @internal
	 */
	_onShapeChange(colShape: CannonColliderShape): void {
		//TODO：
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
		(<Sprite3D>this.owner).transform.on(Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
	}

	/**
	 * @internal
	 */
	_onTransformChanged(flag: number): void {
		if (CannonPhysicsComponent._addUpdateList || !this._controlBySimulation) {
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
		var destPhysicsComponent: CannonPhysicsComponent = <CannonPhysicsComponent>dest;
		destPhysicsComponent.restitution = this._restitution;
		destPhysicsComponent.friction = this._friction;
		destPhysicsComponent.collisionGroup = this._collisionGroup;
		destPhysicsComponent.canCollideWith = this._canCollideWith;
		destPhysicsComponent.canScaleShape = this.canScaleShape;
		(this._colliderShape) && (destPhysicsComponent.colliderShape = this._colliderShape.clone());
	}
}

