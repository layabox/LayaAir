#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

uniform sampler2D u_MainTex;
uniform sampler2D u_AutoExposureTex;
uniform vec4 u_MainTex_TexelSize;
uniform vec4 u_Threshold; // x: threshold value (linear), y: threshold - knee, z: knee * 2, w: 0.25 / knee
uniform vec4 u_Params; // x: clamp, yzw: unused

mediump vec4 prefilter(mediump vec4 color, vec2 uv) {
	mediump float autoExposure = texture2D(u_AutoExposureTex, uv).r;
	color *= autoExposure;
	color = min(vec4(u_Params.x), color); // clamp to max
	color = quadraticThreshold(color, u_Threshold.x, u_Threshold.yzw);
	return color;
}

void fragPrefilter13() {
	mediump vec4 color = downsampleBox13Tap(u_MainTex, v_Texcoord0, u_MainTex_TexelSize.xy);
	gl_FragColor = prefilter(safeHDR(color), v_Texcoord0);
}

void main() {
	fragPrefilter13();
}