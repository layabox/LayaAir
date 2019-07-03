import { SkinMeshForGraphic } from "./bone/canvasmesh/SkinMeshForGraphic";
import { Graphics } from "../display/Graphics";
export declare class GraphicsAni extends Graphics {
    /**
     * @private
     * 画自定义蒙皮动画
     * @param	skin
     */
    drawSkin(skinA: SkinMeshForGraphic, alpha: number): void;
    private static _caches;
    static create(): GraphicsAni;
    static recycle(graphics: GraphicsAni): void;
}
