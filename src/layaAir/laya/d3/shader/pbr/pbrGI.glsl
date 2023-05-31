#if !defined(pbrGI_lib)
    #define pbrGI_lib

    #include "globalIllumination.glsl";

// 获取反射向量
vec3 getReflectedVector(const in Surface surface, const in PixelInfo info)
{
    vec3 v = info.viewDir;
    vec3 n = info.normalWS;
    vec3 positionWS = info.positionWS;

    vec3 r;

    #ifdef ANISOTROPIC

    float anisotropy = surface.anisotropy;
    vec3 anisotropyDirection = info.anisotropicB;

    // float tangentRoughness = mix(roughness, 1.0, anisotropy * anisotropy);
    float roughness = surface.perceptualRoughness;
    vec3 anisotropicTangent = cross(anisotropyDirection, v);
    vec3 anisotropicNormal = cross(anisotropicTangent, anisotropyDirection);
    float bendFactor = 1.0 - anisotropy * (1.0 - roughness);
    float bendFactorPow4 = pow2(bendFactor) * pow2(bendFactor);
    vec3 bentNormal = normalize(mix(anisotropicNormal, n, bendFactorPow4));

    r = normalize(reflect(-v, bentNormal));

    #else // ANISOTROPIC

    r = reflect(-v, n);

    #endif // ANISOTROPIC

    // todo
    #ifdef SPECCUBE_BOX_PROJECTION
    r = getBoxProjectionReflectedVector(r, positionWS);
    #endif // SPECCUBE_BOX_PROJECTION

    return r;
}

vec3 basicIBL(const in Surface surface, const in PixelInfo info)
{
    float NoV = info.NoV;
    vec3 n = info.normalWS;
    vec3 positionWS = info.positionWS;

    vec3 diffuseColor = surface.diffuseColor;
    float roughness = surface.perceptualRoughness;
    vec3 F0 = surface.f0;
    float occlusion = surface.occlusion;
    vec2 f_ab = info.dfg.rg;

    vec3 Fr = max(vec3(1.0 - roughness), F0) - F0;
    vec3 k_S = F0 + Fr * pow5(1.0 - NoV);
    vec3 FssEss = k_S * f_ab.x + f_ab.y;

    // radiance
    vec3 r = getReflectedVector(surface, info);

    vec3 indirectSpecular = specularIrradiance(r, roughness);

    vec3 fSpecular = indirectSpecular * FssEss * occlusion;

    // irradiance
    #if defined(USELIGHTMAP)

    vec2 lightmapUV = info.lightmapUV;
    vec3 bakedlight = getBakedLightmapColor(lightmapUV, n);

    vec3 fDiffuse = bakedlight * diffuseColor;

    #else // USELIGHTMAP

    vec3 irradiance = diffuseIrradiance(n, positionWS, info.viewDir);
    float Ems = (1.0 - (f_ab.x + f_ab.y));
    vec3 F_avg = (F0 + (1.0 - F0) / 21.0);
    vec3 FmsEms = Ems * FssEss * F_avg / (1.0 - F_avg * Ems);
    vec3 k_D = diffuseColor * (1.0 - FssEss + FmsEms);

    vec3 fDiffuse = (FmsEms + k_D) * irradiance * occlusion;

    #endif // USELIGHTMAP

    return fDiffuse + fSpecular;
}

    #ifdef IRIDESCENCE

