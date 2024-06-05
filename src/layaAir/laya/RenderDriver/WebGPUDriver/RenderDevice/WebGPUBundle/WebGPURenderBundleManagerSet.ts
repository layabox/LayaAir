import { WebGPURenderElement3D } from "../../3DRenderPass/WebGPURenderElement3D";
import { WebGPURenderBundleManager } from "./WebGPURenderBundleManager";

export class WebGPURenderBundleManagerSet {
    key: string; //主键（由camera和renderTarget确定）
    bundleManager: WebGPURenderBundleManager = new WebGPURenderBundleManager(); //绘图指令缓存管理器
    elementsToBundleStatic: WebGPURenderElement3D[] = []; //需要创建绘图指令缓存的渲染节点（静态节点）
    elementsToBundleDynamic: WebGPURenderElement3D[] = []; //需要创建绘图指令缓存的渲染节点（动态节点）

    /**
     * 清除渲染指令缓存
     */
    clearBundle() {
        this.bundleManager.clearBundle();
        this.elementsToBundleStatic.length = 0;
        this.elementsToBundleDynamic.length = 0;
    }
}