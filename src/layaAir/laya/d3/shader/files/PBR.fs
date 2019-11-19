#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif

#include "Lighting.glsl";
#include "BRDF02.glsl";
//环境光，没有GI的时候才会起作用
uniform vec3 u_AmbientColor;

//alphaTest
#ifdef ALPHATEST
	uniform float u_AlphaTestValue;
#endif

uniform vec4 u_AlbedoColor;

#ifdef NORMALTEXTURE
	uniform sampler2D u_NormalTexture;
#endif
//漫反射贴图
#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif

#ifdef METALLICGLOSSTEXTURE
	uniform sampler2D u_MetallicGlossTexture;
#endif

uniform float u_smoothness;
uniform float u_smoothnessScale;

uniform float u_metallic;
//高差图
#ifdef PARALLAXTEXTURE
	uniform sampler2D u_ParallaxTexture;
#endif
//遮挡图
#ifdef OCCLUSIONTEXTURE
	uniform sampler2D u_OcclusionTexture;
	uniform sampler2D u_occlusionStrength;
#endif
//自发光
#ifdef EMISSIONTEXTURE
	uniform sampler2D u_EmissionTexture;
#endif
uniform vec4 u_EmissionColor;


#if defined(DIFFUSEMAP)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
	varying vec2 v_Texcoord0;
#endif

#ifdef LIGHTMAP
	varying vec2 v_LightMapUV;
	uniform sampler2D u_LightMap;
#endif

#if defined(REFLECTIONMAP)
	uniform samplerCube u_ReflectTexture;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(NORMALMAP)||defined(PARALLAXMAP)
	varying vec3 v_Normal; 
#endif
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			uniform DirectionLight u_DirectionLight;
		#endif
		#ifdef POINTLIGHT
			uniform PointLight u_PointLight;
		#endif
		#ifdef SPOTLIGHT
			uniform SpotLight u_SpotLight;
		#endif
	#else
		uniform mat4 u_View;
		uniform vec4 u_ProjectionParams;
		uniform vec4 u_Viewport;
		uniform int u_DirationLightCount;
		uniform sampler2D u_LightBuffer;
		uniform sampler2D u_LightClusterBuffer;
	#endif
#endif
//后面考虑宏TODO
varying vec3 v_eyeVec;

#if defined(NORMALMAP)||defined(PARALLAXMAP)
	varying vec3 v_Tangent;
	varying vec3 v_Binormal;
#endif

//后面考虑宏TODO
varying vec3 v_PositionWorld;


#include "ShadowHelper.glsl"
varying float v_posViewZ;
#ifdef RECEIVESHADOW
	#if defined(SHADOWMAP_PSSM2)||defined(SHADOWMAP_PSSM3)
		uniform mat4 u_lightShadowVP[4];
	#endif
	#ifdef SHADOWMAP_PSSM1 
		varying vec4 v_lightMVPPos;
	#endif
#endif
void main_castShadow()
{
	//gl_FragColor=vec4(v_posViewZ,0.0,0.0,1.0);
	gl_FragColor=packDepth(v_posViewZ);
	#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
		float alpha = texture2D(u_DiffuseTexture,v_Texcoord0).w;
		if( alpha < u_AlphaTestValue )
		{
			discard;
		}
	#endif
}

#include "PBRUtils03.glsl";

void main_normal()
{
	vec2 uv;vec3 normal;vec3 binormal;vec3 tangent;vec3 normalWorld;vec3 eyeVec; vec3 posworld;
	#if defined(DIFFUSEMAP)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
		uv = v_Texcoord0;
	#endif
	//FSSetup
	//LayaParallax计算TODO，目前先不考虑
	float alpha = LayaAlpha(uv);
	#ifdef ALPHATEST
		if(alpha<u_AlphaTestValue)
			discard;//Discard使用问题
	#endif
	 LayaFragmentCommonData o;
	 //分流派TODO
	 o = LayaMetallicSetup(uv);
	
	#if defined(NORMALMAP)||defined(PARALLAXMAP)
		tangent = v_Tangent;
		binormal = v_Binormal;
	#endif
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(NORMALMAP)||defined(PARALLAXMAP)
		normal = v_Normal;	
		normalWorld = LayaPerPixelWorldNormal(uv,normal,binormal,tangent);
	#endif
	eyeVec = normalize(v_eyeVec);
	posworld = v_PositionWorld;
	 //unity在这儿还做了Alpha预乘
	 //LayaPreMultiplyAlpha
	//阴影TODO
	float occlusion = LayaOcclusion(uv);
	//GI间接光
	vec4 color = vec4(0.0);
	LayaGI gi =LayaFragmentGI(o,eyeVec,occlusion,normalWorld);
	color = BRDF1_Laya_PBS_GI(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,gi);
	//下一步计算直接光
	
	float shadowValue = 1.0;
	 #ifdef RECEIVESHADOW
		#ifdef SHADOWMAP_PSSM3
			shadowValue = getShadowPSSM3(u_shadowMap1,u_shadowMap2,u_shadowMap3,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
		#endif
		#ifdef SHADOWMAP_PSSM2
			shadowValue = getShadowPSSM2(u_shadowMap1,u_shadowMap2,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
		#endif 
		#ifdef SHADOWMAP_PSSM1
			shadowValue = getShadowPSSM1(u_shadowMap1,v_lightMVPPos,u_shadowPSSMDistance,u_shadowPCFoffset,v_posViewZ,0.001);
		#endif
	#endif

	 #ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			LayaLight light = LayaAirBRDFDirectionLight(u_DirectionLight,shadowValue);
			 color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
		#endif
	
		#ifdef POINTLIGHT
			LayaLight light = LayaAirBRDFPointLight(posworld,normalWorld,u_PointLight,shadowValue);
			color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
		#endif
		
		#ifdef SPOTLIGHT
		    LayaLight light = LayaAirBRDFSpotLight(posworld,normalWorld,u_SpotLight,shadowValue);
			color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
		#endif
	#else
	 	#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				LayaLight light = LayaAirBRDFDirectionLight(directionLight,shadowValue);
			 	color+=BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
			}
	 	#endif
		#if defined(POINTLIGHT)||defined(SPOTLIGHT)
			ivec4 clusterInfo =getClusterInfo(u_LightClusterBuffer,u_View,u_Viewport, v_PositionWorld,gl_FragCoord,u_ProjectionParams);
			#ifdef POINTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.x)//PointLightCount
						break;
					PointLight pointLight = getPointLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					LayaLight light = LayaAirBRDFPointLight(posworld,normalWorld,pointLight,shadowValue);
					color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
				}
			#endif
			#ifdef SPOTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.y)//SpotLightCount
						break;
					SpotLight spotLight = getSpotLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					LayaLight light = LayaAirBRDFSpotLight(posworld,normalWorld,u_SpotLight,shadowValue);
					color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
				}
			#endif
		#endif
	 #endif

	color.rgb += LayaEmission(uv);
	gl_FragColor = vec4(color.rgb,alpha);
	#ifdef FOG
		float lerpFact=clamp((1.0/gl_FragCoord.w-u_FogStart)/u_FogRange,0.0,1.0);
		gl_FragColor.rgb=mix(gl_FragColor.rgb,u_FogColor,lerpFact);
	#endif
	

}

void main()
{
	#ifdef CASTSHADOW		
		main_castShadow();
	#else
		main_normal();
	#endif  
}