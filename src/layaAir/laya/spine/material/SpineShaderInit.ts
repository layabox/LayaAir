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
import { SpineMeshUtils } from "../mesh/SpineMeshUtils";
/**
 * @en SpineShaderInit class handles the initialization and management of Spine shader-related components.
 * @zh SpineShaderInit 类用于处理 Spine 着色器相关组件的初始化和管理。
 */
export class SpineShaderInit {

    static SpineFastVertexDeclaration: VertexDeclaration;

    /**
     * @en Vertex declaration for normal Spine rendering.
     * @zh 用于普通 Spine 渲染的顶点声明。
     */
    static SpineNormalVertexDeclaration: VertexDeclaration;

    // static SpineRBVertexDeclaration: VertexDeclaration;


    /**
     * @en Vertex declaration for instance normal matrix.
     * @zh 实例法线矩阵的顶点声明。
     */
    static instanceNMatrixDeclaration:VertexDeclaration;
    
    /**
     * @en Vertex declaration for instance simple animator.
     * @zh 实例简单动画器的顶点声明。
     */
    static instanceSimpleAnimatorDeclaration:VertexDeclaration;

    /**
     * @en Set the blend mode for Spine material.
     * @param value The blend mode value.
     * @param mat The material to set the blend mode for.
     * @zh 设置 Spine 材质的混合模式。
     * @param value 混合模式值。
     * @param mat 要设置混合模式的材质。
     */
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

    /**
     * @en Initialize the Spine material with default settings.
     * @param mat The material to initialize.
     * @zh 使用默认设置初始化 Spine 材质。
     * @param mat 要初始化的材质。
     */
    static initSpineMaterial(mat: Material) {
        mat.alphaTest = false;
        mat.depthWrite = false;
        mat.cull = RenderState.CULL_NONE;
        mat.blend = RenderState.BLEND_ENABLE_ALL;
        mat.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
        mat.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        mat.depthTest = RenderState.DEPTHTEST_OFF;
    }

    /**
     * @en Property ID for bone matrix.
     * @zh 骨骼矩阵的属性 ID。
     */
    static BONEMAT: number;

    // static NMatrix: number;

    // static Color: number;

    // static Size: number;

    /**
     * @internal
     * @en Simple animator texture.
     * @zh 简单动画器纹理。
     */
    static SIMPLE_SIMPLEANIMATORTEXTURE: number;
    /**
     * @internal
     * @en Simple animator parameters.
     * @zh 简单动画器参数。
     */
    static SIMPLE_SIMPLEANIMATORPARAMS: number;
    /**
     * @internal
     * @en Simple animator texture size.
     * @zh 简单动画器纹理尺寸。
     */
    static SIMPLE_SIMPLEANIMATORTEXTURESIZE: number;

    /**
     * @en Property ID for Spine texture.
     * @zh Spine 纹理的属性 ID。
     */
    static SpineTexture: number;

    /**
     * @en Shader define for fast Spine rendering.
     * @zh 快速 Spine 渲染的着色器定义。
     */
    static SPINE_FAST: ShaderDefine;

    /**
     * @en Shader define for Spine rendering with runtime blending.
     * @zh 运行时混合 Spine 渲染的着色器定义。
     */
    static SPINE_RB: ShaderDefine;

    static SPINE_UV: ShaderDefine;

    static SPINE_COLOR: ShaderDefine;

    static SPINE_SIMPLE:ShaderDefine;

    /**
     * @en Shader define for GPU instance rendering.
     * @zh GPU 实例渲染的着色器定义。
     */
    static SPINE_GPU_INSTANCE:ShaderDefine;

    /**
     * @en TextureSV Mesh Descript.
     * @zh 纹理 Spine 顶点属性描述。
     */
    public static readonly textureSpineAttribute: { [name: string]: [number, ShaderDataType] } = {
        'a_uv': [0, ShaderDataType.Vector2],
        'a_color': [1, ShaderDataType.Vector4],
        'a_position': [2, ShaderDataType.Vector2],
        "a_weight": [3, ShaderDataType.Float],
        "a_BoneId": [4, ShaderDataType.Float],

        'a_PosWeightBoneID_2': [5, ShaderDataType.Vector4],
        'a_PosWeightBoneID_3': [6, ShaderDataType.Vector4],
        'a_PosWeightBoneID_4': [7, ShaderDataType.Vector4],

        'a_NMatrix_0': [8, ShaderDataType.Vector3],
        'a_NMatrix_1': [9, ShaderDataType.Vector3],
        'a_SimpleTextureParams': [10, ShaderDataType.Vector4],
        //todo
        // "a_color2":[11,ShaderDataType.Vector4],
    }


