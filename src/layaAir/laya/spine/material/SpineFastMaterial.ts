import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Vector4 } from "../../maths/Vector4";
import { Material } from "../../resource/Material";
import { IOptimizeMaterial } from "./IOptimizeMaterial";
import { SpineMaterialBase } from "./SpineMaterialBase";


export class SpineFastMaterial extends SpineMaterialBase implements IOptimizeMaterial {
    static BONEMAT: number;

    static NMatrix: number;

    static Color: number;

    static __initDefine__(): void {
        SpineFastMaterial.BONEMAT = Shader3D.propertyNameToID("u_sBone");

        SpineFastMaterial.NMatrix = Shader3D.propertyNameToID("u_NMatrix");

        SpineFastMaterial.Color = Shader3D.propertyNameToID("u_color");

        // SpineFastMaterial.boneBlock=Shader3D.propertyNameToID("boneBlock");

        // SpineFastMaterial.Test=Shader3D.propertyNameToID("u_test");

        // const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2D");
        // //commandUniform.addShaderUniform(SpineFastMaterial.BONEMAT, "u_sBone", ShaderDataType.Buffer);
        // commandUniform.addShaderUniform(SpineFastMaterial.BONEMAT, "u_sBone[200]", ShaderDataType.Buffer, "boneBlock");
        // commandUniform.addShaderUniform(SpineFastMaterial.BONEMAT, "u_test", ShaderDataType.Float, "boneBlock");
    }

    constructor() {
        super();
        this.setShaderName("Sprite2DTextureFastSpine");
        this.renderQueue = Material.RENDERQUEUE_TRANSPARENT;
        this.alphaTest = false;
        this.depthWrite = false;
        this.cull = RenderState.CULL_BACK;
        this.blend = RenderState.BLEND_ENABLE_ALL;
        this.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
        this.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        this.depthTest = RenderState.DEPTHTEST_OFF;
        this.color = new Vector4(1, 1, 1, 1);
    }

    get boneMat(): Float32Array {
        return this._shaderValues.getBuffer(SpineFastMaterial.BONEMAT);
    }

    set boneMat(value: Float32Array) {
        this._shaderValues.setBuffer(SpineFastMaterial.BONEMAT, value);
    }

    get nMatrix(): Float32Array {
        return this._shaderValues.getBuffer(SpineFastMaterial.NMatrix);
    }

    set nMatrix(value: Float32Array) {
        this._shaderValues.setBuffer(SpineFastMaterial.NMatrix, value);
    }

    get color() {
        return this._shaderValues.getVector(SpineFastMaterial.Color);
    }

    set color(value: Vector4) {
        this._shaderValues.setVector(SpineFastMaterial.Color, value);
    }

    /**
     * 克隆。
     * @return	 克隆副本。
     */
    clone(): any {
        var dest: SpineFastMaterial = new SpineFastMaterial();
        this.cloneTo(dest);
        return dest;
    }
}