#if !defined(Lighting_lib)
    #define Lighting_lib

    #include "ShadowSampler.glsl";

struct Light {
    vec3 color;
    vec3 dir;
    float attenuation;
};

struct DirectionLight {
    vec3 color;
    vec3 direction;
    float attenuation;
    int lightMode;
};

struct PointLight {
    vec3 color;
    vec3 position;
    float range;
    float attenuation;
    int lightMode;
};

struct SpotLight {
    vec3 color;
    vec3 position;
    float range;
    vec3 direction;
    float spot;
    float attenuation;
    int lightMode;
};

    #define LightMode_Mix      0
    #define LightMode_RealTime 1

int getAttenuationByMode(float lightMapMode)
{
    #ifdef LIGHTMAP // mix 0 realtime 1
    return int(lightMapMode);
    #else // LIGHTMAP

	#ifdef VOLUMETRICGI
    return int(lightMapMode);
	#endif // VOLUMETRICGI

    #endif // LIGHTMAP
    return LightMode_RealTime;
}

    #if defined(DIRECTIONLIGHT) || defined(POINTLIGHT) || defined(SPOTLIGHT)

	#define LIGHTING

// 灯光衰减函数
float attenuation(in vec3 L, in float invLightRadius)
{
    float fRatio = clamp(length(L) * invLightRadius, 0.0, 1.0);
    fRatio *= fRatio;
    return 1.0 / (1.0 + 25.0 * fRatio) * clamp(4.0 * (1.0 - fRatio), 0.0, 1.0);
}

// 平行光
Light getLight(in DirectionLight directionLight)
{
    Light light;
    light.color = directionLight.color;
    light.dir = directionLight.direction;
    light.attenuation = directionLight.attenuation;
    return light;
}

// 点光
Light getLight(in PointLight pointLight, in vec3 normalWS, in vec3 positionWS)
{
    vec3 lightDirection = positionWS - pointLight.position;
    float rangeAttenuate = attenuation(lightDirection, 1.0 / pointLight.range);

    Light light;
    light.color = pointLight.color * rangeAttenuate;
    light.dir = normalize(lightDirection);
    light.attenuation = pointLight.attenuation;
    return light;
}

// 聚光灯
Light getLight(in SpotLight spotLight, in vec3 normalWS, in vec3 positionWS)
{
    vec3 lightDirection = positionWS - spotLight.position;
    vec3 normalizeLightDir = normalize(lightDirection);

    vec2 cosAngles = cos(vec2(spotLight.spot, spotLight.spot * 0.5) * 0.5);
    float dirAttenuate = dot(spotLight.direction, normalizeLightDir);
    dirAttenuate *= smoothstep(cosAngles.x, cosAngles.y, dirAttenuate);

    float rangeAttenuate = attenuation(lightDirection, 1.0 / spotLight.range);

    Light light;
    light.color = spotLight.color * rangeAttenuate * dirAttenuate;
    light.dir = normalizeLightDir;
    light.attenuation = spotLight.attenuation;
    return light;
}

	#ifdef LEGACYSINGLELIGHTING
	    #define CalculateLightCount 1
	    #define DirectionCount	1

	    #ifdef DIRECTIONLIGHT
uniform DirectionLight u_DirectionLight;
	    #endif // DIRECTIONLIGHT

	    #ifdef POINTLIGHT
uniform PointLight u_PointLight;
	    #endif // POINTLIGHT

	    #ifdef SPOTLIGHT
uniform SpotLight u_SpotLight;
	    #endif // SPOTLIGHT

	#else // LEGACYSINGLELIGHTING
	    #define CalculateLightCount MAX_LIGHT_COUNT
	    #define DirectionCount	u_DirationLightCount

uniform sampler2D u_LightBuffer;

	    #ifdef DIRECTIONLIGHT
uniform mediump int u_DirationLightCount;
	    #endif

	    #if defined(POINTLIGHT) || defined(SPOTLIGHT)
const int c_ClusterBufferWidth = CLUSTER_X_COUNT * CLUSTER_Y_COUNT;
const int c_ClusterBufferHeight = CLUSTER_Z_COUNT * (1 + int(ceil(float(MAX_LIGHT_COUNT_PER_CLUSTER) / 4.0)));
const int c_ClusterBufferFloatWidth = c_ClusterBufferWidth * 4;
uniform sampler2D u_LightClusterBuffer;

int getLightIndex(in int offset, in int index)
{
    int totalOffset = offset + index;
    int row = totalOffset / c_ClusterBufferFloatWidth;
    int lastRowFloat = totalOffset - row * c_ClusterBufferFloatWidth;
    int col = lastRowFloat / 4;
    vec2 uv = vec2((float(col) + 0.5) / float(c_ClusterBufferWidth), (float(row) + 0.5) / float(c_ClusterBufferHeight));
    vec4 texPixel = texture2D(u_LightClusterBuffer, uv);
    int pixelComponent = lastRowFloat - col * 4;

		#ifdef GRAPHICS_API_GLES3
    return int(texPixel[pixelComponent]);
		#else
    if (pixelComponent == 0)
	return int(texPixel.x);
    else if (pixelComponent == 1)
	return int(texPixel.y);
    else if (pixelComponent == 2)
	return int(texPixel.z);
    else
	return int(texPixel.w);
		#endif
}
	    #endif // POINTLIGHT || SPOTLIGHT

	#endif // LEGACYSINGLELIGHTING

	#ifdef DIRECTIONLIGHT
