#define SHADER_NAME DepthVS

#include "DepthVertex.glsl";

void main()
{
    vec4 positionCS = DepthPositionCS();
    gl_Position = remapPositionZ(positionCS);
}