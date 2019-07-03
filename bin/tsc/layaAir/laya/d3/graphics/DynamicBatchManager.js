/**
 * @internal
 * <code>DynamicBatchManager</code> 类用于管理动态批处理。
 */
export class DynamicBatchManager {
    /**
     * 创建一个 <code>DynamicBatchManager</code> 实例。
     */
    constructor() {
        this._batchRenderElementPool = [];
    }
    /**
     * @internal
     */
    static _registerManager(manager) {
        DynamicBatchManager._managers.push(manager);
    }
    /**
     * @internal
     */
    _clear() {
        this._batchRenderElementPoolIndex = 0;
    }
    /**
     * @internal
     */
    _getBatchRenderElementFromPool() {
        throw "StaticBatch:must override this function.";
    }
    /**
     * @internal
     */
    dispose() {
    }
}
/** @internal [只读]*/
DynamicBatchManager._managers = [];
