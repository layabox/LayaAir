
#define SHADER_NAME blurEffect2D

#include "Color.glsl"
#include "OutputTransform.glsl";


vec4 transspaceColor(vec4 color)
{
    
#ifndef GAMMATEXTURE
    //是linear数据
    #ifdef GAMMASPACE
        color.xyz = linearToGamma(color.xyz);    
    #endif
#else
    //gamma数据
    #ifndef GAMMASPACE
        color.xyz = gammaToLinear(color.xyz);
    #endif
#endif
    return color;
}

varying vec2 v_Texcoord0;

float getGaussian(float x, float y)
{
    return u_strength_sig2_2sig2_gauss1.w * exp(-(x * x + y * y) / u_strength_sig2_2sig2_gauss1.z);
}

// dest UV -> 原图 UV。原图居中画在扩张 RT 中，越界视为透明，避免 Repeat 采到对边杂色
vec4 sampleBlurTex(vec2 destUV)
{
    vec2 uv = (destUV - vec2(0.5, 0.5)) / u_centerScale + vec2(0.5, 0.5);
    vec2 sourceSize = u_blurInfo * u_centerScale;
    vec2 halfTexel = 0.5 / sourceSize;
    // Extend the source with transparent texels. At UV 0/1, bilinear
    // filtering must mix the edge texel with transparency at half weight.
    vec2 coverage = clamp(min(uv, 1.0 - uv) * sourceSize + 0.5, 0.0, 1.0);
    vec2 sampleUV = clamp(uv, halfTexel, 1.0 - halfTexel);
    // The input RT is already premultiplied; preserve RGB and alpha together.
    return texture2D(u_MainTex, sampleUV) * (coverage.x * coverage.y);
}

vec4 blur()
{
    const float blurw = 9.0;
    vec4 vec4Color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 step = 1.0 / u_blurInfo;
    vec2 halfsz = vec2(blurw, blurw) / 2.0 * step;
    vec2 startpos = v_Texcoord0.xy - halfsz;
    vec2 ctexcoord = startpos;

    for (float y = 0.0; y <= blurw; ++y)
    {
        ctexcoord.x = startpos.x;
        for (float x = 0.0; x <= blurw; ++x)
        {
            vec4Color += sampleBlurTex(ctexcoord) * getGaussian(x - blurw / 2.0, y - blurw / 2.0);
            ctexcoord.x += step.x;
        }
        ctexcoord.y += step.y;
    }
    return vec4Color;
}

void main()
{
    gl_FragColor = blur();
}
