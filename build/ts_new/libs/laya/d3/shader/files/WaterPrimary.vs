#include "Lighting.glsl";

attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec4 a_Tangent0;

uniform mat4 u_MvpMatrix;
uniform mat4 u_WorldMat;
uniform vec3 u_CameraPos;
uniform float u_WaveScale;
uniform vec4 u_WaveSpeed;
uniform float u_Time;

varying vec3 v_Normal;
varying vec3 v_Tangent;
varying vec3 v_Binormal;
varying vec3 v_ViewDir;
varying vec2 v_Texcoord0;
varying vec2 v_Texcoord1;

void main()
{
	vec4 positionWorld = u_WorldMat * a_Position;
	vec4 position = u_MvpMatrix * a_Position;
	
	vec4 temp = vec4(positionWorld.x, positionWorld.z, positionWorld.x, positionWorld.z) * u_WaveScale + u_WaveSpeed * u_WaveScale * u_Time;
	
	v_Texcoord0 = temp.xy * vec2(0.4, 0.45);
	v_Texcoord1 = temp.wz;
	
	mat3 worldMat = mat3(u_WorldMat);
	v_Normal = worldMat * a_Normal;
	v_Tangent = worldMat * a_Tangent0.xyz;
	v_Binormal = cross(v_Normal, v_Tangent) * a_Tangent0.w;
	
	v_ViewDir = u_CameraPos - positionWorld.xyz;
	gl_Position = position;
	gl_Position=remapGLPositionZ(gl_Position);
}