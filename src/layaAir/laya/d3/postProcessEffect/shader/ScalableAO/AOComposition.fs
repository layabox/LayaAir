#define SHADER_NAME AOComposition

#include "Color.glsl";

#define BLUR_HIGH_QUALITY 0

varying vec2 v_Texcoord0;

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

// Geometry-aware bilateral filter (single pass/small kernel)
float BlurSmall(vec2 uv, vec2 delta)
{
    vec4 p0 = texture2D(u_compositionAoTexture, uv);
    vec2 uvtran = uv + vec2(-delta.x, -delta.y);
    vec4 p1 = texture2D(u_compositionAoTexture, uvtran);
    uvtran = uv + vec2(delta.x, -delta.y);
    vec4 p2 = texture2D(u_compositionAoTexture, uvtran);
    uvtran = uv + vec2(-delta.x, delta.y);
    vec4 p3 = texture2D(u_compositionAoTexture, uvtran);
    uvtran = uv + delta;
    vec4 p4 = texture2D(u_compositionAoTexture, uvtran);

    vec3 n0 = GetPackedNormal(p0);

    float w0 = 1.0;
    float w1 = CompareNormal(n0, GetPackedNormal(p1));
    float w2 = CompareNormal(n0, GetPackedNormal(p2));
    float w3 = CompareNormal(n0, GetPackedNormal(p3));
    float w4 = CompareNormal(n0, GetPackedNormal(p4));

    float s;
    s = GetPackedAO(p0) * w0;
    s += GetPackedAO(p1) * w1;
    s += GetPackedAO(p2) * w2;
    s += GetPackedAO(p3) * w3;
    s += GetPackedAO(p4) * w4;

    return s / (w0 + w1 + w2 + w3 + w4);
}

void main()
{
    vec2 uv = v_Texcoord0;
    vec2 delty = u_MainTex_TexelSize.xy;
    float ao = BlurSmall(uv, delty);
    vec4 albedo = texture2D(u_MainTex, uv);
#ifdef Gamma_u_MainTex
    albedo = gammaToLinear(albedo);
#endif // Gamma_u_MainTex
    vec4 aocolor = vec4(ao * u_AOColor.rgb, ao);
    albedo.rgb = albedo.rgb * (1.0 - ao) + ao * u_AOColor.rgb * ao;
    gl_FragColor = albedo;

    gl_FragColor = outputTransform(gl_FragColor);
}