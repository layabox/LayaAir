import { Shader3D, ShaderFeatureType } from "../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderData, ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";

import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Material } from "../../resource/Material";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { VertexElement } from "../../renders/VertexElement";
import { VertexElementFormat } from "../../renders/VertexElementFormat";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { RenderCapable } from "../../RenderEngine/RenderEnum/RenderCapable";
import spineVertexCommon from "./files/SpineVertexCommon.glsl";
import spineFragment from "./files/SpineFragment.glsl"
import spine2DVertex from "./files/Spine2DVertex.glsl";
import spineStandardVS from "./files/SpineStandard.vs"
import spineStandardFS from "./files/SpineStandard.fs"

/**
 * @en SpineShaderInit class handles the initialization and management of Spine shader-related components.
 * @zh SpineShaderInit 类用于处理 Spine 着色器相关组件的初始化和管理。
 */
export class SpineShaderInit {

    private static _vertexDeclarationMap: any = {};

    /**
     * @en Vertex declaration for normal Spine rendering.
     * @zh 用于普通 Spine 渲染的顶点声明。
     */
    static SpineNormalVertexDeclaration: VertexDeclaration;

    /**
     * @en Vertex declaration for instance normal matrix.
     * @zh 实例法线矩阵的顶点声明。
     */
    static instanceNMatrixDeclaration: VertexDeclaration;

    /**
     * @en Vertex declaration for instance simple animator.
     * @zh 实例简单动画器的顶点声明。
     */
    static instanceSimpleAnimatorDeclaration: VertexDeclaration;