    /**
     * @en Initialize Spine shader-related components.
     * @zh 初始化 Spine 着色器相关组件。
     */
    static init() {
        Shader3D.addInclude("SpineVertex.glsl", spineVertex);
        Shader3D.addInclude("SpineFragment.glsl", spineFragment);
        SpineShaderInit.BONEMAT = Shader3D.propertyNameToID("u_sBone");
        // SpineShaderInit.NMatrix = Shader3D.propertyNameToID("u_NMatrix");
        // SpineShaderInit.Color = Shader3D.propertyNameToID("u_color");
        // SpineShaderInit.Size = Shader3D.propertyNameToID("u_size");
        SpineShaderInit.SpineTexture = Shader3D.propertyNameToID("u_spineTexture");
        SpineShaderInit.SPINE_FAST = Shader3D.getDefineByName("SPINE_FAST");
        SpineShaderInit.SPINE_RB = Shader3D.getDefineByName("SPINE_RB");
        SpineShaderInit.SPINE_UV = Shader3D.getDefineByName("COLOR");
        SpineShaderInit.SPINE_COLOR = Shader3D.getDefineByName("UV");
        
        SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS = Shader3D.propertyNameToID("u_SimpleAnimatorParams");
        SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE = Shader3D.propertyNameToID("u_SimpleAnimatorTexture");
        SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE = Shader3D.propertyNameToID("u_SimpleAnimatorTextureSize");
        
        SpineShaderInit.SPINE_SIMPLE = Shader3D.getDefineByName("SPINE_SIMPLE");
        SpineShaderInit.SPINE_GPU_INSTANCE = Shader3D.getDefineByName("GPU_INSTANCE");
        

        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Spine2D");
        commandUniform.addShaderUniform(SpineShaderInit.BONEMAT, "u_sBone", ShaderDataType.Buffer);
        // commandUniform.addShaderUniform(SpineShaderInit.NMatrix, "u_NMatrix", ShaderDataType.Buffer);
        // commandUniform.addShaderUniform(SpineShaderInit.Color, "u_color", ShaderDataType.Color);
        // commandUniform.addShaderUniform(SpineShaderInit.Size, "u_size", ShaderDataType.Vector2);
        
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, "u_SimpleAnimatorParams", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, "u_SimpleAnimatorTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, "u_SimpleAnimatorTextureSize", ShaderDataType.Float);

        // commandUniform.addShaderUniform(SpineShaderInit.SpineTexture, "u_spineTexture", ShaderDataType.Texture2D);

        let shader = Shader3D.add("SpineStandard", true, false);
        shader.shaderType = ShaderFeatureType.D2;
        let uniformMap = {
            "u_spineTexture": ShaderDataType.Texture2D
        }
        let subShader = new SubShader(SpineShaderInit.textureSpineAttribute , uniformMap);
        shader.addSubShader(subShader);
        let shadingPass = subShader.addShaderPass(spineStandardVS, spineStandardFS);


        // SpineShaderInit.SpineFastVertexDeclaration = new VertexDeclaration(88, [
        //     new VertexElement(0, VertexElementFormat.Vector2, 0),
        //     new VertexElement(8, VertexElementFormat.Vector4, 1),
        //     new VertexElement(24, VertexElementFormat.Vector2, 2),
        //     new VertexElement(32, VertexElementFormat.Single, 3),
        //     new VertexElement(36, VertexElementFormat.Single, 4),
        //     new VertexElement(40, VertexElementFormat.Vector4, 5),
        //     new VertexElement(56, VertexElementFormat.Vector4, 6),
        //     new VertexElement(72, VertexElementFormat.Vector4, 7)
        // ]);

        // SpineShaderInit.SpineRBVertexDeclaration = new VertexDeclaration(36, [
        //     new VertexElement(0, VertexElementFormat.Vector2, 0),
        //     new VertexElement(8, VertexElementFormat.Vector4, 1),
        //     new VertexElement(24, VertexElementFormat.Vector2, 2),
        //     new VertexElement(32, VertexElementFormat.Single, 4)
        // ])

        SpineShaderInit.SpineNormalVertexDeclaration = SpineMeshUtils.getVertexDeclaration("UV,COLOR,POSITION")
        // SpineShaderInit.SpineNormalVertexDeclaration = new VertexDeclaration(32, [
        //     new VertexElement(0, VertexElementFormat.Vector2, 0),
        //     new VertexElement(8, VertexElementFormat.Vector4, 1),
        //     new VertexElement(24, VertexElementFormat.Vector2, 2)
        // ])


        SpineShaderInit.instanceNMatrixDeclaration = new VertexDeclaration(24 , [
            new VertexElement(0, VertexElementFormat.Vector3, 8),
            new VertexElement(12, VertexElementFormat.Vector3, 9),
        ])

        SpineShaderInit.instanceSimpleAnimatorDeclaration = new VertexDeclaration(16 , [
            new VertexElement(0, VertexElementFormat.Vector4, 10),
        ])
    }
}

Laya.addAfterInitCallback(SpineShaderInit.init);