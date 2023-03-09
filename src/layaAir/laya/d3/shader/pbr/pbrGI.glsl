#if !defined(pbrGI_lib)
    #define pbrGI_lib

    #include "globalIllumination.glsl";

    // todo cpu 拼接？
    #define IBL_ROUGHNESS_LEVEL 4.0

vec2 prefilteredDFG_LUT(float coord, float NoV)
{
    return texture2DLodEXT(u_IBLDGF, vec2(NoV, 1.0 - coord), 0.0).rg;
}

vec2 EnvBRDFApproxLazarov(float roughness, float NoV)
{
    vec4 c0 = vec4(-1, -0.0275, -0.572, 0.022);
    vec4 c1 = vec4(1, 0.0425, 1.04, -0.04);
    vec4 r = roughness * c0 + c1;
    float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
    vec2 AB = vec2(-1.04, 1.04) * a004 + r.zw;
    return AB;
}

vec3 PBRGI(const in Surface surface, const in PixelInfo info)
{
    vec3 indirect = vec3(0.0);

    #ifdef LIGHTMAP

	#ifdef UV1
    vec2 lightmapUV = info.lightmapUV;
    vec3 bakedColor = getBakedLightmapColor(lightmapUV);
        #ifdef LIGHTMAP_DIRECTIONAL
            bakedColor = DecodeDirectionalLightmap(lightmapUV,bakedColor,info.normalWS);
        #endif //LIGHTMAP_DIRECTIONAL
    // todo  surface.diffuseColor ？
    vec3 Fd = bakedColor * surface.diffuseColor;
	#endif // UV1

    #else // LIGHTMAP

    vec3 n = info.normalWS;
    vec3 Fd = diffuseIrradiance(n) * surface.diffuseColor * surface.occlusion * u_AmbientIntensity;

    #endif // LIGHTMAP

    // specular
    float perceptualRoughness = surface.perceptualRoughness;
    float NoV = info.NoV;
    vec2 env = EnvBRDFApproxLazarov(perceptualRoughness, NoV);
    vec3 f0 = surface.f0;
    // todo f90 用 1.0 近似 f90
    float f90 = 1.0;
    vec3 specularColor = f0 * env.x + f90 * env.y;

    vec3 r = getReflectedVector(surface, info);

    #ifdef SPECCUBE_BOX_PROJECTION
    r = getBoxProjectionReflectedVector(r, info.positionWS, u_SpecCubeProbePosition, u_SpecCubeBoxMin, u_SpecCubeBoxMax);
    #endif // SPECCUBE_BOX_PROJECTION

    vec3 indirectSpecular = specularIrradiance(r, perceptualRoughness) * u_ReflectionIntensity;

    vec3 Fr = indirectSpecular * specularColor * surface.occlusion;

    indirect = Fd + Fr;

    return indirect;
}

#endif // pbrGI_lib