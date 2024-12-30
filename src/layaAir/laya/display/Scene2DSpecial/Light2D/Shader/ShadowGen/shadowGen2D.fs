#define SHADER_NAME ShadowGen2D_PS
#if defined(GL_FRAGMENT_PRECISION_HIGH) // 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif

#include "Sprite2DFrag.glsl";

void main()
{
    vec2 uv = v_texcoord;
    vec2 t = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    vec4 textureColor = texture2D(u_baseRender2DTexture, uv) * t.x * t.y;
    textureColor = transspaceColor(textureColor);
    setglColor(textureColor);
    gl_FragColor.rgb *= v_color.rgb;
    gl_FragColor.a = 0.0;
}