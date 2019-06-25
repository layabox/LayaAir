import { RenderElement } from "../core/render/RenderElement";

/**
 * @internal
 * <code>DynamicBatchManager</code> 类用于管理动态批处理。
 */
export class DynamicBatchManager {
	/** @internal [只读]*/
	static _managers: DynamicBatchManager[] = [];

	/**
	 * @internal
	 */
	static _registerManager(manager: DynamicBatchManager): void {
		DynamicBatchManager._managers.push(manager);
	}

	/** @internal */
	protected _batchRenderElementPool: RenderElement[];
	/** @internal */
	protected _batchRenderElementPoolIndex: number;

	/**
	 * 创建一个 <code>DynamicBatchManager</code> 实例。
	 */
	constructor() {
		this._batchRenderElementPool = [];
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
	_getBatchRenderElementFromPool(): RenderElement {
		throw "StaticBatch:must override this function.";
	}

	/**
	 * @internal
	 */
	dispose(): void {
	}

}


