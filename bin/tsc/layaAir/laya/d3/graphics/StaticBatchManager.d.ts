import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
import { RenderElement } from "../core/render/RenderElement";
import { SubMeshRenderElement } from "../core/render/SubMeshRenderElement";
/**
 * <code>StaticBatchManager</code> 类用于静态批处理管理的父类。
 */
export declare class StaticBatchManager {
    /** @private [只读]*/
    static _managers: StaticBatchManager[];
    /**
     * @private
     */
    static _registerManager(manager: StaticBatchManager): void;
    /**
     * @private
     */
    private static _addToStaticBatchQueue;
    /**
     * 静态批处理合并，合并后子节点修改Transform属性无效，根节点staticBatchRoot可为null,如果根节点不为null，根节点可移动。
     * 如果renderableSprite3Ds为null，合并staticBatchRoot以及其所有子节点为静态批处理，staticBatchRoot作为静态根节点。
     * 如果renderableSprite3Ds不为null,合并renderableSprite3Ds为静态批处理，staticBatchRoot作为静态根节点。
     * @param staticBatchRoot 静态批处理根节点。
     * @param renderableSprite3Ds 静态批处理子节点队列。
     */
    static combine(staticBatchRoot: Sprite3D, renderableSprite3Ds?: RenderableSprite3D[]): void;
    /** @private */
    protected _batchRenderElementPool: SubMeshRenderElement[];
    /** @private */
    protected _batchRenderElementPoolIndex: number;
    /** @private */
    protected _initBatchSprites: RenderableSprite3D[];
    /** @private */
    protected _staticBatches: any;
    /**
     * 创建一个 <code>StaticBatchManager</code> 实例。
     */
    constructor();
    /**
     * @private
     */
    private _partition;
    /**
     * @private
     */
    protected _quickSort(items: RenderableSprite3D[], left: number, right: number): void;
    /**
     * @private
     */
    protected _compare(left: RenderableSprite3D, right: RenderableSprite3D): number;
    /**
     * @private
     */
    protected _initStaticBatchs(rootSprite: Sprite3D): void;
    /**
     * @private
     */
    _getBatchRenderElementFromPool(): RenderElement;
    /**
     * @private
     */
    _addBatchSprite(renderableSprite3D: RenderableSprite3D): void;
    /**
     * @private
     */
    _clear(): void;
    /**
     * @private
     */
    _garbageCollection(): void;
    /**
     * @private
     */
    dispose(): void;
}
