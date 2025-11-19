
import { IRenderStruct2D } from "../../../../RenderDriver/RenderModuleData/Design/2D/IRenderStruct2D";
import { BakedSpineRenderer } from "../optimize/SpineRendererTypes";
import { BaseRender2DType } from "../../../../display/SpriteConst";


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

        if (this.updater.currentSKin && this.updater.currentSKin.canInstance) {
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




