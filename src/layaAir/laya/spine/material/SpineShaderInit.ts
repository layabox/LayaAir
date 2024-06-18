import { Shader3D, ShaderFeatureType } from "../../RenderEngine/RenderShader/Shader3D";
import spineVertex from "../files/SpineVertex.glsl"
import spineFragment from "../files/SpineFragment.glsl"
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import spineStandardVS from "../files/SpineStandard.vs"
import spineStandardFS from "../files/SpineStandard.fs"
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { Laya } from "../../../Laya";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Material } from "../../resource/Material";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
export class SpineShaderInit {

    static SpineFastVertexDeclaration: VertexDeclaration;

    static SpineNormalVertexDeclaration: VertexDeclaration;

    static SpineRBVertexDeclaration: VertexDeclaration;


    static instanceNMatrixDeclaration:VertexDeclaration;
    
    static instanceSimpleAnimatorDeclaration:VertexDeclaration;

    static SetSpineBlendMode(value: number, mat: Material) {
        switch (value) {
            case 1: //light 
            case 3: //screen
                mat.blendSrc = RenderState.BLENDPARAM_ONE;
                mat.blendDst = RenderState.BLENDPARAM_ONE;
                break;
            case 2://multiply
                mat.blendSrc = RenderState.BLENDPARAM_DST_COLOR;
                mat.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

                break;
            default://nomal
                mat.blendSrc = RenderState.BLENDPARAM_ONE;
                mat.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        }
    }

    static initSpineMaterial(mat: Material) {
        mat.alphaTest = false;
        mat.depthWrite = false;
        mat.cull = RenderState.CULL_NONE;
        mat.blend = RenderState.BLEND_ENABLE_ALL;
        mat.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
        mat.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        mat.depthTest = RenderState.DEPTHTEST_OFF;
    }

    static BONEMAT: number;

    static NMatrix: number;

    static Color: number;

    static Size: number;

    /**@internal  */
    static SIMPLE_SIMPLEANIMATORTEXTURE: number;
    /**@internal */
    static SIMPLE_SIMPLEANIMATORPARAMS: number;
    /**@internal */
    static SIMPLE_SIMPLEANIMATORTEXTURESIZE: number;

    static SpineTexture: number;

    static SPINE_FAST: ShaderDefine;

    static SPINE_RB: ShaderDefine;

    static SPINE_SIMPLE:ShaderDefine;

    static SPINE_GPU_INSTANCE:ShaderDefine;

    /**
    * TextureSV Mesh Descript
    */
    public static readonly textureSpineAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_texcoord': [0, ShaderDataType.Vector2],
        'a_color': [1, ShaderDataType.Vector4],
        'a_pos': [2, ShaderDataType.Vector2],
        "a_weight": [3, ShaderDataType.Float],
        "a_BoneId": [4, ShaderDataType.Float],

        'a_PosWeightBoneID_2': [5, ShaderDataType.Vector4],
        'a_PosWeightBoneID_3': [6, ShaderDataType.Vector4],
        'a_PosWeightBoneID_4': [7, ShaderDataType.Vector4],

