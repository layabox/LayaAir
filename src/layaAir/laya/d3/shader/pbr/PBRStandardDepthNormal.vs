#define SHADER_NAME PBRStandardDepthNormalVS

#include "Math.glsl";

#include "Camera.glsl";

#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";

#include "PBRVertex.glsl";

varying vec4 v_PositionCS;

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

    PixelParams pixel;
    initPixelParams(pixel, vertex);

    sharePixelParams(pixel);

    vec4 positionCS = getPositionCS(pixel.positionWS);
    v_PositionCS = positionCS;
    gl_Position = positionCS;
    gl_Position = remapPositionZ(gl_Position);
}