import { Mesh } from "../../resource/models/Mesh";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { IMeshColliderShape } from "../../../Physics3D/interface/Shape/IMeshColliderShape";
import { Laya3D } from "../../../../Laya3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";

/**
 * @en The `MeshColliderShape` class is used to create mesh colliders.
 * @zh `MeshColliderShape` 类用于创建网格碰撞器。
 */
export class MeshColliderShape extends Physics3DColliderShape {
	/** @internal */
	private _mesh: Mesh = null;
	/** @internal */
	private _convex: boolean = false;
	/** @internal */
	private _convexVertexMax: number = 255;
	/**@internal */
	_shape: IMeshColliderShape;

	/**
	 * @en The mesh of the collider.
	 * @zh 碰撞器的网格。
	 */
	get mesh(): Mesh {
		return this._mesh;
	}

	set mesh(value: Mesh) {
		if ((this._mesh == value && this._shape) || !value)
			return;
		this._mesh = value;
		this._changeShape();
	}

	private _changeShape() {
		if (!this.mesh)
			return;
		if (this._convex)
			this._shape.setConvexMesh(this.mesh);
		else
			this._shape.setPhysicsMeshFromMesh(this.mesh);
	}

	/**
	 * @en The maximum number of convex vertices.
	 * @zh 凸多边形顶点的最大数量。
	 */
	get convexVertexMax(): number {
		return this._convexVertexMax;
	}

	set convexVertexMax(value: number) {
		value = Math.max(Math.min(255, value), 0);
		this._convexVertexMax = value;
	}

	/**
	 * @en Whether the collider uses a convex shape.
	 * @zh 碰撞器是否使用凸多边形形状。
	 */
	get convex(): boolean {
		return this._convex;
	}

	set convex(value: boolean) {
		if (value == this._convex) {
			return;
		}
		this._convex = value;
		this._changeShape();
	}
	/** @ignore */
	constructor() {
		super();
	}

	/**
	 * @internal
	 * @override
	 */
	protected _createShape() {
		if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_MeshColliderShape))
			this._shape = Laya3D.PhysicsCreateUtil.createMeshColliderShape();
		else {
			console.error("MeshColliderShape: cant enable MeshColliderShape");
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Clone data to target object.
	 * @param destObject Target object.
	 * @zh 将数据克隆到目标对象
	 * @param destObject 目标对象。
	 */
	cloneTo(destObject: any): void {
		var destMeshCollider: MeshColliderShape = (<MeshColliderShape>destObject);
		destMeshCollider.convex = this._convex;
		destMeshCollider._convexVertexMax = this._convexVertexMax;
		destMeshCollider.mesh = this._mesh;
		super.cloneTo(destObject);
	}

	/**
	 * @inheritDoc
	 * @override
	 * @en Clone a new MeshColliderShape object.
	 * @return A new MeshColliderShape object.
	 * @zh 克隆一个新的 网格碰撞器 对象。
	 * @return 一个新的 网格碰撞器 对象。
	 */
	clone(): any {
		var dest: MeshColliderShape = new MeshColliderShape();
		this.cloneTo(dest);
		return dest;
	}
}


