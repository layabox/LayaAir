import { RenderElement } from "././RenderElement";
import { RenderContext3D } from "././RenderContext3D";
import { Shader3D } from "../../shader/Shader3D";
/**
 * @private
 * <code>RenderQuene</code> 类用于实现渲染队列。
 */
export declare class RenderQueue {
    /** @private [只读]*/
    isTransparent: boolean;
    /** @private */
    elements: any[];
    /** @private */
    lastTransparentRenderElement: RenderElement;
    /** @private */
    lastTransparentBatched: boolean;
    /**
     * 创建一个 <code>RenderQuene</code> 实例。
     */
    constructor(isTransparent?: boolean);
    /**
     * @private
     */
    private _compare;
    /**
     * @private
     */
    private _partitionRenderObject;
    /**
     * @private
     */
    _quickSort(left: number, right: number): void;
    /**
     * @private
     */
    _render(context: RenderContext3D, isTarget: boolean, customShader?: Shader3D, replacementTag?: string): void;
    /**
     * @private
     */
    clear(): void;
}
