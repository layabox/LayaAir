#define SHADER_NAME Spine3DDepthVS

#include "Math.glsl";
#include "Scene.glsl";
#include "Camera.glsl";

#include "Spine3DVertex.glsl";

#if defined(SHADOW) || defined(SHADOW_SPOT)
#ifndef DEPTHPASS
    #include "ShadowCommon.glsl"

vec3 applyShadowBias(vec3 positionWS, vec3 normalWS, vec3 lightDirection)
{
    float invNdotL = 1.0 - clamp(dot(-lightDirection, normalWS), 0.0, 1.0);
    float scale = invNdotL * u_ShadowBias.y;
    positionWS += -lightDirection * u_ShadowBias.xxx;
    positionWS += normalWS * vec3(scale);
    return positionWS;
}
#endif // DEPTHPASS
#endif // SHADOW || SHADOW_SPOT

vec4 DepthPositionCS(in vec3 positionWS, in vec3 normalWS)
{
    #ifdef DEPTHPASS
    vec4 positionCS = u_ViewProjection * vec4(positionWS, 1.0);
    #endif // DEPTHPASS

    #ifdef SHADOW
    #ifndef DEPTHPASS
    positionWS = applyShadowBias(positionWS, normalWS, u_ShadowLightDirection);
    vec4 positionCS = u_ViewProjection * vec4(positionWS, 1.0);
    positionCS.z = max(positionCS.z, 0.0);
    #endif // DEPTHPASS
    #endif // SHADOW

    #ifdef SHADOW_SPOT
    #ifndef DEPTHPASS
    vec4 positionCS = u_ViewProjection * vec4(positionWS, 1.0);
    positionCS.z = positionCS.z - u_ShadowBias.x / positionCS.w;
    positionCS.z = max(positionCS.z, 0.0);
    #endif // DEPTHPASS
    #endif // SHADOW_SPOT

    return positionCS;
}

#ifdef SPINE_BILLBOARD
uniform mat4 u_spineBillboardMatrix;
#endif

mat4 getWorldMatrix(){
    #ifdef SPINE_BILLBOARD
        return u_spineBillboardMatrix;
    #else
        #ifdef GPU_INSTANCE
        mat4 worldMat = a_WorldMat;
        #else
        mat4 worldMat = u_WorldMat;
        #endif // GPU_INSTANCE
        return worldMat;
    #endif
}

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    vec3 positionWS = pos.xyz / pos.w;

    vec3 normalWS = normalize((worldMat * vec4(vertex.normalOS, 0.0)).xyz);

    vec4 positionCS = DepthPositionCS(positionWS, normalWS);
    gl_Position = remapPositionZ(positionCS);
}
