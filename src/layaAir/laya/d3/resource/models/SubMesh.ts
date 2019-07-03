import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { GeometryElement } from "../../core/GeometryElement";
import { RenderContext3D } from "../../core/render/RenderContext3D";
import { SkinnedMeshRenderer } from "../../core/SkinnedMeshRenderer";
import { SkinnedMeshSprite3D } from "../../core/SkinnedMeshSprite3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Mesh } from "./Mesh";


/**
 * <code>SubMesh</code> 类用于创建子网格数据模板。
 */
export class SubMesh extends GeometryElement {
	/** @internal */
	private static _uniqueIDCounter: number = 0;
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
	_skinAnimationDatas: Float32Array[];

	/** @internal */
	_indexInMesh: number;

	/** @internal */
	_vertexStart: number;
	/** @internal */
	_indexStart: number;
	/** @internal */
	_indexCount: number;
	/** @internal */
	_indices: Uint16Array;
	/**@internal [只读]*/
	_vertexBuffer: VertexBuffer3D;
	/**@internal [只读]*/
	_indexBuffer: IndexBuffer3D;

	/** @internal */
	_id: number;

	/**
	 * 创建一个 <code>SubMesh</code> 实例。
	 * @param	mesh  网格数据模板。
	 */
	constructor(mesh: Mesh) {
		super();
		this._id = ++SubMesh._uniqueIDCounter;
		this._mesh = mesh;
		this._boneIndicesList = [];
		this._subIndexBufferStart = [];
		this._subIndexBufferCount = [];
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
	_render(state: RenderContext3D): void {
		this._mesh._bufferState.bind();
		var skinnedDatas: any[] = ((<SkinnedMeshRenderer>state.renderElement.render))._skinnedData;
		if (skinnedDatas) {
			var subSkinnedDatas: Float32Array[] = skinnedDatas[this._indexInMesh];
			var boneIndicesListCount: number = this._boneIndicesList.length;
			for (var i: number = 0; i < boneIndicesListCount; i++) {
				state.shader.uploadCustomUniform(SkinnedMeshSprite3D.BONES, subSkinnedDatas[i]);
				LayaGL.instance.drawElements(WebGL2RenderingContext.TRIANGLES, this._subIndexBufferCount[i], WebGL2RenderingContext.UNSIGNED_SHORT, this._subIndexBufferStart[i] * 2);
			}
		} else {
			LayaGL.instance.drawElements(WebGL2RenderingContext.TRIANGLES, this._indexCount, WebGL2RenderingContext.UNSIGNED_SHORT, this._indexStart * 2);
		}
		Stat.trianglesFaces += this._indexCount / 3;
		Stat.renderBatches++;
	}

	/**
	 * 获取索引数量。
	 */
	getIndicesCount(): number {
		return this._indexCount;
	}

	/**
	 * 获取索引。
	 * @param triangles 索引。 
	 */
	getIndices(): Uint16Array {
		if (this._mesh._isReadable)
			return this._indices;
		else
			throw "SubMesh:can't get indices on subMesh,mesh's isReadable must be true.";
	}

	/**
	 * 设置子网格索引。
	 * @param indices 
	 */
	setIndices(indices: Uint16Array): void {
		this._indexBuffer.setData(indices, this._indexStart, 0, this._indexCount);
	}

	/**
	 * {@inheritDoc GeometryElement.destroy}
	 * @override
	 */
	destroy(): void {
		if (this._destroyed)
			return;
		super.destroy();
		this._indexBuffer.destroy();
		this._indexBuffer = null;
		this._mesh = null;
		this._boneIndicesList = null;
		this._subIndexBufferStart = null;
		this._subIndexBufferCount = null;
		this._skinAnimationDatas = null;
	}
}

