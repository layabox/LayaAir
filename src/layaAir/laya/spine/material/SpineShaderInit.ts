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

    static SpineTexture: number;

    static SPINE_FAST: ShaderDefine;

    static SPINE_RB: ShaderDefine;

    /**
    * TextureSV Mesh Descript
    */
    public static readonly textureSpineAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_texcoord': [0, ShaderDataType.Vector2],
        'a_color': [1, ShaderDataType.Vector4],
        'a_pos': [2, ShaderDataType.Vector2],
        "a_weight": [3, ShaderDataType.Float],
        "a_BoneId": [4, ShaderDataType.Float],
        'a_pos2': [5, ShaderDataType.Vector2],
        "a_weight2": [6, ShaderDataType.Float],
        "a_BoneId2": [7, ShaderDataType.Float],
        'a_pos3': [8, ShaderDataType.Vector2],
        "a_weight3": [9, ShaderDataType.Float],
        "a_BoneId3": [10, ShaderDataType.Float],

        'a_pos4': [11, ShaderDataType.Vector2],
        "a_weight4": [12, ShaderDataType.Float],
        "a_BoneId4": [13, ShaderDataType.Float],
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
        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2D");
        commandUniform.addShaderUniform(SpineShaderInit.BONEMAT, "u_sBone", ShaderDataType.Buffer);
        commandUniform.addShaderUniform(SpineShaderInit.NMatrix, "u_NMatrix", ShaderDataType.Buffer);
        commandUniform.addShaderUniform(SpineShaderInit.Color, "u_color", ShaderDataType.Color);
        commandUniform.addShaderUniform(SpineShaderInit.Size, "u_size", ShaderDataType.Vector2);
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
            new VertexElement(40, VertexElementFormat.Vector2, 5),
            new VertexElement(48, VertexElementFormat.Single, 6),
            new VertexElement(52, VertexElementFormat.Single, 7),
            new VertexElement(56, VertexElementFormat.Vector2, 8),
            new VertexElement(64, VertexElementFormat.Single, 9),
            new VertexElement(68, VertexElementFormat.Single, 10),

            new VertexElement(72, VertexElementFormat.Vector2, 11),
            new VertexElement(80, VertexElementFormat.Single, 12),
            new VertexElement(84, VertexElementFormat.Single, 13),

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
            new VertexElement(32, VertexElementFormat.Single, 3)
        ])


    }
}

Laya.addAfterInitCallback(SpineShaderInit.init);