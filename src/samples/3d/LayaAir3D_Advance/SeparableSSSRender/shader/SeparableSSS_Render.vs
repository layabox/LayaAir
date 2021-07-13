#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif
#include "Lighting.glsl";

attribute vec4 a_Position;

attribute vec2 a_Texcoord0;
uniform mat4 u_MvpMatrix;

varying vec2 v_Texcoord0;
uniform vec4 u_TilingOffset;
varying vec2 v_ScreenTexcoord;

void main() {
	vec4 position;
	position=a_Position;
	gl_Position = u_MvpMatrix * position;
	v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
	gl_Position=remapGLPositionZ(gl_Position);
	v_ScreenTexcoord =vec2((gl_Position.x/gl_Position.w+1.0)*0.5, (gl_Position.y/gl_Position.w+1.0)*0.5);
}