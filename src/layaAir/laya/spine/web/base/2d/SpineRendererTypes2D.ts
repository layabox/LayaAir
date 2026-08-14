
import { IRenderStruct2D } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { BakedSpineRenderer, StandardSpineRenderer } from "../optimize/SpineRendererTypes";
import { BaseRender2DType } from "../../../../display/SpriteConst";
import { SpineShaderInit } from "../../../shader/SpineShaderInit";
import { Spine2DNormalRenderUpdater } from "./Spine2DNormalRenderUpdater";
import { SpineOptimizeRender2D } from "./SpineOptimizeRender2D";
import { ISpineRenderDataHandle } from "../../../interface/ISpineRenderDataHandle";
import { Matrix } from "../../../../maths/Matrix";
import { Vector2 } from "../../../../maths/Vector2";


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
        let handle = this._struct.renderDataHandler as ISpineRenderDataHandle;
        handle.needUseMatrix = false;
        handle.renderMatrixVersion = -1;
    }

    leave() {
        super.leave();
        this._struct.renderType = BaseRender2DType.spine;
        this._shaderData.removeDefine(SpineShaderInit.SPINE_NORMAL_2D);
        let handle = this._struct.renderDataHandler as ISpineRenderDataHandle;
        handle.needUseMatrix = true;
        handle.renderMatrixVersion = -1;
    }

    /** @internal Synchronize the final render matrix and optionally reproject existing views. */
    updateRenderMatrix(renderMatrix: Matrix, offset: Vector2, applyToViews: boolean): void {
        let matrix = this.normalUpdater.matrix;
        renderMatrix.copyTo(matrix);
        if (offset) {
            matrix.tx += matrix.a * offset.x + matrix.c * offset.y;
            matrix.ty += matrix.b * offset.x + matrix.d * offset.y;
        }
        (this._struct.renderDataHandler as ISpineRenderDataHandle).renderMatrixVersion = this._struct.getRenderMatrixVersion();
        if (applyToViews) {
            this.normalUpdater.applyRenderMatrixToViews();
        }
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

        // Keep the final traversal matrix on the updater. The normal vertex
        // writer fuses this matrix into its existing append loop.
        let handle = this._struct.renderDataHandler as ISpineRenderDataHandle;
        let matrixVersion = this._struct.getRenderMatrixVersion();
        if (matrixVersion < 0 || handle.renderMatrixVersion !== matrixVersion) {
            this.updateRenderMatrix(this._struct.renderMatrix, handle.offset, false);
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


