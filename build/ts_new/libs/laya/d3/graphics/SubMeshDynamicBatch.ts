import { ILaya3D } from "../../../ILaya3D";
import { LayaGL } from "../../layagl/LayaGL";
import { Resource } from "../../resource/Resource";
import { Stat } from "../../utils/Stat";
import { SingletonList } from "../component/SingletonList";
import { BufferState } from "../core/BufferState";
import { GeometryElement } from "../core/GeometryElement";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { Transform3D } from "../core/Transform3D";
import { SubMesh } from "../resource/models/SubMesh";
import { IndexBuffer3D } from "./IndexBuffer3D";
import { VertexMesh } from "./Vertex/VertexMesh";
import { VertexBuffer3D } from "./VertexBuffer3D";
import { VertexDeclaration } from "./VertexDeclaration";
import { VertexElement } from "./VertexElement";
import { IndexFormat } from "./IndexFormat";
/**
 * @internal
 * <code>SubMeshDynamicBatch</code> 类用于网格动态合并。
 */
export class SubMeshDynamicBatch extends GeometryElement {
	/** @internal
	 * //MI6 (微信) 大于12个顶点微小提升
	 * //MI6 (QQ浏览器8.2 X5内核038230GPU-UU) 大于12个顶点微小提升
	 * //MI6 (chrome63) 大于10个顶点微小提升
	 * //IPHONE7PLUS  IOS11 微信 大于12个顶点微小提升
	 * //IPHONE5s  IOS8 微信 大于12仍有较大提升
	 */
	static maxAllowVertexCount: number = 10;
	/** @internal */
	static maxAllowAttribueCount: number = 900;//TODO:
	/** @internal */
	static maxIndicesCount: number = 32000;

	/** @internal */
	static instance: SubMeshDynamicBatch;

	/**
	* @internal
	*/
	static __init__(): void {
		SubMeshDynamicBatch.instance = new SubMeshDynamicBatch();
	}

	/**@internal */
	private _vertices: Float32Array;
	/**@internal */
	private _indices: Int16Array;
	/**@internal */
	private _positionOffset: number;
	/**@internal */
	private _normalOffset: number;
	/**@internal */
	private _colorOffset: number;
	/**@internal */
	private _uv0Offset: number;
	/**@internal */
	_uv1Offset:number;
	/**@internal */
	private _sTangentOffset: number;
	/**@internal */
	_vertexBuffer: VertexBuffer3D;
	/**@internal */
	_indexBuffer: IndexBuffer3D;
	/** @internal */
	private _bufferState: BufferState = new BufferState();

	/**
	 * 创建一个 <code>SubMeshDynamicBatch</code> 实例。
	 */
	constructor() {
		super();
		var gl: WebGLRenderingContext = LayaGL.instance;
		var maxVerDec: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV,UV1,TANGENT");
		var maxByteCount: number = maxVerDec.vertexStride * SubMeshDynamicBatch.maxIndicesCount;
		this._vertices = new Float32Array(maxByteCount / 4);
		this._vertexBuffer = new VertexBuffer3D(maxByteCount, gl.DYNAMIC_DRAW);
		this._indices = new Int16Array(SubMeshDynamicBatch.maxIndicesCount);
		this._indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, this._indices.length, gl.DYNAMIC_DRAW);

