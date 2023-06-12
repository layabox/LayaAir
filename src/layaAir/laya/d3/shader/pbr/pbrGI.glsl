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
    vec3 indirectSpecular = specularRadiance(r, roughness);

    Fr += indirectSpecular * Fc * occlusion;
}
    #endif // CLEARCOAT

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

    #ifdef ANISOTROPIC
    vec3 bentNormal = anisotropyBentNormal(surface, info);
    vec3 r = getReflectedVector(bentNormal, v, positionWS);
    #else // ANISOTROPIC
    vec3 r = getReflectedVector(n, v, positionWS);
    #endif // ANISOTROPIC

    vec3 indirectSpecular = specularRadiance(r, roughness);

    Fr += E * indirectSpecular * occlusion * info.energyCompensation;

    #if defined(USELIGHTMAP)

    vec2 lightmapUV = info.lightmapUV;
    vec3 bakedlight = getBakedLightmapColor(lightmapUV, n);
    Fd += bakedlight * diffuseColor;

    #else // USELIGHTMAP

    vec3 irradiance = diffuseIrradiance(n, positionWS, info.viewDir);
    Fd += diffuseColor * irradiance * (1.0 - E) * occlusion;

    #endif // USELIGHTMAP
}

vec3 getE(const in Surface surface, const in PixelInfo info)
{
    vec3 dfg = info.dfg;
    vec3 f0 = surface.f0;
    vec3 E = mix(dfg.xxx, dfg.yyy, f0);

    return E;
}

vec3 PBRGI(const in Surface surface, const in PixelInfo info)
{
    vec3 Fd = vec3(0.0);
    vec3 Fr = vec3(0.0);

    vec3 E = getE(surface, info);

    baseIBL(surface, info, E, Fd, Fr);

    // clear coat
    #ifdef CLEARCOAT
    clearCoatIBL(surface, info, Fd, Fr);
    #endif // CLEARCOAT

    vec3 gi = Fd + Fr;

    return gi;
}

#endif // pbrGI_lib