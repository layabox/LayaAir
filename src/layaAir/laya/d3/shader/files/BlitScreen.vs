#include "Lighting.glsl";

attribute vec4 a_PositionTexcoord;
uniform vec4 u_OffsetScale;
varying vec2 v_Texcoord0;

void main() {
	gl_Position = vec4(u_OffsetScale.x+(a_PositionTexcoord.x+0.5)*u_OffsetScale.z-0.5,-u_OffsetScale.y+(a_PositionTexcoord.y+0.5)*u_OffsetScale.w-0.5, 0.0, 1.0);	
	v_Texcoord0 = a_PositionTexcoord.zw;
	gl_Position = remapGLPositionZ(gl_Position);
}