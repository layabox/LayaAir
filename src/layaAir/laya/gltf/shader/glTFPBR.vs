#define SHADER_NAME glTFPBRVS

#include "Math.glsl";

#include "Scene.glsl";
#include "SceneFogInput.glsl";

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

    sharePixelParams(pixel);

    gl_Position = getPositionCS(pixel.positionWS);

    gl_Position = remapPositionZ(gl_Position);

#ifdef FOG
    FogHandle(gl_Position.z);
#endif
}