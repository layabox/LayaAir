#define SHADER_NAME BlurDownSample

#include "Color.glsl";

varying vec2 v_Texcoord0;

vec4 sampleMainTex(sampler2D tex, vec2 uv)
{
    vec4 mainSampler = texture2D(tex, uv);
#ifdef Gamma_u_MainTex
    mainSampler = gammaToLinear(mainSampler);
#endif // Gamma_u_MainTex
    return mainSampler;
}

void main()
{
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    color += sampleMainTex(u_MainTex, v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(1.0, 0.0));
    color += sampleMainTex(u_MainTex, v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(-1.0, 0.0));
    color += sampleMainTex(u_MainTex, v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(0.0, -1.0));
    color += sampleMainTex(u_MainTex, v_Texcoord0 + u_MainTex_TexelSize.xy * vec2(0.0, 1.0));
    gl_FragColor = color / 4.0;

    gl_FragColor = outputTransform(gl_FragColor);
}