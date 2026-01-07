
import { IRenderStruct2D } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { BakedSpineRenderer, StandardSpineRenderer } from "../optimize/SpineRendererTypes";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { Spine2DNormalRenderUpdater } from "./Spine2DNormalRenderUpdater";
import { WebSpineRenderDataHandle } from "../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderDataHandle";
import { SpineOptimizeRender2D } from "./SpineOptimizeRender2D";
import { WebRenderStruct2D } from "../../../../RenderDriver/RenderModuleData/WebModuleData/2D/WebRenderStruct2D";


export class BakedSpine2DRenderer extends BakedSpineRenderer {
    
    /** @internal */
    protected _struct: IRenderStruct2D;

    /**
     * @en Create a new instance of SpineBaseRenderer.
     * @param struct The render struct.
     * @zh 创建 SpineBaseRenderer 的新实例。
     * @param struct 渲染结构。
     */
    constructor(struct: IRenderStruct2D) {
        super(struct.spriteShaderData);
        this._struct = struct;
    }

    change() {
        super.change();

        if (this.updater.currentData && this.updater.currentData.canInstance) {
            this._struct.renderType = BaseRender2DType.spineSimple;
            // this._shaderData.addDefine(SpineShaderInit.SPINE_GPU_INSTANCE);
        }else
            this._struct.renderType = BaseRender2DType.spine;
    }
    
    leave() {
        super.leave();
        this._struct.renderType = BaseRender2DType.spine;
    }
}

export class StandardSpine2DRenderer extends StandardSpineRenderer{
     /** @internal */
    protected _struct: IRenderStruct2D;

    private _updateFrame = -1;
    normalUpdater: Spine2DNormalRenderUpdater;

    /**
     * @en Create a new instance of SpineBaseRenderer.
     * @param struct The render struct.
     * @zh 创建 SpineBaseRenderer 的新实例。
     * @param struct 渲染结构。
     */
    constructor(struct: IRenderStruct2D) {
        super(struct.spriteShaderData);
        this._struct = struct;
    }

    change() {
        super.change();
        this._struct.renderType = BaseRender2DType.spinenormal;
        this._shaderData.addDefine(SpineShaderInit.SPINE_NORMAL_2D);
        this._updateFrame = -1;
    }

    leave() {
        super.leave();
        this._struct.renderType = BaseRender2DType.spine;
        this._shaderData.removeDefine(SpineShaderInit.SPINE_NORMAL_2D);
    }

    /**
     * @en Render the current animation with matrix transformation.
     * Overrides parent to set renderMatrix from struct before calling renderUpdate.
     * @param curTime The current time for rendering.
     * @param offsetX X axis offset.
     * @param offsetY Y axis offset.
     * @zh 使用矩阵变换渲染当前动画。
     * 重写父类方法，在调用 renderUpdate 前从 struct 设置 renderMatrix。
     * @param curTime 渲染的当前时间。
     * @param offsetX X轴偏移。
     * @param offsetY Y轴偏移。
     */
    render(curTime: number, offsetX: number = 0, offsetY: number = 0): void {
        let skinData = this.updater?.currentData;

        let trans = (this._struct as WebRenderStruct2D).trans;
        if (this._updateFrame < trans.modifiedFrame) {
            let renderMatrix = trans.matrix;
            let offset = (this._struct.renderDataHandler as WebSpineRenderDataHandle).offset;
            let mat = this.normalUpdater.matrix
            renderMatrix.copyTo(mat);
            if (offset) {
                mat.tx = mat.tx + mat.a * offset.x + mat.c * offset.y;
                mat.ty = mat.ty + mat.b * offset.x + mat.d * offset.y;
            }
            this._updateFrame = trans.modifiedFrame;
        }

        if (skinData && (skinData.hasRenderCache || this.normalUpdater.autoCacheEnabled)) {
            let cache = skinData.renderCache[this.updater.cacheFrameIndex];
            // console.log(this.updater.cacheFrameIndex, "@@@Frame")
            if (cache) {
                this.normalUpdater.restoreFromCache(cache);
                return;
            }
        }
       
        this.normalUpdater.renderUpdate(curTime, this._skeleton, this.updater, -1, -1, offsetX, offsetY);
    }

    /**
     * @en Called after render to update render elements.
     * @param optimizeRender The BaseOptimizeRender instance.
     * @zh 渲染后调用，更新渲染元素。
     * @param optimizeRender BaseOptimizeRender 实例。
     */
    afterRender(optimizeRender: SpineOptimizeRender2D): void {
        if (this.normalUpdater.needUpdate) {
            optimizeRender._updateRenderElements(this.normalUpdater.subMeshes, this.normalUpdater.materials);
            this.normalUpdater.needUpdate = false;
        }
    }

    destroy(): void {
        this._shaderData.removeDefine(SpineShaderInit.SPINE_NORMAL_2D);
        super.destroy();
    }
}


