// 兼容WGSL
#if !defined(ShadowSampler_lib)
    #define ShadowSampler_lib

    // 计算阴影
    #ifdef RECEIVESHADOW

	#include "ShadowSampleTent.glsl";

	#include "ShadowCommon.glsl"

	#define ShadowStrength	   u_ShadowParams.x
	#define SpotShadowStrength u_ShadowParams.y

    // 平行光阴影
	#ifdef SHADOW
	    #define CALCULATE_SHADOWS
varying vec4 v_ShadowCoord; 

float sampleShdowMapFiltered4(vec3 shadowCoord, vec4 shadowMapSize)
{
    float attenuation;
    vec4 attenuation4;
    vec2 offset = shadowMapSize.xy / 2.0;
    vec3 shadowCoord0 = shadowCoord + vec3(-offset, 0.0);
    vec3 shadowCoord1 = shadowCoord + vec3(offset.x, -offset.y, 0.0);
    vec3 shadowCoord2 = shadowCoord + vec3(-offset.x, offset.y, 0.0);
    vec3 shadowCoord3 = shadowCoord + vec3(offset, 0.0);
    attenuation4.x = SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, shadowCoord0);
    attenuation4.y = SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, shadowCoord1);
    attenuation4.z = SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, shadowCoord2);
    attenuation4.w = SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, shadowCoord3);
    attenuation = dot(attenuation4, vec4(0.25));
    return attenuation;
}

float sampleShdowMapFiltered9(vec3 shadowCoord, vec4 shadowmapSize)
{
    float attenuation;
    float fetchesWeights[9];
    vec2 fetchesUV[9];
    sampleShadowComputeSamplesTent5x5(shadowmapSize, shadowCoord.xy, fetchesWeights, fetchesUV);
    attenuation = fetchesWeights[0] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[0].xy, shadowCoord.z));
    attenuation += fetchesWeights[1] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[1].xy, shadowCoord.z));
    attenuation += fetchesWeights[2] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[2].xy, shadowCoord.z));
    attenuation += fetchesWeights[3] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[3].xy, shadowCoord.z));
    attenuation += fetchesWeights[4] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[4].xy, shadowCoord.z));
    attenuation += fetchesWeights[5] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[5].xy, shadowCoord.z));
    attenuation += fetchesWeights[6] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[6].xy, shadowCoord.z));
    attenuation += fetchesWeights[7] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[7].xy, shadowCoord.z));
    attenuation += fetchesWeights[8] * SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, vec3(fetchesUV[8].xy, shadowCoord.z));
    return attenuation;
}

	#endif // SHADOW

	// 聚光灯阴影
	#ifdef SHADOW_SPOT
	    #define CALCULATE_SPOTSHADOWS
varying vec4 v_SpotShadowCoord;

float sampleSpotShdowMapFiltered4(vec3 shadowCoord, vec4 shadowMapSize)
{
    float attenuation;
    vec4 attenuation4;
    vec2 offset = shadowMapSize.xy / 2.0;
    vec3 shadowCoord0 = shadowCoord + vec3(-offset, 0.0);
    vec3 shadowCoord1 = shadowCoord + vec3(offset.x, -offset.y, 0.0);
    vec3 shadowCoord2 = shadowCoord + vec3(-offset.x, offset.y, 0.0);
    vec3 shadowCoord3 = shadowCoord + vec3(offset, 0.0);
    attenuation4.x = SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, shadowCoord0);
    attenuation4.y = SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, shadowCoord1);
    attenuation4.z = SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, shadowCoord2);
    attenuation4.w = SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, shadowCoord3);
    attenuation = dot(attenuation4, vec4(0.25));
    return attenuation;
}

float sampleSpotShdowMapFiltered9(vec3 shadowCoord, vec4 shadowmapSize)
{
    float attenuation;
    float fetchesWeights[9];
    vec2 fetchesUV[9];
    sampleShadowComputeSamplesTent5x5(shadowmapSize, shadowCoord.xy, fetchesWeights, fetchesUV);
    attenuation = fetchesWeights[0] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[0].xy, shadowCoord.z));
    attenuation += fetchesWeights[1] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[1].xy, shadowCoord.z));
    attenuation += fetchesWeights[2] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[2].xy, shadowCoord.z));
    attenuation += fetchesWeights[3] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[3].xy, shadowCoord.z));
    attenuation += fetchesWeights[4] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[4].xy, shadowCoord.z));
    attenuation += fetchesWeights[5] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[5].xy, shadowCoord.z));
    attenuation += fetchesWeights[6] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[6].xy, shadowCoord.z));
    attenuation += fetchesWeights[7] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[7].xy, shadowCoord.z));
    attenuation += fetchesWeights[8] * SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, vec3(fetchesUV[8].xy, shadowCoord.z));
    return attenuation;
}

	#endif // SHADOW_SPOT

    #endif // RECEIVESHADOW

    // 计算平行光阴影
    #if defined(CALCULATE_SHADOWS)

	#ifdef SHADOW_CASCADE
