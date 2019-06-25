import { RenderElement } from "../core/render/RenderElement";
/**
 * @private
 * <code>DynamicBatchManager</code> 类用于管理动态批处理。
 */
export declare class DynamicBatchManager {
    /** @private [只读]*/
    static _managers: DynamicBatchManager[];
    /**
     * @private
     */
    static _registerManager(manager: DynamicBatchManager): void;
    /** @private */
    protected _batchRenderElementPool: RenderElement[];
    /** @private */
    protected _batchRenderElementPoolIndex: number;
    /**
     * 创建一个 <code>DynamicBatchManager</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    _clear(): void;
    /**
     * @private
     */
    _getBatchRenderElementFromPool(): RenderElement;
    /**
     * @private
     */
    dispose(): void;
}
