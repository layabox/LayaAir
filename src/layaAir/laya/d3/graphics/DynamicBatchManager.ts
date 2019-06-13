
import { RenderElement } from "../core/render/RenderElement"


/**
 * @private
 * <code>DynamicBatchManager</code> 类用于管理动态批处理。
 */
export class DynamicBatchManager {
	/** @private [只读]*/
	static _managers: DynamicBatchManager[] = [];

	/**
	 * @private
	 */
	static _registerManager(manager: DynamicBatchManager): void {
		DynamicBatchManager._managers.push(manager);
	}

	/** @private */
	protected _batchRenderElementPool: RenderElement[];
	/** @private */
	protected _batchRenderElementPoolIndex: number;

	/**
	 * 创建一个 <code>DynamicBatchManager</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		this._batchRenderElementPool = [];
	}

	/**
	 * @private
	 */
	_clear(): void {
		this._batchRenderElementPoolIndex = 0;
	}

	/**
	 * @private
	 */
	_getBatchRenderElementFromPool(): RenderElement {
		throw "StaticBatch:must override this function.";
	}

	/**
	 * @private
	 */
	dispose(): void {
	}

}


