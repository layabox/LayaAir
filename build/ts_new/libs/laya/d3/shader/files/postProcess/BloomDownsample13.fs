#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

uniform sampler2D u_MainTex;
uniform vec4 u_MainTex_TexelSize;

void fragDownsample13() {
	mediump vec4 color = downsampleBox13Tap(u_MainTex, v_Texcoord0, u_MainTex_TexelSize.xy);
	gl_FragColor = color;
}

void main() {
	fragDownsample13();
}