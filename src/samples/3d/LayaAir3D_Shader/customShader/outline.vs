// attribute vec4 a_Position;
// attribute vec3 a_Normal;

// uniform mat4 u_MvpMatrix;

#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";
#include "Camera.glsl";
void main()
{

    Vertex vertex;
    getVertexParams(vertex);
    vec4 position = vec4((vertex.positionOS) + (vertex.normalOS) * u_OutlineWidth, 1.0);

    mat4 worldMat = getWorldMatrix();
    vec3 positionWS = (worldMat * vec4(position)).xyz;
    gl_Position = getPositionCS(positionWS);
    gl_Position = remapPositionZ(gl_Position);
}