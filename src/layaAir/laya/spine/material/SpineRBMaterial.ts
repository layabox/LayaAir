import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { Material } from "../../resource/Material";
import { SpineMaterialBase } from "./SpineMaterialBase";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { IOptimizeMaterial } from "./IOptimizeMaterial";
import { Vector4 } from "../../maths/Vector4";


export class SpineRBMaterial extends SpineMaterialBase implements IOptimizeMaterial {
    static BONEMAT: number;
    static Color: number;
    static NMatrix: number;
    static __initDefine__(): void {
        SpineRBMaterial.BONEMAT = Shader3D.propertyNameToID("u_sBone");
        SpineRBMaterial.NMatrix = Shader3D.propertyNameToID("u_NMatrix");
        SpineRBMaterial.Color = Shader3D.propertyNameToID("u_color");
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

    get color() {
        return this._shaderValues.getVector(SpineRBMaterial.Color);
    }

    set color(value: Vector4) {
        this._shaderValues.setVector(SpineRBMaterial.Color, value);
    }


    get nMatrix(): Float32Array {
        return this._shaderValues.getBuffer(SpineRBMaterial.NMatrix);
    }

    set nMatrix(value: Float32Array) {
        this._shaderValues.setBuffer(SpineRBMaterial.NMatrix, value);
    }
}