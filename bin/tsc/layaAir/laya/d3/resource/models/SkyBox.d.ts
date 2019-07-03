import { RenderContext3D } from "../../core/render/RenderContext3D";
import { SkyMesh } from "./SkyMesh";
/**
 * <code>SkyBox</code> 类用于创建天空盒。
 */
export declare class SkyBox extends SkyMesh {
    static instance: SkyBox;
    /**
     * 创建一个 <code>SkyBox</code> 实例。
     */
    constructor();
    /**
     * @inheritDoc
     */
    _render(state: RenderContext3D): void;
}
