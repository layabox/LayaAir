#define SHADER_NAME BlinnPhongVS

#include "Scene.glsl";
#include "Camera.glsl";

#include "MeshVertex.glsl";

#include "BlinnPhongVertex.glsl";

void main()
{
    VertexParams params;
    initMeshVertexParam(params);

    initBlinnPhongSurface(params);

    vec4 positionWS = vec4(params.positionWS, 1.0);
    gl_Position = u_ViewProjection * positionWS;

    gl_Position = remapPositionZ(gl_Position);
}
