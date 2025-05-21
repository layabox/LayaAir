
import BlurEffect2DVS from "./BlurEffect2D.vs"
import BlurEffect2DFS from "./BlurEffect2D.fs"
import ColorEffect2DVS from "./ColorEffect2D.vs"
import ColorEffect2DFS from "./ColorEffect2D.fs"
import GlowEffect2DVS from "./GlowEffect2D.vs"
import GlowEffect2DFS from "./GlowEffect2D.fs"
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData"
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState"
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D"
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader"
export class Effect2DShaderInit {
    static colorEffect2DShaderInit() {
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [0, ShaderDataType.Vector4]
        };
        let uniformMap = {
            "u_centerScale": ShaderDataType.Vector2,//src rt除以dest rt
            "u_MainTex": ShaderDataType.Texture2D,
            "u_colorMat": ShaderDataType.Matrix4x4,
            "u_colorAlpha": ShaderDataType.Vector4
        };
        let shader = Shader3D.add("ColorEffect2D");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blitPass = subShader.addShaderPass(ColorEffect2DVS, ColorEffect2DFS);
        blitPass.statefirst = true;
        blitPass.renderState.depthWrite = false;
        blitPass.renderState.depthTest = RenderState.DEPTHTEST_OFF;
        blitPass.renderState.blend = RenderState.BLEND_ENABLE_ALL;
        blitPass.renderState.blendEquation = RenderState.BLENDEQUATION_ADD;
        blitPass.renderState.srcBlend = RenderState.BLENDPARAM_ONE;
        blitPass.renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        blitPass.renderState.cull = RenderState.CULL_NONE;
    }

    static blurEffect2DShaderInit() {
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [0, ShaderDataType.Vector4]
        };
        let uniformMap = {
            "u_centerScale": ShaderDataType.Vector2,//src rt除以dest rt
            "u_MainTex": ShaderDataType.Texture2D,
            "u_strength_sig2_2sig2_gauss1": ShaderDataType.Vector4,
            "u_blurInfo": ShaderDataType.Vector2
        };
        let shader = Shader3D.add("BlurEffect2D");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blitPass = subShader.addShaderPass(BlurEffect2DVS, BlurEffect2DFS);
        blitPass.statefirst = true;
        blitPass.renderState.depthWrite = false;
        blitPass.renderState.depthTest = RenderState.DEPTHTEST_OFF;
        blitPass.renderState.blend = RenderState.BLEND_ENABLE_ALL;
        blitPass.renderState.blendEquation = RenderState.BLENDEQUATION_ADD;
        blitPass.renderState.srcBlend = RenderState.BLENDPARAM_ONE;
        blitPass.renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        blitPass.renderState.cull = RenderState.CULL_NONE;
    }

    static glow2DShaderInit() {
        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_centerScale": ShaderDataType.Vector2,//src rt除以dest rt
            "u_MainTex": ShaderDataType.Texture2D,
            "u_color": ShaderDataType.Vector4,
            "u_blurInfo1": ShaderDataType.Vector4,
            "u_blurInfo2": ShaderDataType.Vector4
        };
        let shader = Shader3D.add("glow2D");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blitPass = subShader.addShaderPass(GlowEffect2DVS, GlowEffect2DFS);
        blitPass.statefirst = true;
        blitPass.renderState.depthWrite = false;
        blitPass.renderState.depthTest = RenderState.DEPTHTEST_OFF;
        blitPass.renderState.blend = RenderState.BLEND_ENABLE_ALL;
        blitPass.renderState.blendEquation = RenderState.BLENDEQUATION_ADD;
        blitPass.renderState.srcBlend = RenderState.BLENDPARAM_ONE;
        blitPass.renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        blitPass.renderState.cull = RenderState.CULL_NONE;
    }

}