		var memorySize: number = this._vertexBuffer._byteLength + this._indexBuffer._byteLength;
		Resource._addMemory(memorySize, memorySize);
	}

	/**
	 * @internal
	 */
	private _getBatchVertices(vertexDeclaration: VertexDeclaration, batchVertices: Float32Array, batchOffset: number, element: SubMeshRenderElement, subMesh: SubMesh): void {
		var vertexFloatCount: number = vertexDeclaration.vertexStride / 4;
		var oriVertexes: Float32Array = subMesh._vertexBuffer.getFloat32Data();

		var multiSubMesh: boolean = element._dynamicMultiSubMesh;
		var vertexCount: number = element._dynamicVertexCount;
		element._computeWorldPositionsAndNormals(this._positionOffset, this._normalOffset, multiSubMesh, vertexCount);
		var worldPositions: Float32Array = element._dynamicWorldPositions;
		var worldNormals: Float32Array = element._dynamicWorldNormals;
		var indices = subMesh._indices;
		for (var i: number = 0; i < vertexCount; i++) {
			var index: number = multiSubMesh ? indices[i] : i;
			var oriOffset: number = index * vertexFloatCount;
			var bakeOffset: number = (i + batchOffset) * vertexFloatCount;

			var oriOff: number = i * 3;
			var bakOff: number = bakeOffset + this._positionOffset;
			batchVertices[bakOff] = worldPositions[oriOff];
			batchVertices[bakOff + 1] = worldPositions[oriOff + 1];
			batchVertices[bakOff + 2] = worldPositions[oriOff + 2];

			if (this._normalOffset !== -1) {
				bakOff = bakeOffset + this._normalOffset;
				batchVertices[bakOff] = worldNormals[oriOff];
				batchVertices[bakOff + 1] = worldNormals[oriOff + 1];
				batchVertices[bakOff + 2] = worldNormals[oriOff + 2];
			}

			if (this._colorOffset !== -1) {
				bakOff = bakeOffset + this._colorOffset;
				oriOff = oriOffset + this._colorOffset;
				batchVertices[bakOff] = oriVertexes[oriOff];
				batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
				batchVertices[bakOff + 2] = oriVertexes[oriOff + 2];
				batchVertices[bakOff + 3] = oriVertexes[oriOff + 3];
			}

			if (this._uv0Offset !== -1) {
				bakOff = bakeOffset + this._uv0Offset;
				oriOff = oriOffset + this._uv0Offset;
				batchVertices[bakOff] = oriVertexes[oriOff];
				batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
			}

			//if (lightmapScaleOffset) {//TODO:动态合并光照贴图UV如何处理
			//if (_uv1Offset !== -1)
			//Utils3D.transformLightingMapTexcoordByUV1Array(oriVertexes, oriOffset + _uv1Offset, lightmapScaleOffset, batchVertices, bakeOffset + _uv1Offset);
			//else
			//Utils3D.transformLightingMapTexcoordByUV0Array(oriVertexes, oriOffset + _uv0Offset, lightmapScaleOffset, batchVertices, bakeOffset + _uv1Offset);
			//}

			if (this._sTangentOffset !== -1) {
				bakOff = bakeOffset + this._sTangentOffset;
				oriOff = oriOffset + this._sTangentOffset;
				batchVertices[bakOff] = oriVertexes[oriOff];
				batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
				batchVertices[bakOff + 2] = oriVertexes[oriOff + 2];
				batchVertices[bakOff + 3] = oriVertexes[oriOff + 3];

				bakOff = bakeOffset + this._sTangentOffset;
				oriOff = oriOffset + this._sTangentOffset;
				batchVertices[bakOff] = oriVertexes[oriOff];
				batchVertices[bakOff + 1] = oriVertexes[oriOff + 1];
				batchVertices[bakOff + 2] = oriVertexes[oriOff + 2];
				batchVertices[bakOff + 3] = oriVertexes[oriOff + 3];
			}
		}
	}

	/**
	 * @internal
	 */
	private _getBatchIndices(batchIndices: Int16Array, batchIndexCount: number, batchVertexCount: number, transform: Transform3D, subMesh: SubMesh, multiSubMesh: boolean): void {
		var subIndices = subMesh._indices;
		var k: number, m: number, batchOffset: number;
		var isInvert: boolean = transform._isFrontFaceInvert;
		if (multiSubMesh) {
			if (isInvert) {
				for (k = 0, m = subIndices.length; k < m; k += 3) {
					batchOffset = batchIndexCount + k;
					var index: number = batchVertexCount + k;
					batchIndices[batchOffset] = index;
					batchIndices[batchOffset + 1] = index + 2;
					batchIndices[batchOffset + 2] = index + 1;
				}
			} else {
				for (k = 0, m = subIndices.length; k < m; k += 3) {
					batchOffset = batchIndexCount + k;
					index = batchVertexCount + k;
					batchIndices[batchOffset] = index;
					batchIndices[batchOffset + 1] = index + 1;
					batchIndices[batchOffset + 2] = index + 2;
				}
			}
		} else {
			if (isInvert) {
				for (k = 0, m = subIndices.length; k < m; k += 3) {
					batchOffset = batchIndexCount + k;
					batchIndices[batchOffset] = batchVertexCount + subIndices[k];
					batchIndices[batchOffset + 1] = batchVertexCount + subIndices[k + 2];
					batchIndices[batchOffset + 2] = batchVertexCount + subIndices[k + 1];
				}
			} else {
				for (k = 0, m = subIndices.length; k < m; k += 3) {
					batchOffset = batchIndexCount + k;
					batchIndices[batchOffset] = batchVertexCount + subIndices[k];
					batchIndices[batchOffset + 1] = batchVertexCount + subIndices[k + 1];
					batchIndices[batchOffset + 2] = batchVertexCount + subIndices[k + 2];
				}
			}
		}
	}

	/**
	 * @internal
	 */
	private _flush(vertexCount: number, indexCount: number): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		this._vertexBuffer.setData(this._vertices.buffer, 0, 0, vertexCount * (this._bufferState.vertexDeclaration.vertexStride));
		this._indexBuffer.setData(this._indices, 0, 0, indexCount);
		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_prepareRender(state: RenderContext3D): boolean {
		var element: SubMeshRenderElement = (<SubMeshRenderElement>state.renderElement);
		var vertexDeclaration: VertexDeclaration = element.vertexBatchVertexDeclaration;
		this._bufferState = ILaya3D.MeshRenderDynamicBatchManager.instance._getBufferState(vertexDeclaration);

		this._positionOffset = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_POSITION0)._offset / 4;
		var normalElement: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_NORMAL0);
		this._normalOffset = normalElement ? normalElement._offset / 4 : -1;
		var colorElement: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_COLOR0);
		this._colorOffset = colorElement ? colorElement._offset / 4 : -1;
		var uv0Element: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0);
		this._uv0Offset = uv0Element ? uv0Element._offset / 4 : -1;
		var uv1Element: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE1);
		this._uv1Offset = uv1Element ? uv1Element._offset / 4 : -1;
		var tangentElement: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TANGENT0);
		this._sTangentOffset = tangentElement ? tangentElement._offset / 4 : -1;
		return true;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_render(context: RenderContext3D): void {
		this._bufferState.bind();
		var element: SubMeshRenderElement = (<SubMeshRenderElement>context.renderElement);
		var vertexDeclaration: VertexDeclaration = element.vertexBatchVertexDeclaration;
		var batchElements: SingletonList<SubMeshRenderElement> = element.vertexBatchElementList;

		var batchVertexCount: number = 0;
		var batchIndexCount: number = 0;
		var renderBatchCount: number = 0;
		var elementCount: number = batchElements.length;
		var elements: SubMeshRenderElement[] = batchElements.elements;
		for (var i: number = 0; i < elementCount; i++) {
			var subElement: SubMeshRenderElement = elements[i];
			var subMesh: SubMesh = (<SubMesh>subElement._geometry);
			var indexCount: number = subMesh._indexCount;
			if (batchIndexCount + indexCount > SubMeshDynamicBatch.maxIndicesCount) {
				this._flush(batchVertexCount, batchIndexCount);
				renderBatchCount++;
				Stat.trianglesFaces += batchIndexCount / 3;
				batchVertexCount = batchIndexCount = 0;
			}
			var transform: Transform3D = subElement._transform;
			this._getBatchVertices(vertexDeclaration, this._vertices, batchVertexCount, /*(element.render as MeshRender)*/ subElement, subMesh);
			this._getBatchIndices(this._indices, batchIndexCount, batchVertexCount, transform, subMesh, subElement._dynamicMultiSubMesh);
			batchVertexCount += subElement._dynamicVertexCount;
			batchIndexCount += indexCount;
		}
		this._flush(batchVertexCount, batchIndexCount);
		renderBatchCount++;
		Stat.renderBatches += renderBatchCount;
		Stat.savedRenderBatches += elementCount - renderBatchCount;
		Stat.trianglesFaces += batchIndexCount / 3;
	}

}


