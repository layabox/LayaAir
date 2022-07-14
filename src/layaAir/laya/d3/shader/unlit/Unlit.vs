
#define SHADER_NAME UnlitVS

#include "Camera.glsl";
#include "Sprite3D.glsl";

#include "VertexCommon.glsl";

varying vec4 v_Color;
varying vec2 v_Texcoord0;

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

#ifdef UV
    v_Texcoord0 = transformUV(vertex.texCoord0, u_TilingOffset);
#endif // UV

#if defined(COLOR) && defined(ENABLEVERTEXCOLOR)
    v_Color = vertex.vertexColor;
#endif // COLOR && ENABLEVERTEXCOLOR

    mat4 worldMat = getWorldMatrix();

    vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;

    gl_Position = getPositionCS(positionWS);

    gl_Position = remapPositionZ(gl_Position);
}