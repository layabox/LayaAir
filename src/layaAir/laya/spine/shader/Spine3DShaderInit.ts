import { Shader3D, ShaderFeatureType } from "../../RenderEngine/RenderShader/Shader3D";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import spine3DVertex from "./files/Spine3DVertex.glsl";
import spine3DVS from "./files/Spine3D.vs";
import spine3DFS from "./files/Spine3D.fs";
import { SpineShaderInit } from "./SpineShaderInit";

/**
 * @en Spine3DShaderInit class handles the initialization of Spine 3D shader components.
 * @zh Spine3DShaderInit 类用于处理 Spine 3D 着色器组件的初始化。
 */
export class Spine3DShaderInit {

    /**
     * @en Shader define for Spine billboard rendering (always face camera).
     * @zh Spine 广告牌渲染的着色器定义（始终面向相机）。
     */
    static SPINE_BILLBOARD: ShaderDefine;

    /**
     * @en Property ID for Spine billboard world matrix.
     * @zh Spine 广告牌世界矩阵的属性 ID。
     */
    static SPINE_BILLBOARD_MATRIX: number;

    /**
     * @en Initialize Spine 3D shader components. Must be called after SpineShaderInit.init().
     * @zh 初始化 Spine 3D 着色器组件。必须在 SpineShaderInit.init() 之后调用。
     */
    static init() {
        Shader3D.addInclude("Spine3DVertex.glsl", spine3DVertex);

        Spine3DShaderInit.SPINE_BILLBOARD = Shader3D.getDefineByName("SPINE_BILLBOARD");
        Spine3DShaderInit.SPINE_BILLBOARD_MATRIX = Shader3D.propertyNameToID("u_spineBillboardMatrix");

        // 为3D shader注册全局uniform map
        const commandUniform3D = LayaGL.renderDeviceFactory.createGlobalUniformMap("Spine3D");
        commandUniform3D.addShaderUniformArray(SpineShaderInit.BONEMAT, "u_sBone", ShaderDataType.Vector4, 200);
        commandUniform3D.addShaderUniform(SpineShaderInit.BONEMAT_0, "u_sBone0", ShaderDataType.Vector3);
        commandUniform3D.addShaderUniform(SpineShaderInit.BONEMAT_1, "u_sBone1", ShaderDataType.Vector3);
        commandUniform3D.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORPARAMS, "u_SimpleAnimatorParams", ShaderDataType.Vector4);
        commandUniform3D.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURE, "u_SimpleAnimatorTexture", ShaderDataType.Texture2D);
        commandUniform3D.addShaderUniform(SpineShaderInit.SIMPLE_SIMPLEANIMATORTEXTURESIZE, "u_SimpleAnimatorTextureSize", ShaderDataType.Float);
        commandUniform3D.addShaderUniform(SpineShaderInit.SPINE_RENDER_SIZE, "u_spineRenderSize", ShaderDataType.Vector2);
        commandUniform3D.addShaderUniform(Spine3DShaderInit.SPINE_BILLBOARD_MATRIX, "u_spineBillboardMatrix", ShaderDataType.Matrix4x4);

        // 注册Spine3D shader用于3D世界渲染
        let shader3D = Shader3D.add("Spine3D", true, false);
        shader3D.shaderType = ShaderFeatureType.D3;
        let uniformMap3D = {
            "u_spineTexture": ShaderDataType.Texture2D
        }
        let subShader3D = new SubShader(SpineShaderInit.textureSpineAttribute, uniformMap3D);
        shader3D.addSubShader(subShader3D);
        let shadingPass3D = subShader3D.addShaderPass(spine3DVS, spine3DFS);
    }
}
