#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif

#include "Lighting.glsl";

attribute vec4 a_Position;
uniform mat4 u_MvpMatrix;
uniform vec4 u_Color;
attribute vec4 a_Color;
varying vec4 v_Color;


void main()
{
	gl_Position = u_MvpMatrix * a_Position;
	v_Color=a_Color*u_Color;
	gl_Position=remapGLPositionZ(gl_Position);
}