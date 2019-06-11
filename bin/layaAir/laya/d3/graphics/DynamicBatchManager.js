/**
 * @private
 * <code>DynamicBatchManager</code> 类用于管理动态批处理。
 */
export class DynamicBatchManager {
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
    static _registerManager(manager) {
        DynamicBatchManager._managers.push(manager);
    }
    /**
     * @private
     */
    _clear() {
        this._batchRenderElementPoolIndex = 0;
    }
    /**
     * @private
     */
    _getBatchRenderElementFromPool() {
        throw "StaticBatch:must override this function.";
    }
    /**
     * @private
     */
    dispose() {
    }
}
/** @private [只读]*/
DynamicBatchManager._managers = [];
