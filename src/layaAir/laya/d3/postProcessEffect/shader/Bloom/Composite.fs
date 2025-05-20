#define SHADER_NAME CompositeFS

#include "Color.glsl";
#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

vec4 samplerBloom(vec2 uv)
{
    vec4 mainSampler = texture2D(u_BloomTex, uv);
#ifdef Gamma_u_MainTex
    mainSampler = gammaToLinear(mainSampler);
#endif // Gamma_u_MainTex

    return mainSampler;
}

mediump vec4 upsampleTentBloom(vec2 uv, vec2 texelSize, vec4 sampleScale)
{
    vec4 d = texelSize.xyxy * vec4(1.0, 1.0, -1.0, 0.0) * sampleScale;

    mediump vec4 s = samplerBloom(uv - d.xy);
    s += samplerBloom(uv - d.wy) * 2.0;
    s += samplerBloom(uv - d.zy);

    s += samplerBloom(uv + d.zw) * 2.0;
    s += samplerBloom(uv) * 4.0;
    s += samplerBloom(uv + d.xw) * 2.0;

    s += samplerBloom(uv + d.zy);
    s += samplerBloom(uv + d.wy) * 2.0;
    s += samplerBloom(uv + d.xy);

    return s * (1.0 / 16.0);
}

mediump vec4 upsampleBoxBloom(vec2 uv, vec2 texelSize, vec4 sampleScale)
{
    vec4 d = texelSize.xyxy * vec4(-1.0, -1.0, 1.0, 1.0) * 0.5 * sampleScale;

    mediump vec4 s = samplerBloom(uv + d.xy);
    s += samplerBloom(uv + d.zy);
    s += samplerBloom(uv + d.xw);
    s += samplerBloom(uv + d.zw);

    return s * (1.0 / 4.0);
}

void main()
{
    vec4 autoExposureSampler = texture2D(u_AutoExposureTex, v_Texcoord0);
#ifdef Gamma_u_AutoExposureTex
    autoExposureSampler = gammaToLinear(autoExposureSampler);
#endif // Gamma_u_AutoExposureTex
    mediump float autoExposure = autoExposureSampler.r;

    mediump vec4 color = vec4(0.0);
    color = texture2D(u_MainTex, v_Texcoord0);
#ifdef Gamma_u_MainTex
    color = gammaToLinear(color);
#endif // Gamma_u_MainTex

    color.rgb *= autoExposure;

#if defined(BLOOM) || defined(BLOOM_LOW)
    #ifdef BLOOM
    mediump vec4 bloom = upsampleTentBloom(v_Texcoord0, u_BloomTex_TexelSize.xy, vec4(u_Bloom_Settings.x));
    #else
    mediump vec4 bloom = upsampleBoxBloom(v_Texcoord0, u_BloomTex_TexelSize.xy, vec4(u_Bloom_Settings.x));
    #endif

    // UVs should be Distort(uv * u_Bloom_DirtTileOffset.xy + u_Bloom_DirtTileOffset.zw)
    // but considering we use a cover-style scale on the dirt texture the difference
    // isn't massive so we chose to save a few ALUs here instead in case lens distortion
    // is active
    mediump vec4 dirt = vec4(texture2D(u_Bloom_DirtTex, v_Texcoord0 * u_Bloom_DirtTileOffset.xy + u_Bloom_DirtTileOffset.zw).rgb, 0.0);
    #ifdef Gamma_u_Bloom_DirtTex
    dirt = gammaToLinear(dirt);
    #endif // Gamma_u_Bloom_DirtTex

    // Additive bloom (artist friendly)
    bloom *= u_Bloom_Settings.y;
    dirt *= u_Bloom_Settings.z;
    mediump vec4 bloomColor = u_Bloom_Color;
    color += bloom * bloomColor;
    color += dirt * bloom;
#endif

    mediump vec4 finalColor = color;
    // finalColor = linearToSRGB(finalColor);
    // finalColor.rgb = Dither(finalColor.rgb, v_Texcoord0);//TODO:抖动
    gl_FragColor = finalColor;

    gl_FragColor = outputTransform(gl_FragColor);
}