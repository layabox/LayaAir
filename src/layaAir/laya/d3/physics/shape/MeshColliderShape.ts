import { Vector3 } from "../../math/Vector3";
import { Mesh } from "../../resource/models/Mesh";
import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";

/**
 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
 */
export class MeshColliderShape extends ColliderShape {
	/** @internal */
	private _mesh: Mesh = null;
	/** @internal */
	private _convex: boolean = false;

	/**
	 * 网格。
	 */
	get mesh(): Mesh {
		return this._mesh;
	}

	set mesh(value: Mesh) {
		if (this._mesh !== value) {
			var physics3D: any = Physics3D._bullet;
			if (this._mesh) {
				physics3D.destroy(this._nativeShape);
			}
			if (value) {
				var bullet: any = Physics3D._bullet;
				this._nativeShape = bullet.btGImpactMeshShape_create(value._getPhysicMesh());
				bullet.btGImpactShapeInterface_updateBound(this._nativeShape);
			}
			this._mesh = value;
		}
	}

	/**
	 * 是否使用凸多边形。
	 */
	get convex(): boolean {
		return this._convex;
	}

	set convex(value: boolean) {
		this._convex = value;
	}

	/**
	 * 创建一个新的 <code>MeshColliderShape</code> 实例。
	 */
	constructor() {
		super();


	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_setScale(value: Vector3): void {
		if (this._compoundParent) {//TODO:待查,这里有问题
			this.updateLocalTransformations();//TODO:
		} else {
			var bullet: any = Physics3D._bullet;
			bullet.btVector3_setValue(ColliderShape._nativeScale, value.x, value.y, value.z);
			bullet.btCollisionShape_setLocalScaling(this._nativeShape, ColliderShape._nativeScale);
			bullet.btGImpactShapeInterface_updateBound(this._nativeShape);//更新缩放后需要更新包围体,有性能损耗
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		var destMeshCollider: MeshColliderShape = (<MeshColliderShape>destObject);
		destMeshCollider.convex = this._convex;
		destMeshCollider.mesh = this._mesh;
		super.cloneTo(destObject);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: MeshColliderShape = new MeshColliderShape();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	destroy(): void {
		if (this._nativeShape) {
			var physics3D: any = Physics3D._bullet;
			physics3D.destroy(this._nativeShape);
			this._nativeShape = null;
		}
	}

}


