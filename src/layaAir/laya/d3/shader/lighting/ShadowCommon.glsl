#if !defined(ShadowCommon_lib)
    #define ShadowCommon_lib

    #ifndef GRAPHICS_API_GLES3
	#define NO_NATIVE_SHADOWMAP
    #endif // GRAPHICS_API_GLES3

    #if defined(NO_NATIVE_SHADOWMAP)
	#define TEXTURE2D_SHADOW(textureName)		     uniform mediump sampler2D textureName
	#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) (texture2D(textureName, coord3.xy).r < coord3.z ? 0.0 : 1.0)
	#define TEXTURE2D_SHADOW_PARAM(shadowMap)	     mediump sampler2D shadowMap
    #else // NO_NATIVE_SHADOWMAP
	#define TEXTURE2D_SHADOW(textureName)		     uniform mediump sampler2DShadow textureName
	#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) textureLod(textureName, coord3, 0.0)
	#define TEXTURE2D_SHADOW_PARAM(shadowMap)	     mediump sampler2DShadow shadowMap
    #endif // NO_NATIVE_SHADOWMAP

    #ifdef ENUNIFORMBLOCK

uniform Shadow
{
    vec3 u_ShadowLightDirection;
    vec4 u_ShadowBias;
    vec4 u_ShadowSplitSpheres[4];
    mat4 u_ShadowMatrices[4];
    vec4 u_ShadowMapSize;
    vec4 u_ShadowParams;
    vec4 u_SpotShadowMapSize;
    mat4 u_SpotViewProjectMatrix;
};
TEXTURE2D_SHADOW(u_ShadowMap);
TEXTURE2D_SHADOW(u_SpotShadowMap);

    #else // ENUNIFORMBLOCK

uniform vec3 u_ShadowLightDirection;
uniform vec4 u_ShadowBias;
uniform vec4 u_ShadowSplitSpheres[4];
uniform mat4 u_ShadowMatrices[4];
uniform vec4 u_ShadowMapSize;
uniform vec4 u_ShadowParams;
uniform vec4 u_SpotShadowMapSize;
uniform mat4 u_SpotViewProjectMatrix;

TEXTURE2D_SHADOW(u_ShadowMap);
TEXTURE2D_SHADOW(u_SpotShadowMap);

    #endif // ENUNIFORMBLOCK

#endif // ShadowCommon_lib