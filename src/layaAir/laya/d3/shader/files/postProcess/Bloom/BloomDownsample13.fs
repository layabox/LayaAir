#define SHADER_NAME BloomDownSample13FS
#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

void fragDownsample13() {
	mediump vec4 color = downsampleBox13Tap(u_MainTex, v_Texcoord0, u_MainTex_TexelSize.xy);
	gl_FragColor = color;
}

void main() {
	fragDownsample13();
}