
#define SHADER_NAME UnlitVS

#include "Camera.glsl";
#include "MeshVertex.glsl";

void main()
{
    VertexParams params;
    initMeshVertexParam(params);

    vec4 positionWS = vec4(params.positionWS, 1.0);
    gl_Position = u_ViewProjection * positionWS;

    gl_Position = remapPositionZ(gl_Position);
}