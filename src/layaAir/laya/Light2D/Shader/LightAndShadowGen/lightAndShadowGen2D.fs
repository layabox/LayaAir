#define SHADER_NAME LightAndShadowGen2D_PS
#if defined(GL_FRAGMENT_PRECISION_HIGH) // 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif

//将2D方向矢量编码为角度（0~1）
float encodeVector2D(vec2 dir) {
    //确保输入向量在有效范围内
    dir = clamp(dir, -1.0, 1.0);

    //计算角度（atan2返回弧度，范围为-π到π）
    float angle = atan(dir.y, dir.x);

    //将角度从[-π, π]映射到[0, 1]
    return abs(angle * (1.0 / 3.14159));
}

#include "Sprite2DFrag.glsl";

varying vec2 v_uv;

void main()
{
    vec2 uv = v_texcoord;
    vec2 t = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    vec4 textureColor = texture2D(u_baseRender2DTexture, uv) * t.x * t.y;
    textureColor = transspaceColor(textureColor);
    setglColor(textureColor);
    gl_FragColor.rgb *= v_color.rgb * u_PCFIntensity;
    float lumin = gl_FragColor.r * 0.3 + gl_FragColor.g * 0.59 + gl_FragColor.b * 0.11;
    vec2 dir = vec2(v_uv.x - 0.5, v_uv.y - 0.5);
    gl_FragColor.a = encodeVector2D(dir) * lumin; //方向编码到A通道
}