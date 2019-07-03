import { SkyMesh } from "./SkyMesh";
import { RenderContext3D } from "../../core/render/RenderContext3D";
/**
 * <code>SkyDome</code> 类用于创建天空盒。
 */
export declare class SkyDome extends SkyMesh {
    static instance: SkyDome;
    /**
     * 获取堆数。
     */
    readonly stacks: number;
    /**
     * 获取层数。
     */
    readonly slices: number;
    /**
     * 创建一个 <code>SkyDome</code> 实例。
     * @param stacks 堆数。
     * @param slices 层数。
     */
    constructor(stacks?: number, slices?: number);
    _render(state: RenderContext3D): void;
}
