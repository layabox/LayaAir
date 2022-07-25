#define SHADER_NAME PBRStandardVS

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";

#include "PBRVertex.glsl";

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

    PixelParams pixel;
    initPixelParams(pixel, vertex);

    gl_Position = getPositionCS(pixel.positionWS);

    gl_Position = remapPositionZ(gl_Position);
}