import { RenderState } from "../core/material/RenderState";
import { VertexTrail } from "../core/trail/VertexTrail";
import { VertexMesh } from "../graphics/Vertex/VertexMesh";
import { VertexShuriKenParticle } from "../graphics/Vertex/VertexShuriKenParticle";
import BlitScreenPS from "./files/BlitScreen.fs";
import BlitScreenVS from "./files/BlitScreen.vs";
import EffectPS from "./files/Effect.fs";
import EffectVS from "./files/Effect.vs";
import extendTerrainPS from "./files/extendTerrain.fs";
import extendTerrainVS from "./files/extendTerrain.vs";
import GlobalIllumination from "./files/GlobalIllumination.glsl";
// import LightingGLSL from "./files/Lighting.glsl";
// import ShadowSampleTentGLSL from "./files/ShadowSampleTent.glsl";
import LayaUtile from "./files/LayaUtile.glsl"
import linePS from "./files/line.fs";
import lineVS from "./files/line.vs";
import MeshBlinnPhongPS from "./files/Mesh-BlinnPhong.fs";
import MeshBlinnPhongVS from "./files/Mesh-BlinnPhong.vs";
import MeshBlinnPhongShadowCasterPS from "./files/Mesh-BlinnPhongShadowCaster.fs";
import MeshBlinnPhongShadowCasterVS from "./files/Mesh-BlinnPhongShadowCaster.vs";
import ParticleShuriKenPS from "./files/ParticleShuriKen.fs";
import ParticleShuriKenVS from "./files/ParticleShuriKen.vs";
import LayaPBRBRDF from "./files/PBRLibs/LayaPBRBRDF.glsl";
import PBRCore from "./files/PBRLibs/PBRCore.glsl";
import PBRVSInput from "./files/PBRLibs/PBRVSInput.glsl";
import PBRFSInput from "./files/PBRLibs/PBRFSInput.glsl";
import PBRVertex from "./files/PBRLibs/PBRVertex.glsl";
import BloomVS from "./files/postProcess/Bloom.vs";
import BloomDownsample13PS from "./files/postProcess/BloomDownsample13.fs";
import BloomDownsample4PS from "./files/postProcess/BloomDownsample4.fs";
import BloomPrefilter13PS from "./files/postProcess/BloomPrefilter13.fs";
import BloomPrefilter4PS from "./files/postProcess/BloomPrefilter4.fs";
import BloomUpsampleBoxPS from "./files/postProcess/BloomUpsampleBox.fs";
import BloomUpsampleTentPS from "./files/postProcess/BloomUpsampleTent.fs";
import ColorsGLSL from "./files/postProcess/Colors.glsl";
import CompositePS from "./files/postProcess/Composite.fs";
import CompositeVS from "./files/postProcess/Composite.vs";
import SamplingGLSL from "./files/postProcess/Sampling.glsl";
import StdLibGLSL from "./files/postProcess/StdLib.glsl";
import ShadowGLSL from "./files/Shadow.glsl";
import ShadowCasterVSGLSL from "./files/ShadowCasterVS.glsl";
import ShadowCasterFSGLSL from "./files/ShadowCasterFS.glsl";
import SkyBoxPS from "./files/SkyBox.fs";
import SkyBoxVS from "./files/SkyBox.vs";
import SkyBoxProceduralPS from "./files/SkyBoxProcedural.fs";
import SkyBoxProceduralVS from "./files/SkyBoxProcedural.vs";
import TrailPS from "./files/Trail.fs";
import TrailVS from "./files/Trail.vs";
import UnlitPS from "./files/Unlit.fs";
import UnlitVS from "./files/Unlit.vs";
import WaterPrimaryPS from "./files/WaterPrimary.fs";
import WaterPrimaryVS from "./files/WaterPrimary.vs";
import DepthNormalsTextureVS from "./files/DepthNormalsTextureVS.vs";
import DepthNormalsTextureFS from "./files/DepthNormalsTextureFS.fs";
import DepthNormalUtil from "./files/DepthNormalUtil.glsl";
import LayaComInput from "./files/glslInput/LayaComInput.glsl";
import DepthCasterInput from "./files/glslInput/DepthCasterInput.glsl";
import { ShaderPass } from "./ShaderPass";
import { SubShader } from "./SubShader";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

