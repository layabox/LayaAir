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