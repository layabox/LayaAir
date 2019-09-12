import { MeshSprite3D } from "../core/MeshSprite3D";
import { BaseRender } from "../core/render/BaseRender";
import { BatchMark } from "../core/render/BatchMark";
import { RenderElement } from "../core/render/RenderElement";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { Mesh } from "../resource/models/Mesh";
import { StaticBatchManager } from "./StaticBatchManager";
import { SubMeshStaticBatch } from "./SubMeshStaticBatch";
import { VertexDeclaration } from "./VertexDeclaration";
import { VertexMesh } from "./Vertex/VertexMesh";
import { SingletonList } from "../component/SingletonList";

/**
 * @internal
 * <code>MeshSprite3DStaticBatchManager</code> 类用于网格精灵静态批处理管理。
 */
export class MeshRenderStaticBatchManager extends StaticBatchManager {
	/** @internal */
	static _verDec: VertexDeclaration;
	/** @internal */
	static instance: MeshRenderStaticBatchManager = new MeshRenderStaticBatchManager();

	/**
	 * @internal
	 */
	static __init__(): void {
		MeshRenderStaticBatchManager._verDec = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV,UV1,TANGENT");
	}

	/**@internal */
	_opaqueBatchMarks: any[] = [];
	/**@internal [只读]*/
	_updateCountMark: number;

	/**
	 * 创建一个 <code>MeshSprite3DStaticBatchManager</code> 实例。
	 */
	constructor() {
		super();
		this._updateCountMark = 0;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _compare(left: RenderableSprite3D, right: RenderableSprite3D): number {
		//按照合并条件排序，增加初始状态合并几率
		var lRender: BaseRender = left._render, rRender: BaseRender = right._render;
		var leftGeo: Mesh = (<Mesh>((<MeshSprite3D>left)).meshFilter.sharedMesh), rightGeo: Mesh = (<Mesh>((<MeshSprite3D>right)).meshFilter.sharedMesh);
		var lightOffset: number = lRender.lightmapIndex - rRender.lightmapIndex;
		if (lightOffset === 0) {
			var receiveShadowOffset: number = (lRender.receiveShadow ? 1 : 0) - (rRender.receiveShadow ? 1 : 0);
			if (receiveShadowOffset === 0) {
				var materialOffset: number = (lRender.sharedMaterial && rRender.sharedMaterial) ? lRender.sharedMaterial.id - rRender.sharedMaterial.id : 0;//多维子材质以第一个材质排序
				if (materialOffset === 0) {
					var verDec: number = leftGeo._vertexBuffer.vertexDeclaration.id - rightGeo._vertexBuffer.vertexDeclaration.id;
					if (verDec === 0) {
						return rightGeo._indexBuffer.indexCount - leftGeo._indexBuffer.indexCount;//根据三角面排序
					} else {
						return verDec;
					}
				} else {
					return materialOffset;
				}
			} else {
				return receiveShadowOffset;
			}
		} else {
			return lightOffset;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_getBatchRenderElementFromPool(): RenderElement {
		var renderElement: SubMeshRenderElement = this._batchRenderElementPool[this._batchRenderElementPoolIndex++];
		if (!renderElement) {
			renderElement = new SubMeshRenderElement();
			this._batchRenderElementPool[this._batchRenderElementPoolIndex - 1] = renderElement;
			renderElement.staticBatchElementList = new SingletonList<SubMeshRenderElement>();
		}
		return renderElement;
	}

	/**
	 * @internal
	 */
	private _getStaticBatch(staticBatches: Array<SubMeshStaticBatch>, rootOwner: Sprite3D, number: number): SubMeshStaticBatch {
		var subMeshStaticBatch: SubMeshStaticBatch = staticBatches[number];
		if (!subMeshStaticBatch) {
			subMeshStaticBatch = staticBatches[number] = new SubMeshStaticBatch(rootOwner, MeshRenderStaticBatchManager._verDec);
			this._staticBatches[subMeshStaticBatch._batchID] = subMeshStaticBatch;
		}
		return subMeshStaticBatch;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	protected _initStaticBatchs(rootOwner: Sprite3D): void {
		var initBatchSprites: RenderableSprite3D[] = this._initBatchSprites;
		this._quickSort(initBatchSprites, 0, initBatchSprites.length - 1);
		var staticBatches: SubMeshStaticBatch[] = [];
		var lastCanMerage: boolean = false;
		var curStaticBatch: SubMeshStaticBatch;
		var batchNumber: number = 0;
		for (var i: number = 0, n: number = initBatchSprites.length; i < n; i++) {
			var sprite: RenderableSprite3D = initBatchSprites[i];
			if (lastCanMerage) {
				if (curStaticBatch.addTest(sprite)) {
					curStaticBatch.add(sprite);
				} else {
					lastCanMerage = false;
					batchNumber++;//修改编号，区分批处理
				}
			} else {
				var lastIndex: number = n - 1;
				if (i !== lastIndex) {//the last do not need
					curStaticBatch = this._getStaticBatch(staticBatches, rootOwner, batchNumber);
					curStaticBatch.add(sprite);
					lastCanMerage = true;
				}
			}
		}

		for (i = 0, n = staticBatches.length; i < n; i++) {
			var staticBatch: SubMeshStaticBatch = staticBatches[i];
			staticBatch && staticBatch.finishInit();
		}
		this._initBatchSprites.length = 0;
	}

	/**
	 * @internal
	 */
	_removeRenderSprite(sprite: RenderableSprite3D): void {
		var render: BaseRender = sprite._render;
		var staticBatch: SubMeshStaticBatch = <SubMeshStaticBatch>render._staticBatch;
		var batchElements: RenderableSprite3D[] = staticBatch._batchElements;
		var index: number = batchElements.indexOf(sprite);
		if (index !== -1) {
			batchElements.splice(index, 1);
			render._staticBatch = null;
			var renderElements: RenderElement[] = render._renderElements;
			for (var i: number = 0, n: number = renderElements.length; i < n; i++)
				renderElements[i].staticBatch = null;
		}

		if (batchElements.length === 0) {
			delete this._staticBatches[staticBatch._batchID];
			staticBatch.dispose();
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_clear(): void {
		super._clear();
		this._updateCountMark++;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	_garbageCollection(): void {
		for (var key in this._staticBatches) {
			var staticBatch: SubMeshStaticBatch = this._staticBatches[key];
			if (staticBatch._batchElements.length === 0) {
				staticBatch.dispose();
				delete this._staticBatches[key];
			}
		}
	}

	/**
	 * @internal
	 */
	getBatchOpaquaMark(lightMapIndex: number, receiveShadow: boolean, materialID: number, staticBatchID: number): BatchMark {
		var receiveShadowIndex: number = receiveShadow ? 1 : 0;
		var staLightMapMarks: any[] = (this._opaqueBatchMarks[lightMapIndex]) || (this._opaqueBatchMarks[lightMapIndex] = []);
		var staReceiveShadowMarks: any[] = (staLightMapMarks[receiveShadowIndex]) || (staLightMapMarks[receiveShadowIndex] = []);
		var staMaterialMarks: BatchMark[] = (staReceiveShadowMarks[materialID]) || (staReceiveShadowMarks[materialID] = []);
		return (staMaterialMarks[staticBatchID]) || (staMaterialMarks[staticBatchID] = new BatchMark);
	}
}

