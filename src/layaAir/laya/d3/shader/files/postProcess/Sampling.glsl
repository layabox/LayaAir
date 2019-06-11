// Better, temporally stable box filtering
// [Jimenez14] http://goo.gl/eomGso
// . . . . . . .
// . A . B . C .
// . . D . E . .
// . F . G . H .
// . . I . J . .
// . K . L . M .
// . . . . . . .
mediump vec4 downsampleBox13Tap(sampler2D tex, vec2 uv, vec2 texelSize)
{
    mediump vec4 A = texture2D(tex, uv + texelSize * vec2(-1.0, -1.0));
    mediump vec4 B = texture2D(tex, uv + texelSize * vec2( 0.0, -1.0));
    mediump vec4 C = texture2D(tex, uv + texelSize * vec2( 1.0, -1.0));
    mediump vec4 D = texture2D(tex, uv + texelSize * vec2(-0.5, -0.5));
    mediump vec4 E = texture2D(tex, uv + texelSize * vec2( 0.5, -0.5));
    mediump vec4 F = texture2D(tex, uv + texelSize * vec2(-1.0,  0.0));
    mediump vec4 G = texture2D(tex, uv);
    mediump vec4 H = texture2D(tex, uv + texelSize * vec2( 1.0,  0.0));
    mediump vec4 I = texture2D(tex, uv + texelSize * vec2(-0.5,  0.5));
    mediump vec4 J = texture2D(tex, uv + texelSize * vec2( 0.5,  0.5));
    mediump vec4 K = texture2D(tex, uv + texelSize * vec2(-1.0,  1.0));
    mediump vec4 L = texture2D(tex, uv + texelSize * vec2( 0.0,  1.0));
    mediump vec4 M = texture2D(tex, uv + texelSize * vec2( 1.0,  1.0));

	mediump vec2 scale= vec2(0.5, 0.125);
    mediump vec2 div = (1.0 / 4.0) * scale;

    mediump vec4 o = (D + E + I + J) * div.x;
    o += (A + B + G + F) * div.y;
    o += (B + C + H + G) * div.y;
    o += (F + G + L + K) * div.y;
    o += (G + H + M + L) * div.y;

    return o;
}

// Standard box filtering
mediump vec4 downsampleBox4Tap(sampler2D tex, vec2 uv, vec2 texelSize)
{
    vec4 d = texelSize.xyxy * vec4(-1.0, -1.0, 1.0, 1.0);

    mediump vec4 s =  texture2D(tex, uv + d.xy);
    s += texture2D(tex, uv + d.zy);
    s += texture2D(tex, uv + d.xw);
    s += texture2D(tex, uv + d.zw);

    return s * (1.0 / 4.0);
}

// 9-tap bilinear upsampler (tent filter)
// . . . . . . .
// . 1 . 2 . 1 .
// . . . . . . .
// . 2 . 4 . 2 .
// . . . . . . .
// . 1 . 2 . 1 .
// . . . . . . .
mediump vec4 upsampleTent(sampler2D tex, vec2 uv, vec2 texelSize, vec4 sampleScale)
{
    vec4 d = texelSize.xyxy * vec4(1.0, 1.0, -1.0, 0.0) * sampleScale;

    mediump vec4 s =  texture2D(tex, uv - d.xy);
    s += texture2D(tex, uv - d.wy) * 2.0;
    s += texture2D(tex, uv - d.zy);

    s += texture2D(tex, uv + d.zw) * 2.0;
    s += texture2D(tex, uv) * 4.0;
    s += texture2D(tex,	uv + d.xw) * 2.0;

    s += texture2D(tex, uv + d.zy);
    s += texture2D(tex, uv + d.wy) * 2.0;
    s += texture2D(tex, uv + d.xy);

    return s * (1.0 / 16.0);
}

// Standard box filtering
mediump vec4 upsampleBox(sampler2D tex, vec2 uv, vec2 texelSize, vec4 sampleScale)
{
    vec4 d = texelSize.xyxy * vec4(-1.0, -1.0, 1.0, 1.0) * 0.5 * sampleScale;

    mediump vec4 s =  texture2D(tex, uv + d.xy);
    s += texture2D(tex, uv + d.zy);
    s += texture2D(tex, uv + d.xw);
    s += texture2D(tex, uv + d.zw);

    return s * (1.0 / 4.0);
}