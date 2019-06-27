import { Physics } from "../../../d3/physics/Physics";
import { Resource } from "../../../resource/Resource";
import { Bounds } from "../../core/Bounds";
import { BufferState } from "../../core/BufferState";
import { GeometryElement } from "../../core/GeometryElement";
import { IClone } from "../../core/IClone";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { SubMeshInstanceBatch } from "../../graphics/SubMeshInstanceBatch";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexElement } from "../../graphics/VertexElement";
import { VertexElementFormat } from "../../graphics/VertexElementFormat";
import { MeshReader } from "../../loaders/MeshReader";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector3 } from "../../math/Vector3";
import { Utils3D } from "../../utils/Utils3D";
import { SubMesh } from "././SubMesh";
import { Laya } from "../../../../Laya";
import { Handler } from "../../../utils/Handler";

/**
 * <code>Mesh</code> 类用于创建文件网格数据模板。
 */
export class Mesh extends Resource implements IClone {
	/**Mesh资源。*/
	static MESH: string = "MESH";

	/** @internal */
	private _tempVector30: Vector3 = new Vector3()
	/** @internal */
	private _tempVector31: Vector3 = new Vector3();
	/** @internal */
	private _tempVector32: Vector3 = new Vector3();
	/** @internal */
	private static _nativeTempVector30: any;
	/** @internal */
	private static _nativeTempVector31: any;
	/** @internal */
	private static _nativeTempVector32: any;

	/**
 	* @internal
 	*/
	static __init__(): void {
		var physics3D: any = Physics._physics3D;
		if (physics3D) {
			Mesh._nativeTempVector30 = new physics3D.btVector3(0, 0, 0);
			Mesh._nativeTempVector31 = new physics3D.btVector3(0, 0, 0);
			Mesh._nativeTempVector32 = new physics3D.btVector3(0, 0, 0);
		}
	}

	/**
	 *@internal
	 */
	static _parse(data: any, propertyParams: any = null, constructParams: any[] = null): Mesh {
		var mesh: Mesh = new Mesh();
		MeshReader.read((<ArrayBuffer>data), mesh, mesh._subMeshes);
		return mesh;
	}

	/**
	 * 加载网格模板。
	 * @param url 模板地址。
	 * @param complete 完成回掉。
	 */
	static load(url: string, complete: Handler): void {
		Laya.loader.create(url, complete, null, Mesh.MESH);
	}

	/** @internal */
	private _nativeTriangleMesh: any;

	/** @internal */
	protected _bounds: Bounds;

	/** @internal */
	_bufferState: BufferState = new BufferState();
	/** @internal */
	_instanceBufferState: BufferState = new BufferState();
	/** @internal */
	_subMeshCount: number;
	/** @internal */
	_subMeshes: SubMesh[];
	/** */
	_vertexBuffers: VertexBuffer3D[];
	/** */
	_indexBuffer: IndexBuffer3D;
	/** @internal */
	_boneNames: string[];
	/** @internal */
	_inverseBindPoses: Matrix4x4[];
	/** @internal */
	_inverseBindPosesBuffer: ArrayBuffer;//TODO:[NATIVE]临时
	/** @internal */
	_bindPoseIndices: Uint16Array;
	/** @internal */
	_skinDataPathMarks: any[][];
	/** @internal */
	_vertexCount: number = 0;

	/**
	 * 获取网格的全局默认绑定动作逆矩阵。
	 * @return  网格的全局默认绑定动作逆矩阵。
	 */
	get inverseAbsoluteBindPoses(): Matrix4x4[] {
		return this._inverseBindPoses;
	}

	/**
	 * 获取顶点个数
	 */
	get vertexCount(): number {
		return this._vertexCount;
	}

	/**
	 * 获取SubMesh的个数。
	 * @return SubMesh的个数。
	 */
	get subMeshCount(): number {
		return this._subMeshCount;
	}

	/**
	 * 获取边界
	 * @return 边界。
	 */
	get bounds(): Bounds {
		return this._bounds;
	}

	/**
	 * 创建一个 <code>Mesh</code> 实例,禁止使用。
	 * @param url 文件地址。
	 */
	constructor() {
		super();
		this._subMeshes = [];
		this._vertexBuffers = [];
		this._skinDataPathMarks = [];
	}

	/**
	 * @internal
	 */
	private _getPositionElement(vertexBuffer: VertexBuffer3D): VertexElement {
		var vertexElements: any[] = vertexBuffer.vertexDeclaration.vertexElements;
		for (var i: number = 0, n: number = vertexElements.length; i < n; i++) {
			var vertexElement: VertexElement = vertexElements[i];
			if (vertexElement.elementFormat === VertexElementFormat.Vector3 && vertexElement.elementUsage === VertexMesh.MESH_POSITION0)
				return vertexElement;
		}
		return null;
	}

