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
    vec2 texcoord = v_texcoord.xy;
    // 限制u_baseRender2DTextureRange的xy范围大于0，zw范围小于1
    vec4 clampedRange = u_baseRender2DTextureRange;
    clampedRange.xy = max(u_baseRender2DTextureRange.xy, vec2(0.0, 0.0));
    clampedRange.zw = min(u_baseRender2DTextureRange.xy+u_baseRender2DTextureRange.zw, vec2(1.0, 1.0));
    vec2 inRange = step(clampedRange.xy, texcoord) * step(texcoord, clampedRange.zw);
    float useTexture = inRange.x * inRange.y;
    texcoord = fract(texcoord) ;
    textureColor = mix(vec4(0.0,0.0,0.0,0.0), texture2D(u_baseRender2DTexture, texcoord), useTexture);
#else
    vec2 texcoord = v_texcoord.xy * u_baseRender2DTextureRange.zw + u_baseRender2DTextureRange.xy;
    textureColor = texture2D(u_baseRender2DTexture, texcoord);
#endif

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(textureColor);
    #endif

    textureColor = transspaceColor(textureColor);
    setglColor(textureColor);
}