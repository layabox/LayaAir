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
vec3 transmissionIBL(const in Surface surface, const in PixelInfo info, in vec3 E)
{
    vec3 n = info.normalWS;
    vec3 r = -info.viewDir;

    // todo ior
    float airIor = 1.0;

    float ior = surface.ior;

    float etaIR = airIor / ior;
    float etaRI = ior / airIor;

	// ray
	#ifndef VOLUME
    vec3 position = info.positionWS;
    vec3 direction = r;
    float d = 0.0;
	#endif // VOLUME

	#ifdef VOLUME

    vec3 scaleLength = vec3(0.0);
    scaleLength.x = length(vec3(u_WorldMat[0].xyz));
    scaleLength.y = length(vec3(u_WorldMat[1].xyz));
    scaleLength.z = length(vec3(u_WorldMat[2].xyz));
    float transmissionDistance = length(scaleLength) / 3.0;

    r = refract(r, n, etaIR);
    float NoR = dot(n, r);
    float d = surface.thickness * -NoR * transmissionDistance;

    vec3 position = vec3(info.positionWS + r * d);
    vec3 n1 = normalize(NoR * r - n * 0.5);
    vec3 direction = refract(r, n1, etaRI);

    vec3 absorption = -log((surface.attenuationColor)) / surface.attenuationDistance;

    vec3 T = min(vec3(1.0), exp(-absorption * d));

	#endif // VOLUME

	#ifndef VOLUME
    E *= (1.0 + surface.transmission * (1.0 - E.g) / (1.0 + E.g));
	#endif // VOLUME

    // ssr
    vec4 p = u_ViewProjection * vec4(position, 1.0);
    p.xy = p.xy * (0.5 / p.w) + 0.5;
    float lod = log2(1024.0) * surface.perceptualRoughness * saturate(surface.ior * 2.0 - 2.0);
    // todo
    vec3 Ft = texture2DLodEXT(u_CameraOpaqueTexture, p.xy, lod).xyz;

    Ft *= surface.diffuseColor;

    Ft *= 1.0 - E;

	#ifdef VOLUME
    Ft *= T;
	#endif // VOLUME

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
    Ft *= surface.transmission;
    #endif // TRANSMISSION

    vec3 gi = Fd + Fr;

    #ifdef TRANSMISSION
    gi += Ft;
    #endif // TRANSMISSION

    return gi;
}

#endif // pbrGI_lib