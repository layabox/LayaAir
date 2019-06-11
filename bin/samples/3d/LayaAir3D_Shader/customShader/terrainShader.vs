#include "Lighting.glsl";
attribute vec4 a_Position;
attribute vec2 a_Texcoord0;
attribute vec3 a_Normal;

uniform mat4 u_MvpMatrix;
varying vec2 v_Texcoord0;

void main()
{
  gl_Position = u_MvpMatrix * a_Position;
  v_Texcoord0 = a_Texcoord0;
 gl_Position=remapGLPositionZ(gl_Position);
}