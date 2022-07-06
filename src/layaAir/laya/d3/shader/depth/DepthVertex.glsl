#if !defined(DepthVertex_lib)
    #define DepthVertex_lib

    #include "Scene.glsl";

    #include "MeshVertex.glsl";

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

    #endif // SHADOW || SHADOW_SPOT

    #ifdef DEPTHPASS
	#include "Camera.glsl";
    #endif // DEPTHPASS

vec4 DepthPositionCS()
{
    VertexParams params;
    initMeshVertexParam(params);

    vec3 positionWS = params.positionWS;
    vec3 normalWS = params.normalWS;

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