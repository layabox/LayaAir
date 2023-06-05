#if !defined(pbrGI_lib)
    #define pbrGI_lib

    #include "globalIllumination.glsl";

    #ifdef ANISOTROPIC
vec3 anisotropyBentNormal(const in Surface surface, const in PixelInfo info)
{
    float anisotropy = surface.anisotropy;
    vec3 anisotropyDirection = info.anisotropicB;

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
vec3 iridescenceIBL(const in Surface surface, const in PixelInfo info)
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

    vec3 iridescenceFresnelMax = vec3(vecmax(iridescenceFresnel));
    vec3 schlickFresnel = F_Schlick(f0, vec3(1.0), NoV);
    vec3 F = mix(schlickFresnel, iridescenceFresnelMax, iridescenceFactor);

    vec3 E = mix(dfg.xxx, dfg.yyy, F);

    // diffuse
    vec3 irradiance = diffuseIrradiance(n, positionWS, info.viewDir);
    vec3 Fd = diffuseColor * irradiance * (1.0 - E) * occlusion;

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
    vec3 Fr = Er * indirectSpecular * occlusion * info.energyCompensation;

    return Fd + Fr;
}
    #endif // IRIDESCENCE

    #ifdef SHEEN
vec3 sheenIBL(const in Surface surface, const in PixelInfo info)
{
    vec3 v = info.viewDir;
    vec3 n = info.normalWS;
    vec3 positionWS = info.positionWS;

    float occlusion = surface.occlusion;
    float roughness = surface.sheenPerceptualRoughness;

    vec3 r = getReflectedVector(n, v, positionWS);
    vec3 indirectSpecular = specularIrradiance(r, roughness);

    return indirectSpecular * info.sheenDfg * surface.sheenColor * occlusion;
}
    #endif // SHEEN

    #ifdef CLEARCOAT
vec3 clearCoatIBL(const in Surface surface, const in PixelInfo info)
{
    vec3 v = info.viewDir;
    vec3 n = info.clearCoatNormal;
    float NoV = info.clearCoatNoV;
    vec3 positionWS = info.positionWS;

    float clearCoat = surface.clearCoat;
    float roughness = surface.clearCoatPerceptualRoughness;
    float occlusion = surface.occlusion;

    // vec3 Fc = F_Schlick(0.04, 1.0, NoV) * clearCoat;
    // todo base attenuation = 1.0 - Fc

    vec3 r = getReflectedVector(n, v, positionWS);
    vec3 indirectSpecular = specularIrradiance(r, roughness);

    vec3 FrClearCoat = indirectSpecular * occlusion;

    return FrClearCoat;
}
    #endif // CLEARCOAT

vec3 baseIBL(const in Surface surface, const in PixelInfo info)
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

    vec3 E = mix(dfg.xxx, dfg.yyy, f0);

    #ifdef ANISOTROPIC
    vec3 bentNormal = anisotropyBentNormal(surface, info);
    vec3 r = getReflectedVector(bentNormal, v, positionWS);
    #else // ANISOTROPIC
    vec3 r = getReflectedVector(n, v, positionWS);
    #endif // ANISOTROPIC

    vec3 indirectSpecular = specularIrradiance(r, roughness);

    vec3 Fr = E * indirectSpecular * occlusion * info.energyCompensation;

    vec3 irradiance = diffuseIrradiance(n, positionWS, info.viewDir);

    vec3 Fd = diffuseColor * irradiance * (1.0 - E) * occlusion;

    return Fd + Fr;
}

vec3 PBRGI(const in Surface surface, const in PixelInfo info)
{
    vec3 gi = vec3(0.0);

    #ifdef IRIDESCENCE
    gi += iridescenceIBL(surface, info);
    #else // IRIDESCENCE
    gi += baseIBL(surface, info);
    #endif // IRIDESCENCE

    // sheen
    #ifdef SHEEN
    gi *= info.sheenScaling;
    gi += sheenIBL(surface, info);
    #endif // SHEEN

    // clear coat
    #ifdef CLEARCOAT
    float FcClearCoat = F_Schlick(0.04, 1.0, info.clearCoatNoV) * surface.clearCoat;
    gi *= (1.0 - FcClearCoat);
    vec3 fClearCoat = clearCoatIBL(surface, info) * FcClearCoat;
    gi += fClearCoat;
    #endif // CLEARCOAT

    return gi;
}

#endif // pbrGI_lib