import { IBaseRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { NativeSpineOptimizeRenderBase } from "./NativeSpineOptimizeRenderBase";

/**
 * @en Native Spine Optimize Render 3D wrapper class.
 * @zh Native Spine 优化渲染 3D 封装类。
 */
export class NativeSpineOptimizeRender3D extends NativeSpineOptimizeRenderBase {
    constructor(owner: IBaseRenderNode, nativeRender: any) {
        super(owner, nativeRender);
    }
}
