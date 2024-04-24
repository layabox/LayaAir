import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { Material } from "laya/resource/Material";
import { SpineMaterialBase } from "./SpineMaterialBase";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

export class SpineRBMaterial extends SpineMaterialBase {
    static BONEMAT: number;
    static __initDefine__(): void {
        SpineRBMaterial.BONEMAT = Shader3D.propertyNameToID("u_sBone");
    }

    constructor() {
        super();
        this.setShaderName("SpineRigidBody");
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
        this.alphaTest = false;
        this.depthWrite = false;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_ENABLE_ALL;
        this.blendSrc = RenderState.BLENDPARAM_ONE;
        this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        this.depthTest = RenderState.DEPTHTEST_OFF;
    }


    get boneMat(): Float32Array {
        return this._shaderValues.getBuffer(SpineRBMaterial.BONEMAT);
    }

    set boneMat(value: Float32Array) {
        this._shaderValues.setBuffer(SpineRBMaterial.BONEMAT, value);
    }
}