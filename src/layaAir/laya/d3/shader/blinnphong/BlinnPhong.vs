#define SHADER_NAME BlinnPhongVS

#include "Color.glsl";

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3D.glsl";

#include "VertexCommon.glsl";

#include "BlinnPhongVertex.glsl";

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

    PixelParams pixel;
    initPixelParams(pixel, vertex);

    vec4 positionWS = vec4(pixel.positionWS, 1.0);
    gl_Position = getPositionCS(pixel.positionWS);

    gl_Position = remapPositionZ(gl_Position);
}
