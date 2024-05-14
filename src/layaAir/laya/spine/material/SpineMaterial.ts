
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { Material } from "../../resource/Material";
import { SpineMaterialBase } from "./SpineMaterialBase";

export class SpineMaterial extends SpineMaterialBase {

    static __initDefine__(): void {
    }

    constructor() {
        super();
        this.setShaderName("SpineNormal");
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
        this.alphaTest = false;
        this.depthWrite = false;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_ENABLE_ALL;
        this.blendSrc = RenderState.BLENDPARAM_ONE;
        this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        this.depthTest = RenderState.DEPTHTEST_OFF;
    }
}