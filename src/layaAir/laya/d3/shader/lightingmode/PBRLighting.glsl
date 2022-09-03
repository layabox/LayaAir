#if !defined(PBRLighting_lib)
    #define PBRLighting_lib

    #include "Math.glsl";

    #include "Lighting.glsl";

    // 精度
    #if !defined(GL_FRAGMENT_PRECISION_HIGH)
	#define MIN_PERCEPTUAL_ROUGHNESS 0.089
	#define MIN_ROUGHNESS		 0.007921
    #else
	#define MIN_PERCEPTUAL_ROUGHNESS 0.045
	#define MIN_ROUGHNESS		 0.002025
    #endif

    #define MIN_N_DOT_V 1e-4

    #include "BRDF.glsl";

struct PixelInfo {
    vec3 normalWS;

    #ifdef TANGENT
	#ifdef NEEDTBN
    vec3 tangentWS;
    vec3 biNormalWS;

	    #ifdef ANISOTROPIC
    float ToV;
    float BoV;
	    #endif // ANISOTROPIC

	#endif // NEEDTBN
    #endif // TANGENT

    vec3 viewDir;
    float NoV;

    #ifdef LIGHTMAP
	#ifdef UV1
    vec2 lightmapUV;
	#endif // UV1
    #endif // LIGHTMAP
};

struct Surface {
    vec3 diffuseColor;
    float alpha;
    vec3 f0;
    float roughness;
    float perceptualRoughness;
    float occlusion;

    #ifdef ANISOTROPIC
    float anisotropy;
    #endif // ANISOTROPIC
};

struct LightParams {
    vec3 h;
    float NoL;
    float NoH;
    float LoH;

    #ifdef ANISOTROPIC
    float ToL;
    float BoL;
    #endif // ANISOTROPIC
};

// 获取反射向量
vec3 getReflectedVector(const in Surface surface, const in PixelInfo info)
{
    vec3 v = info.viewDir;
    vec3 n = info.normalWS;

    #ifdef ANISOTROPIC

    vec3 direction = surface.anisotropy >= 0.0 ? info.biNormalWS : info.tangentWS;
    vec3 at = cross(direction, v);
    vec3 an = cross(at, direction);
    float bendFactor = abs(surface.anisotropy) * saturate(5.0 * surface.perceptualRoughness);
    vec3 bentNormal = normalize(mix(n, an, bendFactor));
    return reflect(-v, bentNormal);

    #else // ANISOTROPIC
    return reflect(-v, n);
    #endif // ANISOTROPIC
}

void initLightParams(inout LightParams params, const in PixelInfo pixel, const in Light light)
{
    vec3 l = normalize(-light.dir);
    vec3 v = pixel.viewDir;
    vec3 n = pixel.normalWS;

    vec3 h = SafeNormalize(v + l);
    params.h = h;
    params.NoL = saturate(dot(n, l));
    params.NoH = saturate(dot(n, h));
    params.LoH = saturate(dot(l, h));

    #ifdef ANISOTROPIC
    params.ToL = dot(pixel.tangentWS, l);
    params.BoL = dot(pixel.biNormalWS, l);
    #endif // ANISOTROPIC
}

vec3 diffuseLobe(in Surface surface, const in PixelInfo pixel, const in LightParams lightParams)
{
    // return surface.diffuseColor * diffuse();
    return surface.diffuseColor * Fd_Burley(surface.roughness, pixel.NoV, lightParams.NoL, lightParams.LoH);
}

vec3 specularLobe(const in Surface surface, const in PixelInfo pixel, const in LightParams lightParams)
{
    float roughness = surface.roughness;
    #ifdef ANISOTROPIC

	#ifdef TANGENT
	    #ifdef NEEDTBN

    float at = max(roughness * (1.0 + surface.anisotropy), 0.001);
    float ab = max(roughness * (1.0 - surface.anisotropy), 0.001);

    float D = D_GGX_Anisotropic(lightParams.NoH, lightParams.h, pixel.tangentWS, pixel.biNormalWS, at, ab);
    float V = V_SmithGGXCorrelated_Anisotropic(at, ab, pixel.ToV, pixel.BoV, lightParams.ToL, lightParams.BoL, pixel.NoV, lightParams.NoL);

	    #endif // NEEDTBN
	#endif // TANGENT

    #else // ANISOTROPIC

    float D = distribution(roughness, lightParams.NoH, lightParams.h, pixel.normalWS);
    float V = visibility(roughness, pixel.NoV, lightParams.NoL);

    #endif // ANISOTROPIC

    vec3 F = fresnel(surface.f0, lightParams.LoH);

    return (D * V) * F;
}

vec3 PBRLighting(const in Surface surface, const in PixelInfo pixel, const in Light light)
{
    LightParams lightParams;
    initLightParams(lightParams, pixel, light);

    vec3 Fd = diffuseLobe(surface, pixel, lightParams);

    vec3 Fr = specularLobe(surface, pixel, lightParams);

    return (Fd + Fr) * light.color * lightParams.NoL;
}

    // gi
    #include "PBRGI.glsl";

#endif // PBRLighting_lib