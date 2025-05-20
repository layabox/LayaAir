
// todo only sampler u_MainTex
vec4 samplerTex(vec2 uv)
{
    vec4 mainSampler = texture2D(u_MainTex, uv);
#ifdef Gamma_u_MainTex
    mainSampler = gammaToLinear(mainSampler);
#endif // Gamma_u_MainTex

    return mainSampler;
}

// Better, temporally stable box filtering
// [Jimenez14] http://goo.gl/eomGso
// . . . . . . .
// . A . B . C .
// . . D . E . .
// . F . G . H .
// . . I . J . .
// . K . L . M .
// . . . . . . .
mediump vec4 downsampleBox13Tap(vec2 uv, vec2 texelSize)
{
    mediump vec4 A = samplerTex(uv + texelSize * vec2(-1.0, -1.0));
    mediump vec4 B = samplerTex(uv + texelSize * vec2(0.0, -1.0));
    mediump vec4 C = samplerTex(uv + texelSize * vec2(1.0, -1.0));
    mediump vec4 D = samplerTex(uv + texelSize * vec2(-0.5, -0.5));
    mediump vec4 E = samplerTex(uv + texelSize * vec2(0.5, -0.5));
    mediump vec4 F = samplerTex(uv + texelSize * vec2(-1.0, 0.0));
    mediump vec4 G = samplerTex(uv);
    mediump vec4 H = samplerTex(uv + texelSize * vec2(1.0, 0.0));
    mediump vec4 I = samplerTex(uv + texelSize * vec2(-0.5, 0.5));
    mediump vec4 J = samplerTex(uv + texelSize * vec2(0.5, 0.5));
    mediump vec4 K = samplerTex(uv + texelSize * vec2(-1.0, 1.0));
    mediump vec4 L = samplerTex(uv + texelSize * vec2(0.0, 1.0));
    mediump vec4 M = samplerTex(uv + texelSize * vec2(1.0, 1.0));

    mediump vec2 scale = vec2(0.5, 0.125);
    mediump vec2 div = (1.0 / 4.0) * scale;

    mediump vec4 o = (D + E + I + J) * div.x;
    o += (A + B + G + F) * div.y;
    o += (B + C + H + G) * div.y;
    o += (F + G + L + K) * div.y;
    o += (G + H + M + L) * div.y;

    return o;
}

// Standard box filtering
mediump vec4 downsampleBox4Tap(vec2 uv, vec2 texelSize)
{
    vec4 d = texelSize.xyxy * vec4(-1.0, -1.0, 1.0, 1.0);

    mediump vec4 s = samplerTex(uv + d.xy);
    s += samplerTex(uv + d.zy);
    s += samplerTex(uv + d.xw);
    s += samplerTex(uv + d.zw);

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
mediump vec4 upsampleTent(vec2 uv, vec2 texelSize, vec4 sampleScale)
{
    vec4 d = texelSize.xyxy * vec4(1.0, 1.0, -1.0, 0.0) * sampleScale;

    mediump vec4 s = samplerTex(uv - d.xy);
    s += samplerTex(uv - d.wy) * 2.0;
    s += samplerTex(uv - d.zy);

    s += samplerTex(uv + d.zw) * 2.0;
    s += samplerTex(uv) * 4.0;
    s += samplerTex(uv + d.xw) * 2.0;

    s += samplerTex(uv + d.zy);
    s += samplerTex(uv + d.wy) * 2.0;
    s += samplerTex(uv + d.xy);

    return s * (1.0 / 16.0);
}

// Standard box filtering
mediump vec4 upsampleBox(vec2 uv, vec2 texelSize, vec4 sampleScale)
{
    vec4 d = texelSize.xyxy * vec4(-1.0, -1.0, 1.0, 1.0) * 0.5 * sampleScale;

    mediump vec4 s = samplerTex(uv + d.xy);
    s += samplerTex(uv + d.zy);
    s += samplerTex(uv + d.xw);
    s += samplerTex(uv + d.zw);

    return s * (1.0 / 4.0);
}