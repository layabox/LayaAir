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
    float iridescenceFactor = surface.iridescence;

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

    vec3 indirectSpecular = specularRadiance(r, roughness);
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
    vec3 indirectSpecular = specularRadiance(r, roughness);

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
    vec3 indirectSpecular = specularRadiance(r, roughness);

    Fr += indirectSpecular * Fc * occlusion;
}
    #endif // CLEARCOAT

    #ifdef TRANSMISSION
vec3 getRefraction(const in Surface surface, const in PixelInfo info)
{
    vec3 position = info.positionWS;

	#ifdef THICKNESS

    vec3 n = info.normalWS;
    vec3 r = -info.viewDir;
    float airIOR = 1.0;
    float etaIR = airIOR / surface.ior;

    vec3 refractionV = normalize(refract(r, n, etaIR)) * surface.thickness * info.worldScale.xyz;

    position += refractionV;

	#endif // THICKNESS

    vec4 p = u_ViewProjection * vec4(position, 1.0);
    vec2 refractionUV = (p.xy / p.w) * 0.5 + 0.5;

    float refractionLOD = u_OpaqueTextureParams.z * surface.perceptualRoughness * saturate(surface.ior * 2.0 - 2.0);
    vec3 refraction = texture2DLodEXT(u_CameraOpaqueTexture, refractionUV, refractionLOD).xyz;

    return refraction;
}

vec3 transmissionIBL(const in Surface surface, const in PixelInfo info, in vec3 E)
{
    // refraction
    vec3 refraction = getRefraction(surface, info);

	#ifndef THICKNESS
    E *= 1.0 + surface.transmission * (1.0 - E.g) / (1.0 + E.g);
	#endif // THICKNESS

	#ifdef THICKNESS

    // ABSORPTION
    vec3 attenuationColor = surface.attenuationColor;
    float attenuationDistance = surface.attenuationDistance;
    vec3 absorption = -log(attenuationColor) / (attenuationDistance);
    vec3 T = exp(-absorption * info.worldScale.xyz * surface.thickness);

	#endif // THICKNESS

    vec3 Ft = refraction;

    Ft *= surface.diffuseColor;

    Ft *= 1.0 - E;

	#ifdef THICKNESS
    Ft *= T;
	#endif // THICKNESS

    return Ft * surface.transmission;
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
    float occlusion = surface.occlusion;

    #ifdef ANISOTROPIC
    vec3 bentNormal = anisotropyBentNormal(surface, info);
    vec3 r = getReflectedVector(bentNormal, v, positionWS);
    #else // ANISOTROPIC
    vec3 r = getReflectedVector(n, v, positionWS);
    #endif // ANISOTROPIC

    vec3 indirectSpecular = specularRadiance(r, roughness);

    // todo
    float specularAO = occlusion;
    Fr += E * indirectSpecular * specularAO * info.energyCompensation;

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

    #else // IRIDESCENCE

    vec3 dfg = info.dfg;
    vec3 f0 = surface.f0;
    vec3 f90 = surface.f90;
    // vec3 E = mix(dfg.xxx, dfg.yyy, f0);
    vec3 E = (f90 - f0) * dfg.x + f0 * dfg.y;

    #endif // IRIDESCENCE
    return E;
}

vec3 PBRGI(const in Surface surface, const in PixelInfo info)
{
    vec3 Fd = vec3(0.0);
    vec3 Fr = vec3(0.0);

    vec3 E = getE(surface, info);

    #ifdef IRIDESCENCE
    iridescenceIBL(surface, info, E, Fd, Fr);
    #else // IRIDESCENCE
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
    #endif // TRANSMISSION

    vec3 gi = Fd + Fr;

    #ifdef TRANSMISSION
    gi += Ft;
    #endif // TRANSMISSION

    return gi;
}

#endif // pbrGI_lib