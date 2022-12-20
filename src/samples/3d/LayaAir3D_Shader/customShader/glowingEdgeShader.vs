#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif

#define SHADER_NAME EDGE_VS

// #include "Lighting.glsl";
#include "VertexCommon.glsl";
#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";
varying vec2 v_Texcoord;
varying vec3 v_Normal;
varying vec3 v_PositionWorld;

void main()
{
	Vertex vertex;
	getVertexParams(vertex);
	v_Texcoord = vertex.texCoord0;
	mat4 worldMat = getWorldMatrix();
	vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;
	v_PositionWorld = positionWS;
	v_Normal = normalize((worldMat * vec4(vertex.normalOS, 0.0))).xyz;
	gl_Position = getPositionCS(positionWS);
	gl_Position=remapPositionZ(gl_Position);
}