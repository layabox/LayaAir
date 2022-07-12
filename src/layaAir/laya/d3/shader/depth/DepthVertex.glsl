#if !defined(DepthVertex_lib)
    #define DepthVertex_lib

    #include "Scene.glsl";
    #include "Sprite3D.glsl";
    
    #include "VertexCommon.glsl";

    #if defined(SHADOW) || defined(SHADOW_SPOT)

	#ifdef ENUNIFORMBLOCK
uniform ShadowUniformBlock
{
    vec4 u_ShadowBias; // x: depth bias, y: normal bias
    mat4 u_ViewProjection;
    vec3 u_ShadowLightDirection;
};
	#else // ENUNIFORMBLOCK
uniform vec4 u_ShadowBias; // x: depth bias, y: normal bias
uniform mat4 u_ViewProjection;
	    #ifdef SHADOW
uniform vec3 u_ShadowLightDirection;
	    #endif // SHADOW
	#endif // ENUNIFORMBLOCK
// 根据投影剧专重映射深度
vec4 remapPositionZ(vec4 position)
{
    position.z = position.z * 2.0 - position.w;
    return position;
}

vec3 applyShadowBias(vec3 positionWS, vec3 normalWS, vec3 lightDirection)
{
    float invNdotL = 1.0 - clamp(dot(-lightDirection, normalWS), 0.0, 1.0);
    float scale = invNdotL * u_ShadowBias.y;

    // normal bias is negative since we want to apply an inset normal offset
    positionWS += -lightDirection * u_ShadowBias.xxx;
    positionWS += normalWS * vec3(scale);
    return positionWS;
}

    #endif // SHADOW || SHADOW_SPOT

    #ifdef DEPTHPASS
	#include "Camera.glsl";
    #endif // DEPTHPASS

vec4 DepthPositionCS()
{
    Vertex vertex;
    getVertexParams(vertex);

    mat4 worldMat = getWorldMatrix();
    vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;

    vec3 normalWS = normalize((worldMat * vec4(vertex.normalOS, 0.0)).xyz);

    #ifdef DEPTHPASS
    vec4 positionCS = u_ViewProjection * vec4(positionWS, 1.0);
    #endif // DEPTHPASS

    #ifdef SHADOW
    positionWS = applyShadowBias(positionWS, normalWS, u_ShadowLightDirection);
    vec4 positionCS = u_ViewProjection * vec4(positionWS, 1.0);
    positionCS.z = max(positionCS.z, 0.0); // min ndc z is 0.0
    #endif // SHADOW

    #ifdef SHADOW_SPOT
    vec4 positionCS = u_ViewProjection * vec4(positionWS, 1.0);
    positionCS.z = positionCS.z - u_ShadowBias.x / positionCS.w;
    positionCS.z = max(positionCS.z, 0.0); // min ndc z is 0.0
    #endif // SHADOW_SPOT

    return positionCS;
}

#endif // DepthVertex_lib