#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif

#include "Lighting.glsl";


//环境光，没有GI的时候才会起作用
uniform vec4 u_DiffuseColor;
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

#if defined(INDIRECTLIGHT)&&defined(NOLOWPLAT)
	uniform vec4 u_SHAr;
	uniform vec4 u_SHAg;
	uniform vec4 u_SHAb;
	uniform vec4 u_SHBr;
	uniform vec4 u_SHBg;
	uniform vec4 u_SHBb;
	uniform vec4 u_SHC;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(NORMALMAP)||defined(PARALLAXMAP)
	varying vec3 v_Normal; 
#endif

//后面考虑宏TODO
varying vec3 v_eyeVec;

#if (defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(NORMALMAP)||defined(PARALLAXMAP))
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

//#include "PBRUtils02.glsl";
#include "PBRUtils03.glsl";
void main_normal()
{
	vec2 uv;
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