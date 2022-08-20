
#define SHADER_NAME UnlitVS

#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";
#include "Color.glsl";

varying vec4 v_Color;
varying vec2 v_Texcoord0;

void main()
{
    Vertex vertex;
    getVertexParams(vertex);
	
#if defined(UV)
    v_Texcoord0 = transformUV(vertex.texCoord0, u_TilingOffset);
#else
	v_Texcoord0 = vec2(0);
#endif // UV

#if defined(COLOR) && defined(ENABLEVERTEXCOLOR)
    v_Color = gammaToLinear(vertex.vertexColor);
#endif // COLOR && ENABLEVERTEXCOLOR

    mat4 worldMat = getWorldMatrix();

    vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;

    gl_Position = getPositionCS(positionWS);

    gl_Position = remapPositionZ(gl_Position);
}