#define SHADER_NAME ShadowGen2D_PS
#if defined(GL_FRAGMENT_PRECISION_HIGH) // 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif

#include "Sprite2DFrag.glsl";

void main()
{
    vec2 t = step(vec2(0.0), v_texcoord) * step(v_texcoord, vec2(1.0));
    gl_FragColor = texture2D(u_baseRender2DTexture, v_texcoord) * v_color * t.x * t.y;
}