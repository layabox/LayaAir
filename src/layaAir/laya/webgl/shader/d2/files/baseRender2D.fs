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
    vec4 textureColor = texture2D(u_baseRender2DTexture, v_texcoord);

    #ifdef LIGHT_AND_SHADOW
        lightAndShadow(textureColor);
    #endif

    textureColor = transspaceColor(textureColor);
    setglColor(textureColor);
}