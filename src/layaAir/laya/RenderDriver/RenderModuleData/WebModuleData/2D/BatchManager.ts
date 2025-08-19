import { FastSinglelist } from "../../../../utils/SingletonList";
import { IRenderElement2D } from "../../../DriverDesign/2DRenderPass/IRenderElement2D";

/**
 * @ignore
 */
export interface IBatch2DProvider {
    /**合批范围，合批的RenderElement2D直接add进list中 */
    batch(list: FastSinglelist<IRenderElement2D>, start: number, end: number, allowReorder?: boolean): void;
    reset(): void;
    destroy(): void;
}

/**
 * @ignore
 * 合批管理
 */
export class BatchManager {
    /**
     * 
     */
    static readonly registry: Record<number, new () => IBatch2DProvider> = {};

    /**
     * 注册渲染节点之间的合批。根据不同的RenderNode注册合批方式，来优化性能
     * @param renderElementType 
     * @param batch 
     */
    static registerProvider(renderType: number, cls: new () => IBatch2DProvider): void {
        if (BatchManager.registry[renderType])
            throw new Error("Overlapping batch optimization");

        BatchManager.registry[renderType] = cls;
    }

    static createProvider(renderType: number): IBatch2DProvider {
        return new (BatchManager.registry[renderType] || NullBatchProvider)();
    }
}

class NullBatchProvider implements IBatch2DProvider {
    batch(list: FastSinglelist<IRenderElement2D>, start: number, end: number, allowReorder?: boolean): void {
        for (let i = start; i <= end; i++)
            list.add(list.elements[i]);
    }
    reset(): void { }
    destroy(): void { }
}