////////////////////////////////////////////////
import UtilsGLSL from "./utils/Utils.glsl";
import ColorGLSL from "./utils/Color.glsl";
import MathGLSL from "./utils/Math.glsl";
import TBNNormalGLSL from "./utils/TBNNormal.glsl";
import BakedBoneMatrixSamplerGLSL from "./utils/BakedBoneMatrixSampler.glsl";

import VertexGLSL from "./common/VertexCommon.glsl";

import SceneGLSL from "./common/SceneCommon.glsl";
import CameraGLSL from "./common/CameraCommon.glsl";
import Sprite3DGLSL from "./common/Sprite3DCommon.glsl";

import DepthVertexGLSL from "./depth/DepthVertex.glsl";
import DepthFragGLSL from "./depth/DepthFrag.glsl";

import ShadowSampleTentGLSL from "./lighting/ShadowSampleTent.glsl";
import ShadowSamplerGLSL from "./lighting/ShadowSampler.glsl";

import SceneFogGLSL from "./utils/SceneFog.glsl";

import LightingGLSL from "./lighting/Lighting.glsl";

import BlinnPhongLightingGLSL from "./lightingmode/BlinnPhongLighting.glsl";


import { BlitScreenShaderInit } from "./postprocess/BlitScreenShaderInit";
import { UnlitShaderInit } from "./unlit/UnlitShaderInit";
import { BlinnPhongShaderInit } from "./blinnphong/BlinnPhongShaderInit";
import { PBRShaderInit } from "./pbr/PBRShaderInit";
import { TrailShaderInit } from "./Trail/TrailShaderInit";
import { PBRShaderLib } from "./pbr/PBRShaderLib";
import { PBRStandardShaderInit } from "./pbr/PBRStandardShaderInit";
import { SkyBoxShaderInit } from "./sky/SkyBoxShaderInit";

/**
 * @internal
 * <code>ShaderInit</code> 类用于初始化内置Shader。
 */
