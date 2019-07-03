import { ILaya } from "../../../../ILaya";
import { Physics } from "../../../d3/physics/Physics";
import { Resource } from "../../../resource/Resource";
import { Handler } from "../../../utils/Handler";
import { Bounds } from "../../core/Bounds";
import { BufferState } from "../../core/BufferState";
import { IClone } from "../../core/IClone";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { SubMeshInstanceBatch } from "../../graphics/SubMeshInstanceBatch";
import { VertexMesh } from "../../graphics/Vertex/VertexMesh";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { VertexElement } from "../../graphics/VertexElement";
import { VertexElementFormat } from "../../graphics/VertexElementFormat";
import { MeshReader } from "../../loaders/MeshReader";
import { Color } from "../../math/Color";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { Utils3D } from "../../utils/Utils3D";
import { SubMesh } from "./SubMesh";

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
		ILaya.loader.create(url, complete, null, Mesh.MESH);
	}

	/** @internal */
	private _nativeTriangleMesh: any;
	/** @internal */
	private _minVerticesUpdate: number = Number.MAX_VALUE;
	/** @internal */
	private _maxVerticesUpdate: number = Number.MIN_VALUE;


	/** @internal */
	protected _bounds: Bounds;

	/** @internal */
	_isReadable: boolean;
	/** @internal */
	_bufferState: BufferState = new BufferState();
	/** @internal */
	_instanceBufferState: BufferState = new BufferState();
	/** @internal */
	_subMeshes: SubMesh[];
	/** */
	_vertexBuffer: VertexBuffer3D = null;
	/** */
	_indexBuffer: IndexBuffer3D = null;

	/** @internal */
	_boneNames: string[];
	/** @internal */
	_inverseBindPoses: Matrix4x4[];
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
	 * 获取顶点个数。
	 */
	get vertexCount(): number {
		return this._vertexCount;
	}

	/**
	 * 获取SubMesh的个数。
	 * @return SubMesh的个数。
	 */
	get subMeshCount(): number {
		return this._subMeshes.length;
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
	 * @param isReadable 是否可读。
	 */
	constructor(isReadable: boolean = true) {
		super();
		this._isReadable = isReadable;
		this._subMeshes = [];
		this._skinDataPathMarks = [];
	}

	/**
	 * @internal
	 */
	private _getPositionElement(vertexBuffer: VertexBuffer3D): VertexElement {
		var vertexElements: any[] = vertexBuffer.vertexDeclaration._vertexElements;
		for (var i: number = 0, n: number = vertexElements.length; i < n; i++) {
			var vertexElement: VertexElement = vertexElements[i];
			if (vertexElement._elementFormat === VertexElementFormat.Vector3 && vertexElement._elementUsage === VertexMesh.MESH_POSITION0)
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

		var vertexBuffer: VertexBuffer3D = this._vertexBuffer;
		var positionElement: VertexElement = this._getPositionElement(vertexBuffer);
		var verticesData: Float32Array = vertexBuffer.getFloat32Data();
		var floatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
		var posOffset: number = positionElement._offset / 4;
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
		this._bounds = new Bounds(min, max);
	}

	private _getVerticeElementData(data: Array<Vector2 | Vector3 | Vector4 | Color>, elementUsage: number): void {
		data.length = this._vertexCount;
		var verDec: VertexDeclaration = this._vertexBuffer.vertexDeclaration;
		var element: VertexElement = verDec.getVertexElementByUsage(elementUsage);
		if (element) {
			var uint8Vertices: Uint8Array = this._vertexBuffer.getUint8Data();
			var floatVertices: Float32Array = this._vertexBuffer.getFloat32Data();
			var uint8VerStr: number = verDec.vertexStride;
			var floatVerStr: number = uint8VerStr / 4;
			var uint8EleOffset: number = element._offset;
			var floatEleOffset: number = uint8EleOffset / 4;

			switch (elementUsage) {
				case VertexMesh.MESH_TEXTURECOORDINATE0:
				case VertexMesh.MESH_TEXTURECOORDINATE1:
					for (var i: number = 0; i < this._vertexCount; i++) {
						var offset: number = floatVerStr * i + floatEleOffset;
						data[i] = new Vector2(floatVertices[offset], floatVertices[offset + 1]);
					}
					break;
				case VertexMesh.MESH_POSITION0:
				case VertexMesh.MESH_NORMAL0:
					for (var i: number = 0; i < this._vertexCount; i++) {
						var offset: number = floatVerStr * i + floatEleOffset;
						data[i] = new Vector3(floatVertices[offset], floatVertices[offset + 1], floatVertices[offset + 2]);
					}
					break;
				case VertexMesh.MESH_TANGENT0:
				case VertexMesh.MESH_BLENDWEIGHT0:
					for (var i: number = 0; i < this._vertexCount; i++) {
						var offset: number = floatVerStr * i + floatEleOffset;
						data[i] = new Vector4(floatVertices[offset], floatVertices[offset + 1], floatVertices[offset + 2], floatVertices[offset + 3]);
					}
					break;
				case VertexMesh.MESH_COLOR0:
					for (var i: number = 0; i < this._vertexCount; i++) {
						var offset: number = floatVerStr * i + floatEleOffset;
						data[i] = new Color(floatVertices[offset], floatVertices[offset + 1], floatVertices[offset + 2], floatVertices[offset + 3]);
					}
					break;
				case VertexMesh.MESH_BLENDINDICES0:
					for (var i: number = 0; i < this._vertexCount; i++) {
						var offset: number = uint8VerStr * i + uint8EleOffset;
						data[i] = new Vector4(uint8Vertices[offset], uint8Vertices[offset + 1], uint8Vertices[offset + 2], uint8Vertices[offset + 3]);
					}
					break;
				default:
					throw "Mesh:Unknown elementUsage.";
			}
		}
	}


	private _setVerticeElementData(data: Array<Vector2 | Vector3 | Vector4 | Color>, elementUsage: number): void {
		var verDec: VertexDeclaration = this._vertexBuffer.vertexDeclaration;
		var element: VertexElement = verDec.getVertexElementByUsage(elementUsage);
		if (element) {
			var uint8Vertices: Uint8Array = this._vertexBuffer.getUint8Data();
			var floatVertices: Float32Array = this._vertexBuffer.getFloat32Data();
			var uint8VerStr: number = verDec.vertexStride;
			var float8VerStr: number = uint8VerStr / 4;
			var uint8EleOffset: number = element._offset;
			var floatEleOffset: number = uint8EleOffset / 4;
			switch (elementUsage) {
				case VertexMesh.MESH_TEXTURECOORDINATE0:
				case VertexMesh.MESH_TEXTURECOORDINATE1:
					for (var i: number = 0, n: number = data.length; i < n; i++) {
						var offset: number = float8VerStr * i + floatEleOffset;
						var vec2: Vector2 = <Vector2>data[i];
						floatVertices[offset] = vec2.x;
						floatVertices[offset + 1] = vec2.y;
					}
					break;
				case VertexMesh.MESH_POSITION0:
				case VertexMesh.MESH_NORMAL0:
					for (var i: number = 0, n: number = data.length; i < n; i++) {
						var offset: number = float8VerStr * i + floatEleOffset;
						var vec3: Vector3 = <Vector3>data[i];
						floatVertices[offset] = vec3.x;
						floatVertices[offset + 1] = vec3.y;
						floatVertices[offset + 2] = vec3.z;
					}
					break;
				case VertexMesh.MESH_TANGENT0:
				case VertexMesh.MESH_BLENDWEIGHT0:
					for (var i: number = 0, n: number = data.length; i < n; i++) {
						var offset: number = float8VerStr * i + floatEleOffset;
						var vec4: Vector4 = <Vector4>data[i];
						floatVertices[offset] = vec4.x;
						floatVertices[offset + 1] = vec4.y;
						floatVertices[offset + 2] = vec4.z;
						floatVertices[offset + 3] = vec4.w;
					}
					break;
				case VertexMesh.MESH_COLOR0:
					for (var i: number = 0, n: number = data.length; i < n; i++) {
						var offset: number = float8VerStr * i + floatEleOffset;
						var cor: Color = <Color>data[i];
						floatVertices[offset] = cor.r;
						floatVertices[offset + 1] = cor.g;
						floatVertices[offset + 2] = cor.b;
						floatVertices[offset + 2] = cor.a;
					}
					break;
				case VertexMesh.MESH_BLENDINDICES0:
					for (var i: number = 0, n: number = data.length; i < n; i++) {
						var offset: number = uint8VerStr * i + uint8EleOffset;
						var vec4: Vector4 = <Vector4>data[i];
						uint8Vertices[offset] = vec4.x;
						uint8Vertices[offset + 1] = vec4.y;
						uint8Vertices[offset + 2] = vec4.z;
						uint8Vertices[offset + 3] = vec4.w;
					}
					break;
				default:
					throw "Mesh:Unknown elementUsage.";
			}
		}
		else {
			console.warn("Mesh: the mesh don't have  this VertexElement.");
			//TODO:vertexBuffer结构发生变化
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _disposeResource(): void {
		for (var i: number = 0, n: number = this._subMeshes.length; i < n; i++)
			this._subMeshes[i].destroy();
		this._nativeTriangleMesh && (<any>window).Physics3D.destroy(this._nativeTriangleMesh);
		this._vertexBuffer.destroy();
		this._indexBuffer.destroy();
		this._setCPUMemory(0);
		this._setGPUMemory(0);
		this._bufferState.destroy();
		this._instanceBufferState.destroy();
		this._bufferState = null;
		this._instanceBufferState = null;
		this._vertexBuffer = null;
		this._indexBuffer = null;
		this._subMeshes = null;
		this._nativeTriangleMesh = null;
		this._indexBuffer = null;
		this._boneNames = null;
		this._inverseBindPoses = null;
	}

	/**
	 *@internal
	 */
	_setSubMeshes(subMeshes: SubMesh[]): void {
		this._subMeshes = subMeshes

		for (var i: number = 0, n: number = subMeshes.length; i < n; i++)
			subMeshes[i]._indexInMesh = i;
		this._generateBoundingObject();
	}


	/**
	 * @internal
	 */
	_setBuffer(vertexBuffer: VertexBuffer3D, indexBuffer: IndexBuffer3D): void {
		var bufferState: BufferState = this._bufferState;
		bufferState.bind();
		bufferState.applyVertexBuffer(vertexBuffer);
		bufferState.applyIndexBuffer(indexBuffer);
		bufferState.unBind();

		var instanceBufferState: BufferState = this._instanceBufferState;
		instanceBufferState.bind();
		instanceBufferState.applyVertexBuffer(vertexBuffer);
		instanceBufferState.applyInstanceVertexBuffer(SubMeshInstanceBatch.instance.instanceWorldMatrixBuffer);
		instanceBufferState.applyInstanceVertexBuffer(SubMeshInstanceBatch.instance.instanceMVPMatrixBuffer);
		instanceBufferState.applyIndexBuffer(indexBuffer);
		instanceBufferState.unBind();
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

			var vertexBuffer: VertexBuffer3D = this._vertexBuffer;
			var positionElement: VertexElement = this._getPositionElement(vertexBuffer);
			var verticesData: Float32Array = vertexBuffer.getFloat32Data();
			var floatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
			var posOffset: number = positionElement._offset / 4;

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
	 * @internal
	 */
	_uploadVerticesData(): void {
		var min: number = this._minVerticesUpdate;
		var max: number = this._maxVerticesUpdate;
		if (min !== Number.MAX_VALUE && this._maxVerticesUpdate !== Number.MIN_VALUE) {
			this._vertexBuffer.setData(this._vertexBuffer.getUint8Data().buffer, min * 4, min * 4, (max - min) * 4);
			this._minVerticesUpdate = Number.MAX_VALUE;
			this._maxVerticesUpdate = Number.MIN_VALUE;
		}
	}

	/**
	 * 根据获取子网格。
	 * @param index 索引。
	 */
	getSubMesh(index: number): SubMesh {
		return this._subMeshes[index];
	}

	/**
	 * 拷贝并填充位置数据至数组。
	 * @param positions 位置数组。
	 * @remark 该方法为拷贝操作，比较耗费性能。
	 */
	getPositions(positions: Vector3[]): void {
		if (this._isReadable)
			this._getVerticeElementData(positions, VertexMesh.MESH_POSITION0);
		else
			throw "Mesh:can't get positions on mesh,isReadable must be true.";
	}

	/**
	 * 设置位置数据。
	 * @param positions 位置。
	 */
	setPositions(positions: Vector3[]): void {
		if (this._isReadable)
			this._setVerticeElementData(positions, VertexMesh.MESH_POSITION0);
		else
			throw "Mesh:setPosition() need isReadable must be true or use setVertices().";
	}

	/**
	 * 拷贝并填充颜色数据至数组。
	 * @param colors 颜色数组。
	 * @remark 该方法为拷贝操作，比较耗费性能。
	 */
	getColors(colors: Color[]): void {
		if (this._isReadable)
			this._getVerticeElementData(colors, VertexMesh.MESH_COLOR0);
		else
			throw "Mesh:can't get colors on mesh,isReadable must be true.";
	}

	/**
	 * 设置颜色数据。
	 * @param colors  颜色。
	 */
	setColors(colors: Color[]): void {
		if (this._isReadable)
			this._setVerticeElementData(colors, VertexMesh.MESH_COLOR0);
		else
			throw "Mesh:setColors() need isReadable must be true or use setVertices().";
	}

	/**
	 * 拷贝并填充纹理坐标数据至数组。
	 * @param uvs 纹理坐标数组。
	 * @param channel 纹理坐标通道。
	 * @remark 该方法为拷贝操作，比较耗费性能。
	 */
	getUVs(uvs: Vector2[], channel: number = 0): void {
		if (this._isReadable) {
			switch (channel) {
				case 0:
					this._getVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE0);
					break;
				case 1:
					this._getVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE1);
					break;
				default:
					throw "Mesh:Invalid channel.";
			}
		}
		else {
			throw "Mesh:can't get uvs on mesh,isReadable must be true.";
		}
	}

	/**
	 * 设置纹理坐标数据。
	 * @param uvs 纹理坐标。
	 * @param channel 纹理坐标通道。
	 */
	setUVs(uvs: Vector2[], channel: number = 0): void {
		if (this._isReadable) {
			switch (channel) {
				case 0:
					this._setVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE0);
					break;
				case 1:
					this._setVerticeElementData(uvs, VertexMesh.MESH_TEXTURECOORDINATE1);
					break;
				default:
					throw "Mesh:Invalid channel.";
			}
		}
		else {
			throw "Mesh:setUVs() need isReadable must be true or use setVertices().";
		}
	}

	/**
	 * 拷贝并填充法线数据至数组。
	 * @param normals 法线数组。
	 * @remark 该方法为拷贝操作，比较耗费性能。
	 */
	getNormals(normals: Vector3[]): void {
		if (this._isReadable)
			this._getVerticeElementData(normals, VertexMesh.MESH_NORMAL0);
		else
			throw "Mesh:can't get colors on mesh,isReadable must be true.";
	}

	/**
	 * 设置法线数据。
	 * @param normals 法线。 
	 */
	setNormals(normals: Vector3[]): void {
		if (this._isReadable)
			this._setVerticeElementData(normals, VertexMesh.MESH_NORMAL0);
		else
			throw "Mesh:setNormals() need must be true or use setVertices().";
	}

	/**
	 * 拷贝并填充切线数据至数组。
	 * @param tangents 切线。
	 */
	getTangents(tangents: Vector4[]): void {
		if (this._isReadable)
			this._getVerticeElementData(tangents, VertexMesh.MESH_TANGENT0);
		else
			throw "Mesh:can't get colors on mesh,isReadable must be true.";
	}

	/**
	 * 设置切线数据。
	 * @param tangents 切线。
	 */
	setTangents(tangents: Vector4[]): void {
		if (this._isReadable)
			this._setVerticeElementData(tangents, VertexMesh.MESH_TANGENT0);
		else
			throw "Mesh:setTangents() need isReadable must be true or use setVertices().";
	}

	/**
	* 获取骨骼权重。
	* @param boneWeights 骨骼权重。
	*/
	getBoneWeights(boneWeights: Vector4[]): void {
		if (this._isReadable)
			this._getVerticeElementData(boneWeights, VertexMesh.MESH_BLENDWEIGHT0);
		else
			throw "Mesh:can't get boneWeights on mesh,isReadable must be true.";
	}

	/**
	* 拷贝并填充骨骼权重数据至数组。
	* @param boneWeights 骨骼权重。
	*/
	setBoneWeights(boneWeights: Vector4[]): void {
		if (this._isReadable)
			this._setVerticeElementData(boneWeights, VertexMesh.MESH_BLENDWEIGHT0);
		else
			throw "Mesh:setBoneWeights() need isReadable must be true or use setVertices().";
	}

	/**
	* 获取骨骼索引。
	* @param boneIndices 骨骼索引。
	*/
	getBoneIndices(boneIndices: Vector4[]): void {
		if (this._isReadable)
			this._getVerticeElementData(boneIndices, VertexMesh.MESH_BLENDINDICES0);
		else
			throw "Mesh:can't get boneIndices on mesh,isReadable must be true.";
	}

	/**
	* 拷贝并填充骨骼索引数据至数组。
	* @param boneWeights 骨骼索引。
	*/
	setBoneIndices(boneIndices: Vector4[]): void {
		if (this._isReadable)
			this._setVerticeElementData(boneIndices, VertexMesh.MESH_BLENDINDICES0);
		else
			throw "Mesh:setBoneIndices() need isReadable must be true or use setVertices().";
	}


	/**
	 * 将Mesh标记为不可读,可减少内存，标记后不可再调用相关读取方法。
	 */
	markAsUnreadbale(): void {
		this._uploadVerticesData();
		this._vertexBuffer.markAsUnreadbale();
		this._isReadable = false;
	}

	/**
	 * 获取顶点声明。
	 */
	getVertexDeclaration(): VertexDeclaration {
		return this._vertexBuffer._vertexDeclaration;
	}

	/**
	* 拷贝并获取顶点数据的副本。
	* @return 顶点数据。
	*/
	getVertices(): ArrayBuffer {
		if (this._isReadable)
			return this._vertexBuffer.getUint8Data().buffer.slice(0);
		else
			throw "Mesh:can't get vertices on mesh,isReadable must be true.";
	}

	/**
	* 设置顶点数据。
	* @param boneWeights 骨骼权重。
	*/
	setVertices(vertices: ArrayBuffer): void {
		return this._vertexBuffer.setData(vertices);
	}


	/**
	 * 克隆。
	 * @param	destObject 克隆源。
	 */
	cloneTo(destObject: any): void {//[实现IClone接口]
		var destMesh: Mesh = (<Mesh>destObject);
		var vb: VertexBuffer3D = this._vertexBuffer;
		var destVB: VertexBuffer3D = new VertexBuffer3D(vb._byteLength, vb.bufferUsage, vb.canRead);
		destVB.vertexDeclaration = vb.vertexDeclaration;
		destVB.setData(vb.getUint8Data().slice().buffer);
		destMesh._vertexBuffer = destVB;
		destMesh._vertexCount += destVB.vertexCount;
		var ib: IndexBuffer3D = this._indexBuffer;
		var destIB: IndexBuffer3D = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, ib.indexCount, ib.bufferUsage, ib.canRead);
		destIB.setData(ib.getData().slice());
		destMesh._indexBuffer = destIB;

		destMesh._setBuffer(destMesh._vertexBuffer, destIB);
		destMesh._setCPUMemory(this.cpuMemory);
		destMesh._setGPUMemory(this.gpuMemory);

		var i: number;
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
			var vertexBuffer: VertexBuffer3D = destMesh._vertexBuffer;
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



	//------------------------------------------NATIVE----------------------------------------------------
	/** @internal */
	_inverseBindPosesBuffer: ArrayBuffer;
}



