#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

uniform sampler2D u_MainTex;
uniform sampler2D u_BloomTex;

uniform vec4 u_MainTex_TexelSize;
uniform float u_SampleScale;

mediump vec4 combine(mediump vec4 bloom, vec2 uv) {
	mediump vec4 color = texture2D(u_BloomTex, uv);
	return bloom + color;
}

void fragUpsampleTent() {
	mediump vec4 bloom = upsampleTent(u_MainTex, v_Texcoord0, u_MainTex_TexelSize.xy, vec4(u_SampleScale));
	gl_FragColor = combine(bloom, v_Texcoord0);
}

void main() {
	fragUpsampleTent();
}