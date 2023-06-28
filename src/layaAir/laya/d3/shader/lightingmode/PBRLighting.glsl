#if !defined(PBRLighting_lib)
    #define PBRLighting_lib

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
    vec3 positionWS;

    vec3 vertexNormalWS;
    vec3 normalWS;
    vec3 tangentWS;
    vec3 biNormalWS;

    vec3 viewDir;
    float NoV;

    vec3 dfg;
    vec3 energyCompensation;

    #ifdef CLEARCOAT
    vec3 clearCoatNormal;
    float clearCoatNoV;
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
    vec3 anisotropicT;
    vec3 anisotropicB;
    float ToV;
    float BoV;
    float at;
    float ab;
    #endif // ANISOTROPIC

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

    vec3 normalTS;

    #ifdef CLEARCOAT
    float clearCoat;
    float clearCoatRoughness;
    float clearCoatPerceptualRoughness;
	#ifdef CLEARCOAT_NORMAL
    vec3 clearCoatNormalTS;
	#endif // CLEARCOAT_NORMAL
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
    float anisotropy;
    vec2 anisotropyDirection;
    #endif // ANISOTROPIC
};

struct LightParams {
    vec3 l;
    vec3 h;
    float NoL;
    float NoH;
    float LoH;
    float VoH;

    #ifdef CLEARCOAT
    float clearCoatNoH;
    float clearCoatNoL;
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
    float ToL;
    float BoL;
    #endif // ANISOTROPIC
};

void initLightParams(inout LightParams params, const in PixelInfo pixel, const in Light light)
{
    vec3 v = pixel.viewDir;
    vec3 n = pixel.normalWS;

    vec3 l = normalize(-light.dir);
    params.l = l;

    vec3 h = SafeNormalize(v + l);
    params.h = h;
    params.NoL = saturate(dot(n, l));
    params.NoH = saturate(dot(n, h));
    params.LoH = saturate(dot(l, h));
    params.VoH = saturate(dot(v, h));

    #ifdef CLEARCOAT
    params.clearCoatNoL = saturate(dot(pixel.clearCoatNormal, l));
    params.clearCoatNoH = saturate(dot(pixel.clearCoatNormal, h));
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
    vec3 t = pixel.anisotropicT;
    vec3 b = pixel.anisotropicB;
    params.ToL = dot(t, l);
    params.BoL = dot(b, l);
    #endif // ANISOTROPIC
}

vec3 prefilteredDFG_LUT(float roughness, float NoV)
{
    vec2 samplePoint = clamp(vec2(NoV, roughness), vec2(0.0, 0.0), vec2(1.0, 1.0));
    samplePoint.y = 1.0 - samplePoint.y;
    #if defined(FLOATTEXTURE) && defined(FLOATTEXTURE_FIL_LINEAR)
        return (texture2D(u_IBLDFG, samplePoint)).rgb;
    #else
        return decodeRGBD(texture2D(u_IBLDFG, samplePoint));
    #endif
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

vec3 diffuseLobe(in Surface surface, const in PixelInfo pixel, const in LightParams lightParams)
{
    return surface.diffuseColor * diffuse();
    // return surface.diffuseColor * diffuse() * (1.0 - F_Schlick(surface.f0, vec3(1.0, 1.0, 1.0), lightParams.VoH));
    // return surface.diffuseColor * Fd_Burley(surface.roughness, pixel.NoV, lightParams.NoL, lightParams.LoH);
}

vec3 specularLobe(const in Surface surface, const in PixelInfo pixel, const in LightParams lightParams)
{
    float roughness = surface.roughness;

    float D = distribution(roughness, lightParams.NoH, lightParams.h, pixel.normalWS);
    float V = visibility(roughness, pixel.NoV, lightParams.NoL);
    vec3 F = fresnel(surface.f0, lightParams.LoH);

    return (D * V) * F;
}

    #ifdef CLEARCOAT
float clearCoatLobe(const in Surface surface, const in PixelInfo pixel, const in LightParams lightParams)
{
    float roughness = surface.clearCoatRoughness;
    float clearCoat = surface.clearCoat;
    vec3 n = pixel.clearCoatNormal;
    vec3 h = lightParams.h;
    float LoH = lightParams.LoH;

    float clearCoatNoH = lightParams.clearCoatNoH;

    float D = distribution(roughness, clearCoatNoH, h, n);
    float V = V_kelemen(LoH);

    return D * V;
}
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
vec3 anisotropyLobe(const in Surface surface, const in PixelInfo pixel, const in LightParams lightParams)
{
    float anisotropy = surface.anisotropy;
    float at = pixel.at;
    float ab = pixel.ab;
    vec3 anisotropicT = pixel.anisotropicT;
    vec3 anisotropicB = pixel.anisotropicB;

    float NoV = pixel.NoV;
    float ToV = pixel.ToV;
    float BoV = pixel.BoV;

    vec3 h = lightParams.h;
    float NoL = lightParams.NoL;
    float NoH = lightParams.NoH;
    float VoH = lightParams.VoH;
    float ToL = lightParams.ToL;
    float BoL = lightParams.BoL;

    float V = V_SmithGGXCorrelated_Anisotropic(at, ab, ToV, BoV, ToL, BoL, NoV, NoL);
    float D = D_GGX_Anisotropic(NoH, h, anisotropicT, anisotropicB, at, ab);
    vec3 F = fresnel(surface.f0, lightParams.LoH);
    return V * D * F;
}
    #endif // ANISOTROPIC

vec3 PBRLighting(const in Surface surface, const in PixelInfo pixel, const in Light light)
{
    LightParams lightParams;
    initLightParams(lightParams, pixel, light);

    vec3 Fd = diffuseLobe(surface, pixel, lightParams);

    #ifdef ANISOTROPIC
    vec3 Fr = anisotropyLobe(surface, pixel, lightParams);
    #else // ANISOTROPIC
    vec3 Fr = specularLobe(surface, pixel, lightParams);
    #endif // ANISOTROPIC

    vec3 shading = (Fd + Fr * pixel.energyCompensation) * lightParams.NoL;

    #ifdef CLEARCOAT
    float clearCoatNoL = lightParams.clearCoatNoL;
    float LoH = lightParams.LoH;
    // todo
    // default IOR 1.5
    float FccClearCoat = F_Schlick(0.04, 1.0, LoH) * surface.clearCoat;
    float attenuation = 1.0 - FccClearCoat;
    shading *= attenuation;

    float clearcoat = clearCoatLobe(surface, pixel, lightParams) * FccClearCoat;
    shading += clearcoat * clearCoatNoL;
    #endif // CLEARCOAT

    return shading * light.color;
}

    // gi
    #include "PBRGI.glsl";

#endif // PBRLighting_lib