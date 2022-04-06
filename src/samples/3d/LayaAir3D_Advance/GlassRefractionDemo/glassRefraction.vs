#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif
#include "Lighting.glsl";
#include "LayaUtile.glsl"


attribute vec4 a_Position;
uniform mat4 u_MvpMatrix;
attribute vec2 a_Texcoord0;
varying vec2 v_Texcoord0;

attribute vec3 a_Normal;
varying vec3 v_Normal; 

uniform vec3 u_CameraPos;
varying vec3 v_ViewDir; 

attribute vec4 a_Tangent0;
varying vec3 v_Tangent;
varying vec3 v_Binormal;
uniform mat4 u_WorldMat;

varying vec3 v_PositionWorld;

uniform vec4 u_TilingOffset;

varying vec4 v_ScreenTexcoord;

void main() {
	vec4 position;
	position=a_Position;
	mat4 worldMat = u_WorldMat;
	mat3 worldInvMat = INVERSE_MAT(mat3(worldMat));
	vec3 positionWS = (worldMat*position).xyz;
	v_ViewDir = u_CameraPos-positionWS;
	v_PositionWorld = positionWS;

	gl_Position = u_MvpMatrix * position;
	v_Texcoord0=a_Texcoord0;
	gl_Position=remapGLPositionZ(gl_Position);

	// 切线
	v_Tangent=normalize(a_Tangent0.xyz*worldInvMat);
	// 法线
	v_Normal=normalize(a_Normal*worldInvMat);
	// 次法线
	v_Binormal=cross(v_Normal,v_Tangent)*a_Tangent0.w;

	//v_ScreenTexcoord =vec2((gl_Position.x/gl_Position.w+1.0)*0.5, (gl_Position.y/gl_Position.w+1.0)*0.5);
	v_ScreenTexcoord = gl_Position*0.5;
	v_ScreenTexcoord.xy = vec2(v_ScreenTexcoord.x,v_ScreenTexcoord.y)+v_ScreenTexcoord.w;
	v_ScreenTexcoord.zw = gl_Position.zw;
	
}