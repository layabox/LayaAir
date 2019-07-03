import { BaseMaterial } from "../../core/material/BaseMaterial";
import { SkyMesh } from "./SkyMesh";
/**
 * <code>SkyRenderer</code> 类用于实现天空渲染器。
 */
export declare class SkyRenderer {
    private static _tempMatrix0;
    private static _tempMatrix1;
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
}
