import { Spine2DRenderNode } from "../Spine2DRenderNode";
import { ISpineRenderDataHandle } from "../interface/ISpineRenderDataHandle";
import { NativeSpineOptimizeRenderBase } from "./NativeSpineOptimizeRenderBase";
import { TSpineBakeData } from "../SpineConst";
import { SpineShaderInit } from "../shader/SpineShaderInit";

/**
 * @en Native Spine Optimize Render 2D wrapper class.
 * @zh Native Spine 优化渲染 2D 封装类。
 */
export class NativeSpineOptimizeRender2D extends NativeSpineOptimizeRenderBase {
    private _handle: ISpineRenderDataHandle = null;
    declare _owner: Spine2DRenderNode;

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

    initBake(obj: TSpineBakeData | null): void {
        if (!this._nativeRender) {
            return;
        }

        if (!obj) {
            super.initBake(obj);
            return;
        }

        let shaderData = this._owner._spriteShaderData;
        let texture = obj.texture2d;
        shaderData.setTexture(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, texture);
        shaderData.setNumber(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, texture.width);
        super.initBake(obj);
    }
}
