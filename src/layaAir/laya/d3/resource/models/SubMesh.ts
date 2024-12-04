import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Mesh } from "./Mesh";
import { RenderCapable } from "../../../RenderEngine/RenderEnum/RenderCapable";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { LayaGL } from "../../../layagl/LayaGL";
import { NotReadableError } from "../../../utils/Error";


/**
 * @en SubMesh class used to create submesh data template.
 * @zh SubMesh 类用于创建子网格数据模板。
 */
export class SubMesh extends GeometryElement {

	/**@internal */
	private static _type: number = GeometryElement._typeCounter++;

	/** @internal */
	_mesh: Mesh;

	/** @internal */
	_boneIndicesList: Uint16Array[];
	/** @internal */
	_subIndexBufferStart: number[];
	/** @internal */
	_subIndexBufferCount: number[];

	/** @internal */
	_indexInMesh: number;
	/** @internal */
	_indexStart: number;
	/** @internal */
	_indexCount: number;
	/** @internal */
	_indices: Uint16Array | Uint32Array;
	/**@internal [只读]*/
	_vertexBuffer: VertexBuffer3D;
	/**@internal [只读]*/
	_indexBuffer: IndexBuffer3D;

	/**
	 * @en The number of indices.
	 * @zh 索引的数量。
	 */
	get indexCount(): number {
		return this._indexCount;
	}

	/**
	 * @en Creates an instance of SubMesh.
	 * @param mesh  The mesh data template.
	 * @zh 创建 SubMesh 实例。
	 * @param mesh  网格数据模板。
	 */
	constructor(mesh: Mesh) {
		super(MeshTopology.Triangles, DrawType.DrawElement);
		this.indexFormat = mesh.indexFormat;
		if (mesh.indexFormat === IndexFormat.UInt32 && !LayaGL.renderEngine.getCapable(RenderCapable.Element_Index_Uint32)) {
			console.warn("SubMesh:this device do not support IndexFormat.UInt32.");
			return;
		}
		this._mesh = mesh;
		this._boneIndicesList = [];
		this._subIndexBufferStart = [];
		this._subIndexBufferCount = [];
		this.bufferState = mesh._bufferState;
	}

	/**
	 * @internal
	 */
	_setIndexRange(indexStart: number, indexCount: number, indexFormat: IndexFormat = IndexFormat.UInt16): void {
		this._indexStart = indexStart;
		this._indexCount = indexCount;
		if (this._indexBuffer.canRead) {
			if (indexFormat == IndexFormat.UInt16) {
				this._indices = new Uint16Array(this._indexBuffer.getData().buffer, indexStart * 2, indexCount);
			}
			else {
				this._indices = new Uint32Array(this._indexBuffer.getData().buffer, indexStart * 4, indexCount);
			}
		}
	}

	/**
	 * @internal
	 * @override
	 */
	_getType(): number {
		return SubMesh._type;
	}


	/**
	 * @internal
	 * @override
	 */
	_prepareRender(state: RenderContext3D): boolean {
		this._mesh._uploadVerticesData();
		return true;
	}

	/**
	 * @internal
	 * @override
	 */
	_updateRenderParams(state: RenderContext3D): void {
		var mesh: Mesh = this._mesh;
		var byteCount: number;
		switch (mesh._indexFormat) {
			case IndexFormat.UInt32:
				byteCount = 4;
				break;
			case IndexFormat.UInt16:
				byteCount = 2;
				break;
			case IndexFormat.UInt8:
				byteCount = 1;
				break;
		}
		this.clearRenderParams();

		if (this._boneIndicesList && this._boneIndicesList.length > 1) {
			for (var i: number = 0, n: number = this._boneIndicesList.length; i < n; i++) {
				this.setDrawElemenParams(this._subIndexBufferCount[i], this._subIndexBufferStart[i] * byteCount);
			}
		} else {
			this.setDrawElemenParams(this._indexCount, this._indexStart * byteCount);
		}
	}


	/**
	 * @en Copies and gets a copy of the submesh index data.
	 * @returns A copy of the indices.
	 * @zh 拷贝并获取子网格索引数据的副本。
	 * @returns 索引的副本。
	 */
	getIndices(): Uint16Array | Uint32Array {
		if (this._mesh._isReadable)
			return this._indices.slice();
		else
			throw new NotReadableError();
	}

	/**
	 * @en Sets the indices for the submesh.
	 * @param indices The indices to set.
	 * @zh 设置子网格的索引。
	 * @param indices 要设置的索引。
	 */
	setIndices(indices: Uint16Array): void {
		this._indexBuffer.setData(indices, this._indexStart, 0, this._indexCount);
	}

	/**
	 * {@inheritDoc GeometryElement.destroy}
	 * @override
	 * @en Destroys the submesh and releases resources.
	 * @zh 销毁子网格并释放资源。
	 */
	destroy(): void {
		if (this._destroyed)
			return;
		super.destroy();
		this._indexBuffer = null;
		this._vertexBuffer = null;
		this._mesh = null;
		this._boneIndicesList = null;
		this._subIndexBufferStart = null;
		this._subIndexBufferCount = null;
	}
}