    /**
     * @en Set the blend mode for Spine material.
     * @param value The blend mode value.
     * @param mat The material to set the blend mode for.
     * @param premultipliedAlpha Whether to premultiply the alpha channel.
     * @zh 设置 Spine 材质的混合模式。
     * @param value 混合模式值。
     * @param mat 要设置混合模式的材质。
     * @param premultipliedAlpha 是否预乘alpha通道。
     */
    static SetSpineBlendMode(value: number, mat: Material, premultipliedAlpha = true) {
        switch (value) {
            case 1: //Additive 
                mat.blend = RenderState.BLEND_ENABLE_ALL;
                mat.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
                mat.blendDst = RenderState.BLENDPARAM_ONE;
                break;
            case 3: //Screen
                mat.blend = RenderState.BLEND_ENABLE_SEPERATE;

                mat.blendSrcRGB = RenderState.BLENDPARAM_ONE;
                mat.blendSrcAlpha = RenderState.BLENDPARAM_ONE;
                
                mat.blendDstRGB = RenderState.BLENDPARAM_ONE_MINUS_SRC_COLOR;
                mat.blendDstAlpha = RenderState.BLENDPARAM_ONE;
                break;
            case 2://Multiply
                mat.blend = RenderState.BLEND_ENABLE_ALL;

                mat.blendSrc = RenderState.BLENDPARAM_DST_COLOR;
                mat.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

                break;
            default://nomal
                mat.blend = RenderState.BLEND_ENABLE_ALL;
                mat.blendSrc = premultipliedAlpha ? RenderState.BLENDPARAM_ONE : RenderState.BLENDPARAM_SRC_ALPHA;
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
     * @internal
     * @en Bone matrix 0.
     * @zh Rigidbody骨骼矩阵0。
     */
    static BONEMAT_0: number;
    /**
     * @internal
     * @en Bone matrix 1.
     * @zh Rigidbody骨骼矩阵1。
     */
    static BONEMAT_1: number;

    /**
     * @en Property ID for Spine texture.
     * @zh Spine 纹理的属性 ID。
     */
    static SpineTexture: number;
    static COLOR: number;

    /**
     * @en Property ID for render size (width, height).
     * @zh 渲染尺寸的属性 ID (宽度, 高度)。
     */
    static SPINE_RENDER_SIZE: number;

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

    static SPINE_NORMAL_2D: ShaderDefine;

    static SPINE_UV: ShaderDefine;

    static SPINE_COLOR: ShaderDefine;

    static SPINE_SIMPLE: ShaderDefine;

    static SPINE_TWOCOLORTINT: ShaderDefine;

    static SPINE_COLOR2: ShaderDefine;

    /**
     * @en Shader define for GPU instance rendering.
     * @zh GPU 实例渲染的着色器定义。
     */
    static SPINE_GPU_INSTANCE: ShaderDefine;

    static SPINE_PREMULTIPLYALPHA: ShaderDefine;

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

        // 'a_PosWeightBoneID_1': [2, ShaderDataType.Vector4],//pos.xy weight boneID
        // 'a_PosWeightBoneID_2': [3, ShaderDataType.Vector4],
        // 'a_PosWeightBoneID_3': [4, ShaderDataType.Vector4],
        // 'a_PosWeightBoneID_4': [5, ShaderDataType.Vector4],
        // 'a_PosWeightBoneID_5': [6, ShaderDataType.Vector4],
        // 'a_PosWeightBoneID_6': [7, ShaderDataType.Vector4],

        'a_NMatrix_0': [8, ShaderDataType.Vector3],
        'a_NMatrix_1': [9, ShaderDataType.Vector3],
        'a_SimpleTextureParams': [10, ShaderDataType.Vector4],

        "a_color2": [11, ShaderDataType.Vector4],
    }


    /**
     * @en Initialize Spine shader-related components.
     * @zh 初始化 Spine 着色器相关组件。
     */
    static init() {
        Shader3D.addInclude("SpineFragment.glsl", spineFragment);
        Shader3D.addInclude("Spine2DVertex.glsl", spine2DVertex);
        Shader3D.addInclude("SpineVertexCommon.glsl", spineVertexCommon);
        
        SpineShaderInit.BONEMAT = Shader3D.propertyNameToID("u_sBone");
        SpineShaderInit.BONEMAT_0 = Shader3D.propertyNameToID("u_sBone0");
        SpineShaderInit.BONEMAT_1 = Shader3D.propertyNameToID("u_sBone1");
        SpineShaderInit.SpineTexture = Shader3D.propertyNameToID("u_spineTexture");
        SpineShaderInit.COLOR = Shader3D.propertyNameToID("u_color");
        SpineShaderInit.SPINE_RENDER_SIZE = Shader3D.propertyNameToID("u_spineRenderSize");
        SpineShaderInit.SPINE_FAST = Shader3D.getDefineByName("SPINE_FAST");
        SpineShaderInit.SPINE_RB = Shader3D.getDefineByName("SPINE_RB");
        SpineShaderInit.SPINE_UV = Shader3D.getDefineByName("UV");
        SpineShaderInit.SPINE_COLOR = Shader3D.getDefineByName("COLOR");
        SpineShaderInit.SPINE_NORMAL_2D = Shader3D.getDefineByName("SPINE_NORMAL_2D");
        SpineShaderInit.SPINE_PREMULTIPLYALPHA = Shader3D.getDefineByName("PREMULTIPLYALPHA");

        SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS = Shader3D.propertyNameToID("u_SimpleAnimatorParams");
        SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE = Shader3D.propertyNameToID("u_SimpleAnimatorTexture");
        SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE = Shader3D.propertyNameToID("u_SimpleAnimatorTextureSize");

        SpineShaderInit.SPINE_SIMPLE = Shader3D.getDefineByName("SPINE_SIMPLE");
        SpineShaderInit.SPINE_GPU_INSTANCE = Shader3D.getDefineByName("GPU_INSTANCE");
        SpineShaderInit.SPINE_TWOCOLORTINT = Shader3D.getDefineByName("TWOCOLORTINT");
        SpineShaderInit.SPINE_COLOR2 = Shader3D.getDefineByName("COLOR2");

        const commandUniform = LayaGL.renderDeviceFactory.createGlobalUniformMap("Spine2D");
        commandUniform.addShaderUniformArray(SpineShaderInit.BONEMAT, "u_sBone", ShaderDataType.Vector4, 200);
        commandUniform.addShaderUniform(SpineShaderInit.BONEMAT_0, "u_sBone0", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(SpineShaderInit.BONEMAT_1, "u_sBone1", ShaderDataType.Vector4);
        // commandUniform.addShaderUniform(SpineShaderInit.NMatrix, "u_NMatrix", ShaderDataType.Buffer);
        commandUniform.addShaderUniform(SpineShaderInit.COLOR, "u_color", ShaderDataType.Vector4);
        // commandUniform.addShaderUniform(SpineShaderInit.Size, "u_size", ShaderDataType.Vector2);

        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, "u_SimpleAnimatorParams", ShaderDataType.Vector4);
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, "u_SimpleAnimatorTexture", ShaderDataType.Texture2D);
        commandUniform.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, "u_SimpleAnimatorTextureSize", ShaderDataType.Float);
        commandUniform.addShaderUniform(SpineShaderInit.SPINE_RENDER_SIZE, "u_spineRenderSize", ShaderDataType.Vector2);

        // commandUniform.addShaderUniform(SpineShaderInit.SpineTexture, "u_spineTexture", ShaderDataType.Texture2D);

