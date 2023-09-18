import { VertexBuffer3D } from "../../../d3/graphics/VertexBuffer3D";
import { Mesh } from "../../../d3/resource/models/Mesh";
import { Vector3 } from "../../../maths/Vector3";
import { VertexElement } from "../../../renders/VertexElement";
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

	/**@internal */
	static _tempVector30: Vector3;
	/**@internal */
	static _tempVector31: Vector3;
	/**@internal */
	static _tempVector32: Vector3;

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
		this._createShape();
	}


	static __init__() {
		let bt = btPhysicsCreateUtil._bt;
		btMeshColliderShape._btTempVector30 = bt.btVector3_create(0, 0, 0);
		btMeshColliderShape._btTempVector31 = bt.btVector3_create(0, 0, 0);
		btMeshColliderShape._btTempVector32 = bt.btVector3_create(0, 0, 0);
		btMeshColliderShape._tempVector30 = new Vector3();
		btMeshColliderShape._tempVector31 = new Vector3();
		btMeshColliderShape._tempVector32 = new Vector3();
	}

	constructor() {
		super();
	}
	setPhysicsMeshFromMesh(value: Mesh): void {
		throw new Error("Method not implemented.");
	}
	setConvexMesh(value: Mesh): void {
		throw new Error("Method not implemented.");
	}
	setLimitVertex(limit: number): void {
		throw new Error("Method not implemented.");
	}

	createPhysicsMeshFromMesh(value: Mesh): number {
		let bt = btPhysicsCreateUtil._bt;

		var triangleMesh: number = bt.btTriangleMesh_create();//TODO:独立抽象btTriangleMesh,增加内存复用
		// var nativePositio0: number = btMeshColliderShape._btTempVector30;
		// var nativePositio1: number = btMeshColliderShape._btTempVector31;
		// var nativePositio2: number = btMeshColliderShape._btTempVector32;
		// var position0: Vector3 = btMeshColliderShape._tempVector30;
		// var position1: Vector3 = btMeshColliderShape._tempVector31;
		// var position2: Vector3 = btMeshColliderShape._tempVector32;

		// var vertexBuffer: VertexBuffer3D = value._vertexBuffer;
		// var positionElement: VertexElement = value._getPositionElement(vertexBuffer);
		// var verticesData: Float32Array = vertexBuffer.getFloat32Data();
		// var floatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
		// var posOffset: number = positionElement._offset / 4;

		// var indices: Uint16Array = value._indexBuffer.getData();//TODO:API修改问题
		// for (var i: number = 0, n: number = indices.length; i < n; i += 3) {
		// 	var p0Index: number = indices[i] * floatCount + posOffset;
		// 	var p1Index: number = indices[i + 1] * floatCount + posOffset;
		// 	var p2Index: number = indices[i + 2] * floatCount + posOffset;
		// 	position0.setValue(verticesData[p0Index], verticesData[p0Index + 1], verticesData[p0Index + 2]);
		// 	position1.setValue(verticesData[p1Index], verticesData[p1Index + 1], verticesData[p1Index + 2]);
		// 	position2.setValue(verticesData[p2Index], verticesData[p2Index + 1], verticesData[p2Index + 2]);

		// 	btPhysicsManager._convertToBulletVec3(position0, nativePositio0);
		// 	btPhysicsManager._convertToBulletVec3(position1, nativePositio1);
		// 	btPhysicsManager._convertToBulletVec3(position2, nativePositio2);
		// 	bt.btTriangleMesh_addTriangle(triangleMesh, nativePositio0, nativePositio1, nativePositio2, true);
		// }
		return triangleMesh;
	}

	protected _createShape(): void {
		let bt = btPhysicsCreateUtil._bt;
		if (this._btShape) {
			bt.btCollisionShape_destroy(this._btShape);
		}
		this._physicMesh = this.createPhysicsMeshFromMesh(this._mesh);
		this._physicMesh && (this._btShape = bt.btBvhTriangleMeshShape_create(this._physicMesh));
	}

	setWorldScale(value: Vector3): void {
		if (false) {//TODO:待查,这里有问题  if (this._compoundParent)
			// this.updateLocalTransformations();//TODO:
		} else {
			let bt = btPhysicsCreateUtil._bt;
			bt.btVector3_setValue(btMeshColliderShape._btTempVector30, value.x, value.y, value.z);
			bt.btCollisionShape_setLocalScaling(this._btShape, btMeshColliderShape._btTempVector30);
			if (this._btCollider._btColliderShape && this._btCollider._enableProcessCollisions) {
				bt.btGImpactShapeInterface_updateBound(this._btShape);//更新缩放后需要更新包围体,有性能损耗
			}
		}
	}

}


