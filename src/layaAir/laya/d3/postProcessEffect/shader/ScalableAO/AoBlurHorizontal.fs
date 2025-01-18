#define SHADER_NAME AOBlurHorizontal
//质量
#define BLUR_HIGH_QUALITY 0

varying vec2 v_Texcoord0;

// uniform vec2 u_Delty;

vec3 GetPackedNormal(vec4 p)
{
    return p.gba * 2.0 - 1.0;
}

float CompareNormal(vec3 d1, vec3 d2)
{
    return smoothstep(0.8, 1.0, dot(d1, d2));
}

float GetPackedAO(vec4 p)
{
    return p.r;
}

vec4 PackAONormal(float ao, vec3 normal)
{
    return vec4(ao, normal * 0.5 + 0.5);
}

void main()
{
    vec2 delta = vec2(u_MainTex_TexelSize.x * 2.0 * u_Delty.x, u_Delty.y * u_MainTex_TexelSize.y * 2.0);
    vec2 uv = v_Texcoord0;

// #if defined(BLUR_HIGH_QUALITY) //兼容WGSL

    // High quality 7-tap Gaussian with adaptive sampling
    vec2 uvtran = uv;
    vec4 p0 = texture2D(u_MainTex, uv);
    uvtran = uv - delta;
    vec4 p1a = texture2D(u_MainTex, uvtran);
    uvtran = uv + delta;
    vec4 p1b = texture2D(u_MainTex, uvtran);
    uvtran = uv - delta * 2.0;
    vec4 p2a = texture2D(u_MainTex, uvtran);
    uvtran = uv + delta * 2.0;
    vec4 p2b = texture2D(u_MainTex, uvtran);
    uvtran = uv - delta * 3.2307692308;
    vec4 p3a = texture2D(u_MainTex, uvtran);
    ;
    uvtran = uv + delta * 3.2307692308;
    vec4 p3b = texture2D(u_MainTex, uvtran);
    ;

    vec3 n0 = GetPackedNormal(p0);

    float w0 = 0.37004405286;
    float w1a = CompareNormal(n0, GetPackedNormal(p1a)) * 0.31718061674;
    float w1b = CompareNormal(n0, GetPackedNormal(p1b)) * 0.31718061674;
    float w2a = CompareNormal(n0, GetPackedNormal(p2a)) * 0.19823788546;
    float w2b = CompareNormal(n0, GetPackedNormal(p2b)) * 0.19823788546;
    float w3a = CompareNormal(n0, GetPackedNormal(p3a)) * 0.11453744493;
    float w3b = CompareNormal(n0, GetPackedNormal(p3b)) * 0.11453744493;

    float s;
    s = GetPackedAO(p0) * w0;
    s += GetPackedAO(p1a) * w1a;
    s += GetPackedAO(p1b) * w1b;
    s += GetPackedAO(p2a) * w2a;
    s += GetPackedAO(p2b) * w2b;
    s += GetPackedAO(p3a) * w3a;
    s += GetPackedAO(p3b) * w3b;

    s /= w0 + w1a + w1b + w2a + w2b + w3a + w3b;

// #else

//     // Fater 5-tap Gaussian with linear sampling
//     vec4 p0 = texture2D(u_MainTex, sampler_MainTex, i.texcoordStereo);
//     vec4 p1a = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, UnityStereoTransformScreenSpaceTex(i.texcoord - delta * 1.3846153846));
//     vec4 p1b = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, UnityStereoTransformScreenSpaceTex(i.texcoord + delta * 1.3846153846));
//     vec4 p2a = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, UnityStereoTransformScreenSpaceTex(i.texcoord - delta * 3.2307692308));
//     vec4 p2b = SAMPLE_TEXTURE2D(_MainTex, sampler_MainTex, UnityStereoTransformScreenSpaceTex(i.texcoord + delta * 3.2307692308));

//     vec2 uvtran = uv;
//     vec4 p0 = texture2D(u_MainTex, uv);
//     uvtran = uv - delta * 1.3846153846;
//     vec4 p1a = texture2D(u_MainTex, uvtran);
//     uvtran = uv + delta * 1.3846153846;
//     vec4 p1b = texture2D(u_MainTex, uvtran);
//     uvtran = uv - delta * 3.2307692308;
//     vec4 p2a = texture2D(u_MainTex, uvtran);
//     uvtran = uv + delta * 3.2307692308;
//     vec4 p2b = texture2D(u_MainTex, uvtran);

//     vec3 n0 = GetPackedNormal(p0);

//     float w0 = 0.2270270270;
//     float w1a = CompareNormal(n0, GetPackedNormal(p1a)) * 0.3162162162;
//     float w1b = CompareNormal(n0, GetPackedNormal(p1b)) * 0.3162162162;
//     float w2a = CompareNormal(n0, GetPackedNormal(p2a)) * 0.0702702703;
//     float w2b = CompareNormal(n0, GetPackedNormal(p2b)) * 0.0702702703;

//     float s;
//     s = GetPackedAO(p0) * w0;
//     s += GetPackedAO(p1a) * w1a;
//     s += GetPackedAO(p1b) * w1b;
//     s += GetPackedAO(p2a) * w2a;
//     s += GetPackedAO(p2b) * w2b;

//     s /= w0 + w1a + w1b + w2a + w2b;

// #endif

    gl_FragColor = PackAONormal(s, n0);
}