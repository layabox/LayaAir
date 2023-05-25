#define SHADER_NAME ShadingVS

#include "Math.glsl";

#include "Scene.glsl";
#include "SceneFogInput.glsl";

#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "ShadingVertex.glsl";

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

    PixelParams pixel;
    initPixelParams(pixel, vertex);

    gl_Position = getPositionCS(pixel.positionWS);

    gl_Position = remapPositionZ(gl_Position);

#ifdef FOG
    FogHandle(gl_Position.z);
#endif
}