	/**
	 * @internal
	 */
	private _generateBoundingObject(): void {
		var min: Vector3 = this._tempVector30;
		var max: Vector3 = this._tempVector31;
		min.x = min.y = min.z = Number.MAX_VALUE;
		max.x = max.y = max.z = -Number.MAX_VALUE;

		var vertexBufferCount: number = this._vertexBuffers.length;
		for (var i: number = 0; i < vertexBufferCount; i++) {
			var vertexBuffer: VertexBuffer3D = this._vertexBuffers[i];
			var positionElement: VertexElement = this._getPositionElement(vertexBuffer);
			var verticesData: Float32Array = vertexBuffer.getData();
			var floatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
			var posOffset: number = positionElement.offset / 4;
			for (var j: number = 0, m: number = verticesData.length; j < m; j += floatCount) {
				var ofset: number = j + posOffset;
				var pX: number = verticesData[ofset];
				var pY: number = verticesData[ofset + 1];
				var pZ: number = verticesData[ofset + 2];
				min.x = Math.min(min.x, pX);
				min.y = Math.min(min.y, pY);
				min.z = Math.min(min.z, pZ);
				max.x = Math.max(max.x, pX);
				max.y = Math.max(max.y, pY);
				max.z = Math.max(max.z, pZ);
			}
		}
		this._bounds = new Bounds(min, max);
	}

	/**
	 *@internal
	 */
	_setSubMeshes(subMeshes: SubMesh[]): void {
		this._subMeshes = subMeshes
		this._subMeshCount = subMeshes.length;

		for (var i: number = 0; i < this._subMeshCount; i++)
			subMeshes[i]._indexInMesh = i;
		this._generateBoundingObject();
	}

	/**
	 * @inheritDoc
	 */
	_getSubMesh(index: number): GeometryElement {
		return this._subMeshes[index];
	}

