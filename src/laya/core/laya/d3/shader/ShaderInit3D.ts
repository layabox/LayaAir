import { Shader3D } from "././Shader3D";
import { SubShader } from "././SubShader";
import { ShaderPass } from "././ShaderPass";
import { PostProcess } from "../component/PostProcess"
	import { BaseCamera } from "../core/BaseCamera"
	import { RenderableSprite3D } from "../core/RenderableSprite3D"
	import { SkinnedMeshSprite3D } from "../core/SkinnedMeshSprite3D"
	import { Sprite3D } from "../core/Sprite3D"
	import { BaseMaterial } from "../core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "../core/material/BlinnPhongMaterial"
	import { EffectMaterial } from "../core/material/EffectMaterial"
	import { ExtendTerrainMaterial } from "../core/material/ExtendTerrainMaterial"
	import { PBRSpecularMaterial } from "../core/material/PBRSpecularMaterial"
	import { PBRStandardMaterial } from "../core/material/PBRStandardMaterial"
	import { RenderState } from "../core/material/RenderState"
	import { SkyProceduralMaterial } from "../core/material/SkyProceduralMaterial"
	import { UnlitMaterial } from "../core/material/UnlitMaterial"
	import { WaterPrimaryMaterial } from "../core/material/WaterPrimaryMaterial"
	import { ShuriKenParticle3D } from "../core/particleShuriKen/ShuriKenParticle3D"
	import { ShurikenParticleMaterial } from "../core/particleShuriKen/ShurikenParticleMaterial"
	import { PixelLineMaterial } from "../core/pixelLine/PixelLineMaterial"
	import { Scene3D } from "../core/scene/Scene3D"
	import { TrailMaterial } from "../core/trail/TrailMaterial"
	import { TrailSprite3D } from "../core/trail/TrailSprite3D"
	import { VertexTrail } from "../core/trail/VertexTrail"
	import { VertexMesh } from "../graphics/Vertex/VertexMesh"
	import { VertexShuriKenParticle } from "../graphics/Vertex/VertexShuriKenParticle"
	import { TextureGenerator } from "../resource/TextureGenerator"
	import { Utils3D } from "../utils/Utils3D"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	
	/**
	 * @private
	 * <code>ShaderInit</code> 类用于初始化内置Shader。
	 */
	export class ShaderInit3D {
		/**@private */
		 static _rangeAttenTex:Texture2D;
		/**
		 * 创建一个 <code>ShaderInit</code> 实例。
		 */
		constructor(){
		}
		
		/**
		 * @private
		 */
		 static __init__():void {
			ShaderInit3D._rangeAttenTex = Utils3D._buildTexture2D(1024, 1, BaseTexture.FORMAT_ALPHA8, TextureGenerator.lightAttenTexture);//TODO:移动位置
			ShaderInit3D._rangeAttenTex.wrapModeU = BaseTexture.WARPMODE_CLAMP;
			ShaderInit3D._rangeAttenTex.wrapModeV = BaseTexture.WARPMODE_CLAMP;
			ShaderInit3D._rangeAttenTex.lock = true;
			Shader3D.SHADERDEFINE_HIGHPRECISION = Shader3D.registerPublicDefine("HIGHPRECISION");
			Scene3D.SHADERDEFINE_FOG=Shader3D.registerPublicDefine("FOG");
			Scene3D.SHADERDEFINE_DIRECTIONLIGHT=Shader3D.registerPublicDefine("DIRECTIONLIGHT");
			Scene3D.SHADERDEFINE_POINTLIGHT=Shader3D.registerPublicDefine("POINTLIGHT");
			Scene3D.SHADERDEFINE_SPOTLIGHT=Shader3D.registerPublicDefine("SPOTLIGHT");
			Scene3D.SHADERDEFINE_CAST_SHADOW= Shader3D.registerPublicDefine("CASTSHADOW");
			Scene3D.SHADERDEFINE_SHADOW_PSSM1= Shader3D.registerPublicDefine("SHADOWMAP_PSSM1");
			Scene3D.SHADERDEFINE_SHADOW_PSSM2= Shader3D.registerPublicDefine("SHADOWMAP_PSSM2");
			Scene3D.SHADERDEFINE_SHADOW_PSSM3= Shader3D.registerPublicDefine("SHADOWMAP_PSSM3");
			Scene3D.SHADERDEFINE_SHADOW_PCF_NO=Shader3D.registerPublicDefine("SHADOWMAP_PCF_NO");
			Scene3D.SHADERDEFINE_SHADOW_PCF1= Shader3D.registerPublicDefine("SHADOWMAP_PCF1");
			Scene3D.SHADERDEFINE_SHADOW_PCF2=Shader3D.registerPublicDefine("SHADOWMAP_PCF2");
			Scene3D.SHADERDEFINE_SHADOW_PCF3=Shader3D.registerPublicDefine("SHADOWMAP_PCF3");
			Scene3D.SHADERDEFINE_REFLECTMAP=Shader3D.registerPublicDefine("REFLECTMAP");
			
			
			Shader3D.addInclude("Lighting.glsl", this.__INCLUDESTR__("files/Lighting.glsl"));
			Shader3D.addInclude("ShadowHelper.glsl", this.__INCLUDESTR__("files/ShadowHelper.glsl"));
			Shader3D.addInclude("BRDF.glsl", this.__INCLUDESTR__("files/PBRLibs/BRDF.glsl"));
			Shader3D.addInclude("PBRUtils.glsl", this.__INCLUDESTR__("files/PBRLibs/PBRUtils.glsl"));
			Shader3D.addInclude("PBRStandardLighting.glsl", this.__INCLUDESTR__("files/PBRLibs/PBRStandardLighting.glsl"));
			Shader3D.addInclude("PBRSpecularLighting.glsl", this.__INCLUDESTR__("files/PBRLibs/PBRSpecularLighting.glsl"));
			Shader3D.addInclude("Colors.glsl", this.__INCLUDESTR__("files/postProcess/Colors.glsl"));
			Shader3D.addInclude("Sampling.glsl", this.__INCLUDESTR__("files/postProcess/Sampling.glsl"));
			Shader3D.addInclude("StdLib.glsl", this.__INCLUDESTR__("files/postProcess/StdLib.glsl"));
			
			var vs:string, ps:string;
			var attributeMap:any = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Color': VertexMesh.MESH_COLOR0, 
				'a_Normal': VertexMesh.MESH_NORMAL0, 
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0, 
				'a_Texcoord1': VertexMesh.MESH_TEXTURECOORDINATE1, 
				'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0, 
				'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0, 
				'a_Tangent0': VertexMesh.MESH_TANGENT0,
				'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
				'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0
			};
			var uniformMap:any = {
				'u_Bones': Shader3D.PERIOD_CUSTOM, 
				'u_DiffuseTexture': Shader3D.PERIOD_MATERIAL, 
				'u_SpecularTexture': Shader3D.PERIOD_MATERIAL, 
				'u_NormalTexture': Shader3D.PERIOD_MATERIAL, 
				'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseColor': Shader3D.PERIOD_MATERIAL, 
				'u_MaterialSpecular': Shader3D.PERIOD_MATERIAL, 
				'u_Shininess': Shader3D.PERIOD_MATERIAL, 
				'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
				
				'u_WorldMat': Shader3D.PERIOD_SPRITE, 
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_LightmapScaleOffset':Shader3D.PERIOD_SPRITE, 
				'u_LightMap':  Shader3D.PERIOD_SPRITE,
				
				'u_CameraPos': Shader3D.PERIOD_CAMERA, 
				
				'u_ReflectTexture': Shader3D.PERIOD_SCENE, 
				'u_ReflectIntensity': Shader3D.PERIOD_SCENE, 
				'u_FogStart':Shader3D.PERIOD_SCENE, 
				'u_FogRange': Shader3D.PERIOD_SCENE, 
				'u_FogColor': Shader3D.PERIOD_SCENE, 
				'u_DirectionLight.Color': Shader3D.PERIOD_SCENE,
				'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE,  
				'u_PointLight.Position':  Shader3D.PERIOD_SCENE, 
				'u_PointLight.Range': Shader3D.PERIOD_SCENE, 
				'u_PointLight.Color': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Position':Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Direction':Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Range':Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Spot':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Color': Shader3D.PERIOD_SCENE, 
				'u_AmbientColor': Shader3D.PERIOD_SCENE,
				'u_shadowMap1': Shader3D.PERIOD_SCENE, 
				'u_shadowMap2': Shader3D.PERIOD_SCENE, 
				'u_shadowMap3': Shader3D.PERIOD_SCENE, 
				'u_shadowPSSMDistance':  Shader3D.PERIOD_SCENE, 
				'u_lightShadowVP':  Shader3D.PERIOD_SCENE, 
				'u_shadowPCFoffset': Shader3D.PERIOD_SCENE
			};
			
			var stateMap:any = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			}
			
			vs = this.__INCLUDESTR__("files/Mesh-BlinnPhong.vs");
			ps = this.__INCLUDESTR__("files/Mesh-BlinnPhong.ps");
			var shader:Shader3D = Shader3D.add("BLINNPHONG",null,null,true);
			var subShader:SubShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, BlinnPhongMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs, ps, stateMap);
			
			
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Color': VertexMesh.MESH_COLOR0};
			uniformMap = {
				'u_MvpMatrix':  Shader3D.PERIOD_SPRITE,
				'u_Color': Shader3D.PERIOD_MATERIAL
			};
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			}
			vs = this.__INCLUDESTR__("files/line.vs");
			ps = this.__INCLUDESTR__("files/line.ps");
			shader = Shader3D.add("LineShader");
			subShader = new SubShader(attributeMap, uniformMap);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps,stateMap);
			
			//PBRStandard
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Normal': VertexMesh.MESH_NORMAL0,
				'a_Tangent0': VertexMesh.MESH_TANGENT0,
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
				'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0, 
				'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
				'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
				'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0
			};
			uniformMap = {
				'u_Bones': Shader3D.PERIOD_CUSTOM, 
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_WorldMat': Shader3D.PERIOD_SPRITE,
				'u_CameraPos': Shader3D.PERIOD_CAMERA, 
				'u_AlphaTestValue':Shader3D.PERIOD_MATERIAL, 
				'u_AlbedoColor':  Shader3D.PERIOD_MATERIAL, 
				'u_EmissionColor': Shader3D.PERIOD_MATERIAL, 
				'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
				'u_NormalTexture': Shader3D.PERIOD_MATERIAL, 
				'u_ParallaxTexture': Shader3D.PERIOD_MATERIAL, 
				'u_MetallicGlossTexture': Shader3D.PERIOD_MATERIAL, 
				'u_OcclusionTexture': Shader3D.PERIOD_MATERIAL, 
				'u_EmissionTexture': Shader3D.PERIOD_MATERIAL, 
				'u_metallic': Shader3D.PERIOD_MATERIAL, 
				'u_smoothness': Shader3D.PERIOD_MATERIAL,
				'u_smoothnessScale':Shader3D.PERIOD_MATERIAL,
				'u_occlusionStrength': Shader3D.PERIOD_MATERIAL,
				'u_normalScale': Shader3D.PERIOD_MATERIAL,
				'u_parallaxScale': Shader3D.PERIOD_MATERIAL,
				'u_TilingOffset':Shader3D.PERIOD_MATERIAL,
				'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE, 
				'u_DirectionLight.Color': Shader3D.PERIOD_SCENE,
				
				'u_PointLightMatrix': Shader3D.PERIOD_SCENE, 
				'u_PointLight.Position':  Shader3D.PERIOD_SCENE, 
				'u_PointLight.Range':  Shader3D.PERIOD_SCENE, 
				'u_PointLight.Color': Shader3D.PERIOD_SCENE, 
				
				//'u_SpotLightMatrix':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Position':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Direction':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Range':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.SpotAngle':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Color':  Shader3D.PERIOD_SCENE,
				
				'u_RangeTexture':  Shader3D.PERIOD_SCENE,
				//'u_AngleTexture':Shader3D.PERIOD_SCENE,
				
				'u_ReflectTexture':  Shader3D.PERIOD_SCENE, 
				'u_ReflectIntensity':  Shader3D.PERIOD_SCENE, 
				'u_AmbientColor':Shader3D.PERIOD_SCENE,
				'u_shadowMap1': Shader3D.PERIOD_SCENE, 
				'u_shadowMap2': Shader3D.PERIOD_SCENE, 
				'u_shadowMap3':  Shader3D.PERIOD_SCENE, 
				'u_shadowPSSMDistance': Shader3D.PERIOD_SCENE, 
				'u_lightShadowVP':  Shader3D.PERIOD_SCENE, 
				'u_shadowPCFoffset':  Shader3D.PERIOD_SCENE,
				'u_FogStart': Shader3D.PERIOD_SCENE, 
				'u_FogRange':  Shader3D.PERIOD_SCENE, 
				'u_FogColor': Shader3D.PERIOD_SCENE
			};
			
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			}
			
			vs = this.__INCLUDESTR__("files/PBRStandard.vs");
			ps = this.__INCLUDESTR__("files/PBRStandard.ps");
			shader = Shader3D.add("PBRStandard",null,null,true);
			subShader = new SubShader( attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, PBRStandardMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps,stateMap);
			
			//PBRSpecular
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Normal': VertexMesh.MESH_NORMAL0,
				'a_Tangent0': VertexMesh.MESH_TANGENT0,
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
				'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0, 
				'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
				'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0,
				'a_WorldMat': VertexMesh.MESH_WORLDMATRIX_ROW0
			};
			uniformMap = {
				'u_Bones': Shader3D.PERIOD_CUSTOM, 
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_WorldMat': Shader3D.PERIOD_SPRITE,
				'u_CameraPos': Shader3D.PERIOD_CAMERA, 
				'u_AlphaTestValue':Shader3D.PERIOD_MATERIAL, 
				'u_AlbedoColor': Shader3D.PERIOD_MATERIAL, 
				'u_SpecularColor': Shader3D.PERIOD_MATERIAL, 
				'u_EmissionColor': Shader3D.PERIOD_MATERIAL, 
				'u_AlbedoTexture':Shader3D.PERIOD_MATERIAL,
				'u_NormalTexture': Shader3D.PERIOD_MATERIAL, 
				'u_ParallaxTexture':Shader3D.PERIOD_MATERIAL, 
				'u_SpecularTexture':Shader3D.PERIOD_MATERIAL, 
				'u_OcclusionTexture':Shader3D.PERIOD_MATERIAL, 
				'u_EmissionTexture': Shader3D.PERIOD_MATERIAL, 
				'u_smoothness': Shader3D.PERIOD_MATERIAL,
				'u_smoothnessScale':Shader3D.PERIOD_MATERIAL,
				'u_occlusionStrength':Shader3D.PERIOD_MATERIAL,
				'u_normalScale': Shader3D.PERIOD_MATERIAL,
				'u_parallaxScale': Shader3D.PERIOD_MATERIAL,
				'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
				'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE, 
				'u_DirectionLight.Color':  Shader3D.PERIOD_SCENE,
				
				'u_PointLightMatrix':Shader3D.PERIOD_SCENE, 
				'u_PointLight.Position': Shader3D.PERIOD_SCENE, 
				'u_PointLight.Range': Shader3D.PERIOD_SCENE, 
				'u_PointLight.Color': Shader3D.PERIOD_SCENE, 
				
				//'u_SpotLightMatrix':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Position': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Direction':  Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Range': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.SpotAngle': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Color':  Shader3D.PERIOD_SCENE,
				
				'u_RangeTexture':  Shader3D.PERIOD_SCENE,
				//'u_AngleTexture': Shader3D.PERIOD_SCENE,
				
				'u_ReflectTexture': Shader3D.PERIOD_SCENE, 
				'u_ReflectIntensity': Shader3D.PERIOD_SCENE,
				'u_AmbientColor': Shader3D.PERIOD_SCENE,
				'u_shadowMap1':  Shader3D.PERIOD_SCENE, 
				'u_shadowMap2': Shader3D.PERIOD_SCENE, 
				'u_shadowMap3': Shader3D.PERIOD_SCENE, 
				'u_shadowPSSMDistance':Shader3D.PERIOD_SCENE, 
				'u_lightShadowVP': Shader3D.PERIOD_SCENE, 
				'u_shadowPCFoffset':Shader3D.PERIOD_SCENE,
				'u_FogStart': Shader3D.PERIOD_SCENE, 
				'u_FogRange': Shader3D.PERIOD_SCENE, 
				'u_FogColor': Shader3D.PERIOD_SCENE
			};
			
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			}
			
			vs = this.__INCLUDESTR__("files/PBRSpecular.vs");
			ps = this.__INCLUDESTR__("files/PBRSpecular.ps");
			shader = Shader3D.add("PBRSpecular",null,null,true);
			subShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, PBRSpecularMaterial.shaderDefines);
			shader.addSubShader(subShader);
			
			subShader.addShaderPass(vs, ps,stateMap);
			
			//unlit
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Color': VertexMesh.MESH_COLOR0, 
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0, 
				'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0, 
				'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
				'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0
			};
			uniformMap = {
				'u_Bones':Shader3D.PERIOD_CUSTOM, 
				'u_AlbedoTexture':Shader3D.PERIOD_MATERIAL,
				'u_AlbedoColor': Shader3D.PERIOD_MATERIAL, 
				'u_TilingOffset':  Shader3D.PERIOD_MATERIAL,
				'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL, 
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_FogStart': Shader3D.PERIOD_SCENE, 
				'u_FogRange': Shader3D.PERIOD_SCENE, 
				'u_FogColor': Shader3D.PERIOD_SCENE
			};
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			}
			
			vs = this.__INCLUDESTR__("files/Unlit.vs");
			ps = this.__INCLUDESTR__("files/Unlit.ps");
			shader = Shader3D.add("Unlit",null,null,true);
			subShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, UnlitMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs, ps,stateMap);
			
			//meshEffect
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0, 
				'a_BoneWeights': VertexMesh.MESH_BLENDWEIGHT0, 
				'a_BoneIndices': VertexMesh.MESH_BLENDINDICES0,
				'a_MvpMatrix': VertexMesh.MESH_MVPMATRIX_ROW0
			};
			uniformMap = {
				'u_Bones': Shader3D.PERIOD_CUSTOM, 
				'u_AlbedoTexture': Shader3D.PERIOD_MATERIAL,
				'u_AlbedoColor': Shader3D.PERIOD_MATERIAL, 
				'u_TilingOffset':Shader3D.PERIOD_MATERIAL,
				'u_AlphaTestValue': Shader3D.PERIOD_MATERIAL, 
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_FogStart':Shader3D.PERIOD_SCENE, 
				'u_FogRange': Shader3D.PERIOD_SCENE, 
				'u_FogColor': Shader3D.PERIOD_SCENE
			};
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			}
			vs = this.__INCLUDESTR__("files/Effect.vs");
			ps = this.__INCLUDESTR__("files/Effect.ps");
			shader = Shader3D.add("Effect",null,null,true);
			subShader = new SubShader(attributeMap, uniformMap, SkinnedMeshSprite3D.shaderDefines, EffectMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps,stateMap);
			
			//ShurikenParticle
			attributeMap = {
				'a_CornerTextureCoordinate': VertexShuriKenParticle.PARTICLE_CORNERTEXTURECOORDINATE0, 
				'a_MeshPosition': VertexShuriKenParticle.PARTICLE_POSITION0,
				'a_MeshColor': VertexShuriKenParticle.PARTICLE_COLOR0, 
				'a_MeshTextureCoordinate': VertexShuriKenParticle.PARTICLE_TEXTURECOORDINATE0,
				'a_ShapePositionStartLifeTime': VertexShuriKenParticle.PARTICLE_SHAPEPOSITIONSTARTLIFETIME, 
				'a_DirectionTime': VertexShuriKenParticle.PARTICLE_DIRECTIONTIME, 
				'a_StartColor': VertexShuriKenParticle.PARTICLE_STARTCOLOR0, 
				'a_EndColor': VertexShuriKenParticle.PARTICLE_ENDCOLOR0, 
				'a_StartSize': VertexShuriKenParticle.PARTICLE_STARTSIZE, 
				'a_StartRotation0': VertexShuriKenParticle.PARTICLE_STARTROTATION, 
				'a_StartSpeed': VertexShuriKenParticle.PARTICLE_STARTSPEED, 
				'a_Random0': VertexShuriKenParticle.PARTICLE_RANDOM0, 
				'a_Random1': VertexShuriKenParticle.PARTICLE_RANDOM1, 
				'a_SimulationWorldPostion': VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDPOSTION,
				'a_SimulationWorldRotation': VertexShuriKenParticle.PARTICLE_SIMULATIONWORLDROTATION};
			uniformMap = {
				'u_Tintcolor': Shader3D.PERIOD_MATERIAL, 
				'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
				'u_texture':  Shader3D.PERIOD_MATERIAL, 
				'u_WorldPosition': Shader3D.PERIOD_SPRITE, 
				'u_WorldRotation': Shader3D.PERIOD_SPRITE, 
				'u_PositionScale': Shader3D.PERIOD_SPRITE, 
				'u_SizeScale':  Shader3D.PERIOD_SPRITE, 
				'u_ScalingMode': Shader3D.PERIOD_SPRITE, 
				'u_Gravity': Shader3D.PERIOD_SPRITE, 
				'u_ThreeDStartRotation': Shader3D.PERIOD_SPRITE, 
				'u_StretchedBillboardLengthScale': Shader3D.PERIOD_SPRITE, 
				'u_StretchedBillboardSpeedScale':Shader3D.PERIOD_SPRITE, 
				'u_SimulationSpace':Shader3D.PERIOD_SPRITE, 
				'u_CurrentTime': Shader3D.PERIOD_SPRITE, 
				'u_ColorOverLifeGradientAlphas':Shader3D.PERIOD_SPRITE, 
				'u_ColorOverLifeGradientColors':Shader3D.PERIOD_SPRITE, 
				'u_MaxColorOverLifeGradientAlphas': Shader3D.PERIOD_SPRITE, 
				'u_MaxColorOverLifeGradientColors': Shader3D.PERIOD_SPRITE, 
				'u_VOLVelocityConst': Shader3D.PERIOD_SPRITE,
				'u_VOLVelocityGradientX':Shader3D.PERIOD_SPRITE, 
				'u_VOLVelocityGradientY': Shader3D.PERIOD_SPRITE, 
				'u_VOLVelocityGradientZ': Shader3D.PERIOD_SPRITE, 
				'u_VOLVelocityConstMax': Shader3D.PERIOD_SPRITE, 
				'u_VOLVelocityGradientMaxX': Shader3D.PERIOD_SPRITE, 
				'u_VOLVelocityGradientMaxY':Shader3D.PERIOD_SPRITE, 
				'u_VOLVelocityGradientMaxZ':Shader3D.PERIOD_SPRITE, 
				'u_VOLSpaceType':  Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradient': Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradientX': Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradientY': Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradientZ': Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradientMax': Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradientMaxX': Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradientMaxY': Shader3D.PERIOD_SPRITE, 
				'u_SOLSizeGradientMaxZ':Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityConst':Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityConstSeprarate':Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradient': Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradientX':  Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradientY':  Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradientZ':Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityConstMax':Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityConstMaxSeprarate':  Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradientMax':  Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradientMaxX': Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradientMaxY':Shader3D.PERIOD_SPRITE, 
				'u_ROLAngularVelocityGradientMaxZ':  Shader3D.PERIOD_SPRITE,
				'u_ROLAngularVelocityGradientMaxW': Shader3D.PERIOD_SPRITE, 
				'u_TSACycles':  Shader3D.PERIOD_SPRITE, 
				'u_TSASubUVLength': Shader3D.PERIOD_SPRITE, 
				'u_TSAGradientUVs': Shader3D.PERIOD_SPRITE, 
				'u_TSAMaxGradientUVs':  Shader3D.PERIOD_SPRITE, 
				'u_CameraPos': Shader3D.PERIOD_CAMERA, 
				'u_CameraDirection':  Shader3D.PERIOD_CAMERA, 
				'u_CameraUp': Shader3D.PERIOD_CAMERA, 
				'u_View': Shader3D.PERIOD_CAMERA, 
				'u_Projection': Shader3D.PERIOD_CAMERA,
				'u_FogStart': Shader3D.PERIOD_SCENE, 
				'u_FogRange': Shader3D.PERIOD_SCENE, 
				'u_FogColor': Shader3D.PERIOD_SCENE
			};
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			};
			vs = this.__INCLUDESTR__("files/ParticleShuriKen.vs");
			ps = this.__INCLUDESTR__("files/ParticleShuriKen.ps");
			shader = Shader3D.add("PARTICLESHURIKEN");
			subShader = new SubShader(attributeMap, uniformMap, ShuriKenParticle3D.shaderDefines, ShurikenParticleMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps,stateMap);
			
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0};
			uniformMap = {
				'u_TintColor': Shader3D.PERIOD_MATERIAL,
				'u_Exposure': Shader3D.PERIOD_MATERIAL,
				'u_Rotation': Shader3D.PERIOD_MATERIAL, 
				'u_CubeTexture': Shader3D.PERIOD_MATERIAL, 
				'u_MvpMatrix': Shader3D.PERIOD_CAMERA};//TODO:优化
			vs = this.__INCLUDESTR__("files/SkyBox.vs");
			ps = this.__INCLUDESTR__("files/SkyBox.ps");
			shader =Shader3D.add("SkyBox");
			subShader = new SubShader(attributeMap, uniformMap);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps);
			
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0};
			uniformMap = {
				'u_SunSize': Shader3D.PERIOD_MATERIAL, 
				'u_SunSizeConvergence': Shader3D.PERIOD_MATERIAL, 
				'u_AtmosphereThickness': Shader3D.PERIOD_MATERIAL, 
				'u_SkyTint': Shader3D.PERIOD_MATERIAL,
				'u_GroundTint': Shader3D.PERIOD_MATERIAL,
				'u_Exposure':  Shader3D.PERIOD_MATERIAL,
				'u_MvpMatrix':  Shader3D.PERIOD_CAMERA,//TODO:优化
				'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE, 
				'u_DirectionLight.Color':Shader3D.PERIOD_SCENE
			};
			vs = this.__INCLUDESTR__("files/SkyBoxProcedural.vs");
			ps = this.__INCLUDESTR__("files/SkyBoxProcedural.ps");
			shader =Shader3D.add("SkyBoxProcedural");
			subShader = new SubShader(attributeMap, uniformMap,null,SkyProceduralMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps);
			
			//extendTerrain的shader
			 attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Normal': VertexMesh.MESH_NORMAL0, 
				'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0
			};
             uniformMap = {
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_WorldMat': Shader3D.PERIOD_SPRITE, 
				'u_CameraPos': Shader3D.PERIOD_CAMERA, 
				'u_LightmapScaleOffset': Shader3D.PERIOD_SPRITE, 
				'u_LightMap':Shader3D.PERIOD_SPRITE, 
				'u_SplatAlphaTexture': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseTexture1': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseTexture2':  Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseTexture3':  Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseTexture4': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseTexture5': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseScaleOffset1': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseScaleOffset2': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseScaleOffset3': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseScaleOffset4': Shader3D.PERIOD_MATERIAL, 
				'u_DiffuseScaleOffset5': Shader3D.PERIOD_MATERIAL, 
				'u_FogStart': Shader3D.PERIOD_SCENE, 
				'u_FogRange': Shader3D.PERIOD_SCENE, 
				'u_FogColor': Shader3D.PERIOD_SCENE, 
				'u_DirectionLight.Direction': Shader3D.PERIOD_SCENE, 
				'u_DirectionLight.Color': Shader3D.PERIOD_SCENE, 
				'u_PointLight.Position': Shader3D.PERIOD_SCENE, 
				'u_PointLight.Range': Shader3D.PERIOD_SCENE, 
				'u_PointLight.Attenuation':  Shader3D.PERIOD_SCENE, 
				'u_PointLight.Color': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Position': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Direction': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Range': Shader3D.PERIOD_SCENE, 
				'u_SpotLight.Spot': Shader3D.PERIOD_SCENE, 
				
				'u_SpotLight.Color': Shader3D.PERIOD_SCENE, 
				'u_AmbientColor':Shader3D.PERIOD_SCENE,
				'u_shadowMap1': Shader3D.PERIOD_SCENE, 
				'u_shadowMap2':  Shader3D.PERIOD_SCENE, 
				'u_shadowMap3': Shader3D.PERIOD_SCENE, 
				'u_shadowPSSMDistance': Shader3D.PERIOD_SCENE, 
				'u_lightShadowVP': Shader3D.PERIOD_SCENE, 
				'u_shadowPCFoffset': Shader3D.PERIOD_SCENE
			};
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			};
            vs = this.__INCLUDESTR__("files/extendTerrain.vs");
            ps = this.__INCLUDESTR__("files/extendTerrain.ps");
			shader = Shader3D.add("ExtendTerrain");
			subShader = new SubShader(attributeMap, uniformMap,RenderableSprite3D.shaderDefines,ExtendTerrainMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps,stateMap);
			
			//Trail
			attributeMap = {
				'a_Position'    : VertexTrail.TRAIL_POSITION0,
				'a_OffsetVector': VertexTrail.TRAIL_OFFSETVECTOR,
				'a_Texcoord0X'  : VertexTrail.TRAIL_TEXTURECOORDINATE0X,
				'a_Texcoord0Y'  : VertexTrail.TRAIL_TEXTURECOORDINATE0Y,
				'a_BirthTime'   : VertexTrail.TRAIL_TIME0,
				'a_Color'   : VertexTrail.TRAIL_COLOR
			};
			uniformMap = {
				'u_MvpMatrix': Shader3D.PERIOD_SPRITE, 
				'u_View': Shader3D.PERIOD_CAMERA,
				'u_Projection': Shader3D.PERIOD_CAMERA,
				'u_TilingOffset': Shader3D.PERIOD_MATERIAL,
				'u_MainTexture': Shader3D.PERIOD_MATERIAL, 
				'u_MainColor': Shader3D.PERIOD_MATERIAL,
				'u_CurTime' : Shader3D.PERIOD_SPRITE,
				'u_LifeTime' : Shader3D.PERIOD_SPRITE,
				'u_WidthCurve' : Shader3D.PERIOD_SPRITE,
				'u_WidthCurveKeyLength' : Shader3D.PERIOD_SPRITE,
				'u_GradientColorkey' : Shader3D.PERIOD_SPRITE,
				'u_GradientAlphakey' : Shader3D.PERIOD_SPRITE
			};
			stateMap = {
				's_Cull':Shader3D.RENDER_STATE_CULL, 
				's_Blend':Shader3D.RENDER_STATE_BLEND,
				's_BlendSrc':Shader3D.RENDER_STATE_BLEND_SRC,
				's_BlendDst':Shader3D.RENDER_STATE_BLEND_DST,
				's_DepthTest':Shader3D.RENDER_STATE_DEPTH_TEST,
				's_DepthWrite':Shader3D.RENDER_STATE_DEPTH_WRITE
			};
            vs = this.__INCLUDESTR__("files/Trail.vs");
            ps = this.__INCLUDESTR__("files/Trail.ps");
            shader = Shader3D.add("Trail");
			subShader = new SubShader(attributeMap, uniformMap, TrailSprite3D.shaderDefines, TrailMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs,ps,stateMap);
			
			//WaterPrimary
			attributeMap = {
				'a_Position': VertexMesh.MESH_POSITION0, 
				'a_Normal': VertexMesh.MESH_NORMAL0,
				'a_Tangent0': VertexMesh.MESH_TANGENT0
			};
			uniformMap = {
				'u_MvpMatrix':Shader3D.PERIOD_SPRITE, 
				'u_WorldMat': Shader3D.PERIOD_SPRITE,
				'u_CameraPos': Shader3D.PERIOD_CAMERA,
				'u_Time': Shader3D.PERIOD_SCENE, 
				'u_MainTexture': Shader3D.PERIOD_MATERIAL, 
				'u_NormalTexture':Shader3D.PERIOD_MATERIAL, 
				'u_HorizonColor':Shader3D.PERIOD_MATERIAL,
				'u_WaveScale' : Shader3D.PERIOD_MATERIAL,
				'u_WaveSpeed' : Shader3D.PERIOD_MATERIAL
			};
				
			vs = this.__INCLUDESTR__("files/WaterPrimary.vs");
			ps = this.__INCLUDESTR__("files/WaterPrimary.ps");
			shader = Shader3D.add("WaterPrimary");
			subShader = new SubShader(attributeMap, uniformMap, null, WaterPrimaryMaterial.shaderDefines);
			shader.addSubShader(subShader);
			subShader.addShaderPass(vs, ps);
			
			
			//BlitScreen
			attributeMap = {
				'a_PositionTexcoord': VertexMesh.MESH_POSITION0
			};
			uniformMap = {
				'u_MainTex': Shader3D.PERIOD_MATERIAL
			};
				
			vs = this.__INCLUDESTR__("files/BlitScreen.vs");
			ps = this.__INCLUDESTR__("files/BlitScreen.ps");
			shader = Shader3D.add("BlitScreen");
			subShader = new SubShader(attributeMap, uniformMap, null,null);
			shader.addSubShader(subShader);
			var shaderPass:ShaderPass = subShader.addShaderPass(vs, ps);
			var renderState:RenderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
			
			
			//PostProcessBloom
			attributeMap = {
				'a_PositionTexcoord': VertexMesh.MESH_POSITION0
			};
			uniformMap = {
				'u_MainTex':Shader3D.PERIOD_MATERIAL, 
				'u_BloomTex': Shader3D.PERIOD_MATERIAL,
				'u_AutoExposureTex': Shader3D.PERIOD_MATERIAL,
				'u_MainTex_TexelSize': Shader3D.PERIOD_MATERIAL, 
				'u_SampleScale': Shader3D.PERIOD_MATERIAL, 
				'u_Threshold':Shader3D.PERIOD_MATERIAL,
				'u_Params' : Shader3D.PERIOD_MATERIAL
			};
			shader = Shader3D.add("PostProcessBloom",attributeMap,uniformMap);
			
			//subShader0
			subShader = new SubShader(null, null, null, null);
			shader.addSubShader(subShader);
			shaderPass = subShader.addShaderPass(this.__INCLUDESTR__("files/postProcess/Bloom.vs"), this.__INCLUDESTR__("files/postProcess/BloomPrefilter13.ps"));
			renderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
			
			//subShader1
			subShader = new SubShader(null, null, null, null);
			shader.addSubShader(subShader);
			shaderPass = subShader.addShaderPass(this.__INCLUDESTR__("files/postProcess/Bloom.vs"), this.__INCLUDESTR__("files/postProcess/BloomPrefilter4.ps"));
			renderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
			
			//subShader2
			subShader = new SubShader(null, null, null, null);
			shader.addSubShader(subShader);
			shaderPass = subShader.addShaderPass(this.__INCLUDESTR__("files/postProcess/Bloom.vs"), this.__INCLUDESTR__("files/postProcess/BloomDownsample13.ps"));
			renderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
			
			//subShader3
			subShader = new SubShader(null, null, null, null);
			shader.addSubShader(subShader);
			shaderPass = subShader.addShaderPass(this.__INCLUDESTR__("files/postProcess/Bloom.vs"), this.__INCLUDESTR__("files/postProcess/BloomDownsample4.ps"));
			renderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
			
			//subShader4
			subShader = new SubShader(null, null, null, null);
			shader.addSubShader(subShader);
			shaderPass = subShader.addShaderPass(this.__INCLUDESTR__("files/postProcess/Bloom.vs"), this.__INCLUDESTR__("files/postProcess/BloomUpsampleTent.ps"));
			renderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
			
			//subShader5
			subShader = new SubShader(null, null, null, null);
			shader.addSubShader(subShader);
			shaderPass = subShader.addShaderPass(this.__INCLUDESTR__("files/postProcess/Bloom.vs"), this.__INCLUDESTR__("files/postProcess/BloomUpsampleBox.ps"));
			renderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
			
			
			
			
			//PostProcessBloom
			attributeMap = {
				'a_PositionTexcoord': VertexMesh.MESH_POSITION0
			};
			uniformMap = {
				'u_MainTex':Shader3D.PERIOD_MATERIAL, 
				'u_BloomTex': Shader3D.PERIOD_MATERIAL,
				'u_AutoExposureTex': Shader3D.PERIOD_MATERIAL,
				'u_Bloom_DirtTileOffset': Shader3D.PERIOD_MATERIAL, 
				'u_Bloom_DirtTex': Shader3D.PERIOD_MATERIAL, 
				'u_BloomTex_TexelSize': Shader3D.PERIOD_MATERIAL, 
				'u_Bloom_Settings':Shader3D.PERIOD_MATERIAL,
				'u_Bloom_Color' : Shader3D.PERIOD_MATERIAL
			};
			shader = Shader3D.add("PostProcessComposite",attributeMap,uniformMap);
			
			subShader = new SubShader(null, null, null, PostProcess.shaderDefines);
			shader.addSubShader(subShader);
			shaderPass = subShader.addShaderPass(this.__INCLUDESTR__("files/postProcess/Composite.vs"), this.__INCLUDESTR__("files/postProcess/Composite.ps"));
			renderState = shaderPass.renderState;
			renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
			renderState.depthWrite = false;
			renderState.cull = RenderState.CULL_NONE;
			renderState.blend = RenderState.BLEND_DISABLE;
		}
	}

