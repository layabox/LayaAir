#define SHADER_NAME 2DTextureFS
//texture和fillrect使用的。
#if defined(GL_FRAGMENT_PRECISION_HIGH) // 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif

#include "Sprite2DFrag.glsl";

void main()
{
    clip();
    vec4 color = getSpriteTextureColor();
    setglColor(color);
}