// 平行光阴影级联索引
mediump int computeCascadeIndex(in vec3 positionWS)
{
    vec3 fromCenter0 = positionWS - u_ShadowSplitSpheres[0].xyz;
    vec3 fromCenter1 = positionWS - u_ShadowSplitSpheres[1].xyz;
    vec3 fromCenter2 = positionWS - u_ShadowSplitSpheres[2].xyz;
    vec3 fromCenter3 = positionWS - u_ShadowSplitSpheres[3].xyz;

    mediump vec4 comparison = vec4(dot(fromCenter0, fromCenter0) < u_ShadowSplitSpheres[0].w,
	dot(fromCenter1, fromCenter1) < u_ShadowSplitSpheres[1].w,
	dot(fromCenter2, fromCenter2) < u_ShadowSplitSpheres[2].w,
	dot(fromCenter3, fromCenter3) < u_ShadowSplitSpheres[3].w);

    comparison.yzw = clamp(comparison.yzw - comparison.xyz, 0.0, 1.0); // keep the nearest
    mediump vec4 indexCoefficient = vec4(4.0, 3.0, 2.0, 1.0);
    mediump int index = 4 - int(dot(comparison, indexCoefficient));
    return index;
}
	#endif

// 平行光阴影坐标
vec4 getShadowCoord(in vec3 positionWS)
{
	#ifdef SHADOW_CASCADE
    mediump int cascadeIndex = computeCascadeIndex(positionWS);
	    #ifdef GRAPHICS_API_GLES3
    mat4 shadowMat = u_ShadowMatrices[cascadeIndex];
	    #else // GRAPHICS_API_GLES3
    mat4 shadowMat;
    if (cascadeIndex == 0)
	{
	    shadowMat = u_ShadowMatrices[0];
	}
    else if (cascadeIndex == 1)
	{
	    shadowMat = u_ShadowMatrices[1];
	}
    else if (cascadeIndex == 2)
	{
	    shadowMat = u_ShadowMatrices[2];
	}
    else
	{
	    shadowMat = u_ShadowMatrices[3];
	}
	    #endif // GRAPHICS_API_GLES3

    return shadowMat * vec4(positionWS, 1.0);

	#else // SHADOW_CASCADE

    return u_ShadowMatrices[0] * vec4(positionWS, 1.0);

	#endif // SHADOW_CASCADE
}

// 采样平行光阴影
float sampleShadowmap(in vec4 shadowCoord)
{
    float attenuation = 1.0;

    vec3 coord = shadowCoord.xyz / shadowCoord.w;

    vec4 shadowmapSize = u_ShadowMapSize;

    // if (coord.z > 0.0 && coord.z < 1.0)
    {
	#if defined(SHADOW_SOFT_SHADOW_HIGH)
	attenuation = sampleShdowMapFiltered9(coord, shadowmapSize);
	#elif defined(SHADOW_SOFT_SHADOW_LOW)
	attenuation = sampleShdowMapFiltered4(coord, shadowmapSize);
	#else // hard
	attenuation = SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap, coord);
	#endif // SHADOW_SOFT_SHADOW_HIGH
	attenuation = mix(1.0, attenuation, ShadowStrength);
    }

    if (coord.z > 0.0 && coord.z < 1.0)
	return attenuation;
    return 1.0;
}

    #endif // CALCULATE_SHADOWS

    // 计算 聚光灯 阴影
    #if defined(CALCULATE_SPOTSHADOWS)

// 聚光灯阴影坐标
vec4 getSpotShadowCoord(in vec3 positionWS)
{
    vec4 coordinate = u_SpotViewProjectMatrix * vec4(positionWS, 1.0);

    return coordinate;
}

// 采样聚光灯阴影
float sampleSpotShadowmap(vec4 shadowCoord)
{
    float attenuation = 1.0;

    vec3 coord = shadowCoord.xyz / shadowCoord.w;
    coord.xy = coord.xy * 0.5 + 0.5;

    vec4 shadowmapSize = u_SpotShadowMapSize;
	// todo
	// if (coord.z > 0.0 && coord.z < 1.0)
	//{
	#if defined(SHADOW_SPOT_SOFT_SHADOW_HIGH)
    attenuation = sampleSpotShdowMapFiltered9(coord, shadowmapSize);
	#elif defined(SHADOW_SPOT_SOFT_SHADOW_LOW)
    attenuation = sampleSpotShdowMapFiltered4(coord, shadowmapSize);
	#else // hard
    attenuation = SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap, coord);
	#endif
    attenuation = mix(1.0, attenuation, SpotShadowStrength);
    //}

    if (coord.z > 0.0 && coord.z < 1.0)
	return attenuation;
    return 1.0;
}

    #endif // CALCULATE_SPOTSHADOWS

#endif // ShadowSampler_lib