import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import BlitVS from "./BlitScreen.vs";
import BlitFS from "./BlitScreen.fs";
import FXAA from "./FastApproximateAntiAliasing.glsl";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../../RenderEngine/RenderShader/VertexMesh";

import ColorGradingGLSL from "./ColorGrading.glsl";
import TonemappingGLSL from "./Tonemapping.glsl";
import LUTGLSL from "./LUT.glsl";

import LUTBuilderFS from "./LUTBuilder.fs";
import { ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";

export class BlitScreenShaderInit {

    static init() {
        Shader3D.addInclude("FastApproximateAntiAliasing.glsl", FXAA);

        Shader3D.addInclude("ColorGrading.glsl", ColorGradingGLSL);
        Shader3D.addInclude("Tonemapping.glsl", TonemappingGLSL);
        Shader3D.addInclude("LUT.glsl", LUTGLSL);

        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4, //x:width,y:height,z:1/width,w:1/height
        };

        let shader = Shader3D.add("BlitScreen");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let blitPass = subShader.addShaderPass(BlitVS, BlitFS);
        blitPass.statefirst = true;
        let blitState = blitPass.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_DISABLE;

        let transparentShader = Shader3D.add("BlitScreen_Transparnet");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let transparentSubShader = new SubShader(attributeMap, uniformMap);
        transparentShader.addSubShader(transparentSubShader);
        let blitPassTrans = transparentSubShader.addShaderPass(BlitVS, BlitFS);
        blitPass.statefirst = true;
        blitState = blitPassTrans.renderState;
        blitState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = RenderState.CULL_NONE;
        blitState.blend = RenderState.BLEND_ENABLE_ALL;
        blitState.srcBlend = RenderState.BLENDPARAM_SRC_ALPHA;
        blitState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

        this.lutBuilderInit();
    }

    private static lutBuilderInit() {

        let attributeMap: { [name: string]: [number, ShaderDataType] } = {
            "a_PositionTexcoord": [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };

        let uniformMap = {
            "u_OffsetScale": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_MainTex_TexelSize": ShaderDataType.Vector4, //x:width,y:height,z:1/width,w:1/height
            "u_LutParams": ShaderDataType.Vector4
        };

        let shader = Shader3D.add("LUTBuilder");
        shader.shaderType = ShaderFeatureType.PostProcess;
        let subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        let pass = subShader.addShaderPass(BlitVS, LUTBuilderFS);
        pass.renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        pass.renderState.depthWrite = false;
        pass.renderState.cull = RenderState.CULL_NONE;
        pass.renderState.blend = RenderState.BLEND_DISABLE;
        pass.statefirst = true;
    }

}