#define SHADER_NAME PBRDepthVS
#include "DepthVertex.glsl";

#ifdef COLOR
    varying vec4 v_VertexColor;
#endif // COLOR

varying vec2 v_Texcoord0;
void main()
{
    Vertex vertex;
    getVertexParams(vertex);
    
    #ifdef COLOR
        v_VertexColor = a_Color;
    #endif // COLOR
    
    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    vec3 positionWS = pos.xyz / pos.w;

    mat4 normalMat = transpose(inverse(worldMat));
    vec3 normalWS = normalize((normalMat * vec4(vertex.normalOS, 0.0)).xyz);

    vec4 positionCS = DepthPositionCS(positionWS, normalWS);
    gl_Position = remapPositionZ(positionCS);
}