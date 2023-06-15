#define SHADER_NAME BlinnPhongVS

#include "Math.glsl";

#include "Scene.glsl";
#include "SceneFogInput.glsl";

#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";

#include "BlinnPhongVertex.glsl";

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