vec3 iridescenceIBLDiffuse(const in Surface surface, const in PixelInfo info)
{
    float NoV = info.NoV;
    vec3 n = info.normalWS;
    vec3 positionWS = info.positionWS;
    vec3 iridescenceFresnel = info.iridescenceFresnel;
    vec2 f_ab = info.dfg.rg;

    float roughness = surface.perceptualRoughness;
    vec3 F0 = surface.f0;
    vec3 diffuseColor = surface.diffuseColor;
    float iridescenceFactor = surface.iridescence;
    float occlusion = surface.occlusion;

    // todo iridescence lightmap
    vec3 irradiance = diffuseIrradiance(n, positionWS, info.viewDir);

    vec3 iridescenceF0Max = vec3(vecmax(fresnel(iridescenceFresnel, NoV)));

    vec3 mixedF0 = mix(F0, iridescenceF0Max, iridescenceFactor);

    vec3 Fr = max(vec3(1.0 - roughness), mixedF0) - mixedF0;
    vec3 k_S = mixedF0 + Fr * pow(1.0 - NoV, 5.0);
    vec3 FssEss = k_S * f_ab.x + f_ab.y;

    float Ems = (1.0 - (f_ab.x + f_ab.y));
    vec3 F_avg = (mixedF0 + (1.0 - mixedF0) / 21.0);
    vec3 FmsEms = Ems * FssEss * F_avg / (1.0 - F_avg * Ems);
    vec3 k_D = diffuseColor * (1.0 - FssEss + FmsEms);

    return (FmsEms + k_D) * irradiance * occlusion;
}

vec3 iridescenceIBLSpecular(const in Surface surface, const in PixelInfo info)
{
    float NoV = info.NoV;
    vec3 n = info.normalWS;
    vec3 positionWS = info.positionWS;
    vec3 iridescenceFresnel = info.iridescenceFresnel;
    vec2 f_ab = info.dfg.rg;

    float roughness = surface.perceptualRoughness;
    vec3 F0 = surface.f0;
    float iridescenceFactor = surface.iridescence;
    float occlusion = surface.occlusion;

    vec3 r = getReflectedVector(surface, info);

    vec3 indirectSpecular = specularIrradiance(r, roughness);

    vec3 Fr = max(vec3(1.0 - roughness), F0) - F0;
    vec3 k_S = mix(F0 + Fr * pow5(1.0 - NoV), iridescenceFresnel, iridescenceFactor);
    vec3 FssEss = k_S * f_ab.x + f_ab.y;

    return indirectSpecular * FssEss * occlusion;
}

vec3 iridescenceIBL(const in Surface surface, const in PixelInfo info)
{
    return iridescenceIBLDiffuse(surface, info) + iridescenceIBLSpecular(surface, info);
}

    #endif // IRIDESCENCE

    #ifdef CLEARCOAT
vec3 clearCoatIBL(const in Surface surface, const in PixelInfo info)
{
    float NoV = info.clearCoatNoV;

    // specular
    float roughness = surface.clearCoatPerceptualRoughness;
    // todo default IOR 1.5
    vec3 F0 = vec3(0.04);
    float occlusion = surface.occlusion;
    vec2 f_ab = info.dfg.rg;

    vec3 Fr = max(vec3(1.0 - roughness), F0) - F0;
    vec3 k_S = F0 + Fr * pow5(1.0 - NoV);
    vec3 FssEss = k_S * f_ab.x + f_ab.y;

    // radiance
    vec3 v = info.viewDir;
    vec3 n = info.clearCoatNormal;
    vec3 positionWS = info.positionWS;
    vec3 r = reflect(-v, n);
	// todo
	#ifdef SPECCUBE_BOX_PROJECTION
    r = getBoxProjectionReflectedVector(r, positionWS);
	#endif // SPECCUBE_BOX_PROJECTION

    vec3 indirectSpecular = specularIrradiance(r, roughness);

    vec3 fClearCoat = indirectSpecular * FssEss * surface.clearCoat * occlusion;

    return fClearCoat;
}
    #endif // CLEARCOAT

vec3 PBRGI(const in Surface surface, const in PixelInfo info)
{
    vec3 gi = vec3(0.0);

    #ifdef IRIDESCENCE
    gi += iridescenceIBL(surface, info);
    #else // IRIDESCENCE
    gi += basicIBL(surface, info);
    #endif // IRIDESCENCE

    // clear coat
    #ifdef CLEARCOAT
    vec3 fClearCoat = clearCoatIBL(surface, info);
    gi += fClearCoat;
    #endif // CLEARCOAT

    return gi;
}

#endif // pbrGI_lib