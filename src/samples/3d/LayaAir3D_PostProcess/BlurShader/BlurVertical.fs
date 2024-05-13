#define SHADER_NAME BlurVertical

#include "Color.glsl";

varying vec2 v_Texcoord0;

vec4 sampleMainTex(sampler2D tex, vec2 uv)
{
#ifdef BLITSCREEN_INVERTY
    uv.y = 1.0 - uv.y;
#endif
    vec4 mainSampler = texture2D(tex, uv);
#ifdef Gamma_u_MainTex
    mainSampler = gammaToLinear(mainSampler);
#endif // Gamma_u_MainTex
    return mainSampler;
}

void main()
{
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 uv = v_Texcoord0;
    vec2 uvOffset = vec2(0.0, 1.0) * u_MainTex_TexelSize.xy * u_DownSampleValue;
    uv = uv - uvOffset * 3.0;
    //高斯参数
    color += 0.0205 * sampleMainTex(u_MainTex, uv);
    uv += uvOffset;
    color += 0.0855 * sampleMainTex(u_MainTex, uv);
    uv += uvOffset;
    color += 0.232 * sampleMainTex(u_MainTex, uv);
    uv += uvOffset;
    color += 0.324 * sampleMainTex(u_MainTex, uv);
    uv += uvOffset;
    color += 0.232 * sampleMainTex(u_MainTex, uv);
    uv += uvOffset;
    color += 0.0855 * sampleMainTex(u_MainTex, uv);
    uv += uvOffset;
    color += 0.0205 * sampleMainTex(u_MainTex, uv);

    gl_FragColor = color;

    gl_FragColor = outputTransform(gl_FragColor);
}