	/**
	 * @internal
	 */
	_setBuffer(vertexBuffers: VertexBuffer3D[], indexBuffer: IndexBuffer3D): void {
		var bufferState: BufferState = this._bufferState;
		bufferState.bind();
		bufferState.applyVertexBuffers(vertexBuffers);
		bufferState.applyIndexBuffer(indexBuffer);
		bufferState.unBind();

		var instanceBufferState: BufferState = this._instanceBufferState;
		instanceBufferState.bind();
		instanceBufferState.applyVertexBuffers(vertexBuffers);
		instanceBufferState.applyInstanceVertexBuffer(SubMeshInstanceBatch.instance.instanceWorldMatrixBuffer);
		instanceBufferState.applyInstanceVertexBuffer(SubMeshInstanceBatch.instance.instanceMVPMatrixBuffer);
		instanceBufferState.applyIndexBuffer(indexBuffer);
		instanceBufferState.unBind();
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _disposeResource(): void {
		for (var i: number = 0, n: number = this._subMeshes.length; i < n; i++)
			this._subMeshes[i].destroy();
		this._nativeTriangleMesh && (<any>window).Physics3D.destroy(this._nativeTriangleMesh);
		for (i = 0, n = this._vertexBuffers.length; i < n; i++)
			this._vertexBuffers[i].destroy();
		this._indexBuffer.destroy();
		this._setCPUMemory(0);
		this._setGPUMemory(0);
		this._bufferState.destroy();
		this._instanceBufferState.destroy();
		this._bufferState = null;
		this._instanceBufferState = null;
		this._vertexBuffers = null;
		this._indexBuffer = null;
		this._subMeshes = null;
		this._nativeTriangleMesh = null;
		this._vertexBuffers = null;
		this._indexBuffer = null;
		this._boneNames = null;
		this._inverseBindPoses = null;
	}

	/**
	 * @internal
	 */
	_getPhysicMesh(): any {
		if (!this._nativeTriangleMesh) {
			var physics3D: any = (<any>window).Physics3D;
			var triangleMesh: any = new physics3D.btTriangleMesh();//TODO:独立抽象btTriangleMesh,增加内存复用
			var nativePositio0: any = Mesh._nativeTempVector30;
			var nativePositio1: any = Mesh._nativeTempVector31;
			var nativePositio2: any = Mesh._nativeTempVector32;
			var position0: Vector3 = this._tempVector30;
			var position1: Vector3 = this._tempVector31;
			var position2: Vector3 = this._tempVector32;

			var vertexBuffer: VertexBuffer3D = this._vertexBuffers[0];//TODO:临时
			var positionElement: VertexElement = this._getPositionElement(vertexBuffer);
			var verticesData: Float32Array = vertexBuffer.getData();
			var floatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
			var posOffset: number = positionElement.offset / 4;

			var indices: Uint16Array = this._indexBuffer.getData();//TODO:API修改问题
			for (var i: number = 0, n: number = indices.length; i < n; i += 3) {
				var p0Index: number = indices[i] * floatCount + posOffset;
				var p1Index: number = indices[i + 1] * floatCount + posOffset;
				var p2Index: number = indices[i + 2] * floatCount + posOffset;
				position0.setValue(verticesData[p0Index], verticesData[p0Index + 1], verticesData[p0Index + 2]);
				position1.setValue(verticesData[p1Index], verticesData[p1Index + 1], verticesData[p1Index + 2]);
				position2.setValue(verticesData[p2Index], verticesData[p2Index + 1], verticesData[p2Index + 2]);

				Utils3D._convertToBulletVec3(position0, nativePositio0, true);
				Utils3D._convertToBulletVec3(position1, nativePositio1, true);
				Utils3D._convertToBulletVec3(position2, nativePositio2, true);
				triangleMesh.addTriangle(nativePositio0, nativePositio1, nativePositio2, true);
			}
			this._nativeTriangleMesh = triangleMesh;
		}
		return this._nativeTriangleMesh;
	}

	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {//[实现IClone接口]
		var destMesh: Mesh = (<Mesh>destObject);
		for (var i: number = 0; i < this._vertexBuffers.length; i++) {
			var vb: VertexBuffer3D = this._vertexBuffers[i];
			var destVB: VertexBuffer3D = new VertexBuffer3D(vb._byteLength, vb.bufferUsage, vb.canRead);
			destVB.vertexDeclaration = vb.vertexDeclaration;
			destVB.setData(vb.getData().slice());
			destMesh._vertexBuffers.push(destVB);
			destMesh._vertexCount += destVB.vertexCount;
		}
		var ib: IndexBuffer3D = this._indexBuffer;
		var destIB: IndexBuffer3D = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, ib.indexCount, ib.bufferUsage, ib.canRead);
		destIB.setData(ib.getData().slice());
		destMesh._indexBuffer = destIB;

		destMesh._setBuffer(destMesh._vertexBuffers, destIB);
		destMesh._setCPUMemory(this.cpuMemory);
		destMesh._setGPUMemory(this.gpuMemory);

		var boneNames: string[] = this._boneNames;
		var destBoneNames: string[] = destMesh._boneNames = [];
		for (i = 0; i < boneNames.length; i++)
			destBoneNames[i] = boneNames[i];

		var inverseBindPoses: Matrix4x4[] = this._inverseBindPoses;
		var destInverseBindPoses: Matrix4x4[] = destMesh._inverseBindPoses = [];
		for (i = 0; i < inverseBindPoses.length; i++)
			destInverseBindPoses[i] = inverseBindPoses[i];

		destMesh._bindPoseIndices = new Uint16Array(this._bindPoseIndices);

		for (i = 0; i < this._skinDataPathMarks.length; i++)
			destMesh._skinDataPathMarks[i] = this._skinDataPathMarks[i].slice();

		for (i = 0; i < this.subMeshCount; i++) {
			var subMesh: SubMesh = this._subMeshes[i];
			var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
			var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
			var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
			var destSubmesh: SubMesh = new SubMesh(destMesh);

			destSubmesh._subIndexBufferStart.length = subIndexBufferStart.length;
			destSubmesh._subIndexBufferCount.length = subIndexBufferCount.length;
			destSubmesh._boneIndicesList.length = boneIndicesList.length;

			for (var j: number = 0; j < subIndexBufferStart.length; j++)
				destSubmesh._subIndexBufferStart[j] = subIndexBufferStart[j];
			for (j = 0; j < subIndexBufferCount.length; j++)
				destSubmesh._subIndexBufferCount[j] = subIndexBufferCount[j];
			for (j = 0; j < boneIndicesList.length; j++)
				destSubmesh._boneIndicesList[j] = new Uint16Array(boneIndicesList[j]);

			destSubmesh._indexBuffer = destIB;
			destSubmesh._indexStart = subMesh._indexStart;
			destSubmesh._indexCount = subMesh._indexCount;
			destSubmesh._indices = new Uint16Array(destIB.getData().buffer, subMesh._indexStart * 2, subMesh._indexCount);
			var vertexBuffer: VertexBuffer3D = destMesh._vertexBuffers[0];
			destSubmesh._vertexBuffer = vertexBuffer;
			destMesh._subMeshes.push(destSubmesh);
		}
		destMesh._setSubMeshes(destMesh._subMeshes);
	}

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 */
	clone(): any {//[实现IClone接口]
		var dest: Mesh = new Mesh();
		this.cloneTo(dest);
		return dest;
	}
}



