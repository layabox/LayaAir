import { LayaGL } from "../../layagl/LayaGL";
import { IDispose } from "../../resource/IDispose";
import { Resource } from "../../resource/Resource";
import { Stat } from "../../utils/Stat";
import { SingletonList } from "../component/SingletonList";
import { BufferState } from "../core/BufferState";
import { GeometryElement } from "../core/GeometryElement";
import { MeshRenderer } from "../core/MeshRenderer";
import { MeshSprite3D } from "../core/MeshSprite3D";
import { BaseRender } from "../core/render/BaseRender";
import { RenderContext3D } from "../core/render/RenderContext3D";
import { RenderElement } from "../core/render/RenderElement";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { Transform3D } from "../core/Transform3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";
import { Vector4 } from "../math/Vector4";
import { Mesh } from "../resource/models/Mesh";
import { SubMesh } from "../resource/models/SubMesh";
import { Utils3D } from "../utils/Utils3D";
import { IndexBuffer3D } from "./IndexBuffer3D";
import { VertexMesh } from "./Vertex/VertexMesh";
import { VertexBuffer3D } from "./VertexBuffer3D";
import { VertexDeclaration } from "./VertexDeclaration";
import { VertexElement } from "./VertexElement";
import { IndexFormat } from "./IndexFormat";

/**
 * @internal
 * <code>SubMeshStaticBatch</code> 类用于网格静态合并。
 */
export class SubMeshStaticBatch extends GeometryElement implements IDispose {
	/** @internal */
	private static _tempVector30: Vector3 = new Vector3();
	/** @internal */
	private static _tempVector31: Vector3 = new Vector3();
	/** @internal */
	private static _tempQuaternion0: Quaternion = new Quaternion();
	/** @internal */
	private static _tempMatrix4x40: Matrix4x4 = new Matrix4x4();
	/** @internal */
	private static _tempMatrix4x41: Matrix4x4 = new Matrix4x4();
	/** @internal */
	private static _tempMatrix4x42: Matrix4x4 = new Matrix4x4();

	/** @internal */
	static maxBatchVertexCount: number = 65535;

	/** @internal */
	private static _batchIDCounter: number = 0;

	/** @internal */
	private _currentBatchVertexCount: number;
	/** @internal */
	private _currentBatchIndexCount: number;
	/** @internal */
	private _vertexDeclaration: VertexDeclaration;
	/**@internal */
	private _vertexBuffer: VertexBuffer3D;
	/**@internal */
	private _indexBuffer: IndexBuffer3D;
	/** @internal */
	private _bufferState: BufferState = new BufferState();

	/** @internal */
	_batchElements: RenderableSprite3D[];

	/** @internal */
	_batchID: number;

	/** @internal [只读]*/
	batchOwner: Sprite3D;

	/**
	 * 创建一个 <code>SubMeshStaticBatch</code> 实例。
	 */
	constructor(batchOwner: Sprite3D, vertexDeclaration: VertexDeclaration) {
		super();
		this._batchID = SubMeshStaticBatch._batchIDCounter++;
		this._batchElements = [];
		this._currentBatchVertexCount = 0;
		this._currentBatchIndexCount = 0;
		this._vertexDeclaration = vertexDeclaration;
		this.batchOwner = batchOwner;
	}

