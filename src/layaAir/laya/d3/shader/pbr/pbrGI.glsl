#if !defined(pbrGI_lib)
    #define pbrGI_lib

    #include "globalIllumination.glsl";

    #ifdef ANISOTROPIC
vec3 anisotropyBentNormal(const in Surface surface, const in PixelInfo info)
{
    float anisotropy = surface.anisotropy;
    vec3 anisotropyDirection = info.anisotropicB;

    vec3 n = info.normalWS;
    vec3 v = info.viewDir;

    // float tangentRoughness = mix(roughness, 1.0, anisotropy * anisotropy);
    float roughness = surface.perceptualRoughness;
    vec3 anisotropicTangent = cross(anisotropyDirection, v);
    vec3 anisotropicNormal = cross(anisotropicTangent, anisotropyDirection);
    float bendFactor = 1.0 - anisotropy * (1.0 - roughness);
    float bendFactorPow4 = pow2(bendFactor) * pow2(bendFactor);
    vec3 bentNormal = normalize(mix(anisotropicNormal, n, bendFactorPow4));

    return bentNormal;
}
    #endif // ANISOTROPIC

// 获取反射向量
vec3 getReflectedVector(const in vec3 n, const in vec3 v, const in vec3 positionWS)
{
    vec3 r;
    r = reflect(-v, n);

    #ifdef SPECCUBE_BOX_PROJECTION
    r = getBoxProjectionReflectedVector(r, positionWS);
    #endif // SPECCUBE_BOX_PROJECTION

    return r;
}

    #ifdef IRIDESCENCE
void iridescenceIBL(const in Surface surface, const in PixelInfo info, in vec3 E, inout vec3 Fd, inout vec3 Fr)
{
    vec3 dfg = info.dfg;
    float NoV = info.NoV;
    vec3 n = info.normalWS;
    vec3 v = info.viewDir;
    vec3 positionWS = info.positionWS;
    vec3 iridescenceFresnel = info.iridescenceFresnel;

    vec3 diffuseColor = surface.diffuseColor;
    float roughness = surface.perceptualRoughness;
    float occlusion = surface.occlusion;
    vec3 f0 = surface.f0;
    float iridescenceFactor = surface.iridescence;

    // vec3 iridescenceFresnelMax = vec3(vecmax(iridescenceFresnel));
    // vec3 schlickFresnel = F_Schlick(f0, vec3(1.0), NoV);
    // vec3 F = mix(schlickFresnel, iridescenceFresnelMax, iridescenceFactor);

    // vec3 E = mix(dfg.xxx, dfg.yyy, F);

    // diffuse
    vec3 irradiance = diffuseIrradiance(n, positionWS, info.viewDir);
    Fd += diffuseColor * irradiance * (1.0 - E) * occlusion;

    // specular
    vec3 iridescenceF0 = mix(surface.f0, iridescenceFresnel, vec3(iridescenceFactor));
    vec3 Er = mix(dfg.xxx, dfg.yyy, iridescenceF0);

	#ifdef ANISOTROPIC
    vec3 bentNormal = anisotropyBentNormal(surface, info);
    vec3 r = getReflectedVector(bentNormal, v, positionWS);
	#else // ANISOTROPIC
    vec3 r = getReflectedVector(n, v, positionWS);
	#endif // ANISOTROPIC

    vec3 indirectSpecular = specularIrradiance(r, roughness);
    Fr += Er * indirectSpecular * occlusion * (1.0 + Er * (1.0 / dfg.y - 1.0));
}
    #endif // IRIDESCENCE

    #ifdef SHEEN
void sheenIBL(const in Surface surface, const in PixelInfo info, inout vec3 Fd, inout vec3 Fr)
{
    vec3 v = info.viewDir;
    vec3 n = info.normalWS;
    vec3 positionWS = info.positionWS;

    float occlusion = surface.occlusion;
    float roughness = surface.sheenPerceptualRoughness;

    Fd *= info.sheenScaling;
    Fr *= info.sheenScaling;

    vec3 r = getReflectedVector(n, v, positionWS);
    vec3 indirectSpecular = specularIrradiance(r, roughness);

    Fr += indirectSpecular * info.sheenDfg * surface.sheenColor * occlusion;
}
    #endif // SHEEN

    #ifdef CLEARCOAT
void clearCoatIBL(const in Surface surface, const in PixelInfo info, inout vec3 Fd, inout vec3 Fr)
{
    vec3 v = info.viewDir;
    vec3 n = info.clearCoatNormal;
    float NoV = info.clearCoatNoV;
    vec3 positionWS = info.positionWS;

    float clearCoat = surface.clearCoat;
    float roughness = surface.clearCoatPerceptualRoughness;
    float occlusion = surface.occlusion;

    float Fc = F_Schlick(0.04, 1.0, NoV) * clearCoat;
    float attenuation = 1.0 - Fc;
    Fd *= attenuation;
    Fr *= attenuation;

    vec3 r = getReflectedVector(n, v, positionWS);
    vec3 indirectSpecular = specularIrradiance(r, roughness);

    Fr += indirectSpecular * Fc * occlusion;
}
    #endif // CLEARCOAT

    #ifdef TRANSMISSION
