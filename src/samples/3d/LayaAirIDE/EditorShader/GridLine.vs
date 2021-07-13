#if defined(GL_FRAGMENT_PRECISION_HIGH)
precision highp float;
#else
precision mediump float;
#endif

#include "Lighting.glsl";

attribute vec4 a_Position;
attribute vec4 a_Color;

uniform mat4 u_MvpMatrix;
uniform mat4 u_View;
uniform vec4 u_Color;

varying vec4 v_Color;
varying vec4 v_PositionWS;

void main()
{
	gl_Position = u_MvpMatrix * vec4(a_Position.xyz, 1.0);
	gl_Position=remapGLPositionZ(gl_Position);
	v_Color=a_Color*u_Color;
	v_PositionWS = a_Position;
}