export class ShaderInit3D {
	/**
	 * @internal
	 */
	static __init__(): void {

		// utils
		Shader3D.addInclude("Utils.glsl", UtilsGLSL);
		Shader3D.addInclude("Color.glsl", ColorGLSL);
		Shader3D.addInclude("Math.glsl", MathGLSL);

		Shader3D.addInclude("TBNNormal.glsl", TBNNormalGLSL);
		Shader3D.addInclude("BakedBoneMatrixSampler.glsl", BakedBoneMatrixSamplerGLSL);

		Shader3D.addInclude("VertexCommon.glsl", VertexGLSL);

		// scene
		Shader3D.addInclude("Scene.glsl", SceneGLSL);

		// camera
		Shader3D.addInclude("Camera.glsl", CameraGLSL);

		// sprite3D
		Shader3D.addInclude("Sprite3D.glsl", Sprite3DGLSL);

		// depth
		Shader3D.addInclude("DepthVertex.glsl", DepthVertexGLSL);
		Shader3D.addInclude("DepthFrag.glsl", DepthFragGLSL);

		// scene fog
		Shader3D.addInclude("SceneFog.glsl", SceneFogGLSL);

		// shadow sampler
		Shader3D.addInclude("ShadowSampleTent.glsl", ShadowSampleTentGLSL);
		Shader3D.addInclude("ShadowSampler.glsl", ShadowSamplerGLSL);

		// lighting
		Shader3D.addInclude("Lighting.glsl", LightingGLSL);

		// lighting mode
		Shader3D.addInclude("BlinnPhongLighting.glsl", BlinnPhongLightingGLSL);

		// lib
		PBRShaderLib.init();

		// shader init
		BlitScreenShaderInit.init();
		UnlitShaderInit.init();
		PBRStandardShaderInit.init();
		PBRShaderInit.init();
		BlinnPhongShaderInit.init();
		TrailShaderInit.init();

		SkyBoxShaderInit.init();

		///////////////////////////////////////////////////////////////////////
		Shader3D.SHADERDEFINE_LEGACYSINGALLIGHTING = Shader3D.getDefineByName("LEGACYSINGLELIGHTING");
		Shader3D.SHADERDEFINE_GRAPHICS_API_GLES2 = Shader3D.getDefineByName("GRAPHICS_API_GLES2");
		Shader3D.SHADERDEFINE_GRAPHICS_API_GLES3 = Shader3D.getDefineByName("GRAPHICS_API_GLES3");
		Shader3D.SHADERDEFINE_ENUNIFORMBLOCK = Shader3D.getDefineByName("ENUNIFORMBLOCK");
		// Shader3D.addInclude("LayaComInput.glsl", LayaComInput);
		// Shader3D.addInclude("DepthCasterInput.glsl", DepthCasterInput);
		// Shader3D.addInclude("Lighting.glsl", LightingGLSL);
		// Shader3D.addInclude("ShadowSampleTent.glsl", ShadowSampleTentGLSL);
		// Shader3D.addInclude("GlobalIllumination.glsl", GlobalIllumination);
		// Shader3D.addInclude("Shadow.glsl", ShadowGLSL);
		// Shader3D.addInclude("ShadowCasterVS.glsl", ShadowCasterVSGLSL);
		// Shader3D.addInclude("ShadowCasterFS.glsl", ShadowCasterFSGLSL);
		// Shader3D.addInclude("Colors.glsl", ColorsGLSL);
		// Shader3D.addInclude("Sampling.glsl", SamplingGLSL);
		// Shader3D.addInclude("StdLib.glsl", StdLibGLSL);
		// Shader3D.addInclude("PBRVSInput.glsl", PBRVSInput);
		// Shader3D.addInclude("PBRFSInput.glsl", PBRFSInput);
		// Shader3D.addInclude("LayaPBRBRDF.glsl", LayaPBRBRDF);
		// Shader3D.addInclude("PBRCore.glsl", PBRCore);
		// Shader3D.addInclude("PBRVertex.glsl", PBRVertex);
		// Shader3D.addInclude("LayaUtile.glsl", LayaUtile);
		// Shader3D.addInclude("DepthNormalUtil.glsl", DepthNormalUtil);
		//Blinnphong
		// var shader: Shader3D = Shader3D.add("BLINNPHONG", true);
		// var subShader: SubShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(MeshBlinnPhongVS, MeshBlinnPhongPS, "Forward");
		// var shaderPass: ShaderPass = subShader.addShaderPass(MeshBlinnPhongShadowCasterVS, MeshBlinnPhongShadowCasterPS, "ShadowCaster");
		// shaderPass = subShader.addShaderPass(DepthNormalsTextureVS, DepthNormalsTextureFS, "DepthNormal");
		// //LineShader
		// shader = Shader3D.add("LineShader");
		// subShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(lineVS, linePS);
		// //unlit
		// shader = Shader3D.add("Unlit", true);
		// subShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(UnlitVS, UnlitPS);
		// //meshEffect
		// shader = Shader3D.add("Effect", true);
		// subShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(EffectVS, EffectPS);

		// //ShurikenParticle
		// var attributeMap = {
		// 	'a_CornerTextureCoordinate': VertexShuriKenParticle.PARTICLE_CORNERTEXTURECOORDINATE0,
		// 	'a_MeshPosition': VertexShuriKenParticle.PARTICLE_POSITION0,
		// 	'a_MeshColor': VertexShuriKenParticle.PARTICLE_COLOR0,
		// 	'a_MeshTextureCoordinate': VertexShuriKenParticle.PARTICLE_TEXTURECOORDINATE0,
		// 	'a_ShapePositionStartLifeTime': VertexShuriKenParticle.PARTICLE_SHAPEPOSITIONSTARTLIFETIME,
		// 	'a_DirectionTime': VertexShuriKenParticle.PARTICLE_DIRECTIONTIME,
		// 	'a_StartColor': VertexShuriKenParticle.PARTICLE_STARTCOLOR0,
		// 	'a_EndColor': VertexShuriKenParticle.PARTICLE_ENDCOLOR0,
		// 	'a_StartSize': VertexShuriKenParticle.PARTICLE_STARTSIZE,
		// 	'a_StartRotation0': VertexShuriKenParticle.PARTICLE_STARTROTATION,
		// 	'a_StartSpeed': VertexShuriKenParticle.PARTICLE_STARTSPEED,
		// 	'a_Random0': VertexShuriKenParticle.PARTICLE_RANDOM0,
		// 	'a_Random1': VertexShuriKenParticle.PARTICLE_RANDOM1,
		// 	'a_SimulationWorldPostion': VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDPOSTION,
		// 	'a_SimulationWorldRotation': VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDROTATION,
		// 	'a_SimulationUV': VertexShuriKenParticle.PARTICLE_SIMULATIONUV
		// };
		// shader = Shader3D.add("PARTICLESHURIKEN");
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(ParticleShuriKenVS, ParticleShuriKenPS);
		// //SkyBox
		// shader = Shader3D.add("SkyBox");
		// subShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(SkyBoxVS, SkyBoxPS);
		// // //SkyBoxProcedural
		// shader = Shader3D.add("SkyBoxProcedural");
		// subShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(SkyBoxProceduralVS, SkyBoxProceduralPS);
		// //extendTerrain的shader TODO delete
		// shader = Shader3D.add("ExtendTerrain");
		// subShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(extendTerrainVS, extendTerrainPS);
		// //Trail
		// (attributeMap as any) = {
		// 	'a_Position': VertexTrail.TRAIL_POSITION0,
		// 	'a_OffsetVector': VertexTrail.TRAIL_OFFSETVECTOR,
		// 	'a_Texcoord0X': VertexTrail.TRAIL_TEXTURECOORDINATE0X,
		// 	'a_Texcoord0Y': VertexTrail.TRAIL_TEXTURECOORDINATE0Y,
		// 	'a_BirthTime': VertexTrail.TRAIL_TIME0,
		// 	'a_Color': VertexTrail.TRAIL_COLOR
		// };
		// shader = Shader3D.add("Trail");
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(TrailVS, TrailPS);

		// // //WaterPrimary TODO delete
		// shader = Shader3D.add("WaterPrimary");
		// subShader = new SubShader();
		// shader.addSubShader(subShader);
		// subShader.addShaderPass(WaterPrimaryVS, WaterPrimaryPS);
		// //BlitScreen
		// // (attributeMap as any) = {
		// // 	'a_PositionTexcoord': VertexMesh.MESH_POSITION0
		// // };
		// // shader = Shader3D.add("BlitScreen");
		// // subShader = new SubShader(attributeMap);
		// // shader.addSubShader(subShader);
		// // var shaderPass: ShaderPass = subShader.addShaderPass(BlitScreenVS, BlitScreenPS);
		// var renderState: RenderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;
		// //PostProcessBloom
		// (attributeMap as any) = {
		// 	'a_PositionTexcoord': VertexMesh.MESH_POSITION0
		// };
		// shader = Shader3D.add("PostProcessBloom");
		// //subShader0
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// shaderPass = subShader.addShaderPass(BloomVS, BloomPrefilter13PS);
		// renderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;
		// //subShader1
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// shaderPass = subShader.addShaderPass(BloomVS, BloomPrefilter4PS);
		// renderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;
		// //subShader2
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// shaderPass = subShader.addShaderPass(BloomVS, BloomDownsample13PS);
		// renderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;
		// //subShader3
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// shaderPass = subShader.addShaderPass(BloomVS, BloomDownsample4PS);
		// renderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;
		// //subShader4
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// shaderPass = subShader.addShaderPass(BloomVS, BloomUpsampleTentPS);
		// renderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;
		// //subShader5
		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// shaderPass = subShader.addShaderPass(BloomVS, BloomUpsampleBoxPS);
		// renderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;

		// //PostProcessComposite
		// (attributeMap as any) = {
		// 	'a_PositionTexcoord': VertexMesh.MESH_POSITION0
		// };
		// shader = Shader3D.add("PostProcessComposite");

		// subShader = new SubShader(attributeMap);
		// shader.addSubShader(subShader);
		// shaderPass = subShader.addShaderPass(CompositeVS, CompositePS);
		// renderState = shaderPass.renderState;
		// renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
		// renderState.depthWrite = false;
		// renderState.cull = RenderState.CULL_NONE;
		// renderState.blend = RenderState.BLEND_DISABLE;
	}
}

