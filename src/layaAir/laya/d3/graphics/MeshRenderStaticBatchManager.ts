import { MeshSprite3D } from "../core/MeshSprite3D";
import { BaseRender } from "../core/render/BaseRender";
import { BatchMark } from "../core/render/BatchMark";
import { RenderElement } from "../core/render/RenderElement";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { Mesh } from "../resource/models/Mesh";
import { StaticBatchManager } from "././StaticBatchManager";
import { SubMeshStaticBatch } from "././SubMeshStaticBatch";
import { VertexDeclaration } from "././VertexDeclaration";
import { VertexMesh } from "./Vertex/VertexMesh";

/**
 * @private
 * <code>MeshSprite3DStaticBatchManager</code> 类用于网格精灵静态批处理管理。
 */
export class MeshRenderStaticBatchManager extends StaticBatchManager {
	/** @private */
	static _verDec: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,UV,UV1,TANGENT");
	/** @private */
	static instance: MeshRenderStaticBatchManager = new MeshRenderStaticBatchManager();

	/**@private */
	_opaqueBatchMarks: any[] = [];
	/**@private [只读]*/
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
		 */
		/*override*/ protected _compare(left: RenderableSprite3D, right: RenderableSprite3D): number {
		//按照合并条件排序，增加初始状态合并几率
		var lRender: BaseRender = left._render, rRender: BaseRender = right._render;
		var leftGeo: Mesh = (<Mesh>((<MeshSprite3D>left)).meshFilter.sharedMesh), rightGeo: Mesh = (<Mesh>((<MeshSprite3D>right)).meshFilter.sharedMesh);
		var lightOffset: number = lRender.lightmapIndex - rRender.lightmapIndex;
		if (lightOffset === 0) {
			var receiveShadowOffset: number = (lRender.receiveShadow ? 1 : 0) - (rRender.receiveShadow ? 1 : 0);
			if (receiveShadowOffset === 0) {
				var materialOffset: number = lRender.sharedMaterial.id - rRender.sharedMaterial.id;//多维子材质以第一个材质排序
				if (materialOffset === 0) {
					var verDec: number = leftGeo._vertexBuffers[0].vertexDeclaration.id - rightGeo._vertexBuffers[0].vertexDeclaration.id;//TODO:以第一个Buffer为主,后期是否修改VB机制
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
		 */
		/*override*/  _getBatchRenderElementFromPool(): RenderElement {
		var renderElement: SubMeshRenderElement = this._batchRenderElementPool[this._batchRenderElementPoolIndex++];
		if (!renderElement) {
			renderElement = new SubMeshRenderElement();
			this._batchRenderElementPool[this._batchRenderElementPoolIndex - 1] = renderElement;
			renderElement.staticBatchElementList = [];
		}
		return renderElement;
	}

	/**
	 * @private
	 */
	private _getStaticBatch(rootOwner: Sprite3D, number: number): SubMeshStaticBatch {
		var key: number = rootOwner ? rootOwner.id : 0;
		var batchOwner: any = this._staticBatches[key];
		(batchOwner) || (batchOwner = this._staticBatches[key] = []);
		return (batchOwner[number]) || (batchOwner[number] = new SubMeshStaticBatch(rootOwner, number, MeshRenderStaticBatchManager._verDec));
	}

		/**
		 * @inheritDoc
		 */
		/*override*/ protected _initStaticBatchs(rootOwner: Sprite3D): void {
		this._quickSort(this._initBatchSprites, 0, this._initBatchSprites.length - 1);
		var lastCanMerage: boolean = false;
		var curStaticBatch: SubMeshStaticBatch;
		var batchNumber: number = 0;
		for (var i: number = 0, n: number = this._initBatchSprites.length; i < n; i++) {
			var sprite: RenderableSprite3D = this._initBatchSprites[i];
			if (lastCanMerage) {
				if (curStaticBatch.addTest(sprite)) {
					curStaticBatch.add(sprite);
				} else {
					lastCanMerage = false;
					batchNumber++;//修改编号，区分批处理
				}
			} else {
				var lastIndex: number = n - 1;
				if (i !== lastIndex) {
					curStaticBatch = this._getStaticBatch(rootOwner, batchNumber);
					curStaticBatch.add(sprite);
					lastCanMerage = true;
				}
			}
		}

		for (var key in this._staticBatches) {
			var batches: any[] = this._staticBatches[key];
			for (i = 0, n = batches.length; i < n; i++)
				batches[i].finishInit();
		}
		this._initBatchSprites.length = 0;
	}

	/**
	 * @private
	 */
	_destroyRenderSprite(sprite: RenderableSprite3D): void {
		var staticBatch: SubMeshStaticBatch = (<SubMeshStaticBatch>sprite._render._staticBatch);
		staticBatch.remove(sprite);

		if (staticBatch._batchElements.length === 0) {
			var owner: Sprite3D = staticBatch.batchOwner;
			var ownerID: number = owner ? owner.id : 0;
			var batches: any[] = this._staticBatches[ownerID];
			batches[staticBatch.number] = null;
			staticBatch.dispose();
			var empty: boolean = true;
			for (var i: number = 0; i < batches.length; i++) {
				if (batches[i])
					empty = false;
			}

			if (empty) {
				delete this._staticBatches[ownerID];
			}
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _clear(): void {
		super._clear();
		this._updateCountMark++;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  _garbageCollection(): void {
		for (var key in this._staticBatches) {
			var batches: any[] = this._staticBatches[key];
			for (var i: number = 0, n: number = batches.length; i < n; i++) {
				var staticBatch: SubMeshStaticBatch = batches[i];
				if (staticBatch._batchElements.length === 0) {
					staticBatch.dispose();
					batches.splice(i, 1);
					i-- , n--;
					if (n === 0)
						delete this._staticBatches[key];
				}
			}
		}
	}

	/**
	 * @private
	 */
	getBatchOpaquaMark(lightMapIndex: number, receiveShadow: boolean, materialID: number, staticBatchID: number): BatchMark {
		var receiveShadowIndex: number = receiveShadow ? 1 : 0;
		var staLightMapMarks: any[] = (this._opaqueBatchMarks[lightMapIndex]) || (this._opaqueBatchMarks[lightMapIndex] = []);
		var staReceiveShadowMarks: any[] = (staLightMapMarks[receiveShadowIndex]) || (staLightMapMarks[receiveShadowIndex] = []);
		var staMaterialMarks: BatchMark[] = (staReceiveShadowMarks[materialID]) || (staReceiveShadowMarks[materialID] = []);
		return (staMaterialMarks[staticBatchID]) || (staMaterialMarks[staticBatchID] = new BatchMark);
	}
}

