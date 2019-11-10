#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

uniform sampler2D u_MainTex;
uniform vec4 u_MainTex_TexelSize;

void fragDownsample4() {
	mediump vec4 color = downsampleBox4Tap(u_MainTex, v_Texcoord0, u_MainTex_TexelSize.xy);
	gl_FragColor = color;
}

void main() {
	fragDownsample4();
}