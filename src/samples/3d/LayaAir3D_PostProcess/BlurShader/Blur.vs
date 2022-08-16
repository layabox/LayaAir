#include "Camera.glsl";
varying vec2 v_Texcoord0;

void main() {
	gl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);
	v_Texcoord0 = a_PositionTexcoord.zw;
	gl_Position = remapPositionZ(gl_Position);
}