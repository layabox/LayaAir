
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import UtilsGLSL from "./utils/Utils.glsl";
import ColorGLSL from "./utils/Color.glsl";
import MathGLSL from "./utils/Math.glsl";
import TBNNormalGLSL from "./utils/TBNNormal.glsl";
import BakedBoneMatrixSamplerGLSL from "./utils/BakedBoneMatrixSampler.glsl";

import VertexGLSL from "./common/VertexCommon.glsl";

import MorphTargetGLSL from "./common/MorphTarget.glsl";

import SceneGLSL from "./common/SceneCommon.glsl";
import CameraGLSL from "./common/CameraCommon.glsl";
import Sprite3DCommonGLSL from "./common/Sprite3DCommon.glsl";
import Sprite3DVertexGLSL from "./common/Sprite3DVertex.glsl";
import Sprite3DFragGLSL from "./common/Sprite3DFrag.glsl";
import DepthVertexGLSL from "./depth/DepthVertex.glsl";
import DepthFragGLSL from "./depth/DepthFrag.glsl";
import DepthNormalUtilGLSL from "./depth/DepthNormalUtil.glsl";
import ShadowSampleTentGLSL from "./lighting/ShadowSampleTent.glsl";
import ShadowSamplerGLSL from "./lighting/ShadowSampler.glsl";
import SceneFogGLSL from "./utils/SceneFog.glsl";
import SceneFogInputGLSL from "./utils/SceneFogInput.glsl";
import LightingGLSL from "./lighting/Lighting.glsl";
import GlobalIlluminationGLSL from "./lighting/globalIllumination.glsl";
import BlinnPhongLightingGLSL from "./lightingmode/BlinnPhongLighting.glsl";
import PBRLightingGLSL from "./lightingmode/PBRLighting.glsl";
import { BlitScreenShaderInit } from "./postprocess/BlitScreenShaderInit";
import { UnlitShaderInit } from "./unlit/UnlitShaderInit";
import { BlinnPhongShaderInit } from "./blinnphong/BlinnPhongShaderInit";
import { TrailShaderInit } from "./Trail/TrailShaderInit";
import { PBRShaderLib } from "./pbr/PBRShaderLib";
import { PBRStandardShaderInit } from "./pbr/PBRStandardShaderInit";
import { SkyBoxShaderInit } from "./sky/SkyBoxShaderInit";
import { ParticleShuriKenShaderInit } from "./ShurikenParticle/ParticleShuriKenShaderInit";
import { SkyProceduralShaderInit } from "./sky/SkyProceduralShaderInit";
import { SkyPanoramicShaderInit } from "./sky/SkyPanoramicShaderInit";
import { ACESShaderLib } from "./postprocess/ACES/ACESShaderLib";

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
		Shader3D.addInclude("MorphTarget.glsl", MorphTargetGLSL);

		// scene
		Shader3D.addInclude("Scene.glsl", SceneGLSL);

		// camera
		Shader3D.addInclude("Camera.glsl", CameraGLSL);

		// sprite3D
		Shader3D.addInclude("Sprite3DCommon.glsl", Sprite3DCommonGLSL);
		Shader3D.addInclude("Sprite3DVertex.glsl", Sprite3DVertexGLSL);
		Shader3D.addInclude("Sprite3DFrag.glsl", Sprite3DFragGLSL);

		// depth
		Shader3D.addInclude("DepthVertex.glsl", DepthVertexGLSL);
		Shader3D.addInclude("DepthFrag.glsl", DepthFragGLSL);
		Shader3D.addInclude("DepthNormalUtil.glsl", DepthNormalUtilGLSL);

		// scene fog
		Shader3D.addInclude("SceneFog.glsl", SceneFogGLSL);
		Shader3D.addInclude("SceneFogInput.glsl", SceneFogInputGLSL);
		// shadow sampler
		Shader3D.addInclude("ShadowSampleTent.glsl", ShadowSampleTentGLSL);
		Shader3D.addInclude("ShadowSampler.glsl", ShadowSamplerGLSL);

		// lighting
		Shader3D.addInclude("Lighting.glsl", LightingGLSL);
		Shader3D.addInclude("globalIllumination.glsl", GlobalIlluminationGLSL);

		// lighting mode
		Shader3D.addInclude("BlinnPhongLighting.glsl", BlinnPhongLightingGLSL);
		Shader3D.addInclude("PBRLighting.glsl", PBRLightingGLSL);

		// lib
		PBRShaderLib.init();
		ACESShaderLib.init();

		// shader init
		BlitScreenShaderInit.init();
		UnlitShaderInit.init();
		PBRStandardShaderInit.init();
		//PBRShaderInit.init();
		BlinnPhongShaderInit.init();
		TrailShaderInit.init();
		ParticleShuriKenShaderInit.init();
		SkyBoxShaderInit.init();
		SkyProceduralShaderInit.init();
		SkyPanoramicShaderInit.init();

		///////////////////////////////////////////////////////////////////////
		Shader3D.SHADERDEFINE_LEGACYSINGALLIGHTING = Shader3D.getDefineByName("LEGACYSINGLELIGHTING");
		Shader3D.SHADERDEFINE_ENUNIFORMBLOCK = Shader3D.getDefineByName("ENUNIFORMBLOCK");
	}
}

