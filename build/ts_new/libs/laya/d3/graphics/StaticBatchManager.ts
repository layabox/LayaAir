import { RenderElement } from "../core/render/RenderElement";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { SubMeshStaticBatch } from "./SubMeshStaticBatch";

/**
 * <code>StaticBatchManager</code> 类用于静态批处理管理的父类。
 */
export class StaticBatchManager {
	/** @internal [只读]*/
	static _managers: StaticBatchManager[] = [];

	/**
	 * @internal
	 */
	private static _addToStaticBatchQueue(sprite3D: Sprite3D, renderableSprite3D: RenderableSprite3D[]): void {
		if (sprite3D instanceof RenderableSprite3D)
			renderableSprite3D.push(sprite3D);
		for (var i: number = 0, n: number = sprite3D.numChildren; i < n; i++)
			StaticBatchManager._addToStaticBatchQueue((<Sprite3D>sprite3D._children[i]), renderableSprite3D);
	}

	/**
	 * @internal
	 */
	static _registerManager(manager: StaticBatchManager): void {
		StaticBatchManager._managers.push(manager);
	}

	/**
	 * 静态批处理合并，合并后子节点修改Transform属性无效，根节点staticBatchRoot可为null,如果根节点不为null，根节点可移动。
	 * 如果renderableSprite3Ds为null，合并staticBatchRoot以及其所有子节点为静态批处理，staticBatchRoot作为静态根节点。
	 * 如果renderableSprite3Ds不为null,合并renderableSprite3Ds为静态批处理，staticBatchRoot作为静态根节点。
	 * @param staticBatchRoot 静态批处理根节点。
	 * @param renderableSprite3Ds 静态批处理子节点队列。
	 */
	static combine(staticBatchRoot: Sprite3D, renderableSprite3Ds: RenderableSprite3D[] = null): void {
		if (!renderableSprite3Ds) {
			renderableSprite3Ds = [];
			if (staticBatchRoot)
				StaticBatchManager._addToStaticBatchQueue(staticBatchRoot, renderableSprite3Ds);
		}

		var batchSpritesCount: number = renderableSprite3Ds.length;
		if (batchSpritesCount > 0) {
			for (var i: number = 0; i < batchSpritesCount; i++) {
				var sprite: RenderableSprite3D = renderableSprite3Ds[i];
				if (!sprite.destroyed) {
					if (sprite._render._isPartOfStaticBatch)
						console.warn("StaticBatchManager: Sprite " + sprite.name + " has a part of Static Batch,it will be ignore.");
					else
						sprite._addToInitStaticBatchManager();
				}
			}

			for (var k: number = 0, m: number = StaticBatchManager._managers.length; k < m; k++) {
				var manager: StaticBatchManager = StaticBatchManager._managers[k];
				manager._initStaticBatchs(staticBatchRoot);
			}
		}
	}

	/** @internal */
	protected _batchRenderElementPool: SubMeshRenderElement[];
	/** @internal */
	protected _batchRenderElementPoolIndex: number;
	/** @internal */
	protected _initBatchSprites: RenderableSprite3D[] = [];
	/** @internal */
	protected _staticBatches: {[key:number]:SubMeshStaticBatch}= {};

	/**
	 * 创建一个 <code>StaticBatchManager</code> 实例。
	 */
	constructor() {
		this._batchRenderElementPoolIndex = 0;
		this._batchRenderElementPool = [];
	}

	/**
	 * @internal
	 */
	private _partition(items: RenderableSprite3D[], left: number, right: number): number {
		var pivot: RenderableSprite3D = items[Math.floor((right + left) / 2)];
		while (left <= right) {
			while (this._compare(items[left], pivot) < 0)
				left++;
			while (this._compare(items[right], pivot) > 0)
				right--;
			if (left < right) {
				var temp: any = items[left];
				items[left] = items[right];
				items[right] = temp;
				left++;
				right--;
			} else if (left === right) {
				left++;
				break;
			}
		}
		return left;
	}

	/**
	 * @internal
	 */
	protected _quickSort(items: RenderableSprite3D[], left: number, right: number): void {
		if (items.length > 1) {
			var index: number = this._partition(items, left, right);
			var leftIndex: number = index - 1;
			if (left < leftIndex)
				this._quickSort(items, left, leftIndex);

			if (index < right)
				this._quickSort(items, index, right);
		}
	}

	/**
	 * @internal
	 */
	protected _compare(left: RenderableSprite3D, right: RenderableSprite3D): number {
		throw "StaticBatch:must override this function.";
	}

	/**
	 * @internal
	 */
	protected _initStaticBatchs(rootSprite: Sprite3D): void {
		throw "StaticBatch:must override this function.";
	}

	/**
	 * @internal
	 */
	_getBatchRenderElementFromPool(): RenderElement {
		throw "StaticBatch:must override this function.";
	}

	/**
	 * @internal
	 */
	_addBatchSprite(renderableSprite3D: RenderableSprite3D): void {
		this._initBatchSprites.push(renderableSprite3D);
	}

	/**
	 * @internal
	 */
	_clear(): void {
		this._batchRenderElementPoolIndex = 0;
	}

	/**
	 * @internal
	 */
	_garbageCollection(): void {
		throw "StaticBatchManager: must override it.";
	}

	/**
	 * @internal
	 */
	dispose(): void {
		this._staticBatches = null;
	}

}