DirectionLight getDirectionLight(in int index, in vec3 positionWS)
{
    DirectionLight light;
	    #ifdef LEGACYSINGLELIGHTING
    light.color = u_DirectionLight.color;
    light.direction = u_DirectionLight.direction;
    light.attenuation = 1.0;
    light.lightMode = LightMode_RealTime;
	    #else // LEGACYSINGLELIGHTING
    float v = (float(index) + 0.5) / float(CalculateLightCount);
    vec4 p1 = texture2D(u_LightBuffer, vec2(0.125, v));
    vec4 p2 = texture2D(u_LightBuffer, vec2(0.375, v));
    light.color = p1.rgb;
    light.direction = p2.rgb;
    light.attenuation = 1.0;
    light.lightMode = getAttenuationByMode(p1.a);
	    #endif // LEGACYSINGLELIGHTING

	    #if defined(CALCULATE_SHADOWS)
    if (index == 0)
	{
	    vec4 shadowCoord = getShadowCoord(positionWS);
	    float shadowAttenuation = sampleShadowmap(shadowCoord);
	    light.attenuation = shadowAttenuation;
	}
	    #endif // CALCULATE_SHADOWS

    return light;
}
	#endif // DIRECTIONLIGHT

	#if defined(POINTLIGHT) || defined(SPOTLIGHT)
ivec4 getClusterInfo(mat4 viewMatrix, vec4 viewport, vec3 positionWS, vec4 fragCoord, vec4 projectParams)
{
	    #ifdef LEGACYSINGLELIGHTING
    return ivec4(1, 1, 0, 0);
	    #else // LEGACYSINGLELIGHTING
    // todo  这个地方 用 positionVS 替换?
    vec3 viewPos = vec3(viewMatrix * vec4(positionWS, 1.0));
    int clusterXIndex = int(floor(fragCoord.x / (float(viewport.z) / float(CLUSTER_X_COUNT))));
    int clusterYIndex = int(floor((viewport.w * (projectParams.z < 0.0 ? 0.0 : 1.0) - fragCoord.y * projectParams.z) / (float(viewport.w) / float(CLUSTER_Y_COUNT))));
    float zSliceParam = float(CLUSTER_Z_COUNT) / log2(projectParams.y / projectParams.x);
    int clusterZIndex = int(floor(log2(-viewPos.z) * zSliceParam - log2(projectParams.x) * zSliceParam));
    // todo 化简
    vec2 uv = vec2((float(clusterXIndex + clusterYIndex * CLUSTER_X_COUNT) + 0.5) / float(c_ClusterBufferWidth), (float(clusterZIndex) + 0.5) / float(c_ClusterBufferHeight));
    vec4 clusterPixel = texture2D(u_LightClusterBuffer, uv);
    return ivec4(clusterPixel); // X:Point Count Y:Spot Count Z、W:Light Offset
	    #endif // LEGACYSINGLELIGHTING
}
	#endif // POINTLIGHT || SPOTLIGHT

	#ifdef POINTLIGHT
PointLight getPointLight(in int index, in ivec4 clusterInfo, in vec3 positionWS)
{

    PointLight light;
	    #ifdef LEGACYSINGLELIGHTING
    light.color = u_PointLight.color;
    light.position = u_PointLight.position;
    light.range = u_PointLight.range;
    light.attenuation = 1.0;
	    #else // LEGACYSINGLELIGHTING
    // todo  重复计算
    int indexOffset = clusterInfo.z * c_ClusterBufferFloatWidth + clusterInfo.w;
    int pointIndex = getLightIndex(indexOffset, index);
    float v = (float(pointIndex) + 0.5) / float(CalculateLightCount);
    vec4 p1 = texture2D(u_LightBuffer, vec2(0.125, v));
    vec4 p2 = texture2D(u_LightBuffer, vec2(0.375, v));
    light.color = p1.rgb;
    light.range = p1.a;
    light.position = p2.rgb;
    light.attenuation = 1.0;
    light.lightMode = getAttenuationByMode(p2.a);
	    #endif // LEGACYSINGLELIGHTING
    return light;
}
	#endif // POINTLIGHT

	#ifdef SPOTLIGHT
SpotLight getSpotLight(in int index, in ivec4 clusterInfo, in vec3 positionWS)
{
    SpotLight light;

	    #ifdef LEGACYSINGLELIGHTING
    light.color = u_SpotLight.color;
    light.position = u_SpotLight.position;
    light.range = u_SpotLight.range;
    light.direction = u_SpotLight.direction;
    light.spot = u_SpotLight.spot;
    light.attenuation = 1.0;
	    #else // LEGACYSINGLELIGHTING
    // todo  重复计算
    int indexOffset = clusterInfo.z * c_ClusterBufferFloatWidth + clusterInfo.w;
    int spotIndex = getLightIndex(indexOffset, index + clusterInfo.x);
    float v = (float(spotIndex) + 0.5) / float(CalculateLightCount);
    vec4 p1 = texture2D(u_LightBuffer, vec2(0.125, v));
    vec4 p2 = texture2D(u_LightBuffer, vec2(0.375, v));
    vec4 p3 = texture2D(u_LightBuffer, vec2(0.625, v));
    light.color = p1.rgb;
    light.range = p1.a;
    light.position = p2.rgb;
    light.spot = p2.a;
    light.direction = p3.rgb;
    light.attenuation = 1.0;
    light.lightMode = getAttenuationByMode(p3.a);
	    #endif // LEGACYSINGLELIGHTING

	    #if defined(CALCULATE_SPOTSHADOWS)
    if (index == 0)
	{
	    vec4 shadowCoord = getSpotShadowCoord(positionWS);
	    float shadowAttenuation = sampleSpotShadowmap(shadowCoord);
	    light.attenuation = shadowAttenuation;
	}
	    #endif // CALCULATE_SPOTSHADOWS

    return light;
}
	#endif // SPOTLIGHT

    #endif // DIRECTIONLIGHT || POINTLIGHT || SPOTLIGHT

#endif // Lighting_lib