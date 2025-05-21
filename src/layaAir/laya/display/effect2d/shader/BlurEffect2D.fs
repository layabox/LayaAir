
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

vec4 blur()
{
    const float blurw = 9.0;
    vec4 vec4Color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 halfsz = vec2(blurw, blurw) / 2.0 / u_blurInfo;
    vec2 startpos = v_Texcoord0.xy - halfsz;
    vec2 ctexcoord = startpos;
    vec2 step = 1.0 / u_blurInfo; //每个像素

    for (float y = 0.0; y <= blurw; ++y)
    {
        ctexcoord.x = startpos.x;
        for (float x = 0.0; x <= blurw; ++x)
        {
            // TODO 纹理坐标的固定偏移应该在vs中处理
            vec4Color +=texture2D(u_MainTex, ctexcoord) * getGaussian(x - blurw / 2.0, y - blurw / 2.0);
            ctexcoord.x += step.x;
        }
        ctexcoord.y += step.y;
    }
    //vec4Color.a=1.0;// 这个会导致丢失alpha。以后有时间再找模糊会导致透明的问题
    return vec4Color;
}

void main()
{
        gl_FragColor = blur();
    //  gl_FragColor= texture2D(u_MainTex, v_Texcoord0);
}