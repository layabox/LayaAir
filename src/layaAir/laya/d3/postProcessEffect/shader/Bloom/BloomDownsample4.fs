#define SHADER_NAME BloomDownSample4FS

#include "Color.glsl";
#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

void fragDownsample4()
{
    mediump vec4 color = downsampleBox4Tap(u_MainTex, v_Texcoord0, u_MainTex_TexelSize.xy);
    gl_FragColor = color;
}

void main()
{
    fragDownsample4();

    gl_FragColor = outputTransform(gl_FragColor);
}