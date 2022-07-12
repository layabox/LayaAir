#define SHADER_NAME PBRVS

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3D.glsl";

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