        let shader = Shader3D.add("SpineStandard", true, false);
        shader.shaderType = ShaderFeatureType.D2_BaseRenderNode2D;
        let uniformMap = {
            "u_spineTexture": ShaderDataType.Texture2D
        }
        let subShader = new SubShader(SpineShaderInit.textureSpineAttribute, uniformMap);
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

        SpineShaderInit.SpineNormalVertexDeclaration = SpineShaderInit.getVertexDeclaration("UV,COLOR,POSITION,COLOR2");

        // SpineShaderInit.SpineNormalVertexDeclaration = new VertexDeclaration(32, [
        //     new VertexElement(0, VertexElementFormat.Vector2, 0),
        //     new VertexElement(8, VertexElementFormat.Vector4, 1),
        //     new VertexElement(24, VertexElementFormat.Vector2, 2)
        // ])


        SpineShaderInit.instanceNMatrixDeclaration = new VertexDeclaration(24, [
            new VertexElement(0, VertexElementFormat.Vector3, 8),
            new VertexElement(12, VertexElementFormat.Vector3, 9),
        ])

        SpineShaderInit.instanceSimpleAnimatorDeclaration = new VertexDeclaration(16, [
            new VertexElement(0, VertexElementFormat.Vector4, 10),
        ])
    }


    static getVertexDeclaration(vertexFlag: string) {
        var verDec: VertexDeclaration = SpineShaderInit._vertexDeclarationMap[vertexFlag];
        if (!verDec) {
            var subFlags: any[] = vertexFlag.split(",");
            var elements: VertexElement[] = [];
            var offset: number = 0;

            for (var i: number = 0, n: number = subFlags.length; i < n; i++) {
                var element: VertexElement;
                switch (subFlags[i]) {
                    case "COLOR2":
                        element = new VertexElement(offset, VertexElementFormat.Vector4, 11);
                        offset += 16;
                        break;
                    case "BONE":
                        element = new VertexElement(offset, VertexElementFormat.Single, 3);
                        elements.push(element);
                        offset += 4;

                        element = new VertexElement(offset, VertexElementFormat.Single, 4);
                        elements.push(element);
                        offset += 4;

                        element = new VertexElement(offset, VertexElementFormat.Vector4, 5);
                        elements.push(element);
                        offset += 16;

                        element = new VertexElement(offset, VertexElementFormat.Vector4, 6);
                        elements.push(element);
                        offset += 16;

                        element = new VertexElement(offset, VertexElementFormat.Vector4, 7);
                        offset += 16;
                        break;
                    // case "RIGIDBODY":
                    //     element = new VertexElement(offset, VertexElementFormat.Single, 4);
                    //     offset += 4;
                    //     break;
                    case "UV":
                        element = new VertexElement(offset, VertexElementFormat.Vector2, 0);
                        offset += 8;
                        break;
                    case "COLOR":
                        element = new VertexElement(offset, VertexElementFormat.Vector4, 1);
                        offset += 16;
                        break;
                    case "POSITION":
                        element = new VertexElement(offset, VertexElementFormat.Vector2, 2);
                        offset += 8
                        break;
                    default:
                        throw new Error("unknown vertex flag.");
                }
                elements.push(element);
            }

            verDec = new VertexDeclaration(offset, elements);
            SpineShaderInit._vertexDeclarationMap[vertexFlag] = verDec;
        }

        return verDec;
    }

    private static _declarations: Record<string , VertexDeclaration>;

    static getAllVertexDeclarations() {
        if (this._declarations) {
            return this._declarations;
        }
        this._declarations = {};

        let vertexFlags = [
            "UV,COLOR,POSITION",
            "UV,COLOR,POSITION,COLOR2",
            "UV,COLOR,POSITION,BONE",
            "UV,COLOR,POSITION,BONE,COLOR2"
        ];
        for (const vertexFlag of vertexFlags) {
            this._declarations[vertexFlag] = SpineShaderInit.getVertexDeclaration(vertexFlag);
        }
        this._declarations["instanceMatrix"] = SpineShaderInit.instanceNMatrixDeclaration;
        this._declarations["simpleAnimation"] = SpineShaderInit.instanceSimpleAnimatorDeclaration;
        return this._declarations;
    }

    static getIndexFormat(vertexCount: number) {
        let type = IndexFormat.UInt32;
        if (vertexCount < 256 && LayaGL.renderEngine.getCapable(RenderCapable.Element_Index_Uint8)) {
            type = IndexFormat.UInt8;
        } else if (vertexCount < 65536) {
            type = IndexFormat.UInt16;
        }
        return type;
    }
}
