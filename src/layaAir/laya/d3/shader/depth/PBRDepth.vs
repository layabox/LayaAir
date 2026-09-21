#define SHADER_NAME PBRDepthVS

#include "DepthVertex.glsl";

#ifdef ALPHATEST
varying vec2 v_AlphaTestUV;
varying float v_AlphaTestVertexAlpha;
#endif // ALPHATEST

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

#ifdef ALPHATEST
    #ifdef UV
    v_AlphaTestUV = vertex.texCoord0;
    #else // UV
    v_AlphaTestUV = vec2(0.0);
    #endif // UV

    #if defined(COLOR) && defined(ENABLEVERTEXCOLOR)
    v_AlphaTestVertexAlpha = vertex.vertexColor.a;
    #else // COLOR && ENABLEVERTEXCOLOR
    v_AlphaTestVertexAlpha = 1.0;
    #endif // COLOR && ENABLEVERTEXCOLOR
#endif // ALPHATEST

    mat4 worldMat = getWorldMatrix();
    vec4 pos = worldMat * vec4(vertex.positionOS, 1.0);
    vec3 positionWS = pos.xyz / pos.w;

    mat4 normalMat = transpose(inverse(worldMat));
    vec3 normalWS = normalize((normalMat * vec4(vertex.normalOS, 0.0)).xyz);

    vec4 positionCS = DepthPositionCS(positionWS, normalWS);
    gl_Position = remapPositionZ(positionCS);
}
