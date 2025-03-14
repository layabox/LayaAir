#define SHADER_NAME BaseRender2DPS
#if defined(GL_FRAGMENT_PRECISION_HIGH) // 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif

#include "Sprite2DFrag.glsl";

void main()
{
    clip();
    vec4 textureColor;
#ifdef CLIPMODE
    vec2 texcoord = fract(v_texcoord.xy) * u_baseRender2DTextureRange.zw + u_baseRender2DTextureRange.xy;
    textureColor = texture2D(u_baseRender2DTexture, texcoord);
#else
    vec2 texcoord = v_texcoord.xy;
    vec2 inRange = step(u_baseRender2DTextureRange.xy, texcoord) * step(texcoord, u_baseRender2DTextureRange.xy + u_baseRender2DTextureRange.zw);
    float useTexture = inRange.x * inRange.y;
    texcoord = fract(texcoord) ;
    textureColor = mix(vec4(0.0,0.0,0.0,0.0), texture2D(u_baseRender2DTexture, texcoord), useTexture);
#endif

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(textureColor);
    #endif

    textureColor = transspaceColor(textureColor);
    setglColor(textureColor);
}