	/**
	 * @internal
	 */
	private _getStaticBatchBakedVertexs(batchVertices: Float32Array, batchOffset: number, batchOwnerTransform: Transform3D, transform: Transform3D, render: MeshRenderer, mesh: Mesh): number {
		var vertexBuffer: VertexBuffer3D = mesh._vertexBuffer;
		var vertexDeclaration: VertexDeclaration = vertexBuffer.vertexDeclaration;
		var positionOffset: number = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_POSITION0)._offset / 4;
		var normalElement: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_NORMAL0);
		var normalOffset: number = normalElement ? normalElement._offset / 4 : -1;
		var colorElement: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_COLOR0);
		var colorOffset: number = colorElement ? colorElement._offset / 4 : -1;
		var uv0Element: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE0);
		var uv0Offset: number = uv0Element ? uv0Element._offset / 4 : -1;
		var uv1Element: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TEXTURECOORDINATE1);
		var uv1Offset: number = uv1Element ? uv1Element._offset / 4 : -1;
		var tangentElement: VertexElement = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_TANGENT0);
		var sTangentOffset: number = tangentElement ? tangentElement._offset / 4 : -1;
		var bakeVertexFloatCount: number = 18;
		var oriVertexFloatCount: number = vertexDeclaration.vertexStride / 4;
		var oriVertexes: Float32Array = vertexBuffer.getFloat32Data();

		var worldMat: Matrix4x4;
		if (batchOwnerTransform) {
			var rootMat: Matrix4x4 = batchOwnerTransform.worldMatrix;
			rootMat.invert(SubMeshStaticBatch._tempMatrix4x40);
			worldMat = SubMeshStaticBatch._tempMatrix4x41;
			Matrix4x4.multiply(SubMeshStaticBatch._tempMatrix4x40, transform.worldMatrix, worldMat);
		} else {
			worldMat = transform.worldMatrix;
		}
		var normalMat: Matrix4x4 = SubMeshStaticBatch._tempMatrix4x42;
		worldMat.invert(normalMat);
		normalMat.transpose();

		var rotation: Quaternion = SubMeshStaticBatch._tempQuaternion0;
		worldMat.decomposeTransRotScale(SubMeshStaticBatch._tempVector30, rotation, SubMeshStaticBatch._tempVector31);//可不计算position和scale	
		var lightmapScaleOffset: Vector4 = render.lightmapScaleOffset;

		var vertexCount: number = mesh.vertexCount;

		for (var i: number = 0; i < vertexCount; i++) {
			var oriOffset: number = i * oriVertexFloatCount;
			var bakeOffset: number = (i + batchOffset) * bakeVertexFloatCount;
			Utils3D.transformVector3ArrayToVector3ArrayCoordinate(oriVertexes, oriOffset + positionOffset, worldMat, batchVertices, bakeOffset + 0);
			if (normalOffset !== -1)
				Utils3D.transformVector3ArrayToVector3ArrayNormal(oriVertexes, oriOffset + normalOffset, normalMat, batchVertices, bakeOffset + 3);

			var j: number, m: number;
			var bakOff: number = bakeOffset + 6;
			if (colorOffset !== -1) {
				var oriOff: number = oriOffset + colorOffset;
				for (j = 0, m = 4; j < m; j++)
					batchVertices[bakOff + j] = oriVertexes[oriOff + j];
			} else {
				for (j = 0, m = 4; j < m; j++)
					batchVertices[bakOff + j] = 1.0;
			}

			if (uv0Offset !== -1) {
				var absUv0Offset: number = oriOffset + uv0Offset;
				batchVertices[bakeOffset + 10] = oriVertexes[absUv0Offset];
				batchVertices[bakeOffset + 11] = oriVertexes[absUv0Offset + 1];
			}

			if (lightmapScaleOffset) {
				if (uv1Offset !== -1)
					Utils3D.transformLightingMapTexcoordArray(oriVertexes, oriOffset + uv1Offset, lightmapScaleOffset, batchVertices, bakeOffset + 12);
				else
					Utils3D.transformLightingMapTexcoordArray(oriVertexes, oriOffset + uv0Offset, lightmapScaleOffset, batchVertices, bakeOffset + 12);
			}

			if (sTangentOffset !== -1) {
				var absSTanegntOffset: number = oriOffset + sTangentOffset;
				Utils3D.transformVector3ArrayToVector3ArrayNormal(oriVertexes, absSTanegntOffset, normalMat, batchVertices, bakeOffset + 14);
				batchVertices[bakeOffset + 17] = oriVertexes[absSTanegntOffset + 3];
			}
		}
		return vertexCount;
	}

	/**
	 * @internal
	 */
	addTest(sprite: RenderableSprite3D): boolean {
		var vertexCount: number;
		var subMeshVertexCount: number = ((<Mesh>((<MeshSprite3D>sprite)).meshFilter.sharedMesh)).vertexCount;
		vertexCount = this._currentBatchVertexCount + subMeshVertexCount;
		if (vertexCount > SubMeshStaticBatch.maxBatchVertexCount)
			return false;
		return true;
	}

	/**
	 * @internal
	 */
	add(sprite: RenderableSprite3D): void {
		var mesh: Mesh = (<Mesh>((<MeshSprite3D>sprite)).meshFilter.sharedMesh);
		var subMeshVertexCount: number = mesh.vertexCount;
		this._batchElements.push(sprite);

		var render: BaseRender = sprite._render;
		render._isPartOfStaticBatch = true;
		render._staticBatch = this;//TODO:mayebe shhould  delete
		var renderElements: RenderElement[] = render._renderElements;
		for (var i: number = 0, n: number = renderElements.length; i < n; i++)
			renderElements[i].staticBatch = this;

		this._currentBatchIndexCount += mesh._indexBuffer.indexCount;
		this._currentBatchVertexCount += subMeshVertexCount;

	}

	/**
	 * @internal
	 */
	remove(sprite: RenderableSprite3D): void {
		var mesh: Mesh = (<MeshSprite3D>sprite).meshFilter.sharedMesh;
		var index: number = this._batchElements.indexOf(sprite);
		if (index !== -1) {
			this._batchElements.splice(index, 1);

			var renderElements: RenderElement[] = sprite._render._renderElements;
			for (var i: number = 0, n: number = renderElements.length; i < n; i++)
				renderElements[i].staticBatch = null;

			this._currentBatchIndexCount = this._currentBatchIndexCount - mesh._indexBuffer.indexCount;
			this._currentBatchVertexCount = this._currentBatchVertexCount - mesh.vertexCount;
			sprite._render._isPartOfStaticBatch = false;
		}
	}

	/**
	 * @internal
	 */
	finishInit(): void {//TODO:看下优化
		if (this._vertexBuffer) {
			this._vertexBuffer.destroy();
			this._indexBuffer.destroy();
			Resource._addGPUMemory(-(this._vertexBuffer._byteLength + this._indexBuffer._byteLength));
		}
		var gl: WebGLRenderingContext = LayaGL.instance;
		var batchVertexCount: number = 0;
		var batchIndexCount: number = 0;

		var rootOwner: Sprite3D = this.batchOwner;
		var floatStride: number = this._vertexDeclaration.vertexStride / 4;
		var vertexDatas: Float32Array = new Float32Array(floatStride * this._currentBatchVertexCount);
		var indexDatas: Uint16Array = new Uint16Array(this._currentBatchIndexCount);
		this._vertexBuffer = new VertexBuffer3D(this._vertexDeclaration.vertexStride * this._currentBatchVertexCount, gl.STATIC_DRAW);
		this._vertexBuffer.vertexDeclaration = this._vertexDeclaration;
		this._indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, this._currentBatchIndexCount, gl.STATIC_DRAW);

		for (var i: number = 0, n: number = this._batchElements.length; i < n; i++) {
			var sprite: MeshSprite3D = (<MeshSprite3D>this._batchElements[i]);
			var mesh: Mesh = (<Mesh>sprite.meshFilter.sharedMesh);
			var meshVerCount: number = this._getStaticBatchBakedVertexs(vertexDatas, batchVertexCount, rootOwner ? rootOwner._transform : null, sprite._transform, ((<MeshRenderer>sprite._render)), mesh);
			var indices: Uint16Array = mesh._indexBuffer.getData();
			var indexOffset: number = batchVertexCount;
			var indexEnd: number = batchIndexCount + indices.length;//TODO:indexStartCount和Index
			var elements: RenderElement[] = sprite._render._renderElements;
			for (var j: number = 0, m: number = mesh.subMeshCount; j < m; j++) {
				var subMesh: SubMesh = mesh._subMeshes[j];
				var start: number = batchIndexCount + subMesh._indexStart;
				var element: SubMeshRenderElement = (<SubMeshRenderElement>elements[j]);
				element.staticBatchIndexStart = start;
				element.staticBatchIndexEnd = start + subMesh._indexCount;
			}

			indexDatas.set(indices, batchIndexCount);//TODO:换成函数和动态合并一样
			var k: number;
			var isInvert: boolean = rootOwner ? (sprite._transform._isFrontFaceInvert !== rootOwner.transform._isFrontFaceInvert) : sprite._transform._isFrontFaceInvert;
			if (isInvert) {
				for (k = batchIndexCount; k < indexEnd; k += 3) {
					indexDatas[k] = indexOffset + indexDatas[k];
					var index1: number = indexDatas[k + 1];
					var index2: number = indexDatas[k + 2];
					indexDatas[k + 1] = indexOffset + index2;
					indexDatas[k + 2] = indexOffset + index1;
				}
			} else {
				for (k = batchIndexCount; k < indexEnd; k += 3) {
					indexDatas[k] = indexOffset + indexDatas[k];
					indexDatas[k + 1] = indexOffset + indexDatas[k + 1];
					indexDatas[k + 2] = indexOffset + indexDatas[k + 2];
				}
			}
			batchIndexCount += indices.length;
			batchVertexCount += meshVerCount;
		}
		this._vertexBuffer.setData(vertexDatas.buffer);
		this._indexBuffer.setData(indexDatas);
		var memorySize: number = this._vertexBuffer._byteLength + this._indexBuffer._byteLength;
		Resource._addGPUMemory(memorySize);

		this._bufferState.bind();
		this._bufferState.applyVertexBuffer(this._vertexBuffer);
		this._bufferState.applyIndexBuffer(this._indexBuffer);
		this._bufferState.unBind();
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_render(state: RenderContext3D): void {
		this._bufferState.bind();
		var gl: WebGLRenderingContext = LayaGL.instance;
		var element: RenderElement = state.renderElement;
		var staticBatchElementList: SingletonList<SubMeshRenderElement> = (<SubMeshRenderElement>element).staticBatchElementList;
		var batchElementList: Array<SubMeshRenderElement> = staticBatchElementList.elements;
		/*合并drawcall版本:合并几率不大*/
		var from: number = 0;
		var end: number = 0;
		var count: number = staticBatchElementList.length;
		for (var i: number = 1; i < count; i++) {
			var lastElement: SubMeshRenderElement = batchElementList[i - 1];
			if (lastElement.staticBatchIndexEnd === batchElementList[i].staticBatchIndexStart) {
				end++;
				continue;
			} else {
				var start: number = batchElementList[from].staticBatchIndexStart;
				var indexCount: number = batchElementList[end].staticBatchIndexEnd - start;
				gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, start * 2);
				from = ++end;
				Stat.trianglesFaces += indexCount / 3;
			}
		}
		start = batchElementList[from].staticBatchIndexStart;
		indexCount = batchElementList[end].staticBatchIndexEnd - start;
		gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, start * 2);
		Stat.renderBatches++;
		Stat.savedRenderBatches += count - 1;
		Stat.trianglesFaces += indexCount / 3;
		/*暴力循环版本:drawcall调用次数有浪费
		   //for (var i:int = 0, n:int = batchElementList.length; i < n; i++) {
		   //var element:SubMeshRenderElement = batchElementList[i];
		   //var start:int = element.staticBatchIndexStart;
		   //var indexCount:int = element.staticBatchIndexEnd - start;
		   //LayaGL.instance.drawElements(WebGLContext.TRIANGLES, indexCount, WebGLContext.UNSIGNED_SHORT, start * 2);
		   //Stat.drawCall++;
		   //Stat.trianglesFaces += indexCount / 3;
		   //}
		 */
	}

	/**
	 * @internal
	 */
	dispose(): void {
		var memorySize: number = this._vertexBuffer._byteLength + this._indexBuffer._byteLength;
		Resource._addGPUMemory(-memorySize);
		this._batchElements = null;
		this.batchOwner = null;
		this._vertexDeclaration = null;
		this._bufferState.destroy();
		this._vertexBuffer.destroy();
		this._indexBuffer.destroy();
		this._vertexBuffer = null;
		this._indexBuffer = null;
		this._bufferState = null;
	}

}


