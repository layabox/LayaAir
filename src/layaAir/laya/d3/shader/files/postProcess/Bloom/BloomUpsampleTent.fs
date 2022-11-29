#define SHADER_NAME BloomUpSampleTentFS

#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

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