
#define SHADER_NAME UnlitVS

#include "Math.glsl";

#include "Scene.glsl";
#include "SceneFogInput.glsl";

#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";

#ifdef UV
varying vec2 v_Texcoord0;
#endif // UV

#ifdef COLOR
varying vec4 v_VertexColor;
#endif // COLOR

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

#ifdef UV
    v_Texcoord0 = transformUV(vertex.texCoord0, u_TilingOffset);
#endif // UV

#ifdef COLOR
    v_VertexColorr = vertex.vertexColor;
#endif // COLOR

    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    vec3 positionWS = pos.xyz / pos.w;

    gl_Position = getPositionCS(positionWS);

    gl_Position = remapPositionZ(gl_Position);

#ifdef FOG
    FogHandle(gl_Position.z);
#endif
}
