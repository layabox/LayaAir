#define SHADER_NAME BlurHorizontal

#include "Color.glsl";

varying vec2 v_Texcoord0;

vec4 sampleMainTex(vec2 uv)
{
    vec4 mainSampler = texture2D(u_MainTex, uv);
#ifdef Gamma_u_MainTex
    mainSampler = gammaToLinear(mainSampler);
#endif // Gamma_u_MainTex
    return mainSampler;
}

void main()
{
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 uv = v_Texcoord0;
    vec2 uvOffset = vec2(1.0, 0.0) * u_MainTex_TexelSize.xy * u_DownSampleValue;
    uv = uv - uvOffset * 3.0;
    //高斯参数
    color += 0.0205 * sampleMainTex(uv);
    uv += uvOffset;
    color += 0.0855 * sampleMainTex(uv);
    uv += uvOffset;
    color += 0.232 * sampleMainTex(uv);
    uv += uvOffset;
    color += 0.324 * sampleMainTex(uv);
    uv += uvOffset;
    color += 0.232 * sampleMainTex(uv);
    uv += uvOffset;
    color += 0.0855 * sampleMainTex(uv);
    uv += uvOffset;
    color += 0.0205 * sampleMainTex(uv);

    gl_FragColor = color;

    gl_FragColor = outputTransform(gl_FragColor);
}