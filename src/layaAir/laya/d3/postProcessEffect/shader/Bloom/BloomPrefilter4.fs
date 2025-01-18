#define SHADER_NAME BloomPreFilter4FS

#include "Color.glsl";
#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

mediump vec4 prefilter(mediump vec4 color, vec2 uv)
{
    vec4 autoExposureSampler = texture2D(u_AutoExposureTex, uv);
#ifdef Gamma_u_AutoExposureTex
    autoExposureSampler = gammaToLinear(autoExposureSampler);
#endif // Gamma_u_AutoExposureTex

    mediump float autoExposure = autoExposureSampler.r;
    color *= autoExposure;
    color = min(vec4(u_Params.x), color); // clamp to max
    color = quadraticThreshold(color, u_Threshold.x, u_Threshold.yzw);
    return color;
}

void fragPrefilter4()
{
    mediump vec4 color = downsampleBox4Tap(u_MainTex, v_Texcoord0, u_MainTex_TexelSize.xy);
    gl_FragColor = prefilter(safeHDR(color), v_Texcoord0);
}

void main()
{
    fragPrefilter4();

    gl_FragColor = outputTransform(gl_FragColor);
}