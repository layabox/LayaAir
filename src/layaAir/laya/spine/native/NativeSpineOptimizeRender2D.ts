import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { ISpineRenderDataHandle } from "../../RenderDriver/RenderModuleData/Design/2D/IRender2DDataHandle";
import { NativeSpineOptimizeRenderBase } from "./NativeSpineOptimizeRenderBase";

/**
 * @en Native Spine Optimize Render 2D wrapper class.
 * @zh Native Spine 优化渲染 2D 封装类。
 */
export class NativeSpineOptimizeRender2D extends NativeSpineOptimizeRenderBase {
    private _handle: ISpineRenderDataHandle = null;

    constructor(owner: Spine2DRenderNode, nativeRender: any) {
        super(owner, nativeRender);
        this._handle = owner._getRenderHandle() as ISpineRenderDataHandle;
    }

    protected _onInit(): void {
        // Set skeleton to handle (native layer should provide a method to get skeleton reference)
        // if (this._handle && this._handle.setSkeleton && this._nativeRender.getSkeleton) {
        //     const skeletonRef = this._nativeRender.getSkeleton();
        //     if (skeletonRef && this._handle.setSkeleton) {
        //         this._handle.setSkeleton(skeletonRef);
        //     }
        // }
    }
}
