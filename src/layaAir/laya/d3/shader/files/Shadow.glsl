#ifndef GRAPHICS_API_GLES3
	#define NO_NATIVE_SHADOWMAP
#endif

#if defined(NO_NATIVE_SHADOWMAP)
	#define TEXTURE2D_SHADOW(textureName) uniform mediump sampler2D textureName
	#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) (texture2D(textureName,coord3.xy).r<coord3.z?0.0:1.0)
	#define TEXTURE2D_SHADOW_PARAM(shadowMap) mediump sampler2D shadowMap
#else
	#define TEXTURE2D_SHADOW(textureName) uniform mediump sampler2DShadow textureName
	#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) textureLod(textureName,coord3,0.0)
	#define TEXTURE2D_SHADOW_PARAM(shadowMap) mediump sampler2DShadow shadowMap
#endif

#if defined(RECEIVESHADOW)&&defined(SHADOW)
    #define CALCULATE_SHADOWS
#endif

#if defined(RECEIVESHADOW)&&defined(SHADOW_SPOT)
	#define CALCULATE_SPOTSHADOWS
#endif

uniform vec4 u_ShadowBias; // x: depth bias, y: normal bias

#if defined(CALCULATE_SHADOWS)||defined(CALCULATE_SPOTSHADOWS)
	#include "ShadowSampleTent.glsl"
	uniform vec4 u_ShadowMapSize;
	uniform vec4 u_SpotShadowMapSize;
	uniform vec4 u_ShadowParams; // x: shadowStrength y: ShadowSpotLightStrength
	
	float sampleShdowMapFiltered4(TEXTURE2D_SHADOW_PARAM(shadowMap),vec3 shadowCoord,vec4 shadowMapSize)
	{
		float attenuation;
		vec4 attenuation4;
		vec2 offset=shadowMapSize.xy/2.0;
		vec3 shadowCoord0=shadowCoord + vec3(-offset,0.0);
		vec3 shadowCoord1=shadowCoord + vec3(offset.x,-offset.y,0.0);
		vec3 shadowCoord2=shadowCoord + vec3(-offset.x,offset.y,0.0);
		vec3 shadowCoord3=shadowCoord + vec3(offset,0.0);
		attenuation4.x = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord0);
		attenuation4.y = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord1);
		attenuation4.z = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord2);
		attenuation4.w = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord3);
		attenuation = dot(attenuation4, vec4(0.25));
		return attenuation;
	}

	float sampleShdowMapFiltered9(TEXTURE2D_SHADOW_PARAM(shadowMap),vec3 shadowCoord,vec4 shadowmapSize)
	{
		float attenuation;
		float fetchesWeights[9];
		vec2 fetchesUV[9];
		sampleShadowComputeSamplesTent5x5(shadowmapSize, shadowCoord.xy, fetchesWeights, fetchesUV);
		attenuation = fetchesWeights[0] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[0].xy, shadowCoord.z));
		attenuation += fetchesWeights[1] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[1].xy, shadowCoord.z));
		attenuation += fetchesWeights[2] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[2].xy, shadowCoord.z));
		attenuation += fetchesWeights[3] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[3].xy, shadowCoord.z));
		attenuation += fetchesWeights[4] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[4].xy, shadowCoord.z));
		attenuation += fetchesWeights[5] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[5].xy, shadowCoord.z));
		attenuation += fetchesWeights[6] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[6].xy, shadowCoord.z));
		attenuation += fetchesWeights[7] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[7].xy, shadowCoord.z));
		attenuation += fetchesWeights[8] * SAMPLE_TEXTURE2D_SHADOW(shadowMap, vec3(fetchesUV[8].xy, shadowCoord.z));
		return attenuation;
	}

#endif




