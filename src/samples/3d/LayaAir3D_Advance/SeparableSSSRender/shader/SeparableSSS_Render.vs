#define SHADER_NAME SeparableSSSRenderVS
#include "Camera.glsl";
#include "VertexCommon.glsl";
#include "Sprite3DVertex.glsl";

varying vec2 v_Texcoord0;
varying vec4 v_ScreenTexcoord;

void main() {
	Vertex vertex;
	getVertexParams(vertex);
	mat4 worldMat = getWorldMatrix();
	vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;
	gl_Position = getPositionCS(positionWS);
	gl_Position= remapPositionZ(gl_Position);
	v_Texcoord0= transformUV(a_Texcoord0, u_TilingOffset);
	//v_ScreenTexcoord =vec2((gl_Position.x/gl_Position.w+1.0)*0.5, (gl_Position.y/gl_Position.w+1.0)*0.5);
	v_ScreenTexcoord = gl_Position*0.5;
	v_ScreenTexcoord.xy = vec2(v_ScreenTexcoord.x,v_ScreenTexcoord.y)+v_ScreenTexcoord.w;
	v_ScreenTexcoord.zw = gl_Position.zw;
}