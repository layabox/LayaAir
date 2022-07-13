#if !defined(TBNNormal_lib)
    #define TBNNormal_lib

    #ifdef NEEDTBN

mat3 generateTBNMat(in VertexParams params)
{
    vec3 normalWS = params.normalWS;
    vec3 tangentWS = params.tangentWS.xyz;
    vec3 biNormalWS = params.biNormalWS;

    mat3 TBNMat = mat3(tangentWS, biNormalWS, normalWS);
    return TBNMat;
}

vec3 sampleTBNNormalMap(in VertexParams params, in mat3 TBN, sampler2D normalMap, in vec2 uv)
{
    // vec2 uv = params.texCoord0;
    vec3 samplerNormal = texture2D(normalMap, uv).rgb;
    samplerNormal = normalize(samplerNormal * 2.0 - 1.0);;
    vec3 normalWS = normalize(TBN * samplerNormal);
    return normalWS;
}

    #endif // NEEDTBN

#endif // TBNNormal_lib