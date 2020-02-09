#ifndef GRAPHICS_API_GLES3
	#define NO_NATIVE_SHADOWMAP
#endif

#ifdef NO_NATIVE_SHADOWMAP
	uniform mediump sampler2D u_shadowMap1;
	uniform mediump sampler2D u_shadowMap2;
	uniform mediump sampler2D u_shadowMap3;
	#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) texture2D(textureName,coord3.xy).r<coord3.z?0.0:1.0
	#define TEXTURE2D_SHADOW_PARAM(shadowMap) sampler2D shadowMap
#else
	uniform mediump sampler2DShadow u_shadowMap1;
	uniform mediump sampler2DShadow u_shadowMap2;
	uniform mediump sampler2DShadow u_shadowMap3;
	#define SAMPLE_TEXTURE2D_SHADOW(textureName, coord3) texture2D(textureName,coord3)
	#define TEXTURE2D_SHADOW_PARAM(shadowMap) sampler2DShadow shadowMap
#endif



uniform vec2 u_shadowPCFoffset;
uniform vec4 u_shadowPSSMDistance;
uniform vec4 u_ShadowBias; // x: depth bias, y: normal bias

vec4 packDepth(const in float depth)
{
	const vec4 bitShift = vec4(256.0*256.0*256.0, 256.0*256.0, 256.0, 1.0);
	const vec4 bitMask	= vec4(0.0, 1.0/256.0, 1.0/256.0, 1.0/256.0);
	vec4 res = mod(depth*bitShift*vec4(255), vec4(256))/vec4(255);
	res -= res.xxyz * bitMask;
	return res;
}
float unpackDepth(const in vec4 rgbaDepth)
{
	const vec4 bitShift = vec4(1.0/(256.0*256.0*256.0), 1.0/(256.0*256.0), 1.0/256.0, 1.0);
	float depth = dot(rgbaDepth, bitShift);
	return depth;
}

mediump float sampleShdowMapFiltered(TEXTURE2D_SHADOW_PARAM(shadowMap),vec3 shadowCoord,vec2 halfTexelSize)
{
	mediump float attenuation;
	vec4 attenuation4;
	vec3 shadowCoord0=shadowCoord + vec3(-halfTexelSize,0.0);
	vec3 shadowCoord1=shadowCoord + vec3(halfTexelSize.x,-halfTexelSize.y,0.0);
	vec3 shadowCoord2=shadowCoord + vec3(-halfTexelSize.x,halfTexelSize.y,0.0);
	vec3 shadowCoord3=shadowCoord + vec3(halfTexelSize,0.0);
    attenuation4.x = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord0);
    attenuation4.y = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord1);
    attenuation4.z = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord2);
    attenuation4.w = SAMPLE_TEXTURE2D_SHADOW(shadowMap, shadowCoord3);
	attenuation = dot(attenuation4, vec4(0.25));
	return attenuation;
}

float getShadowPSSM1(vec4 lightMVPPos,vec4 pssmDistance,vec2 shadowPCFOffset,float posViewZ)
{
	float value = 1.0;
	if( posViewZ < pssmDistance.x )
	{
		vec3 vText = lightMVPPos.xyz / lightMVPPos.w;
		float fMyZ = vText.z;
		if ( fMyZ <= 1.0 ) 
		{
			#if defined(SHADOW_SOFT_SHADOW_HIGH)
				value = sampleShdowMapFiltered(u_shadowMap1,vText,shadowPCFOffset);//TODO:验证shadowPCFOffset
			#elif defined(SHADOW_SOFT_SHADOW_LOW)
				value = sampleShdowMapFiltered(u_shadowMap1,vText,shadowPCFOffset);//TODO:
			#else
				value = SAMPLE_TEXTURE2D_SHADOW(u_shadowMap1,vText);
			#endif
		}
	}
	return value;
}



vec3 applyShadowBias(vec3 positionWS, vec3 normalWS, vec3 lightDirection)
{
    float invNdotL = 1.0 - clamp(dot(lightDirection, normalWS),0.0,1.0);
    float scale = invNdotL * u_ShadowBias.y;

    // normal bias is negative since we want to apply an inset normal offset
    positionWS += lightDirection * vec3(u_ShadowBias);
    positionWS += normalWS * vec3(scale);
    return positionWS;
}