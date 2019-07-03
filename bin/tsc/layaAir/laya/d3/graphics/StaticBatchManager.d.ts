import { RenderableSprite3D } from "../core/RenderableSprite3D";
import { Sprite3D } from "../core/Sprite3D";
/**
 * <code>StaticBatchManager</code> 类用于静态批处理管理的父类。
 */
export declare class StaticBatchManager {
    /**
     * 静态批处理合并，合并后子节点修改Transform属性无效，根节点staticBatchRoot可为null,如果根节点不为null，根节点可移动。
     * 如果renderableSprite3Ds为null，合并staticBatchRoot以及其所有子节点为静态批处理，staticBatchRoot作为静态根节点。
     * 如果renderableSprite3Ds不为null,合并renderableSprite3Ds为静态批处理，staticBatchRoot作为静态根节点。
     * @param staticBatchRoot 静态批处理根节点。
     * @param renderableSprite3Ds 静态批处理子节点队列。
     */
    static combine(staticBatchRoot: Sprite3D, renderableSprite3Ds?: RenderableSprite3D[]): void;
    /**
     * 创建一个 <code>StaticBatchManager</code> 实例。
     */
    constructor();
}
