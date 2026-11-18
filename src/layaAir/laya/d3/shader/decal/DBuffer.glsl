#ifndef LayaDBuffer_lib
#define LayaDBuffer_lib

#if defined(LAYA_DBUFFER) && !defined(DECAL_PROJECTOR)
uniform sampler2D u_DBufferTexture0;
uniform sampler2D u_DBufferTexture1;
uniform sampler2D u_DBufferTexture2;
uniform vec4 u_DBufferScreenParams;

vec2 decalReceiverUV()
{
    return (gl_FragCoord.xy + u_DBufferScreenParams.xy) * u_DBufferScreenParams.zw;
}
#endif

void applyDBufferColor(inout vec3 color)
{
    #if defined(LAYA_DBUFFER) && !defined(DECAL_PROJECTOR)
    vec4 base = texture2D(u_DBufferTexture0, decalReceiverUV());
    color = color * base.a + base.rgb;
    #endif
}

void applyDBufferSurface(inout vec3 color, inout float metallic, inout float smoothness, inout float occlusion)
{
    #if defined(LAYA_DBUFFER) && !defined(DECAL_PROJECTOR)
    vec2 uv = decalReceiverUV();
    vec4 base = texture2D(u_DBufferTexture0, uv);
    vec4 maos = texture2D(u_DBufferTexture2, uv);
    color = color * base.a + base.rgb;
    metallic = metallic * maos.a + maos.r;
    occlusion = occlusion * maos.a + maos.g;
    smoothness = smoothness * maos.a + maos.b;
    #endif
}

void applyDBufferNormal(inout vec3 normalWS)
{
    #if defined(LAYA_DBUFFER) && !defined(DECAL_PROJECTOR)
    vec4 normal = texture2D(u_DBufferTexture1, decalReceiverUV());
    if (normal.a < 1.0)
    {
        // The normal target clears to (0.5, 0.5, 0.5, 1). Its neutral RGB
        // cancels the encoding bias while A stores remaining receiver weight.
        // 法线目标清为 (0.5, 0.5, 0.5, 1)：中性 RGB 抵消编码偏移，
        // A 保存接收表面法线的剩余权重。
        vec3 combined = normalWS * normal.a + (normal.rgb * 2.0 - 1.0);
        float lengthSquared = dot(combined, combined);
        if (lengthSquared > 0.000001)
            normalWS = combined * inversesqrt(lengthSquared);
    }
    #endif
}
#endif
