import { Mesh } from "../../../d3/resource/models/Mesh";
import { Vector3 } from "../../../maths/Vector3";
import { IMeshColliderShape } from "../../interface/Shape/IMeshColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btPhysicsManager } from "../btPhysicsManager";
import { btColliderShape } from "./btColliderShape";


export class btMeshColliderShape extends btColliderShape implements IMeshColliderShape {
	/**@internal */
	private _mesh: Mesh;

	/**@internal */
	private _physicMesh: any;

	/**@internal */
	static _btTempVector30: number;
	/**@internal */
	static _btTempVector31: number;
	/**@internal */
	static _btTempVector32: number;


	private _limitvertex = 10;

	private _convex: boolean;


	/**
	 * 网格
	*/
	public get mesh(): Mesh {
		return this._mesh;
	}
	public set mesh(value: Mesh) {
		if (this._mesh == value)
			return;
		this._mesh = value;
		if (this._convex) {
			this._createConvexMeshGeometry();
		} else {
			this._createTrianggleMeshGeometry();
		}
	}


	static __init__() {
		let bt = btPhysicsCreateUtil._bt;
		btMeshColliderShape._btTempVector30 = bt.btVector3_create(0, 0, 0);
		btMeshColliderShape._btTempVector31 = bt.btVector3_create(0, 0, 0);
		btMeshColliderShape._btTempVector32 = bt.btVector3_create(0, 0, 0);
	}

	constructor() {
		super();
	}

	setPhysicsMeshFromMesh(value: Mesh): void {
		this._mesh = value;
		this._convex = false;
		this._createTrianggleMeshGeometry();
	}

	setConvexMesh(value: Mesh): void {
		this._mesh = value;
		this._convex = true;
		//TODO
		this._createConvexMeshGeometry();
	}

	setLimitVertex(limit: number): void {

		this._limitvertex = limit;
	}

	/**@internal */
	get convex(): boolean {
		return this._convex;
	}

	private _createPhysicsMeshFromMesh(value: Mesh): number {
		if (value._triangleMesh) {
			return value._triangleMesh;
		}
		let bt = btPhysicsCreateUtil._bt;

		var triangleMesh: number = value._triangleMesh = bt.btTriangleMesh_create();//TODO:独立抽象btTriangleMesh,增加内存复用
		var nativePositio0: number = btMeshColliderShape._btTempVector30;
		var nativePositio1: number = btMeshColliderShape._btTempVector31;
		var nativePositio2: number = btMeshColliderShape._btTempVector32;

		let posArray = new Array<Vector3>();
		value.getPositions(posArray);

		var indices: Uint16Array = value._indexBuffer.getData();//TODO:API修改问题
		for (var i: number = 0, n: number = indices.length; i < n; i += 3) {
			var position0: Vector3 = posArray[indices[i]];
			var position1: Vector3 = posArray[indices[i + 1]];
			var position2: Vector3 = posArray[indices[i + 2]];
			btPhysicsManager._convertToBulletVec3(position0, nativePositio0);
			btPhysicsManager._convertToBulletVec3(position1, nativePositio1);
			btPhysicsManager._convertToBulletVec3(position2, nativePositio2);
			bt.btTriangleMesh_addTriangle(triangleMesh, nativePositio0, nativePositio1, nativePositio2, true);
		}
		return triangleMesh;
	}

	private _createConvexMeshFromMesh(value: Mesh): number {
		if (!value._convexMesh) {
			let bt = btPhysicsCreateUtil._bt;
			let physicMesh = this._createPhysicsMeshFromMesh(this._mesh);
			value._convexMesh = bt.btShapeHull_create(physicMesh);
		}
		return value._convexMesh;
	}

	protected _createTrianggleMeshGeometry(): void {
		let bt = btPhysicsCreateUtil._bt;
		if (this._btShape) {
			bt.btCollisionShape_destroy(this._btShape);
		}
		this._physicMesh = this._createPhysicsMeshFromMesh(this._mesh);
		if (this._physicMesh) {
			this._btShape = bt.btBvhTriangleMeshShape_create(this._physicMesh);
			if (this._btCollider) this._btCollider.setColliderShape(this);
		}
	}

	protected _createConvexMeshGeometry(): void {
		let bt = btPhysicsCreateUtil._bt;
		if (this._btShape) {
			bt.btCollisionShape_destroy(this._btShape);
		}
		let convexMesh = this._createConvexMeshFromMesh(this._mesh);
		this._btShape = bt.btConvexHullShape_create(convexMesh);
		if (this._btCollider) this._btCollider.setColliderShape(this);

	}



	setWorldScale(value: Vector3): void {
		if (this._btShape && this._btCollider) {
			let bt = btPhysicsCreateUtil._bt;
			bt.btVector3_setValue(btMeshColliderShape._btTempVector30, value.x, value.y, value.z);
			bt.btCollisionShape_setLocalScaling(this._btShape, btMeshColliderShape._btTempVector30);
			// if (this._btCollider._btColliderShape && this._btCollider._enableProcessCollisions) {
			// 	bt.btGImpactShapeInterface_updateBound(this._btShape);//更新缩放后需要更新包围体,有性能损耗
			// }
		}
	}

}