        // 'a_NMatrix[0]': [8, ShaderDataType.Vector3],
        // 'a_NMatrix[1]': [9, ShaderDataType.Vector3],
        // 'a_SimpleTextureParams': [10, ShaderDataType.Vector4]
    }


    static init() {
        Shader3D.addInclude("SpineVertex.glsl", spineVertex);
        Shader3D.addInclude("SpineFragment.glsl", spineFragment);
        SpineShaderInit.BONEMAT = Shader3D.propertyNameToID("u_sBone");
        SpineShaderInit.NMatrix = Shader3D.propertyNameToID("u_NMatrix");
        SpineShaderInit.Color = Shader3D.propertyNameToID("u_color");
        SpineShaderInit.Size = Shader3D.propertyNameToID("u_size");
        SpineShaderInit.SpineTexture = Shader3D.propertyNameToID("u_spineTexture");
        SpineShaderInit.SPINE_FAST = Shader3D.getDefineByName("SPINE_FAST");
        SpineShaderInit.SPINE_RB = Shader3D.getDefineByName("SPINE_RB");
        
        SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS = Shader3D.propertyNameToID("u_SimpleAnimatorParams");
        SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE = Shader3D.propertyNameToID("u_SimpleAnimatorTexture");
        SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE = Shader3D.propertyNameToID("u_SimpleAnimatorTextureSize");
        
        SpineShaderInit.SPINE_SIMPLE = Shader3D.getDefineByName("SPINE_SIMPLE");
        SpineShaderInit.SPINE_GPU_INSTANCE = Shader3D.getDefineByName("GPU_INSTANCE");

        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2D");
        commandUniform.addShaderUniform(SpineShaderInit.BONEMAT, "u_sBone", ShaderDataType.Buffer);
        commandUniform.addShaderUniform(SpineShaderInit.NMatrix, "u_NMatrix", ShaderDataType.Buffer);
        commandUniform.addShaderUniform(SpineShaderInit.Color, "u_color", ShaderDataType.Color);
        commandUniform.addShaderUniform(SpineShaderInit.Size, "u_size", ShaderDataType.Vector2);
        
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, "u_SimpleAnimatorParams", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, "u_SimpleAnimatorTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, "u_SimpleAnimatorTextureSize", ShaderDataType.Float);

        //commandUniform.addShaderUniform(SpineShaderInit.SpineTexture, "u_spineTexture", ShaderDataType.Texture2D);
        let shader = Shader3D.add("SpineStandard", true, false);
        shader.shaderType = ShaderFeatureType.D2;
        let uniformMap = {
            "u_spineTexture": ShaderDataType.Texture2D
        }
        let subShader = new SubShader(SpineShaderInit.textureSpineAttribute, uniformMap, {});
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(spineStandardVS, spineStandardFS);


        SpineShaderInit.SpineFastVertexDeclaration = new VertexDeclaration(88, [
            new VertexElement(0, VertexElementFormat.Vector2, 0),
            new VertexElement(8, VertexElementFormat.Vector4, 1),
            new VertexElement(24, VertexElementFormat.Vector2, 2),
            new VertexElement(32, VertexElementFormat.Single, 3),
            new VertexElement(36, VertexElementFormat.Single, 4),
            new VertexElement(40, VertexElementFormat.Vector4, 5),
            new VertexElement(56, VertexElementFormat.Vector4, 6),
            new VertexElement(72, VertexElementFormat.Vector4, 7)
        ]);

        SpineShaderInit.SpineNormalVertexDeclaration = new VertexDeclaration(32, [
            new VertexElement(0, VertexElementFormat.Vector2, 0),
            new VertexElement(8, VertexElementFormat.Vector4, 1),
            new VertexElement(24, VertexElementFormat.Vector2, 2)
        ])

        SpineShaderInit.SpineRBVertexDeclaration = new VertexDeclaration(36, [
            new VertexElement(0, VertexElementFormat.Vector2, 0),
            new VertexElement(8, VertexElementFormat.Vector4, 1),
            new VertexElement(24, VertexElementFormat.Vector2, 2),
            new VertexElement(32, VertexElementFormat.Single, 4)
        ])

        SpineShaderInit.instanceNMatrixDeclaration = new VertexDeclaration(24 , [
            new VertexElement(0, VertexElementFormat.Vector3, 8),
            new VertexElement(12, VertexElementFormat.Vector3, 9),
        ])

        SpineShaderInit.instanceSimpleAnimatorDeclaration = new VertexDeclaration(16 , [
            new VertexElement(0, VertexElementFormat.Vector4, 9),
        ])
    }
}

Laya.addAfterInitCallback(SpineShaderInit.init);