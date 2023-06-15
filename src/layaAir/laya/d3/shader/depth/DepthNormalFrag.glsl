#if !defined(DepthNormalFrag_lib)
    #define DepthNormalFrag_lib

    #include "DepthNormalUtil.glsl";

vec4 encodeDepthNormal(const in vec4 positionCS, const in vec3 normalWS)
{
    float depth = (positionCS.z * 2.0 - positionCS.w) * u_ProjectionParams.w;

    vec3 normalVS = mat3(u_View) * normalWS;

    return EncodeDepthNormal(depth, normalVS);
}

#endif // DepthNormalFrag_lib