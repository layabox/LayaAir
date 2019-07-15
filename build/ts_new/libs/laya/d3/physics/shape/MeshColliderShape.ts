import { Vector3 } from "../../math/Vector3";
import { Mesh } from "../../resource/models/Mesh";
import { ColliderShape } from "./ColliderShape";
import { Physics3D } from "../Physics3D";

/**
 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
 */
export class MeshColliderShape extends ColliderShape {
	private _mesh: Mesh = null;
	private _convex: boolean = false;

	/**
	 * 获取网格。
	 * @return 网格。
	 */
	get mesh(): Mesh {
		return this._mesh;
	}

	/**
	 * 设置网格。
	 * @param 网格。
	 */
	set mesh(value: Mesh) {
		if (this._mesh !== value) {
			var physics3D: any = Physics3D._physics3D;
			if (this._mesh) {
				physics3D.destroy(this._nativeShape);
			}
			if (value) {
				this._nativeShape = new Physics3D._physics3D.btGImpactMeshShape(value._getPhysicMesh());
				this._nativeShape.updateBound();
			}
			this._mesh = value;
		}
	}

	/**
	 * 获取是否使用凸多边形。
	 * @return 是否使用凸多边形。
	 */
	get convex(): boolean {
		return this._convex;
	}

	/**
	 * 设置是否使用凸多边形。
	 * @param value 是否使用凸多边形。
	 */
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
		 */
		/*override*/  _setScale(value: Vector3): void {
		if (this._compoundParent) {//TODO:待查,这里有问题
			this.updateLocalTransformations();//TODO:
		} else {
			ColliderShape._nativeScale.setValue(value.x, value.y, value.z);
			this._nativeShape.setLocalScaling(ColliderShape._nativeScale);
			this._nativeShape.updateBound();//更新缩放后需要更新包围体,有性能损耗
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  cloneTo(destObject: any): void {
		var destMeshCollider: MeshColliderShape = (<MeshColliderShape>destObject);
		destMeshCollider.convex = this._convex;
		destMeshCollider.mesh = this._mesh;
		super.cloneTo(destObject);
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  clone(): any {
		var dest: MeshColliderShape = new MeshColliderShape();
		this.cloneTo(dest);
		return dest;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  destroy(): void {
		if (this._nativeShape) {
			var physics3D: any = Physics3D._physics3D;
			physics3D.destroy(this._nativeShape);
			this._nativeShape = null;
		}
	}

}


