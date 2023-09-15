import { Mesh } from "../../resource/models/Mesh";
import { Physics3DColliderShape } from "./Physics3DColliderShape";
import { IMeshColliderShape } from "../../../Physics3D/interface/Shape/IMeshColliderShape";

/**
 * <code>MeshColliderShape</code> 类用于创建网格碰撞器。
 */
export class MeshColliderShape extends Physics3DColliderShape {
	/** @internal */
	private _mesh: Mesh = null;
	/** @internal */
	private _convex: boolean = false;
	/** @internal */
	private _convexVertexMax: number = 255;

	_shape: IMeshColliderShape;

	/**
	 * 网格。
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
	 * 是否使用凸多边形。
	 */
	get convexVertexMax(): number {
		return this._convexVertexMax;
	}

	set convexVertexMax(value: number) {
		value = Math.max(Math.min(255, value), 0);
		this._convexVertexMax = value;
	}

	/**
	 * 是否使用凸多边形。
	 */
	get convex(): boolean {
		return this._convex;
	}

	set convex(value: boolean) {
		if (value != this._convex)
			this._convex = value;
		this._changeShape();
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
	 */
	clone(): any {
		var dest: MeshColliderShape = new MeshColliderShape();
		this.cloneTo(dest);
		return dest;
	}
}