#if defined(CALCULATE_SHADOWS)

	TEXTURE2D_SHADOW(u_ShadowMap);

	uniform mat4 u_ShadowMatrices[4];
	uniform vec4 u_ShadowSplitSpheres[4];// max cascade is 4

	mediump int computeCascadeIndex(vec3 positionWS)
	{
		vec3 fromCenter0 = positionWS - u_ShadowSplitSpheres[0].xyz;
		vec3 fromCenter1 = positionWS - u_ShadowSplitSpheres[1].xyz;
		vec3 fromCenter2 = positionWS - u_ShadowSplitSpheres[2].xyz;
		vec3 fromCenter3 = positionWS - u_ShadowSplitSpheres[3].xyz;

		mediump vec4 comparison = vec4(
			dot(fromCenter0, fromCenter0)<u_ShadowSplitSpheres[0].w,
			dot(fromCenter1, fromCenter1)<u_ShadowSplitSpheres[1].w,
			dot(fromCenter2, fromCenter2)<u_ShadowSplitSpheres[2].w,
			dot(fromCenter3, fromCenter3)<u_ShadowSplitSpheres[3].w);
		comparison.yzw = clamp(comparison.yzw - comparison.xyz,0.0,1.0);//keep the nearest
		mediump vec4 indexCoefficient = vec4(4.0,3.0,2.0,1.0);
		mediump int index = 4 - int(dot(comparison, indexCoefficient));
		return index;
	}

	vec4 getShadowCoord(vec4 positionWS)
	{
		#ifdef SHADOW_CASCADE
			mediump int cascadeIndex = computeCascadeIndex(positionWS.xyz);
			if(cascadeIndex > 3)// out of shadow range cascadeIndex is 4.
				return vec4(0.0);
			
			#ifdef GRAPHICS_API_GLES3
				return u_ShadowMatrices[cascadeIndex] * positionWS;
			#else
				mat4 shadowMat;
				if(cascadeIndex == 0)
					shadowMat = u_ShadowMatrices[0];
				else if(cascadeIndex == 1)
					shadowMat = u_ShadowMatrices[1];
				else if(cascadeIndex == 2)
					shadowMat = u_ShadowMatrices[2];
				else
					shadowMat = u_ShadowMatrices[3];
				return shadowMat * positionWS;
			#endif
		#else
			return u_ShadowMatrices[0] * positionWS;
		#endif
	}

	float sampleShadowmap(vec4 shadowCoord)
	{
		shadowCoord.xyz /= shadowCoord.w;
		float attenuation = 1.0;
		if(shadowCoord.z > 0.0 && shadowCoord.z < 1.0)
		{
			#if defined(SHADOW_SOFT_SHADOW_HIGH)
				attenuation = sampleShdowMapFiltered9(u_ShadowMap,shadowCoord.xyz,u_ShadowMapSize);
			#elif defined(SHADOW_SOFT_SHADOW_LOW)
				attenuation = sampleShdowMapFiltered4(u_ShadowMap,shadowCoord.xyz,u_ShadowMapSize);
			#else
				attenuation = SAMPLE_TEXTURE2D_SHADOW(u_ShadowMap,shadowCoord.xyz);
			#endif
			attenuation = mix(1.0,attenuation,u_ShadowParams.x);//shadowParams.x:shadow strength
		}
		return attenuation;
	}
#endif

#if defined(CALCULATE_SPOTSHADOWS)//shader���Զ���ĺ겻����ifdef ����ĳ�if defined
	TEXTURE2D_SHADOW(u_SpotShadowMap);
	uniform mat4 u_SpotViewProjectMatrix;
	float sampleSpotShadowmap(vec4 shadowCoord)
	{
		shadowCoord.xyz /= shadowCoord.w;
		float attenuation = 1.0;
		shadowCoord.xy +=1.0;
		shadowCoord.xy/=2.0; 
		if(shadowCoord.z > 0.0 && shadowCoord.z < 1.0)
		{
			#if defined(SHADOW_SPOT_SOFT_SHADOW_HIGH)
				attenuation = sampleShdowMapFiltered9(u_SpotShadowMap,shadowCoord.xyz,u_SpotShadowMapSize);
			#elif defined(SHADOW_SPOT_SOFT_SHADOW_LOW)
				attenuation = sampleShdowMapFiltered4(u_SpotShadowMap,shadowCoord.xyz,u_SpotShadowMapSize);
			#else
				attenuation = SAMPLE_TEXTURE2D_SHADOW(u_SpotShadowMap,shadowCoord.xyz);
			#endif
			attenuation = mix(1.0,attenuation,u_ShadowParams.y);//shadowParams.y:shadow strength
		}
		return attenuation;
	}
#endif

vec3 applyShadowBias(vec3 positionWS, vec3 normalWS, vec3 lightDirection)
{
    float invNdotL = 1.0 - clamp(dot(-lightDirection, normalWS),0.0,1.0);
    float scale = invNdotL * u_ShadowBias.y;

    // normal bias is negative since we want to apply an inset normal offset
    positionWS += -lightDirection * u_ShadowBias.xxx;
    positionWS += normalWS * vec3(scale);
    return positionWS;
}
