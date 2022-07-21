#define SHADER_NAME DepthVS

#include "DepthVertex.glsl";

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

    mat4 worldMat = getWorldMatrix();
    vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;

    vec3 normalWS = normalize((worldMat * vec4(vertex.normalOS, 0.0)).xyz);

    vec4 positionCS = DepthPositionCS(positionWS, normalWS);
    gl_Position = remapPositionZ(positionCS);
}