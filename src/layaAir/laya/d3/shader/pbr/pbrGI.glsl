#if !defined(pbrGI_lib)
    #define pbrGI_lib

    #include "globalIllumination.glsl";

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
    float NoV = info.NoV;
    vec3 n = info.normalWS;
    vec3 positionWS = info.positionWS;

    vec3 ibl = vec3(0.0);

    // specular
    float specularWeight = 1.0;
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
    // todo
    #ifdef SPECCUBE_BOX_PROJECTION
    r = getBoxProjectionReflectedVector(r, positionWS);
    #endif // SPECCUBE_BOX_PROJECTION

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
    vec3 F_avg = specularWeight * (F0 + (1.0 - F0) / 21.0);
    vec3 FmsEms = Ems * FssEss * F_avg / (1.0 - F_avg * Ems);
    vec3 k_D = diffuseColor * (1.0 - FssEss + FmsEms);

    vec3 fDiffuse = (FmsEms + k_D) * irradiance * occlusion;

    #endif // USELIGHTMAP

    ibl = fDiffuse + fSpecular;

    // clear coat
    #ifdef CLEARCOAT
    vec3 fClearCoat = clearCoatIBL(surface, info);
    ibl += fClearCoat;
    #endif // CLEARCOAT

    return ibl;
}

#endif // pbrGI_lib