vec3 transmissionIBL(const in Surface surface, const in PixelInfo info, in vec3 E)
{
    vec3 n = info.normalWS;
    // ray
    vec3 position = info.positionWS;
    vec3 direction = -info.viewDir;
    float d = 0.0;

    // todo ior
    float airIor = 1.0;
    float ior = surface.ior;
    float etaIR = airIor / ior;
    float etaRI = ior / airIor;

    E *= 1.0 + surface.transmission * (1.0 - E.g) / (1.0 + E.g);

    // todo
    // only ibl
    // float perceptualRoughness = mix(surface.perceptualRoughness, 0.0, saturate(etaIR * 3.0 - 2.0));
    // vec3 Ft = specularIrradiance(direction, perceptualRoughness);

    // ssr
    vec4 p = u_ViewProjection * vec4(position, 1.0);
    p.xy = p.xy * (0.5 / p.w) + 0.5;
    // const float invLog2sqrt5 = 0.8614;
    // float lod = max(0.0, (2.0 * log2(perceptualRoughness) + frameUniforms.refractionLodOffset) * invLog2sqrt5);
    float lod = log2(1024.0) * surface.perceptualRoughness * saturate(surface.ior * 2.0 - 2.0);
    // todo
    vec3 Ft = texture2DLodEXT(u_CameraOpaqueTexture, p.xy, lod).xyz;

    Ft *= surface.diffuseColor;

    Ft *= 1.0 - E;

    return Ft;
}
    #endif // TRANSMISSION

void baseIBL(const in Surface surface, const in PixelInfo info, in vec3 E, inout vec3 Fd, inout vec3 Fr)
{
    vec3 dfg = info.dfg;
    float NoV = info.NoV;
    vec3 n = info.normalWS;
    vec3 v = info.viewDir;
    vec3 positionWS = info.positionWS;

    vec3 diffuseColor = surface.diffuseColor;
    float roughness = surface.perceptualRoughness;
    vec3 f0 = surface.f0;
    float occlusion = surface.occlusion;

    // vec3 E = mix(dfg.xxx, dfg.yyy, f0);

    #ifdef ANISOTROPIC
    vec3 bentNormal = anisotropyBentNormal(surface, info);
    vec3 r = getReflectedVector(bentNormal, v, positionWS);
    #else // ANISOTROPIC
    vec3 r = getReflectedVector(n, v, positionWS);
    #endif // ANISOTROPIC

    vec3 indirectSpecular = specularIrradiance(r, roughness);

    Fr += E * indirectSpecular * occlusion * info.energyCompensation;

    vec3 irradiance = diffuseIrradiance(n, positionWS, info.viewDir);

    Fd += diffuseColor * irradiance * (1.0 - E) * occlusion;
}

vec3 PBRGI(const in Surface surface, const in PixelInfo info)
{
    vec3 Fd = vec3(0.0);
    vec3 Fr = vec3(0.0);

    #ifdef IRIDESCENCE
    vec3 dfg = info.dfg;
    float NoV = info.NoV;
    vec3 iridescenceFresnel = info.iridescenceFresnel;
    vec3 f0 = surface.f0;
    float iridescenceFactor = surface.iridescence;
    vec3 iridescenceFresnelMax = vec3(vecmax(iridescenceFresnel));
    vec3 schlickFresnel = F_Schlick(f0, vec3(1.0), NoV);
    vec3 F = mix(schlickFresnel, iridescenceFresnelMax, iridescenceFactor);
    vec3 E = mix(dfg.xxx, dfg.yyy, F);
    iridescenceIBL(surface, info, E, Fd, Fr);
    #else // IRIDESCENCE
    vec3 dfg = info.dfg;
    vec3 f0 = surface.f0;
    vec3 E = mix(dfg.xxx, dfg.yyy, f0);
    baseIBL(surface, info, E, Fd, Fr);
    #endif // IRIDESCENCE

    // sheen
    #ifdef SHEEN
    sheenIBL(surface, info, Fd, Fr);
    #endif // SHEEN

    // clear coat
    #ifdef CLEARCOAT
    clearCoatIBL(surface, info, Fd, Fr);
    #endif // CLEARCOAT

    #ifdef TRANSMISSION
    Fd *= (1.0 - surface.transmission);
    vec3 Ft = transmissionIBL(surface, info, E);
    Ft *= surface.transmission;
    #endif // TRANSMISSION

    vec3 gi = Fd + Fr;

    #ifdef TRANSMISSION
    gi += Ft;
    #endif // TRANSMISSION

    return gi;
}

#endif // pbrGI_lib