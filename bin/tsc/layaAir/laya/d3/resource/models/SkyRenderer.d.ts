import { SkyMesh } from "././SkyMesh";
import { BaseMaterial } from "../../core/material/BaseMaterial";
import { RenderContext3D } from "../../core/render/RenderContext3D";
/**
 * <code>SkyRenderer</code> 类用于实现天空渲染器。
 */
export declare class SkyRenderer {
    /** @private */
    private _material;
    /** @private */
    private _mesh;
    /**
     * 获取材质。
     * @return 材质。
     */
    /**
    * 设置材质。
    * @param 材质。
    */
    material: BaseMaterial;
    /**
     * 获取网格。
     * @return 网格。
     */
    /**
    * 设置网格。
    * @param 网格。
    */
    mesh: SkyMesh;
    /**
     * 创建一个新的 <code>SkyRenderer</code> 实例。
     */
    constructor();
    /**
     * @private
     * 是否可用。
     */
    _isAvailable(): boolean;
    /**
     * @private
     */
    _render(state: RenderContext3D): void;
    /**
     * @private
     */
    destroy(): void;
}
