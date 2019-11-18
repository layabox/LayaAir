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

#if defined(INDIRECTLIGHT)&&defined(LOWPLAT)
	varying vec3 v_ambientDiffuse;
#endif

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

#include "PBRUtils02.glsl";
#include "PBRUtils03.glsl";
LayaLight directLight()
{
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		vec3 dif,spe;
		#ifdef SPECULARMAP
			vec3 gloss=texture2D(u_SpecularTexture, v_Texcoord0).rgb;
		#else
			#ifdef DIFFUSEMAP
				vec3 gloss=vec3(difTexColor.a);
			#else
				vec3 gloss=vec3(1.0);
			#endif
		#endif
	#endif
}
void main_normal()
{
	vec2 uv;vec3 normal;vec3 binormal;vec3 tangent;vec3 normalWorld;vec3 eyevec; vec3 posworld;
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
		normalWorld = LayaPerPixelWorldNormal(uv, tangentToWorld);
	#endif
	eyevec = LayaNormalizePerPixelNormal(v_eyeVec);
	posworld = v_PositionWorld;
	 //unity在这儿还做了Alpha预乘
	 //LayaPreMultiplyAlpha
	//阴影TODO
	float occlusion = LayaOcclusion(uv);
	//GI间接光
	LayaGI gi =LayaFragmentGI(o,occlusion,normalWorld);

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
	

}

void test(out vec4 color)
{
	color.r = 1.0;
}

void main()
{
	vec4 col = vec4(0.0,0.0,0.0,1.0);
	test(col);
	gl_FragColor = col;
}